---
title: "Context Engineering"
slug: context-engineering
description: "The art and science of managing what goes into an LLM's context window to get the best outputs"
tags: [LLM, Prompting, Agents]
links:
  - ai-engineering
  - memory-management-agents
group: "AI Engineering"
---

## What is Context Engineering?

Context engineering is the discipline of designing what information goes into an LLM's context window, when, and in what format. As LLMs become the core compute unit of AI systems, the context window becomes the primary interface — what you put in largely determines what you get out.

> "The context window is the LLM's entire world at the moment of inference."

## Components of a Context Window

A well-engineered context typically contains:

1. **System prompt** — role, constraints, persona, output format instructions
2. **Retrieved knowledge** — relevant documents from a vector store or search (RAG)
3. **Tool definitions** — available functions the model can call
4. **Conversation history** — prior turns, summarized or truncated as needed
5. **Working memory** — intermediate results, scratchpad content
6. **Current user input** — the actual task or question

## Key Principles

### 1. Relevance Over Volume
More context is not always better. Irrelevant information increases cost, latency, and can distract the model ("lost in the middle" problem).

### 2. Recency Bias
LLMs tend to pay more attention to content at the beginning and end of the context. Place critical instructions at the start; put the most relevant retrieved content close to the query.

### 3. Structure Signals Intent
Using clear delimiters (XML tags, markdown headers, labeled sections) helps the model understand the role of each piece of context.

### 4. Context is Stateless
Each inference call starts fresh. Continuity must be explicitly engineered — through conversation history management, summarization, or external memory.
See [[memory-management-agents]] for a deep dive on how agents persist state across sessions.

## Context Management Strategies

| Strategy | When to Use |
|----------|-------------|
| Full history | Short conversations |
| Sliding window | Long conversations, recent context matters most |
| Summarization | Long conversations, need to preserve key facts |
| RAG | Factual queries, large knowledge bases |
| Episodic memory | Agents that need to recall past sessions |

## The Tension: Richness vs. Cost

Every token in the context costs money and latency. The goal is to be maximally informative with minimal tokens — which is fundamentally a compression and retrieval problem.
