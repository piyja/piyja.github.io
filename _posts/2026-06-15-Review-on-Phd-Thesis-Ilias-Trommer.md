---
title: "Review: PhD Thesis — Ilias Trommer"
slug: phd-thesis-ilias-trommer
description: "Notes from reading Dr. Ilias Trommer's PhD thesis on efficient neural network inference"
tags: [MLSystems, LLM]
links:
  - ai-engineering
category: ai-engineering
---

How I came to read this thesis?

What is this thesis about?
Covers topics to optimize the models to be running on the edge. Limitations at edge - consumption of power has been a key metric for measurement of performance.
Models can be optimized by quantization during training and post training while inferencing.
There are good benefits of using quantised aware training methods
Model training and inference can be thought jointly to make the best when running it on embedded device.

What are the challenges of the edge AI models?
- energy efficient - power consumptions during inference matters X / Tokens watts matters 
- memory constraints RAM - can have limited context

Where is the most of the time spent during training - 
- in multiplication 
- what does the GPU / NPU do
- approximation in multiplication
- make the models sparsity

chapter 1 basics about the Artificial Neural network
- how to make the models more efficient
- post training qunatization
- quantization aware training
- pruning - using sparsity of model
- approximate computing

TorchApprox - extension to pytorch for approx multiplication
- contains different quantization techniques supported

chapter 3 and 4 - 
- introduction of approximate multiplication
- model sensitivity - error can be predicted with AM
- number of AMs are unbounded and can be made hardware efficient by bounding it

chapter 5 -
- memory efficient encoding of sparse parameter matrix
- unstructured pruning 

chapter 6 -
- application development - which applied techniques of approximate multiplication and unstructure pruning of model 
- reduces arthematic resources and memory by 50 percent

Conclusion - the author is clear about which perspectives are missing and limitation of the study (measure mainly on energy comsumption). 
This stiudy gives a great deal of insights on how the models training and inference can be optimized by targetting most fundamental task which a processor spends while running these models that is about approximately multiplication. 
The author also talks about the sparse matrix and how efficiency can be found in memory efficient encoding.
