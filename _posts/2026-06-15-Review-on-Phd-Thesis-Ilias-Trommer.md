---
title: "Review: PhD Thesis — Dr Ilias Trommer"
slug: phd-thesis-ilias-trommer
description: "Notes from reading Dr. Ilias Trommer's PhD thesis on efficient neural network inference"
tags: [MLSystems, LLM]
links:
  - ai-engineering
category: ai-engineering
---

On the quest of learning about machine learning at the edge — from building and optimizing models to tuning data pipelines and the infrastructure around them — I came across Dr. Trommer's talk at an event in Berlin. It sparked enough interest to follow up, and along with some references, he suggested reading his thesis to get a grounded understanding of fundamental optimization techniques for model training and inference. I'll admit that some sections were not easy reads, but in the interest of time I focused on understanding the main arguments and conclusions rather than working through every mathematical derivation.

The thesis covers techniques for optimizing neural networks to run on edge devices. The central constraint at the edge is power — tokens per watt is the metric that matters, not raw throughput. Dr Trommer's argument is that models can be optimized through quantization (both during training and post-training at inference time), and that quantization-aware training in particular yields meaningful gains. A key premise throughout is that training and inference should not be designed in isolation — thinking about them jointly produces better outcomes when deploying on embedded hardware.

---

## Key Challenges of Edge AI Focused in this Work
- **Energy efficiency**: power consumed per inference is the primary performance metric; tokens per watt is what counts
- **Memory constraints**: RAM is limited, which affects how large a model can be, how fast it runs, and how much context it can hold — target inference speeds for coding models, for example, are around 40–50 tokens per second


## Thinking from First Principles

- The bulk of computation during inference is spent on multiplication
- This is the core operation that GPUs and NPUs are built around
- Approximate multiplication exploits the fact that exact precision is not always necessary — tolerating small arithmetic errors in exchange for lower cost
- Model weights tend to be highly sparse: many values are near zero after training. By identifying and encoding only the non-zero parameters, the model can be compacted significantly, reducing both memory footprint and the number of operations needed at runtime — directly addressing the memory and power constraints of edge deployment

## Chapter 1: Foundations of Efficient Neural Networks

- Overview of how to make models more efficient for deployment
- Post-training quantization: reducing numerical precision after training is complete
- Quantization-aware training: simulating quantization during training so the model learns to be robust to reduced precision
- Pruning: inducing sparsity by removing less important weights from the model
- Approximate computing: accepting small arithmetic errors to reduce computational cost

## TorchApprox: A PyTorch Extension for Approximate Multiplication

- An extension to PyTorch that brings approximate multiplication into standard deep learning workflows
- Includes support for multiple quantization techniques, making it practical to experiment with approximate computing in training

## Chapters 3 & 4: Approximate Multiplication in Depth

- Introduces approximate multiplication as a first-class design consideration for efficient models
- Model sensitivity to approximation errors can be predicted — this makes it possible to apply approximate multiplication selectively where it does least harm
- The space of possible approximate multipliers is unbounded, but bounding it to a practical subset enables hardware-efficient implementations

## Chapter 5: Memory-Efficient Sparse Parameter Encoding

- Introduces a memory-efficient encoding scheme for sparse parameter matrices
- Addresses unstructured pruning, where individual weights are zeroed out rather than entire structures like filters or layers

## Chapter 6: End-to-End Application

- Combines approximate multiplication and unstructured pruning in a practical deployment scenario
- The result: arithmetic resource usage and memory footprint are each reduced by approximately 50%

---

Dr Trommer is notably clear-eyed about the scope and limitations of the work — he explicitly identifies which perspectives are missing and what the study does not measure, with energy consumption being the primary axis of evaluation throughout. The thesis offers a coherent set of insights into how model training and inference can be co-optimized by targeting the most fundamental operation a processor performs: multiplication. The parallel thread on sparse parameter representation and memory-efficient encoding adds another practical dimension, showing how the structural properties of trained weights can themselves be leveraged to reduce the cost of running models on constrained hardware. Taken together, it is a focused and technically honest contribution to the problem of deploying capable models at the edge.
