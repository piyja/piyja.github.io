---
layout: post
title: "What is a neuron? and a neural network?"
date: 2026-01-01 
description: A beginner-friendly walkthrough of how neural networks learn — from neurons and weights to forward pass and backpropagation.
category: ml-basics
tags: [ML, Neural Networks, Deep Learning]
---

## A Neuron {#neuron}

A neuron is the fundamental building block of a neural network. It takes in one or more inputs, applies a weighted sum to them, adds a bias, and then passes the result through an activation function to produce an output. The weights and bias are learnable parameters that the network adjusts during training to minimize the error in its predictions.
It depicts a simple mathematical function that can capture non-linear relationships in data, allowing neural networks to model complex patterns and make accurate predictions.

## Neurons, all the way down {#neural-network}

A neural network is just a stack of matrix multiplications with non-linearities sprinkled in. Each "neuron" computes a weighted sum of its inputs, adds a bias, then squashes the result through an activation function like ReLU or sigmoid.

```
output = activation(W · x + b)
```

String a few of these layers together and you have a network capable of approximating remarkably complex functions.

## Forward pass {#forward-pass}

Data flows left to right: input → hidden layers → output. Each layer transforms the representation, gradually building up features from raw pixels (or tokens, or tabular values) into something the final layer can classify or regress on.

## Backpropagation {#backpropagation}

Training works by measuring the error at the output (the *loss*), then propagating gradients back through the network using the chain rule. Each weight gets nudged in the direction that reduces the loss — that nudge is the *learning rate* times the gradient.

```
w ← w - lr * ∂L/∂w
```

Repeat this for thousands of mini-batches and the network learns.

## Why does this work? {#why-it-works}

Universal approximation theorem: a sufficiently wide single hidden layer can approximate any continuous function. In practice, depth beats width — deeper networks learn hierarchical features more efficiently.

That's the core idea. Everything else (CNNs, Transformers, diffusion models) is specialised architecture built on this foundation.
