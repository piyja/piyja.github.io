---
layout: post
title: Inside Out of a LLM
date: 2026-05-14
description: In this post, we will explore the inner workings of LLMs and how they are designed and built. Basic concepts which build LLM will be discussed here.
tags: MLSystems
categories: MLSystems
chart:
  vega_lite: true
giscus_comments: true
toc:
  sidebar: left
---

Following article is from my notes while learning on how LLMs work and what happens inside a LLM when we infer them. The resources I used to learn about LLMs are listed throughout [the repo myMLStudy](https://github.com/piyja/myMLStudy).

## The full forward pass (one layer, one token)

The user input is first tokenized and converted into token vectors. Each token vector is then processed through a transformer decoder layer, which transforms it into an enriched output vector by incorporating information from previous tokens through attention and applying non-linear transformations via feed-forward networks. Here's a step-by-step breakdown of the forward pass for one token through one layer:

Input: `x, shape (dim,)`

| Step | Operation | In layman's terms |
|---|---|---|
|  1 | `xb = RMSNorm(x)` | normalized input for attention |
|  2 | `Q = xb @ Wq` | "what am I looking for?" |
| | `K = xb @ Wk` | "what do I offer to queries?" |
| | `V = xb @ Wv` | "what information do I carry?" |
|  3 | `scores[t] = Q · K_cache[t] / √head_size` for t = 0..pos | attention scores over past tokens |
|  4 | `weights = softmax(scores)` | probability distribution over past tokens |
|  5 | `xb = sum(weights[t] * V_cache[t])` | weighted blend of value vectors |
|  6 | `xb2 = xb @ Wo` | project back to dim |
|  7 | `x = x + xb2` | first residual connection |
|  8 | `xb = RMSNorm(x)` | normalized input for FFN |
|  9 | `hb = xb @ W1` | expand to hidden_dim (4x) |
| | `hb2 = xb @ W3` | |
| | `hb = SwiGLU(hb, hb2)` | gate: `silu(hb) * hb2` |
|  10 | `xb = hb @ W2` | compress back to dim |
|  11 | `x = x + xb` | second residual connection |
| **Output** | `x, shape (dim,)` | enriched token vector |

This block repeats for every layer of the model (32 in Llama-7B). Then:

```
x = RMSNorm(x)
logits = x @ Wcls          → (vocab_size,)
next_token = sample(logits)
```

## Embracing Q, K, V — why do we have three vectors?

Each token projects into three separate vectors via learned matrices `Wq`, `Wk`, `Wv`:

| Vector | Meaning | Role |
|---|---|---|
| Q (query) | "what am I looking for?" | Dot with other tokens' K |
| K (key) | "what do I offer to queries?" | Matched against Q |
| V (value) | "what information do I carry?" | Blended into output |

**Why not one vector?** A token's ability to ask questions (Q) and its ability to answer others (K) are different learned behaviors. V is even more separate — it carries the actual content that flows into the output, independent of how attention scores are computed.


## Multi-Head Attention — why multiple heads?

A single large head can only learn one way to measure relevance. Multiple smaller heads learn different relationship types in parallel. Outputs are concatenated and projected via `Wo`.

N heads each have their own `Wq`, `Wk`, `Wv`. Each head learns to specialize in a different type of relationship.

### Backpropagation and training — how do LLMs learn from data?

1. Runs forward pass, compute loss (how wrong the output is)
2. Chain rule backwards: at each layer, multiply incoming gradient by local derivative
3. Each weight gets a gradient: does increasing this weight increase or decrease the loss?
4. Update: `w = w - learning_rate × gradient`

## Residual connections — why add the input back to the output?

Each layer only needs to learn a *delta* (what to add), not rewrite the full vector. The original signal flows through untouched.
A borrowed analogy: think of a birthday card, the card itself is the input, and the message inside is the delta. The card can be passed through many layers of people adding their own messages without losing the original card. The residual connection allows the original input to be preserved while allowing each layer to add its own contribution. The reason behind the backpropagating of the gradients is that if any layer's derivative < 1, repeated multiplication shrinks the gradient to ~0 quickly making the initial layers not learn effectively. Residuals solve this by providing a gradient highway.

**Why:** Each layer only needs to learn a *delta* (what to add), not rewrite the full vector. The original signal flows through untouched.

**Backprop benefit:** The chain rule at a residual gives:

```
d(x₁)/d(x₀) = 1 + d(F(x₀))/d(x₀)
```

The `1` is a gradient highway — even if `d(F)/d(x₀)` shrinks to zero, gradients still reach early layers. This is why 32-96 layer models are trainable.

**What residuals don't fix:**
| Problem | Solution |
|---|---|
| Vanishing gradients | Residual connections |
| Exploding gradients | Gradient clipping |
| Early training chaos | Weight initialization |
| Step size | Learning rate + scheduler |

## Layer normalization — why normalize the input to each block?

Applied *before* each attention block and each FFN block (pre-norm):

```
rms = sqrt(mean(x²))
x̂  = x / rms
out = learned_weights * x̂
```

**Why normalize:** after each residual addition, vector magnitudes can grow, destabilizing training.

**Why learned re-scale weights:** normalization destroys scale information. The model learns per-dimension weights to recover the scales that matter for each layer. Without them, normalization would be purely static.

## Feed forward networks — why have a separate feed forward network after attention? not just activation functions

After attention mixes *which* tokens communicate, FFN decides *what to think* about that mixture:

```
expand:    hb  = xb @ W1    (dim → hidden_dim, ~4x bigger)
gate:      hb2 = xb @ W3
activate:  hb  = SwiGLU(hb, hb2)   = silu(hb) * hb2
compress:  xb  = hb @ W2    (hidden_dim → dim)
```

FFN layers behave like **key-value memories** — neurons in the hidden layer fire for patterns ("European capital", "past tense verb"), and W2 retrieves associated knowledge back into the token vector.

Attention = routing (who talks to whom).
FFN = storage (what facts are applied).

## KV Cache — how do transformers efficiently handle long contexts during inference?

During generation, every new token needs to attend to all previous tokens. Without cache: recompute K and V for all previous tokens every step — O(N²) recomputation.

With cache: store K and V for each token as computed, at its position:

```c
s->k = key_cache   + layer_offset + pos * kv_dim;
s->v = value_cache + layer_offset + pos * kv_dim;
```

Q is **not cached** — it's only needed for the current token. Once a position is done, its Q is never used again.

**Memory cost:**

```
2 × n_layers × seq_len × kv_dim × 4 bytes
```
For Llama-7B, seq_len=4096: ~1GB just for KV cache.

**Prompt processing:** the model runs a full forward pass on every prompt token to populate the KV cache, even though it forces the known next token and ignores the logits.

## Encoder vs Decoder vs Encoder-Decoder models — what are the differences and use cases for each architecture?

Encoder - only models (BERT) use bidirectional attention and are trained with masked language modeling (MLM) objectives, making them ideal for understanding tasks like classification and embeddings.

Decoder - only models (GPT, Llama) use causal attention and are trained to predict the next token, making them ideal for generation tasks.

Encoder-Decoder models - combine both, using an encoder to process the input sequence and a decoder to generate the output, making them ideal for sequence-to-sequence tasks like translation, summarization and reasoning.

| Architecture | Attention | Training objective | Use case |
|---|---|---|---|
| Decoder-only (GPT, Llama) | Causal (left-to-right only) | Predict next token | Generation |
| Encoder-only (BERT) | Bidirectional (full context) | Fill masked tokens (MLM) | Classification, embeddings |
| Encoder-Decoder (T5) | Encoder: full / Decoder: causal + cross-attention | Seq-to-seq | Translation, summarization |

**Key insight:** Encoder architecture cannot generate not because of the attention pattern alone, but because its training objective (MLM) never learned `P(next token | previous tokens)`. The causal mask in decoders *enforces* learning that distribution during training.

**Cross-attention** (encoder-decoder only): decoder Q comes from the decoder's own tokens; K and V come from the encoder's output. This is how the decoder "reads" the input sequence while generating the output.


