---
layout: post
title: Building Agentic Applications
date: 2026-05-16
description: In this post, we will explore the concept of agentic applications, their design principles, and how they can be leveraged to create more autonomous and intelligent systems.
tags: MLOps
categories: MLOps
chart:
  vega_lite: true
giscus_comments: true
toc:
  sidebar: left
---

# What are agentic applications?
    - Agentic applications are softwares which build around AI models to utilize it as the decision making and reasoning engine
    - AI models are used as the controller to this systems that take actions based on the data and context it receives.
    - This enables the applications to shift away from hard coded rules and logic increasingly making them more flexible, adaptable and intelligent.

    Before the agentic term was coined by Andrew Ng, Lilian Weng described such application in her blog "LLM Powered Autonomous Agents" in 2023. In her blog, she describes how LLMs can be used to build autonomous agents that can perform complex tasks by breaking them down into smaller sub-tasks and delegating them to different agents or tools. Here in this blog we are building on the ideas which Lilian pitched had already picthed and have become standard to develop agentic applications today but also going to add more structure, design principles and learning from the community over this time.

## Core components of an agentic application

Agentic applications typically consist of several core components that work together to enable the application to function autonomously. These components include:

- AI models and inference server layer - the core decision making and reasoning engine of the application
- Task planning module - 
    - Task decomopistion step - methods which breaks down complex tasks into smaller sub-tasks to be deligated to different agents or tools
    - Reasoning and reflection step - Chain / Tree of thoughts
- Orchestrator layer - the system that manages the flow of information and tasks between the AI model, task decomposer, tools and other agents. This sits at the heart of the application and is responsible for ensuring that the different components work together seamlessly to achieve the desired outcomes.
- Taking actions via tools - the external systems and APIs that the AI model can interact with to perform actions and gather information
    - Together with the reasoning step this forms the basis for ReAct (Reasoning and Acting) pattern which is widely used in agentic applications
    - Standards used for tool usage and integration - A2A protocol, MCP servers, etc.
- Memory - the system that stores the context and information for the AI model to use in its decision making process
    - Short term memory - the system that stores the information and context for the AI model to use in its decision making process over a short period of time
    - Long term memory - the system that stores the information and context for the AI model to use in its decision making process over a long period of time
    - External memory and knowledge base stored as vector embeddings or more recently graph database are gaining popularity as the long term memory for the AI models
- Data and evaluation metrics pipeline - the system that collects, processes and feeds data to the AI model
    - This enabled the system to evaluate how well the agents are working on the tasks assigned to them
    - ## Heuristic-based agents
        Heuristics means the rules of thumb, the mental shortcut a pragmatic engineer would take while designing a product.

        - rule-based systems
        - expert systems
        - decision trees
        - finite state machines
        External feedback and chain of hindsight?

## Benefits of agentic applications

Agentic applications utilises the power of AI models more effectively. By building around the AI models, agentic applications can leverage the models' ability to learn from data and adapt to new situations, making them more flexible and adaptable than traditional applications. This allows for more complex and sophisticated applications that can handle a wider range of tasks and scenarios.
It also allows the applications to be not hard coded and rule based anymore.

# Multi-agent systems

## Why do we need multiple agents in an application?
Inorder to maintain separation of concerns and make expert modules for different tasks, it is advices to have multiple agents in an application. This allows for better modularity, scalability and maintainability of the application. Each agent can be designed to specialize in a specific task or domain, allowing for more efficient and effective performance. Although it add challenges on the communication and task orchestration between the agents, it is a trade off worth making for the benefits it provides.

### Design principles for multi-agent systems
- Modularity - each agent should be designed to specialize in a specific task or domain, allowing
for better modularity and separation of concerns
- Communication - the agents should be able to communicate and share information effectively to achieve the desired outcomes
- Coordination - the agents should be able to coordinate their actions and tasks to achieve the desired outcomes
- Scalability - the system should be designed to scale as the number of agents and tasks increases
- Robustness - the system should be designed to handle failures and errors gracefully, ensuring that the
application can continue to function even when individual agents fail or encounter issues.

