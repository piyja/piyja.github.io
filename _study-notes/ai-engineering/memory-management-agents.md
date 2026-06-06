---
title: "Memory Management for Agents"
slug: memory-management-agents
description: "How AI agents store, retrieve, and manage memory across sessions and tasks"
tags: [Agents, LLM, MLSystems]
links:
  - context-engineering
  - coding-agents-workflow
group: "AI Agents"
---

## The Memory Problem in AI Agents

LLMs are stateless by nature — each call to the model sees only what's in the current context window. For agents that operate over long tasks or across sessions, this creates a fundamental challenge: how do you give an agent a sense of continuity and accumulated knowledge?

## Types of Agent Memory

### 1. In-Context Memory (Working Memory)
Content directly in the current context window. Fast, reliable, but limited by context size and cost.

**Use for:** Current task state, recent tool results, immediate reasoning steps

### 2. External Memory (Episodic / Semantic)
Stored outside the LLM, retrieved on demand:
- **Vector databases** — semantic search over embeddings (Pinecone, Chroma, pgvector)
- **Key-value stores** — exact lookup of structured facts
- **Document stores** — full text retrieval

**Use for:** Long-term facts, past interactions, knowledge bases

### 3. In-Weights Memory
Knowledge baked into the model during pretraining and fine-tuning. Not modifiable at inference time without retraining.

**Use for:** General world knowledge, language understanding, domain expertise

### 4. Cache Memory
KV-cache at the inference level — reuse computation for repeated prefixes (system prompts, static context). Reduces latency and cost significantly.

**Use for:** Stable system prompts, frequently repeated documents

## Memory Lifecycle in a Long-Running Agent

```
Task Start
    │
    ▼
Load relevant memories from external store (semantic search)
    │
    ▼
Execute task steps (accumulate in-context)
    │
    ▼
On context limit: summarize + write important facts to external store
    │
    ▼
Task End: consolidate session into long-term memory
```

## Practical Patterns

### Episodic Memory with Summaries
After each session, have the agent write a structured summary: what was accomplished, key decisions made, open questions. Retrieve these summaries at the start of future related sessions.

### Hierarchical Memory
- **Short-term:** Full detail, last N turns
- **Medium-term:** Compressed summaries of past sessions
- **Long-term:** Key facts and preferences (user profile, learned patterns)

### Memory Decay and Freshness
Not all memories are equally valuable over time. Implement recency weighting in retrieval — recent memories should score higher unless the query is specifically historical.

## The Hard Problems

1. **What to remember** — agents can't store everything; deciding what matters is non-trivial
2. **Retrieval quality** — semantic search often surfaces vaguely related but wrong memories
3. **Memory conflicts** — when old memories contradict new information, which wins?
4. **Privacy** — user data in memory stores requires careful governance
