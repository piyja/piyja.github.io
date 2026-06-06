---
title: "Autonomous Driving AI Engineering"
description: "Study guide — edge LLM inference, C++ systems, automotive safety standards"
tags: [Automotive, MLSystems]
category: System Design
---

# Autonomous Driving AI Engineering
## Complete Study Guide — Edge LLM Inference, C++ Systems, Automotive Safety

---

## How to use this guide

Each topic follows the same structure:
- **One-liner** — the concept in one sentence
- **Why it exists** — the problem it solves
- **How it works** — mechanics, bottom-up
- **Key tradeoffs** — what it costs, when NOT to use it
- **Mental model** — the analogy that sticks
- **Interview answer** — what to say precisely

---

## Topic 1 — Zero-Copy Memory Pipeline

### One-liner
Pass camera frames from ISP hardware directly to GPU inference without CPU involvement.

### Why it exists
Naive pipeline: ISP writes frame to CPU RAM → CPU copies to GPU VRAM → inference runs.
At 30 FPS, 4K frames, this copy takes 5–15ms and burns memory bandwidth. The CPU is a bottleneck that doesn't need to be in the loop.

### How it works

The ISP, GPU, DLA, and other engines on an NVIDIA Orin SoC all share the same physical memory pool via an internal interconnect. You allocate a buffer visible to all of them simultaneously:

```cpp
// NvSciBuf — allocates hardware-visible shared memory
NvSciBufObj frameBuf;
NvSciBufAttrList attrs;
// attrs declare: GPU-accessible + ISP-accessible + physically contiguous
NvSciBufAllocate(attrs, &frameBuf);
```

The ISP's DMA engine is configured to write directly into this buffer. No CPU involved.

**Synchronization** — the GPU must not read until ISP finishes writing:

```cpp
// ISP signals done via CUDA event
cudaEventRecord(ispDoneEvent, ispStream);

// GPU inference stream waits on that event
// CPU thread is NOT blocked — it moves on immediately
cudaStreamWaitEvent(inferStream, ispDoneEvent, 0);
```

**Ring buffer** — use 3 slots (triple buffering) so ISP can write frame N+1 while GPU processes frame N:

```
Slot 0: [ISP writing frame 3   ]
Slot 1: [GPU reading frame 2   ]
Slot 2: [free                  ]
```

### API decision table

| Scenario | Correct API |
|---|---|
| CPU writes, GPU reads | `cudaHostAlloc` (pinned memory) |
| CPU + GPU migrate automatically | `cudaMallocManaged` |
| ISP / DLA / GPU share, zero copy | **NvSciBuf / NvMedia** |

`cudaMallocManaged` is wrong here — the ISP is not the CPU and cannot see unified memory directly.

### Key tradeoffs
- NvSciBuf ties you to NVIDIA SoC hardware — not portable
- Triple buffering adds ~2 frames of latency — acceptable at 30 FPS
- Synchronization bugs (reading before write complete) cause silent data corruption

### Mental model
Think of it like memory-mapped I/O in embedded systems — the ISP has a register that is the frame buffer address. You point it at shared memory. The GPU reads from the same address. No copy, just ordering.

---

## Topic 2 — Live Context Management for SLMs

### One-liner
Manage a rolling token window in C++ so an edge LLM never OOMs during a long drive.

### Why it exists
A 3B LLM has a fixed context window (e.g. 4096 tokens). A long drive produces continuous token streams from telematics, sensor events, and GPS. Without management, you hit the limit in ~30 minutes and the process crashes or degrades.

### How it works

**Data structure: static ring buffer, zero malloc**

```cpp
class TokenRingBuffer {
    std::array<Token, 4096> pool;  // allocated once at startup
    size_t head = 0, tail = 0, count = 0;

public:
    void push(Token t) {
        pool[head % 4096] = t;
        head++;
        if (count < 4096) count++;
        else tail++;  // FIFO eviction of oldest token
    }

    // No heap allocation anywhere. Ever.
};
```

**Eviction policy: segmented, NOT pure FIFO**

Pure FIFO is dangerous — it evicts your system prompt first:

```
[SYSTEM: "You are a driving assistant. Never suggest illegal turns..."]
← pure FIFO evicts this after 30 minutes → model loses its instructions → dangerous
```

Correct approach: pinned segment + rolling segment:

```
┌────────────────────────────────────┐
│ PINNED (never evict)  ~200 tokens  │
│  - System instructions             │
│  - Destination goal                │
│  - Current safety state            │
├────────────────────────────────────┤
│ ROLLING (FIFO)       ~3800 tokens  │
│  - Telematics stream               │
│  - Old traffic events              │
│  - Sensor readings                 │
└────────────────────────────────────┘
```

**Why no malloc at runtime**

In safety-critical C++ (MISRA C++, AUTOSAR), heap allocation at runtime is forbidden:
- `malloc` has non-deterministic latency — the allocator may block
- Heap fragmentation accumulates over hours of operation
- OOM discovered at runtime = crash at the worst moment

Allocate everything in a static pool at application startup. Zero dynamic allocation during the drive.

### Key tradeoffs

| Token type | Eviction policy |
|---|---|
| System prompt / goals | Pinned — never evict |
| Recent telemetry (last N seconds) | Keep — high relevance |
| Old events (past traffic lights) | FIFO evict first |

### Mental model
The ring buffer is a circular tape recorder. The pinned segment is a sticky note on the recorder that never gets taped over. Only the rolling tape gets reused.

---

## Topic 3 — Real-Time Speculative Decoding

### One-liner
Use a tiny 100M draft model to generate candidate tokens that the 7B model validates in one parallel pass — achieving 6x speedup with identical output quality.

### Why it exists
Autoregressive generation is sequential: each token requires a full 7B forward pass (~200ms). At 33ms per frame budget, this is 6x too slow. Speculative decoding exploits the fact that **validating** a token is much cheaper than **generating** one.

### How it works

```
Step 1: Draft model (100M) generates N candidate tokens in one fast pass
        e.g. ["the", "vehicle", "is", "approaching", "red"] in 5ms

Step 2: Target model (7B) validates ALL N tokens in ONE forward pass
        (like BERT reading a sentence — parallel, not sequential) in 15ms

Step 3: Accept tokens where target agrees, reject from first disagreement
        Accept: "the", "vehicle", "is"
        Reject: "approaching" (target preferred "near")
        Discard: everything after rejection

Step 4: Rollback — pointer reset, not re-run
        Net result: 3 tokens for 15ms vs 1 token for 200ms
```

**Acceptance criterion — ratio, not threshold**

```
Accept draft token x if:
    rand() < min(1, P_target(x) / P_draft(x))
```

If target agrees (P_target ≥ P_draft): always accept.
If target partially disagrees: accept probabilistically.

This guarantees output is statistically identical to running the 7B model alone — no quality loss.

**Rollback in C++**

```cpp
struct SpecDecodeState {
    int draft_start;       // where draft batch began in context
    int accepted_count;    // how many tokens passed verification
    Token draft_tokens[N]; // candidate batch
};

// On rejection at position k:
context_buffer.truncate_to(draft_start + accepted_count);
// O(1) — just move a pointer, no re-run, no heap allocation
```

### Key tradeoffs
- Draft model must be from the same family as target for good acceptance rate
- Overhead if draft model is wrong frequently (low acceptance rate) — worse than baseline
- Requires two TensorRT engines, two CUDA streams, careful synchronization
- Sweet spot: draft model accepts ~70–80% of tokens → 4–6x real speedup

### Mental model
The draft model is a fast typist who writes a rough draft. The senior engineer (7B model) reads the whole paragraph in one scan, crosses out mistakes, and keeps what's good. Much faster than dictating word by word.

---

## Topic 4 — Deterministic INT8 Quantization & Calibration

### One-liner
Map FP16 activations to INT8 without destroying precision for safety-critical detections, using entropy calibration and layer-wise mixed precision.

### Why it exists
FP16 → INT8 reduces model size 2x and inference latency ~2–4x on Tensor Cores. Critical for fitting a model on Jetson Orin and hitting real-time latency budgets.

### How it works

**Why INT8 hurts small objects**

FP16 has 65,536 representable values. INT8 has 256. All activations across the full range are compressed into 256 buckets.

Distant pedestrians produce tiny, low-magnitude activations. With INT8:
```
Full activation range: [-127 ... 127]
Small object activations: 0.001 – 0.05  → all land in bucket 0 or 1
Information destroyed → bounding box regressor loses precision → detection missed
```

**Calibration: Entropy vs MinMax**

During TensorRT INT8 calibration, you run a representative dataset to determine where the 256 bucket boundaries sit.

*MinMax:*
```
Record absolute min and max across all calibration samples.
Map entire range to [-128, 127].

Problem: one outlier (bright pixel = 127.3) stretches the whole range.
Small pedestrian activations: all crushed into bottom 2 buckets.
```

*Entropy (KL-divergence):*
```
Find the INT8 mapping that minimizes information loss
between FP16 and INT8 activation distributions.
Saturates/clips outliers to give more buckets to the dense middle range.

Result: small object activations spread across 10–15 buckets → precision preserved.
```

**Rule:** Use Entropy calibration for almost all real models. Use MinMax only when activations are provably uniform with no outliers (rare).

**Mixed precision fix**

Don't throw away INT8 entirely — promote only the sensitive layers:

```cpp
// Backbone stays INT8 — 80% of compute, tolerant of quantization
config->setFlag(BuilderFlag::kINT8);

// Regression head stays FP16 — produces bounding box coordinates
auto layer = network->getLayer(regression_head_idx);
layer->setPrecision(DataType::kHALF);
layer->setOutputType(0, DataType::kHALF);
```

**Which layers to protect in FP16**

| Layer | Quantization | Reason |
|---|---|---|
| Convolution backbone | INT8 | Feature extraction, tolerant |
| BatchNorm, activations | INT8 | Fine |
| Classification head | INT8 | Probabilities are robust to small errors |
| **Regression head** | **FP16** | Coordinates need precision |
| **lm_head (LLM)** | **FP16** | Logit rankings determine output token |
| **Token embeddings** | **FP16** | Semantic meaning encoded in small differences |

**Adapting to LLM inference**

The regression head analog in LLMs is the `lm_head` — the final projection from hidden state (4096 dims) to vocabulary logits (32,000 values). A 0.2 difference between `brake` and `stop` logits can flip the output token. Keep it FP16.

KV cache quantization is an additional LLM-specific tradeoff:
```
KV cache FP16 → safe, memory-expensive
KV cache INT8 → 2x memory saving, slight quality loss (usually acceptable)
KV cache INT4 → 4x saving, risky for long contexts
```

### Mental model
Quantize the representation (backbone features), protect the decision (regression/lm_head). The backbone learns to recognize a pedestrian — small errors are fine. The regression head tells you where they are — small errors change the box position.

**Rule: quantize the representation, protect the decision.**

---

## Topic 5 — Multi-Model Pipeline Concurrency & MPS

### One-liner
Use NVIDIA MPS to spatially share GPU SMs across concurrent inference processes, and SM reservation to guarantee resources for safety-critical tasks.

### Why it exists
Without MPS, three separate processes each have their own CUDA context. The GPU serializes them — only one runs at a time. A 200ms planner kernel blocks lane detection for 200ms. The car is effectively blind.

### How it works

**Without MPS: serial execution**
```
Process A (Planner):     [200ms kernel ──────────────────────────────]
Process B (Lane detect): [waiting...                                 ][5ms]
Process C (Sign recog):  [waiting...                                         ][10ms]
```

**With MPS: concurrent execution**
```
Single shared CUDA context — SMs spatially partitioned:
[Planner kernel  ──────────────────────────────────────]
[Lane detect ──]
[Sign recog    ────]
All three run simultaneously on different SM groups.
```

MPS merges all processes into one CUDA context. The GPU's Streaming Multiprocessors are spatially shared rather than time-sliced.

**GPU preemption ≠ CPU preemption**

This is a critical distinction:
```
CPU scheduler: mid-instruction preemption, save full register state, restore later
GPU (CUDA):    NO mid-kernel preemption (in most cases)
               preemption only at kernel launch boundaries
               a running kernel runs to completion
```

Stream priorities affect scheduling order when resources are contested — they do NOT interrupt running kernels.

**Stream priority assignment**

```cpp
int loPri, hiPri;
cudaDeviceGetStreamPriorityRange(&loPri, &hiPri);

// Lane detection — highest priority
cudaStreamCreateWithPriority(&laneStream, cudaStreamNonBlocking, hiPri);

// Agentic planner — lowest priority
cudaStreamCreateWithPriority(&plannerStream, cudaStreamNonBlocking, loPri);
```

**The full saturation problem — MPS alone is not enough**

If the planner uses 100% of SMs, MPS cannot help — there is nowhere for lane detection to run concurrently.

Three solutions, used together:

*Solution 1: MPS SM reservation*
```bash
# Cap planner to 60% of SMs
CUDA_MPS_ACTIVE_THREAD_PERCENTAGE=60

# Lane detection always has 40% reserved
CUDA_MPS_ACTIVE_THREAD_PERCENTAGE=40
```

*Solution 2: DLA offloading (see Topic 9)*
Move CNN-based safety models (lane detection) to the DLA — physically independent hardware, zero GPU contention.

*Solution 3: WCET budgeting*
Formally prove at design time that the sum of all worst-case execution times fits within the timing budget. If it doesn't, the system doesn't ship.

**CUDA Graphs — reducing launch overhead**

Each `cudaLaunchKernel` call has ~5–10μs CPU overhead. For a pipeline launching dozens of kernels per frame:
```cpp
// Record the pipeline once
cudaGraphBeginCapture(stream);
// ... all kernel launches ...
cudaGraphEndCapture(stream, &graph);
cudaGraphInstantiate(&graphExec, graph);

// Replay every frame — single CPU call, all kernels fire
cudaGraphLaunch(graphExec, stream);
```

### Mental model
MPS = open office floor plan (everyone shares space, works in parallel).
Without MPS = meeting rooms (each process gets exclusive use, others wait outside).
SM reservation = assigned desks (safety tasks have reserved seats, can't be displaced).
DLA = a separate building entirely (lane detection runs there, immune to GPU traffic).

---

## Topic 6 — Constrained JSON Tool Calling

### One-liner
Prevent LLM hallucination of malformed JSON at the token level by masking illegal logits at every generation step — structurally impossible to produce invalid output.

### Why it exists
Small 2B–3B models hallucinate JSON syntax: wrong field names, missing brackets, string values where numbers are expected. Malformed JSON reaching the vehicle CAN bus could trigger the wrong actuator command.

Reactive approach (generate → validate → retry) wastes 200ms × N tokens before detecting the error. At 33ms control loop budget, this is unacceptable.

### How it works

JSON has a finite state machine structure. At any generation position, only certain tokens are legal:

```
Generated so far: {"action": "
Legal next tokens: letters a-z, A-Z       (start of action name)
Illegal: }, numbers, quotes, whitespace

Generated so far: {"action": "adjust_speed", "value": 
Legal next tokens: digits 0-9            (number expected)
Illegal: letters, quotes, {
```

**Logits masking — the core mechanism**

Before sampling at every token step, set illegal token logits to -∞:

```cpp
enum JSONState {
    EXPECT_OPEN_BRACE,
    EXPECT_ACTION_KEY,
    EXPECT_ACTION_VALUE,
    EXPECT_VALUE_KEY,
    EXPECT_NUMBER,
    EXPECT_CLOSE_BRACE,
};

void maskLogits(float* logits, int vocabSize, JSONState currentState) {
    for (int tokenId = 0; tokenId < vocabSize; tokenId++) {
        if (!isTokenLegalInState(tokenId, currentState)) {
            logits[tokenId] = -INFINITY;
            // softmax(-INF) = 0 → token can never be sampled
        }
    }
}

// Called inside the generation loop at every step:
// 1. Run model forward pass → raw logits
// 2. maskLogits(logits, vocabSize, currentState)
// 3. Sample from masked distribution → always a legal token
// 4. Advance state machine
```

The model literally cannot produce a structural error — probability is zero before sampling.

**Two-layer architecture**

```
Layer 1: Constrained decoding (per-token masking)
         Guarantees syntactically valid JSON
         Zero retry cost — prevention, not detection

Layer 2: C++ semantic validation (post-generation)
         Guarantees values are physically safe
         Runs at ASIL-D level, deterministic C++

```cpp
bool validateCommand(SpeedCommand cmd) {
    return cmd.value >= 0.0f && cmd.value <= 120.0f;
    // Schema correctness guaranteed by Layer 1
    // This only checks semantic safety
}
```

**Rate-of-change check — catches hallucinated values**

A model might output `{"value": 0}` while doing 60mph — syntactically valid, in range, but physically catastrophic:

```cpp
bool isSafeCommand(SpeedCommand cmd, SpeedCommand last, float dt) {
    float delta = std::abs(cmd.value - last.value);
    float maxDelta = MAX_DECEL_G * 9.8f * dt;  // physics limit
    return delta <= maxDelta;  // catches 60→0 in 33ms
}
```

### Key tradeoffs
- State machine complexity grows with schema complexity — maintain it carefully
- Masking assumes a tokenizer where JSON characters map cleanly to single tokens (not always true with BPE tokenizers — requires token trie)
- Retry loop still exists as last resort for semantic validation failures, not structural ones

### Mental model
Autocomplete on a phone keyboard — at each keystroke, only words that form valid sentences are suggested. You physically cannot type a grammatically broken sentence. The C++ state machine is the grammar checker, operating one token at a time.

---

## Topic 7 — Multi-Agent Jitter and Latency Spikes

### One-liner
Isolate agent latency spikes from the control loop using lock-free message queues, dead reckoning during gaps, and a watchdog-triggered ASIL-D fallback.

### Why it exists
A Perception agent normally runs in 20ms. Occasionally a complex scene triggers a long reasoning chain — 800ms. The Actuator agent is waiting on Perception to decide whether to brake. Control loop needs a decision every 33ms. 800ms of silence = 24 missed frames = potential accident.

### How it works

**Lock-free SPSC queue — the message channel**

A mutex blocks if the perception thread holds it during a spike. Lock-free = Actuator never waits:

```cpp
template<typename T, size_t N>
class SPSCQueue {  // Single Producer Single Consumer
    std::array<T, N> buffer;
    std::atomic<size_t> head{0}, tail{0};

public:
    bool push(const T& item) {           // Perception thread writes
        size_t next = (head + 1) % N;
        if (next == tail) return false;  // full — drop oldest
        buffer[head] = item;
        head.store(next, std::memory_order_release);
        return true;
    }

    bool pop(T& item) {                  // Actuator thread reads
        if (tail == head) return false;  // empty — non-blocking
        item = buffer[tail];
        tail.store((tail + 1) % N, std::memory_order_acquire);
        return true;
    }
};
```

`std::memory_order_release/acquire` — ensures writes are visible across cores without a mutex.

**Dead reckoning during the gap**

Do NOT spin up a new model (hundreds of ms to start). Use the last known state + physics:

```cpp
struct VehicleState {
    float speed;      // mph
    float heading;    // degrees
    float lat, lon;   // GPS position
    uint64_t timestamp_ms;
};

VehicleState deadReckon(VehicleState last, float dt) {
    VehicleState predicted = last;
    predicted.lat += last.speed * std::cos(last.heading) * dt;
    predicted.lon += last.speed * std::sin(last.heading) * dt;
    predicted.timestamp_ms += (uint64_t)(dt * 1000);
    return predicted;
    // Pure deterministic C++ math — always available, zero latency
}
```

This is standard in ADAS systems — same technique used for GPS dropout handling.

**Watchdog timer — the detection mechanism**

```cpp
class PerceptionWatchdog {
    std::atomic<uint64_t> lastHeartbeat{0};
    static constexpr uint64_t TIMEOUT_MS = 66;  // 2x frame budget

public:
    void onPerceptionComplete() {
        lastHeartbeat.store(currentTimeMs(), std::memory_order_release);
    }

    bool isTimedOut() const {
        return (currentTimeMs() - lastHeartbeat.load()) > TIMEOUT_MS;
    }
};

// In 33ms control loop:
if (watchdog.isTimedOut()) {
    safetyController.initiateControlledStop();  // ASIL-D takes over
} else {
    PerceptionResult result;
    if (perceptionQueue.pop(result)) {
        actuator.apply(result);
        lastKnownState = result.vehicleState;
    } else {
        actuator.apply(deadReckon(lastKnownState, 0.033f));  // interpolate
    }
}
```

**Three-tier ownership**

```
Tier 1: Agents (QM)        → suggest actions, no CAN bus access
Tier 2: Safety Monitor (ASIL-B) → validate timing + values, watchdog
Tier 3: Safety Controller (ASIL-D) → owns CAN bus, final decision, cannot be overridden
```

### Key tradeoffs
- Dead reckoning diverges over time — only safe for 2–5 frames (66–165ms)
- Lock-free queues require careful memory ordering — harder to reason about than mutexes
- Watchdog timeout must be tuned — too short = false triggers, too long = real danger window

### Mental model
Airplane autopilot with a co-pilot watching. The AI co-pilot (Perception agent) gives recommendations. The autopilot (control loop) checks every 33ms. If the co-pilot goes silent for 2 checks (66ms), the autopilot engages its own safe-descent protocol — it doesn't wait.

---

## Topic 8 — KV Cache & Grouped-Query Attention (GQA)

### One-liner
GQA reduces KV cache memory 4x by having groups of query heads share key-value heads; PagedAttention eliminates fragmentation with OS-style paging.

### Why it exists
Standard Multi-Head Attention (MHA) stores a Key and Value vector for every head, every token, every layer. At 4096 context, 32 heads, 128 dims, 32 layers: **2.1 GB just for KV cache** on a 16GB Jetson Orin — before model weights.

After hours of operation, mixed-length sequences cause heap fragmentation. `malloc` at inference time adds non-deterministic latency spikes.

### How it works

**Understanding attention head memory**

```
MHA (32 heads):
  Per token: 32 K vectors + 32 V vectors
  Per layer × 32 layers
  Total at 4096 context: 2.1 GB

This is just the cache — model weights are separate.
```

**From MHA → MQA → GQA**

*Multi-Query Attention (MQA):* all Q heads share 1 K and 1 V head
```
Memory: 2.1 GB → 66 MB  (32x reduction)
Problem: quality degrades significantly
```

*Grouped-Query Attention (GQA):* Q heads grouped, each group shares K and V
```
32 Q heads, 8 groups (G=8):

Group 1: Q1  Q2  Q3  Q4  → share K1, V1
Group 2: Q5  Q6  Q7  Q8  → share K2, V2
...
Group 8: Q29 Q30 Q31 Q32 → share K8, V8

KV cache: 8 K heads + 8 V heads (was 32+32)
Memory reduction: 32/8 = 4x
Quality: near-identical to full MHA
```

On Jetson Orin:
```
MHA KV cache:        2.1 GB for 4096 context  (13% of 16GB)
GQA (G=8) KV cache:  525 MB for same context  (3.3% of 16GB)
Leaves room for:     model weights + activations + buffers
```

GQA is not just an optimization — it's what makes edge LLM deployment feasible. Llama 3, Gemma, Phi-3 all use GQA.

**PagedAttention — eliminating fragmentation**

Inspired by OS virtual memory paging. Instead of one contiguous allocation per sequence:

```
Traditional allocation:
Seq A (long):  [KKKKKKKKKKKKKKKKKVVVVVVVVVVVVVVVVV]  contiguous block
Seq B (short): [KKVV]
Seq C (long):  [KKKKKKKKKKKVVVVVVVVVVV]
Seq B ends → hole in memory → fragmentation grows over hours
```

PagedAttention:
```
Static pool of fixed-size pages (allocated once at init):
[Page 0][Page 1][Page 2][Page 3][Page 4][Page 5]...

Seq A → pages [0, 2, 5, ...]   (non-contiguous, tracked in page table)
Seq B → pages [1, 3]
Seq C → pages [4, 6, ...]

Page table maps logical position → physical page
When seq ends, pages returned to pool — no fragmentation
```

```cpp
class KVCachePool {
    std::array<KVPage, MAX_PAGES> pages;  // static, allocated at init
    std::stack<int> freePages;            // page indices available

public:
    KVCachePool() {
        for (int i = 0; i < MAX_PAGES; i++) freePages.push(i);
    }

    int allocatePage() {
        // O(1), no malloc, deterministic
        int idx = freePages.top(); freePages.pop();
        return idx;
    }

    void freePage(int idx) {
        freePages.push(idx);  // return to pool
    }
};
```

Zero `malloc` at runtime. Pages pre-allocated at startup. MISRA-compliant.

### Key tradeoffs
- GQA reduces memory bandwidth — shared K/V means less data movement per attention op
- PagedAttention adds page table lookup overhead — negligible vs memory savings
- Static pool size must be tuned at design time — too small = OOM, too large = waste
- KV cache INT8 quantization: 2x further reduction, slight quality degradation — reasonable tradeoff on Orin

### Mental model
GQA: A study group where 4 students (Q heads) share one set of textbooks (K, V). Instead of each student having their own copy, they pass around shared copies. Same knowledge, 4x less paper.

PagedAttention: Library book checkout system. Each book (KV page) has a slot. Students (sequences) check out multiple books. When done, books return to the shelf for others. No pile accumulates in one corner (no fragmentation).

---

## Topic 9 — Hardware Offloading to DLA

### One-liner
The Orin SoC contains DLA ASICs that run CNN layers independently of the GPU — compile backbone layers to DLA so safety-critical inference runs with zero GPU contention.

### Why it exists
Even with MPS, if the planner LLM occupies 100% of GPU SMs, lane detection has nowhere to run. DLA is physically separate silicon — it cannot be starved by the GPU under any circumstances.

### How it works

**DLA vs GPU: the key differences**

| Property | GPU | DLA |
|---|---|---|
| Operations | Any CUDA kernel | Fixed set only |
| Performance | High, variable | Lower, deterministic |
| Power | 20–40W | 2–5W |
| Latency variance | Can jitter | Cycle-exact |
| ASIL rating achievable | QM | ASIL-B |
| Cost | High | Included in Orin die |

DLA is not faster. It is **deterministic and power-efficient**. That is its value.

**What DLA supports vs what it doesn't**

```
DLA SUPPORTS:                    DLA DOESN'T SUPPORT:
  Standard Conv2D                  Custom CUDA kernels
  Depthwise Convolution            Dynamic shapes
  BatchNorm                        Transformer attention (MHA, GQA)
  ReLU, Sigmoid, Tanh              Complex control flow
  MaxPool, AvgPool                 lm_head projection
  Elementwise operations           Sparse operations
  Fully connected (limited)
```

**VLM split: vision backbone → DLA, language model → GPU**

```
Camera Frame
     │
     ▼
┌─────────────────────┐
│  Vision Backbone    │  ← DLA 0
│  (ResNet / EfficientDet)│  Standard convolutions only
│  Feature extraction │  Runs independently of GPU
└──────────┬──────────┘
           │  feature tensor (in shared memory)
           ▼
┌─────────────────────┐
│  Language Model     │  ← GPU
│  Transformer layers │  Attention cannot run on DLA
│  Token generation   │
└─────────────────────┘
```

**Data transfer: shared memory + sync fence**

DLA and GPU are on the same SoC die, sharing the same physical memory pool. "Transfer" is a pointer pass, not a copy:

```cpp
// Allocate in shared SoC memory — visible to both DLA and GPU
NvSciBufObj featureTensor;
NvSciBufAllocate(attrs, &featureTensor);  // hardware-visible to both

// Submit vision backbone to DLA asynchronously
NvSciSyncFence dlaFence;
NvMediaDlaSubmitWithFence(dlaHandle, inputFrame, featureTensor, &dlaFence);
// CPU continues — not blocked

// GPU waits for DLA to finish, then reads feature tensor
cudaStreamWaitNvSciSyncFence(gpuStream, &dlaFence);
inferenceEngine->execute(featureTensor, outputTokens, gpuStream);
// featureTensor read by GPU — same physical address DLA wrote to
// No copy. Just ordering.
```

**Concurrent execution timeline**

```
Frame N:
  DLA 0:  [vision backbone 8ms       ]
  GPU:                                [LLM 20ms                    ]
  DLA 1:  [sign recognition 6ms  ]

Frame N+1:
  DLA 0:  [vision backbone 8ms       ]
  GPU:                                [LLM 20ms                    ]

All running simultaneously. Zero contention. This is the real answer to
full GPU saturation — put safety tasks on DLA, not on GPU.
```

**TensorRT compilation to DLA**

```cpp
// Prefer DLA for all compatible layers
config->setDefaultDeviceType(DeviceType::kDLA);
config->setDLACore(0);

// Force specific unsupported layers to GPU (fallback)
auto attnLayer = network->getLayer(attention_layer_idx);
attnLayer->setDeviceType(DeviceType::kGPU);

// TensorRT handles the split automatically:
// DLA-compatible subgraphs → DLA
// Everything else → GPU
// Handoff managed internally
```

### Decision framework

```
Use DLA when:
  ✓ Standard CNN layers (conv, pool, activation)
  ✓ Need deterministic latency (ASIL path)
  ✓ Need to run concurrently with GPU workload
  ✓ Power budget is tight

Use GPU when:
  ✓ Attention layers (MHA, GQA, FlashAttention)
  ✓ Dynamic shapes
  ✓ Custom CUDA kernels
  ✓ LLM inference (no DLA path possible)
```

### Mental model
DLA is a dedicated specialist employee who only does one type of work (CNN inference) but does it reliably, cheaply, and without competing for the main office (GPU) resources. The GPU is the general contractor — flexible, powerful, but shared. Lane detection goes to the specialist; planning goes to the general contractor.

---

## Topic 10 — Safety-Critical Veto / Arbitration Layer

### One-liner
LLM output is advisory only — a three-tier C++ architecture ensures deterministic, ASIL-D-rated validation before any command reaches the vehicle CAN bus.

### Why it exists
An LLM is a QM (non-safety-rated) component — it can hallucinate, timeout, or produce physically dangerous outputs. ISO 26262 prohibits a QM component from directly actuating a safety-critical system. A deterministic arbitration layer is mandatory.

### How it works

**Three-tier architecture**

```
┌──────────────────────────────────────────────────────┐
│  TIER 1: Agentic AI Layer                            │
│  ASIL: QM (non-safety)                               │
│  Hardware: GPU                                        │
│  Components: Perception agent, Planner agent,         │
│              Router agent, constrained decoder        │
│  Output: structured JSON suggestion                   │
│  CAN bus access: NONE                                 │
│                                                       │
│  {"action": "adjust_speed", "value": 45, "unit":"mph"}│
└─────────────────────────┬────────────────────────────┘
                          │ suggestion (no authority)
                          ▼
┌──────────────────────────────────────────────────────┐
│  TIER 2: C++ Validation Monitor                      │
│  ASIL: ASIL-B                                        │
│  Hardware: CPU (deterministic, real-time)             │
│  Checks:                                              │
│    ✓ Schema valid (constrained decoding handled most) │
│    ✓ Value in physical range [0, 120 mph]             │
│    ✓ Rate of change physically possible               │
│    ✓ Command arrived within timing budget (33ms)      │
│    ✓ Cross-check against sensor state                 │
│  Output: approved command OR rejection                │
└─────────────────────────┬────────────────────────────┘
                          │ validated command
                          ▼
┌──────────────────────────────────────────────────────┐
│  TIER 3: Deterministic Safety Controller             │
│  ASIL: ASIL-D (highest — mandatory for actuation)    │
│  Hardware: dedicated CPU core, PREEMPT_RT / QNX      │
│  Owns: CAN bus write access                          │
│  Timeout: if Tier 2 silent > 66ms → controlled stop  │
│  Cannot be overridden by any upstream layer           │
│  ISO 26262 certified                                  │
└──────────────────────────────────────────────────────┘
```

**Why ASIL-D must be CPU, not GPU**

```
GPU:  non-deterministic latency (kernel scheduling, MPS, thermal throttle)
      not ASIL-certifiable hardware
      cannot be formally verified
      fails if driver crashes

CPU (Orin real-time core, QNX or PREEMPT_RT):
      cycle-deterministic
      ASIL-D certifiable
      formally verifiable for simple C++ logic
      runs even if GPU fails completely
```

**Rate-of-change validation — the check most miss**

```cpp
bool isSafeCommand(SpeedCommand cmd, SpeedCommand lastCmd, float dt_seconds) {
    // Value range check
    if (cmd.value < 0.0f || cmd.value > 120.0f) return false;

    // Rate of change check — physically impossible delta
    float delta = std::abs(cmd.value - lastCmd.value);
    float maxPhysicalDelta = MAX_DECEL_G * 9.8f * dt_seconds;
    if (delta > maxPhysicalDelta) return false;
    // Catches: {"value": 0} while doing 60mph → would destroy brakes

    return true;
}
```

**ASIL decomposition — the formal framing**

| ASIL Level | Meaning | Example in this stack |
|---|---|---|
| QM | Quality managed, no safety requirement | LLM inference |
| ASIL-A | Lowest safety level | Comfort features (seat adjustment) |
| ASIL-B | Moderate safety | Validation monitor, watchdog |
| ASIL-C | High safety | Redundant sensor fusion |
| ASIL-D | Highest safety | Final actuator control, CAN bus write |

The key rule: **ASIL-D cannot accept input from QM without an ASIL-B/C intermediate decomposition.** The three-tier architecture is not a design choice — it is a compliance requirement.

**Complete flow with all topics connected**

```
ISP frame [Topic 1: zero-copy via NvSciBuf]
     │
     ▼
DLA 0: vision backbone [Topic 9: DLA offloading, concurrent]
     │  (sync fence)
     ▼
GPU: VLM attention layers [Topics 4,5: INT8 + MPS]
     │
     ▼
Draft tokens [Topic 3: speculative decoding, 6x faster]
     │
     ▼
Constrained decoder [Topic 6: logits masking, valid JSON guaranteed]
     │
     ▼
Rolling context [Topic 2: ring buffer, pinned system prompt]
     │
     ▼
Tier 1 suggestion: {"action": "adjust_speed", "value": 45}
     │
     ├── Watchdog [Topic 7: 66ms timeout, dead reckoning fallback]
     │
     ▼
Tier 2: C++ validation (range + rate-of-change check)
     │
     ▼
Tier 3: ASIL-D controller → CAN bus → drivetrain
```

### Key tradeoffs
- More layers = more latency — each validation step costs microseconds; budget carefully
- ASIL-D certification is expensive — requires documentation, formal verification, testing campaigns
- The LLM as advisor pattern limits autonomy — edge cases where the LLM is right but the safety layer rejects it are real; tune conservatively

### Mental model
Air traffic control. The pilot (LLM) suggests a flight path. The co-pilot (Tier 2) cross-checks it against regulations and physics. ATC (Tier 3) has final authority and can override both. The pilot never touches the radio directly.

---

## Quick Reference — APIs and Tools

| Purpose | API / Tool |
|---|---|
| ISP/DLA/GPU shared memory | NvSciBuf, NvMedia |
| CUDA stream synchronization | cudaEventRecord, cudaStreamWaitEvent |
| Cross-hardware sync | NvSciSyncFence |
| INT8 calibration in TensorRT | IInt8EntropyCalibrator2 |
| Mixed precision per layer | layer->setPrecision(DataType::kHALF) |
| DLA compilation | config->setDefaultDeviceType(DeviceType::kDLA) |
| MPS SM reservation | CUDA_MPS_ACTIVE_THREAD_PERCENTAGE |
| Stream priority | cudaStreamCreateWithPriority |
| CUDA Graphs | cudaGraphBeginCapture / cudaGraphLaunch |
| GPU profiling | Nsight Systems (timeline), Nsight Compute (kernel) |
| Memory-bound vs compute-bound | Nsight Compute — roofline model |

---

## Quick Reference — Safety Standards

| Standard | Scope | Relevance |
|---|---|---|
| ISO 26262 | Functional safety, automotive E/E systems | ASIL levels, safety architecture |
| MISRA C++ | C++ coding guidelines for safety systems | No malloc at runtime, no exceptions |
| AUTOSAR | Software architecture standard | Memory management, OS abstraction |
| QNX / PREEMPT_RT | Real-time OS | Deterministic scheduling for Tier 3 |

---

## Study Priority — What to do next

### High priority (gaps identified in this session)
1. **CUDA programming model** — read CUDA C Programming Guide chapters 1–4: threads, blocks, SMs, warps, streams, events. One focused day covers the conceptual gaps.
2. **TensorRT hands-on** — build one pipeline: PyTorch model → ONNX export → TensorRT INT8 build → run inference. Hands-on closes the gap faster than reading.
3. **ISO 26262 ASIL levels** — read a 2-page summary. Know QM/A/B/C/D definitions and what they mean for software architecture. Will immediately distinguish you.

### Medium priority
4. **NvSciBuf / NvMedia API** — NVIDIA developer documentation, focus on buffer allocation and sync primitives
5. **TensorRT-LLM** — run the example notebooks for speculative decoding and INT8 quantization
6. **PagedAttention** — read the vLLM paper (10 pages) — the C++ concepts transfer directly

### Practice answers to memorize
- "7B VLM at 5 FPS, need 30 FPS" → quantization checklist + speculative decoding + CUDA Graphs + DLA offload backbone
- "Thread-safe TensorRT wrapper for multiple sensor threads" → one engine per CUDA stream, lock-free queue feeding inference threads, no shared mutable state
- "How does MPS differ from stream priorities?" → MPS = spatial SM sharing across processes; priorities = scheduling order within shared context; neither preempts running kernels
