---
layout: post
title: WIP Inside Out of a LLM
date: 2026-05-21
description: In this post, we will explore the building blocks of LLM, their basic definition and how they work together to make a LLM. 
tags: MLSystems
categories: MLSystems
chart:
  vega_lite: true
giscus_comments: true
toc:
  sidebar: left
---

Previously we saw the internals of the LLM and [how the forward pass works](), useful to know for inferencing. Although I felt the lack of covering the basics, hence decided to capture the building blocks of the LLM. We will cover the concepts - tokenization, embeddings, position encoding, self-attention, multi-head attention, encoder vs decoder vs encoder-decoder, feed forward networks, layer normalization, KV cache their basic definition and how they work together to make a LLM.

I do not intend to cover the deep details of the concept but rather on high level which will serve as good starting point for anyone or a good recap place for those who are already familiar with the concepts. I will be sharing the resources which I used to learn about these concepts in the [repo myMLStudy]().


## Tokenization

### What is tokenization?

Tokenization is the process of breaking down text into smaller units called tokens represented as numbers so that we can feed them into the model.

### Types of tokenization
1. Char wide tokenization - each character is a token
2. Word wide tokenization - each word is a token
3. Subword tokenization - each subword is a token, which can be a word or subword. This is the most common type of tokenization used in LLMs, as it allows the model to handle out-of-vocabulary words and capture more fine-grained information about the text.

## Embeddings

Embeddings are dense vector representations of tokens that capture their semantic meaning and relationships. They are learned during the training of the model and are used to represent the input tokens in a continuous vector space. The embedding layer maps each token to a high-dimensional vector, which is then processed by the subsequent layers of the model. Embeddings allow the model to capture the meaning and context of words, enabling it to generate more coherent and relevant responses.

## Position Encoding

Position encoding is a technique used in transformer models to provide information about the position of tokens in a sequence. Since transformer models do not have a built-in notion of token order, position encoding allows the model to capture the sequential nature of the input data. There are different methods for position encoding, such as sinusoidal position encoding or learned position embeddings. The position encoding is added to the token embeddings before being processed by the attention mechanism, allowing the model to understand the relative positions of tokens in the input sequence.

## Self-Attention

## Multi-Head Attention

## Encoder vs Decoder vs Encoder-Decoder

## Feed Forward Networks

## Layer Normalization

## KV Cache





