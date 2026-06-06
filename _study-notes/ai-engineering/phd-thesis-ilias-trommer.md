---
title: "Review: PhD Thesis — Ilias Trommer"
slug: phd-thesis-ilias-trommer
description: "Notes from reading Dr. Ilias Trommer's PhD thesis on efficient neural network inference"
tags: [MLSystems, LLM]
links:
  - ai-engineering
group: "Research"
---

## Thesis Overview

Dr. Ilias Trommer's PhD thesis focuses on efficient inference for neural networks, particularly addressing the computational and memory bottlenecks that make deploying large models at scale expensive.

## Core Themes

### 1. Quantization
Reducing the numerical precision of model weights and activations (e.g., from FP32 to INT8 or INT4) to reduce memory footprint and accelerate inference on hardware that handles lower-precision arithmetic efficiently.

Key insight: most of the information in a trained model is in the *structure* of the weights, not their exact floating-point values. Significant precision can be dropped with minimal accuracy loss if done carefully.

### 2. Calibration Post-Training
Rather than training quantized models from scratch, post-training quantization (PTQ) calibrates an already-trained model using a small dataset. This avoids expensive retraining while recovering much of the accuracy lost to quantization.

### 3. Efficient Attention Mechanisms
Standard attention is O(n²) in sequence length. The thesis covers work on approximate or sparse attention patterns that reduce this cost for long sequences — relevant to modern LLMs with 128k+ context windows.

## Why This Matters for LLM Deployment

The economics of inference at scale are dominated by:
- **Memory bandwidth** — how fast you can move weights from memory to compute units
- **Compute utilization** — how efficiently the GPU/TPU arithmetic units are used

Quantization addresses both: smaller weights mean better bandwidth utilization, and INT8/INT4 arithmetic is faster on modern hardware than FP32.

## Connections to Production AI Engineering

These low-level efficiency techniques have become mainstream in production LLM serving:
- **GPTQ / AWQ** — popular post-training quantization methods for LLMs
- **bitsandbytes** — 4-bit and 8-bit quantization library widely used in Hugging Face ecosystem
- **vLLM / TGI** — serving frameworks that leverage these techniques at scale

## Personal Takeaways

Reading this thesis reinforced that the gap between a model's "benchmark accuracy" and its production cost is enormous. The research on efficient inference isn't just an optimization concern — it's what makes deploying LLMs economically viable for anything beyond the largest companies.
