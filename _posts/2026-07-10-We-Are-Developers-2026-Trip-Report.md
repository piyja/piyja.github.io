---
layout: post
title: "We Are Developers 2026 — Trip Report"
date: 2026-09-07
slug: we-are-developers-2026-trip-report
description: "A trip report from We Are Developers 2026 in Berlin — workshops, talks, booth visits, and key takeaways on Edge AI, inference optimisation, and the agentic wave."
tags: [Edge AI, Agents, Inference, Conferences]
categories: [Field Notes]
giscus_comments: false
toc:
  sidebar: left
---

# We Are Developers 2026 — Berlin {#wad-2026}

We Are Developers is one of those conferences where the sheer volume of content makes it impossible to catch even 10–15% of what is happening. With **10+ tracks** of tech talks, **6+ workshops** running 2 hours each, and a packed exhibition floor, the only winning strategy is to be deliberately selective — pick the areas that matter most to your current work and go deep there. Most of the talks end up on YouTube anyway, so the real value of attending in person is the workshops, the hallway conversations, and the booth visits.

I spent most of my time at the conference attending hands-on workshops, talking to people to catch key insights on **Edge AI application development**, visiting booths to understand what they offer and how their tools could fit into our work, and cherry-picking talks that aligned with these interests.

## Company booth visits {#booth-visits}

The exhibition floor is where you get a concentrated view of where the industry is heading — each booth is a window into a specific bet someone is making. Here are the ones that stood out:

- **Antithesis** — their approach to test generation from "key property" based testing is compelling. Instead of writing individual test cases, you define the properties your system must satisfy, and their platform generates the tests automatically. Great potential for catching edge cases that manual test writing tends to miss.
- **Qualcomm + Arduino + Edge Impulse** — a joint showcase around Edge AI. Qualcomm has spun off an edge compute initiative where you can collect and train data using their software stack, paired with Arduino hardware for on-device deployment. The end-to-end flow from data collection to model training to edge deployment was well demonstrated.
- **Snowflake** — stopped by to understand the breadth of cloud services they now offer beyond the data warehousing core. The platform has expanded significantly into data applications and AI workloads.
- **OpenSearch** — the open-source search platform continues to mature. Useful to see how it positions against managed alternatives, especially for use cases where data sovereignty matters.
- **Neo4j** — graph-based search and knowledge representation. With the growing interest in graph-based retrieval for RAG systems, this was a timely visit to understand the current state of their APIs and integrations.
- **Vercel** — showcased their AI-powered platform capabilities — agents, skills, and the developer experience they are building around server-side AI inference. Interesting to see how they are thinking about the developer workflow for agentic applications.
- **LaunchDarkly** — beyond feature flags, they are now running tests automatically to find vulnerabilities and can revert deployments automatically when issues are detected. The shift from feature management to automated safety nets is a notable evolution.

## Talks {#talks}

### Day 0 — Copilot inside IntelliJ IDEs {#day0-copilot}

Day 0 was overcrowded and I could only attend one talk. The session on **Co-Pilot inside IntelliJ IDEs** showcased practices that are fairly regular for us now — code completion, context-aware suggestions, and the usual workflow integrations. One new learning stood out: a **containerised method to run parallel tasks** with a coding agent, enabling multiple agents to work simultaneously. You can also use `git worktree` to achieve something similar — spinning up isolated working trees so each agent has its own clean context to operate in. Practical and immediately useful.

### Day 1 {#day1-talks}

**Thomas Dohmke — The Agentic Assembly Line** was a highlight. The core idea: store context and memory that can be transferred across sessions. Instead of every coding session starting from scratch, the system retains the chat history and commit context alongside the code changes — so it understands not just *what* was done, but *how* the solution space was explored to arrive there. This is a significant step towards making coding agents feel like continuous collaborators rather than stateless tools.

**The R in RAG: Why Retrieval is Often the Weakest Link (and How to Fix It)** dug into the part of the RAG pipeline that most practitioners struggle with. The talk went beyond the usual "chunk your data better" advice and addressed the structural issues in retrieval that cause downstream generation quality to suffer.

**Goodbye Microservices, Hello Self-Contained Systems** made a case for a middle ground between monoliths and microservices — systems that are self-contained enough to be independently deployable and understandable, without the operational overhead that microservices architectures tend to accumulate.

**Owning the Inference Layer: When and How to Run Your Own Models** covered the decision framework for when to self-host inference versus relying on API providers, and the practical considerations around cost, latency, and control that go into that choice.

**The Retrieval Layer for Edge AI** was a demo session showing what edge AI applications can do in practice — live object detection through smart glasses. Seeing the retrieval and inference pipeline run in real-time on a constrained device made the practical possibilities feel much more tangible.

**Inside Mercedes-Benz: 140 Years of Heritage Meet AI** explored how a legacy automotive giant is integrating AI into its operations and products — a useful perspective on the challenges of bringing modern AI capabilities into established engineering cultures.

**Nemotron: NVIDIA's Open Model Strategy for Developers** covered NVIDIA's approach to open models aimed at giving developers more flexibility in deploying inference workloads, particularly for specialised domains.

**Building the Nervous System of AI** framed the infrastructure layer — the connectivity, data pipelines, and orchestration — that ties AI components together into functioning systems, much like a nervous system coordinates a body.

**Physical AI for the Next Wave of Industrial Digitalisation** was one of the most forward-looking talks. It covered the NVIDIA stack for physical AI: **Omniverse** for simulation environments, **Cosmos** for synthetic data generation, and **Isaac** for physical AI foundational models. All built around open-source models and blueprints designed to run on specific hardware. This is where the digital-physical gap starts closing.

### Day 2 {#day2-talks}

**Future of Mobile AI: What On-Device Intelligence Means for App Developers** was a comprehensive overview of where edge inference is heading. The key points:

- **Models are small enough to run on devices** — ranging from 300M to 1B to 3B parameters. Models like Gemma, Qwen, and Phi are making on-device inference practical for real applications.
- **Runtimes** — ONNX Runtime and llama.cpp are the dominant options for running these models efficiently on constrained hardware.
- **Frameworks** — MediaPipe and Cactus are making it easier to integrate on-device models into mobile applications without deep ML expertise.
- **Hardware** — NPUs and TPUs are now measured in FLOP/s and TOP/s (tera operations per second), and the available silicon is finally catching up to what these small models need.
- **Arbitration approaches** — the question of when to run on-device versus when to fall back to the cloud. Patterns discussed included mobile-first, cloud-first, intent classification to route requests, and a cascading approach where you try on-device first and escalate to cloud only when needed.

## Workshops {#workshops}

### Day 1 {#day1-workshops}

**Accelerating AI Inference at Scale: A Deep Dive into NVIDIA Dynamo on Kubernetes** was a hands-on session with dedicated hardware — 2 H100 GPUs each. The workshop covered:

- Basics of inferencing and the tokenization process inside LLMs — understanding what actually happens when tokens flow through the model.
- **Disaggregation optimisation techniques** — separating different stages of the inference pipeline (prefill vs decode) to optimise throughput and latency independently.
- Performance benchmarking with AI Perf for LLM inferencing workloads.

Having dedicated H100s for a hands-on notebook session is a rare opportunity — it made the optimisation concepts much more concrete when you could see the performance numbers change in real time.

**Edge Impulse — Ducks, Sensors & Agents: Hands-On Edge AI with Arduino UNO Q** was a full end-to-end edge AI workshop. Using the Arduino Q with the Qualcomm chip:

- Collected data on the Edge Impulse cloud instance — image data for object recognition and gyroscope data for motion classification.
- Trained models on the collected data directly within the platform.
- Deployed the trained models onto the Arduino hardware and ran inference locally — classifying ducks in real time from camera input.

The workshop was a clean demonstration of the full edge AI loop: collect → train → deploy → infer, all within a constrained hardware setup.

### Day 2 {#day2-workshops}

**Compress, Cut, and Distill: The Latest Gen AI Model Compression Techniques in Practice** was directly relevant to anyone working on deploying models on edge devices. The workshop covered the full toolkit:

- **Quantisation** — reducing the precision of model weights to shrink model size and speed up inference, with practical guidance on when to use INT8, INT4, or mixed precision.
- **Depth-wise pruning** — removing entire layers from the model to reduce depth, trading some accuracy for significant gains in inference speed.
- **Breadth-wise pruning** — reducing the width of layers (fewer neurons per layer) while keeping the depth, a finer-grained approach to compression.
- **Distillation techniques** — training a smaller student model to mimic the behaviour of a larger teacher model, preserving much of the capability at a fraction of the compute cost.

**Generate Synthetic Data for Physical AI with NVIDIA Cosmos World Foundation Models** covered:

- What Cosmos models are and how they fit into the physical AI pipeline.
- Generating synthetic data with these models for training — particularly useful when real-world data is expensive or dangerous to collect.

## Key takeaways {#takeaways}

The overarching theme across the conference was clear: **AI is moving closer to the edge, and the tooling to make that practical is finally maturing.** From the small models (Gemma, Qwen, Phi) that can run on phones, to the runtimes (ONNX Runtime, llama.cpp) that make it efficient, to the hardware (NPUs, TPUs) that provides the compute — the full stack for on-device intelligence is coming together.

The other thread running through many talks and workshops was **model optimisation as a first-class concern** — quantisation, pruning, distillation, and disaggregated inference are no longer niche techniques but essential tools in any engineer's toolkit for deploying AI at scale.

And the agentic wave continues to build — from coding agents that retain context across sessions, to the assembly-line patterns for orchestrating multiple agents, to the infrastructure plays from NVIDIA and others making it possible to run these systems efficiently. The shift from stateless tools to continuous collaborators is underway.
