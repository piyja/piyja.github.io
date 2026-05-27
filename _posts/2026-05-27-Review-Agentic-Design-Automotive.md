---
layout: post
title: Review of Agentic Design in Automotive
date: 2026-05-27
description: 
tags: MLOps, MLSystems
chart:
  vega_lite: true
giscus_comments: true
toc:
  sidebar: left
---

## Article review - [How to Build In-Vehicle AI Agents with NVIDIA: From Cloud to Car](https://developer.nvidia.com/blog/how-to-build-in-vehicle-ai-agents-with-nvidia-from-cloud-to-car/)

Nvidia's DRIVE team recently published a blog post on developing in-vehicle edge AI agents. I wanted to share my notes on it here and add further thoughts about the critical focus areas from the lens of product strategy and user requirements. Since I am working in the automotive domain, I find it important to keep an eye on the developments in the industry and also to understand how the big players are thinking about the future of in-vehicle AI agents. We can hinge our product development on these key evaluation parameters and critical focus areas and develop a reliable and robust agentic AI systems.

### Arguments made in the article - a quick analysis 

1. As building AI models powered applications is becoming common we are shifting away from hard Rule-based programming and entering new phase in which we make use of the AI powered Agents, the so called agentic AI shift. As fixed command-response doesn't scale well; LLMs/VLMs enable conversational AI with memory, reasoning, and proactive assistance.   
2. Although to get reliable output AI model requires a good amount of hardware acceleration. Real-time AI at the edge can be hard — if you have need to run 7B+ param models locally, preferably for multimodal use case. Importantly it also requires rethinking of the memory budget and not just the compute budget. The in cabin edge computation would require tight SLO/SLA of 400-500ms response time, >30 tokens/sec, multimodal inputs (camera + audio + telemetry), all while preserving privacy of the users.
3. The user experience for invehicle can be greatly enhanced by leveraging edge models with input from the cloud in form of compute, tools or peer agents. This blog talked about the hybrid cloud-edge architecture — Local agents for in-car tasks, cloud agents for use case like web/trip planning; key challenges would be here to correctly route intent, context sharing, and graceful degradation when the vehicle is offline.
4. The pipeline for agentic voice based assistants briefly contains this chain 

      ```wake word -> ASR -> Orchestrator -> LLM inference -> Tools -> TTS -> audio output```

    The orchestrator is the key component that routes user input to the right LLM, manages context, and handles fallback when the vehicle is offline. Nvidia's NeMo Agent Toolkit serves as the glue for building, orchestrating and evaulating these agents.
5. For the OEMs, Nvidia comes with a hardware solution in 3 levels each with more commitment for AI ready hardware stack: 
    * AI Box build with DRIVE AGX as a modular add-on to the existing IVI system providing a plug and play solution for AI agents without full E/E redesign. But the downside would be increased inter processor communication latency and potential bottlenecks.
    * DRIVE AGX Thor taking the above solution further by utlizing blackwell GPUs serving a platform for AI workload for the whole vehicle
    * A single central car computer fused with DRIVE AGX fused with the MediaTek Dimensity AX SoC - a fully integrated solution for infotainment and AI workloads, but would require more commitment to the new hardware architecture. Will have a great upside that latency for data communication will be the lowest but then again it would require a full redesign of the E/E architecture and software stack.

### Critical focus areas for building in-vehicle AI agents

1. **Specialised models for the voice pipeline** — 
    The 500ms-700ms end-to-end SLA is a budget distributed across every stage of the pipeline. Each arrow in `Wake Word → ASR → Orchestrator → LLM → TTS → Audio Output` carries a latency cost, leaving roughly 150ms per stage — which immediately constrains model size and quantization decisions at every step.

    Starting upstream: always-on wake word detection is a distinct engineering problem that precedes the ASR stage. It must run continuously on a low-power audio DSP with a near-zero false-positive rate — misfires while driving are both annoying and a safety distraction.

    For ASR, Mixture-of-Experts (MoE) architectures are well suited to automotive conditions because the acoustic environment is finite set of profiles (highway noise, HVAC, music, quiet cabin). MoE routing can specialise experts per acoustic profile, and the router can be conditioned on vehicle telemetry (speed as a proxy for road noise, HVAC state) before audio even arrives — proactive expert selection rather than reactive. The tradeoff: MoE models have a higher total parameter count even when only a fraction activates, so they require careful VRAM budgeting on edge hardware. 

    For TTS, streaming token-by-token output directly to the audio renderer is the single highest-leverage latency optimisation available. The first audio chunk can begin playing while subsequent tokens are still being generated, cutting perceived response time significantly even if wall-clock total is unchanged.

    The orchestrator LLM also deserves specific attention: for a voice assistant context, its fine-tuning objective is fundamentally different from a general-purpose LLM. Inputs are short, intent-dense, and often acoustically degraded. The model needs to be optimised for rapid intent classification and slot filling. The reasoning part can be tricky and optional as we could have complex queries coming from user which would require reasoning over multiple tools. Alas we have to find a balance here.

    Finally, user feedback comes in three distinct forms with different pipeline implications: explicit (thumbs up/down), implicit (user rephrasing the same request after a failure), and behavioural (abandoning the interaction entirely). Treating all three as a single "feedback loop" leads to muddled improvement signals — each requires a different data pipeline and triggers different retraining decisions.

2. **Platform scalability and the standardisation gap** — 
    We need automotive software standards that address agentic AI orchestration. AUTOSAR Adaptive has introduced ML model management interfaces, but we also need agent-to-agent communication contracts, tool calling interfaces, memory management for multi-turn context, or evaluation criteria for agentic behaviour. OEM-specific frameworks share the same gap and in my opinion this is a significant structural requirement for long-term scalability of in-vehicle AI agents.

    The cloud/edge routing question also carries a hard constraint that "location-agnostic" framing obscures: some tasks cannot be cloud-routed regardless of latency or connectivity, not for performance reasons but for safety and regulatory ones. An agent recognising a medical emergency must complete that interaction fully on-edge. Safety-critical voice paths and comfort/infotainment paths have fundamentally different routing requirements, fallback policies, and hardware resource allocations — treating them as a single routable workload is architecturally incorrect.

    Testing and evaluation for automotive voice agents cannot rely on general-purpose LLM benchmarks. What is needed — and does not yet exist as a public standard — is domain-specific evaluation covering: navigation command accuracy across real address formats, HVAC and media control intent parsing, multi-turn context retention under acoustic degradation, and regional language and accent coverage. Building such an evaluation framework is a prerequisite for any serious agent improvement programme.

3. **Agents deep in the automotive software stack** 

    Automotive software enforces hard partitioning between safety domains through a hypervisor managing multiple OSes simultaneously: typically a real-time OS for safety-critical functions, QNX or equivalent for high-availability services, and Linux for infotainment and AI workloads. 
    An AI agent running in the Linux partition has no direct path to safety-critical vehicle functions — all communication must cross hypervisor guest boundaries via IPC or RPC, adding latency and introducing a new class of failure modes that must be explicitly designed against.

    The core tension is that LLM-powered flexibility is inherently non-deterministic, while Classic AUTOSAR at ASIL-D requires hard real-time determinism. 
    These properties cannot be reconciled by pushing the LLM deeper into the stack. 
    The practical architectural answer is that the LLM remains at the application layer and communicates intent downward through well-defined, auditable tool-calling interfaces — constrained API boundaries that enforce certifiable behaviour at the safety layer while allowing flexible reasoning above it.

4. **Personalised and context-aware setup** — 
    Agentic setup offers means to highly personalise the setup as per the user and continuously improve the agents - dedicated pipelines can be designed to receive and store feedback from the user, handle errors, and continuous improvement of the agent's performance in real-world conditions.
   

### Closing points:

  Navigating this moving landscape of AI engineering and taking steps to create platform for building and iterating on AI agents in the future can be tough. 
  But with wholistic design thinking and a user-product centric approach we can build system ready for the future. Finally the onus is on the decision making step - on deciding what to build!