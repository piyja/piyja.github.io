---
layout: post
title: "My Personalised Coding Agent Workflows"
slug: coding-agents-workflow
description: "Practical patterns for working effectively with AI coding agents like Claude Code and Copilot"
tags: [Agents, Thoughts, MLOps]
links:
  - memory-management-agents
  - pi-coding-agent-review
categories: [Field Notes, ai-engineering]
---

# My Personalised Coding Agent Workflows

## What is the agentic coding workflow?

The agentic coding workflow is about using LLMs as a **thinking partner and a coding assistant** — not just a smarter autocomplete. I started skeptical. Chat bots felt like a party trick; agentic workflows felt like hype. That changed when I started seeing real productivity gains on tasks that would have otherwise cost me hours: complex refactors, iterative debugging, developing implementations from high level design. Now I use coding agents across the full spectrum — from quick planning sketches to multi-session tasks that evolve well beyond my initial idea.

## Setup of the coding harness

Every week there are new frontier coding models dropping, each claiming to break the previous benchmark. I've stopped chasing benchmarks and instead optimised for flexibility.

My daily workflow runs on two harnesses:

- **Pi coding agent** — fully open source, minimalist by design. You bring your own models, including local ones. That model-agnostic freedom is the main reason I consider it my primary harness. I've connected both local and frontier models to it, and the ability to swap without changing my workflow is something Claude Code can't match.
- **Claude Code** — excellent capabilities, but strictly tied to Anthropic's models behind API walls. I use it when I need the full weight of Sonnet/Opus on a hard problem.

#### How much can a 12B edge model actually do for coding?

Quite a lot, if you prompt it right. A 12B model falls apart on complex tasks when you dump everything at once — but break the task into small, well-scoped steps and prompt iteratively, and it holds up well. It handles code reviews, simple generation, and debugging reliably. My current pattern: use a heavy frontier model to create a clear, well-structured plan, then hand execution to the small model. It follows defined plans well. The cost savings are significant and the quality loss is minimal when the plan is tight.

## Using skills effectively

Skills are how I extend what coding agents can do without burning tokens reinventing workflows in every session.

Skills I keep coming back to:

- `tutor` — when I want to go deep on a concept rather than just get an answer. Install: `npx skills add piyja/myAgentsSkills/skills/tutor`
- `system design` — when I'm designing a new system or architecture and want structured thinking from the agent
- `grill-with-docs` — starts a challenge session against your plan, grounded in your actual domain docs. Excellent for stress-testing a design before committing to it
- `superpowers` (Anthropic) — a collection of workflow primitives covering code generation, debugging, TDD, and more

## Tips for cost-effective and efficient use of coding agents

1. **Use plan mode first.** High-level design before any code. Review and push back on the plan using your own engineering judgement — the agent is not always right.
2. **Compact the context aggressively.** When you're approaching context limits, summarise and reset. Stale context degrades output quality.
3. **Match model to task.** Thinking and planning → heavy frontier model. Executing a clear plan → smaller, cheaper model.
4. **Use skills.** Don't rebuild common workflows from scratch in every session.
5. **Delegate plan execution to smaller models.** A well-defined plan from a large model runs cleanly on a 12B. The quality gap closes fast when the task is well-specified.
6. **Create session summaries.** At the end of a long session, generate a structured summary and use it as context seed for the next one. Saves tokens, keeps the important decisions in scope.

## Where I spend most of my time as a Software Engineer

The biggest leverage I've found with coding agents is in **abstract thinking and solution design** — not code generation. The agent becomes a sparring partner for exploring the problem space: brainstorming approaches, debating trade-offs, thinking through edge cases. It's a good rubber duck, but one that pushes back.

The other place I invest heavily is **test-driven development**. Writing tests first forces you to think clearly about the problem before touching implementation. I use the agent to help write the tests, then write code to pass them. The loop is tighter and the designs come out cleaner.