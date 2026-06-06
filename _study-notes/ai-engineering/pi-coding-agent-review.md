---
title: "Review: Using Pi as a Coding Agent"
slug: pi-coding-agent-review
description: "Personal experience and lessons learned from using Pi (an AI assistant) as a coding companion"
tags: [Agents, Thoughts]
links:
  - coding-agents-workflow
  - ai-engineering
group: "AI Agents"
---

## Background

Pi is a conversational AI assistant built by Inflection AI. While primarily designed as a personal assistant, I experimented with using it as a coding companion for a period — asking it to help debug, explain code, and brainstorm solutions.

## What I Was Testing

I wanted to understand how a conversational AI (without direct code execution or file access) compares to purpose-built coding agents (Claude Code, Cursor) when used informally for software tasks.

## What Worked Well

### Explaining Concepts
Pi excels at explaining *why* code works a certain way, walking through algorithms, and drawing analogies. It's patient and adaptive — it will re-explain in different terms if the first explanation doesn't land.

### Rubber Duck Debugging
Describing a problem to Pi often helped me think it through, even when Pi's specific suggestions weren't useful. The act of formulating a precise question exposes your own assumptions.

### High-Level Design Discussion
For early-stage thinking about architecture or API design, Pi was a good thinking partner. It would surface tradeoffs and ask clarifying questions without jumping to implementation.

## Where It Fell Short

### No Code Execution Context
Pi can't run code, read files, or check outputs. Every interaction is purely textual, which means you're doing more transcription and context-setting than with integrated agents.

### Stale Knowledge
Pi's training cutoff means it may not know recent library versions, new APIs, or best practices that emerged after its cutoff. You have to verify its suggestions against current docs.

### No Codebase Awareness
It can only see what you paste in. For tasks requiring understanding of how multiple files interact, this becomes a significant limitation very quickly.

## Key Takeaway

Pi (and conversational AIs in general) are best as *thinking partners* for software work, not execution engines. They're good for concepts, tradeoffs, and rubber-duck debugging. For actual code changes, purpose-built coding agents with file access and tool use are dramatically more effective.

The right mental model: use conversational AI for the *design* phase, use coding agents for the *implementation* phase.
