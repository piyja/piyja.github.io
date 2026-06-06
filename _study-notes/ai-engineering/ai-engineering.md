---
title: "AI Engineering"
slug: ai-engineering
description: "How AI engineering differs from traditional ML engineering, and the foundations of building production AI systems"
tags: [MLSystems, LLM, MLOps]
links:
  - context-engineering
  - coding-agents-workflow
group: "AI Engineering"
---

## What is AI Engineering?

AI Engineering is the discipline of building production-grade applications on top of foundation models (LLMs, multimodal models). It differs from traditional ML engineering in a fundamental way: instead of training models from scratch, AI engineers work primarily with pre-trained models through APIs and prompting.

### AI Engineering vs. Traditional ML Engineering

| Traditional ML Engineering | AI Engineering |
|---------------------------|----------------|
| Train models from data | Prompt pre-trained models |
| Weeks/months to iterate | Hours/days to iterate |
| Requires ML expertise | Accessible to software engineers |
| Custom architectures | Foundation model APIs |
| Data pipelines are core | Context management is core |

## Foundations

### The Stack

1. **Foundation Models** — The LLMs themselves (GPT-4, Claude, Gemini, Llama)
2. **Inference Layer** — APIs, batching, caching, rate limiting
3. **Context Layer** — RAG, memory, tool use, prompt engineering
4. **Application Layer** — Agents, workflows, user interfaces

### Why It Matters

The shift from training to prompting has dramatically lowered the barrier to building intelligent systems. However, it introduces new challenges:
- **Non-determinism** — same input can produce different outputs
- **Evaluation** — harder to measure quality than classic ML metrics
- **Cost** — token costs at scale require careful optimization
- **Context limits** — managing what fits in the context window

## Key Skills for AI Engineers

- Prompt engineering and evaluation
- RAG (Retrieval Augmented Generation) system design
- Agent architectures and tool use
- LLM observability and monitoring
- Context management strategies
