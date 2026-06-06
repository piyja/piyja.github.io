---
title: "Coding Agent Workflows"
slug: coding-agents-workflow
description: "Practical patterns for working effectively with AI coding agents like Claude Code, Cursor, and Copilot"
tags: [Agents, Thoughts, MLOps]
links:
  - memory-management-agents
  - pi-coding-agent-review
group: "AI Agents"
---

## The Shift in How We Write Code

Coding agents like Claude Code, Cursor, and GitHub Copilot have changed the texture of software development. You're no longer writing every line — you're directing, reviewing, and composing. The mental model shifts from *author* to *editor*.

## Effective Workflows

### 1. Spec Before Code
The biggest leverage point with coding agents is the quality of your specification. A vague request produces vague code; a precise spec with constraints, examples, and success criteria produces production-ready code.

**Anti-pattern:** "Add user authentication"
**Better:** "Add JWT authentication with a 1-hour access token and 7-day refresh token. Store refresh tokens in Redis with the key `refresh:{userId}`. On expiry, redirect to `/login` with the original URL as a query param."

### 2. Review, Don't Just Accept
Agents write plausible-looking code that may be subtly wrong. The review step is where your expertise still matters most:
- Does the logic actually handle edge cases?
- Are there security issues (injection, auth bypass, data leaks)?
- Does it follow the existing patterns in the codebase?

### 3. Incremental Tasks over Big Bangs
Agents work best on bounded, well-defined tasks. Break large features into small, independently verifiable steps. Commit after each successful step.

### 4. Keep the Agent in Context
Coding agents lose context across sessions. Techniques to help:
- Use CLAUDE.md / AGENTS.md to document project conventions
- Be explicit about what files are relevant
- Share test failures rather than just describing bugs

This is fundamentally a [[context-engineering]] problem — what you put in the agent's context window determines what you get out.

## The Agent Loop

```
You specify task
    │
    ▼
Agent proposes changes
    │
    ▼
You review diff
    │
    ▼
Accept / reject / redirect
    │
    ▼
Run tests / verify
    │
    ▼
Commit or iterate
```

## What Agents Are Good At

- Boilerplate and repetitive patterns
- Translating specs into code
- Refactoring with clear rules
- Writing tests given an implementation
- Debugging with stack traces
- Explaining unfamiliar code

## What Agents Struggle With

- Cross-file architectural decisions
- Subtle business logic constraints
- Performance optimization (without profiling data)
- Security-critical code without explicit prompting
- Tasks requiring deep domain context

## Measuring Productivity

The right metric isn't "lines of code per hour" — it's "features shipped per week" and "bugs introduced per PR". Agents can increase velocity while also introducing subtle bugs if you're not reviewing carefully.
