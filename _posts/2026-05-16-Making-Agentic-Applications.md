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

Agentic applications are softwares which builds around AI models to utilize it as a decision making and reasoning engine along with the tools and external systems it interacts with. AI models are used as the controller to this systems that can also trigger the actions based on the data and context it receives. This enables the applications to shift away from hard coded rules and logic increasingly making them more flexible, adaptable and intelligent.

Before the agentic term was coined by Andrew Ng, Lilian Weng described such application in her blog "LLM Powered Autonomous Agents" in 2023. In her blog, she describes how LLMs can be used to build autonomous agents that can perform complex tasks by breaking them down into smaller sub-tasks and delegating them to different agents or tools. Here in this blog we are building on the ideas which Lilian pitched had already picthed and have become standard to develop agentic applications today but also going to add more structure, design principles and learning from the community over this time.

## Benefits of agentic applications

Agentic applications utilises the power of AI models more effectively. By building around the AI models, agentic applications can leverage the models' ability to learn from data and adapt to new situations, making them more flexible and adaptable than traditional applications. This allows for more complex and sophisticated applications that can handle a wider range of tasks and scenarios.
It also allows the applications to be not hard coded and rule based anymore.

## Core components of an agentic application

Agentic applications typically consist of several core components that work together to enable the application to function autonomously. These components include:

1. AI models and inference server layer - the core reasoning engine which comprehends and derives meaning from the application
    - This is the core component of the agentic application which is responsible for understanding the context, making decisions and generating responses based on the data it receives. The AI model can be a large language model (LLM) or any other type of AI model that is suitable for the task at hand. The inference server layer is responsible for managing the communication between the AI model and the other components of the application, as well as handling the inference requests and responses.
2. Reasoning and task planning module
    - Reasoning step is the most crucial step where the AI model thinks about the task at hand and generates a plan of action to achieve the desired outcome. This can be steps like breaking down the task into smaller sub-tasks, identifying the tools and resources needed to complete the task, and determining the best course of action to take.
    - Task decomposition step - methods which breaks down complex tasks into smaller sub-tasks to be delegated to different agents or tools in the system. This can involve techniques such as hierarchical task decomposition, where tasks are broken down into a hierarchy of sub-tasks, or flat task decomposition, where tasks are broken down into a flat list of sub-tasks.
3. Orchestrator layer and agent loop architecture - the system that manages the flow of information and tasks between the AI model, task decomposer, tools, other agents and evaluate results.
    - The react loop of observe → think → act → observe again. This sits at the heart of the application and is responsible for ensuring that the different components cordinates and communicates seamlessly to achieve the desired outcomes.
    - Together with the reasoning step this forms the basis for ReAct (Reasoning and Acting) pattern which is widely used in agentic applications
4. Taking actions via tools - the external systems and APIs that the AI model can interact with the external world by performing actions and gather information
    - Tool usage can be triggered by the reasoning module or can be hard coded for specific tasks. For example, if the task is to book a flight, the reasoning module can trigger the use of a flight booking tool to complete the task.
    - Standards used for tool usage and integration - A2A protocol, MCP servers, etc. which allows to scale and develop such tools independently and also share them across different agents in the system
    - Each agent can use multiple tools at a time and also share tools with other agents in the system
5. Context management - system which decides how to prune vs summarize the stored cache used for the session data
    - Context is basically what the AI model can see right now, as inherently models are stateless and every call must contains all the details required by it to generate the output. 
    - What does the current context contain?  
        - system prompt
        - retrived data
        - recent messages
        - tools and it's output
    - As the context can grow linearly over time, we need strategies to trim or summarize it. Common techniques include sliding window, summarize-and-compress, hierarchical isolation, etc.
6. Memory - unlike context here the context data is stored for future use by the models as well as read for current inference cycle
    - Short term memory - the system that stores the information and context for the AI model to use in its decision making process over a short period of time
    - Long term memory - the system that stores the information and context for the AI model to use in its decision making process over a long period of time
    - External memory and knowledge base stored as vector embeddings or more recently graph database are gaining popularity as the long term memory for the AI models
7. Data and evaluation metrics pipeline - the system that collects, processes and feeds data to the AI model
    - This can include data from user interactions, tool usage, and other sources that can be used to train and improve the AI model over time. It also includes the evaluation metrics that are used to measure the performance of the AI model and the overall system. This can include metrics such as accuracy, precision, recall, F1 score, etc. which are used to evaluate how well the AI model is performing on the tasks it is designed to handle. 
    - Heuristic-based agents - Heuristics means the rules of thumb, the mental shortcut a pragmatic engineer would take while designing a product. These are agents that are designed to follow a set of predefined rules or heuristics to make decisions and take actions. These agents can be useful in situations where the task is well-defined and can be easily codified into a set of rules. However, they may not be as flexible or adaptable as AI model-based agents, which can learn from data and adapt to new situations.
        - rule-based systems
        - expert systems
        - decision trees                    
        - finite state machines
    - Chain of hindsight - the system that collects feedback from users and other sources to improve the performance of the AI model over time. This can include techniques such as reinforcement learning, where the AI model learns from the feedback it receives to improve its performance on the tasks it is designed to handle. Chain of hindsight is a technique where the AI model can learn from its past mistakes and successes by analyzing the outcomes of its actions and using that information to improve its future decision making process.
8. Trust & safety boundaries — one of the most critical design concerns in agentic systems. How do you constrain what an agent can do? Sandboxing, permission scopes, human-in-the-loop checkpoints.
  irreversible action guards.
    - This is a crucial aspect of designing agentic applications, as it is important to ensure that the AI model does not take actions that could be harmful or unethical. This can be achieved through techniques such as sandboxing, where the AI model is isolated from the rest of the system and can only interact with it through a controlled interface, or through permission scopes, where the AI model is only allowed to access certain resources or perform certain actions based on predefined rules. Additionally, human-in-the-loop checkpoints can be used to allow for human oversight and intervention in critical decision-making processes.

# Developing application with Multi-agent

## Why do we need multiple agents in an application?
Inorder to maintain separation of concerns and make expert modules for different tasks, it is advices to have multiple agents in an application. This allows for better modularity, scalability and maintainability of the application. Each agent can be designed to specialize in a specific task or domain, allowing for more efficient and effective performance. Although it add challenges on the communication and task orchestration between the agents, it is a trade off worth making for the benefits it provides.

## Design principles for multi-agent systems
- Modularity - each agent should be designed to specialize in a specific task or domain, allowing
for better modularity and separation of concerns
- Communication - communicate and share information effectively to achieve the desired outcomes
- Coordination - coordinate their actions and tasks to achieve the desired outcomes
- Scalability - scale as the number of agents and tasks increases
- Robustness - handle failures and errors gracefully by retry/fallback/partial-pass/escalate mechanisms

## Orchestration patterns for multi-agent systems

### Decision Control Patterns
- Centralized orchestration - a single orchestrator agent manages the flow of information and tasks between the different agents in the system. This can be simpler to implement but may become a bottleneck as the number of agents increases.
- Decentralized orchestration - each agent is responsible for managing its own tasks and communication with
other agents. This can be more complex to implement but can provide better scalability and robustness.
- Hybrid orchestration - a combination of centralized and decentralized orchestration, where some agents are responsible
for managing their own tasks and communication, while others are managed by a central orchestrator. This can provide a balance between simplicity and scalability.

### Flow Control Patterns
- hierarchical orchestration - agents are organized in a hierarchical structure, where higher-level agents manage the flow of information and tasks between lower-level agents. This can provide better modularity and separation of concerns but may require more complex communication and coordination between agents.
- peer-to-peer orchestration - agents communicate and coordinate directly with each other without a central orchestr
ator. This can provide better scalability and robustness but may require more complex communication and coordination between agents.
- event-driven orchestration - agents communicate and coordinate based on events and triggers, allowing for more flexible and dynamic interactions between agents. This can provide better adaptability and responsiveness but may require more complex event management and coordination between agents.
- pipeline orchestration - agents are organized in a pipeline structure, where the output of one agent serves as the input for the next agent in the pipeline. This can provide better modularity and separation of concerns but may require more complex communication and coordination between agents.

I hope this gives a good overview of the moving parts and design principles for building agentic applications. As the state of the art of this field is evolving rapidly, I will keep updating this post with new learnings and insights from the community. If you have any suggestions or feedback, please feel free to reach out!
