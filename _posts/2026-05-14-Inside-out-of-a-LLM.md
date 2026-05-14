---
layout: post
title: Inside Out of a LLM
date: 2026-05-14
description: In this post, we will explore the inner workings of LLMs and how they are designed and built. Basic concepts which build LLM will be discussed here.
tags: MLSys
categories: MLSys
chart:
  vega_lite: true
giscus_comments: true
toc:
  sidebar: left
---

# What are Large language models?
# What are the basic building blocks of LLMs?
## The full forward pass (one layer, one token)
## Q, K, V — why three vectors?
## Multi-Head Attention — why multiple heads?
## Residual connections — why add the input back to the output?
### Backpropagation and training — how do LLMs learn from data?
### Which problem residual connections solve? Why do we need them in deep networks?
## Layer normalization — why normalize the input to each block?
## Feed forward networks — why have a separate feed forward network after attention?
## Positional encoding — how do transformers handle the order of tokens?
## KV Cache — how do transformers efficiently handle long contexts during inference?
## Encoder vs Decoder vs Encoder-Decoder models — what are the differences and use cases for each architecture?
