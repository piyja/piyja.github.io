---
layout: post
title: 
date: 2024-03-27 00:20:00
description: What is adaptive about Adaptive AUTOSAR?
tags: Automotive
categories: [Field Notes]
chart:
  vega_lite: true
giscus_comments: false
toc:
  sidebar: left
---

In the last few days, I dedicated some time to learning about the Adaptive AUTOSAR (AA) platform. Anticipating the course of automotive software development, it becomes important to understand the problems that AA aims to solve. In the past, our team worked closely with AA to develop a consumer service application that provided some sensitive data, but the inner workings of the platform were still to be explored. 
The challenge in understanding AA was in the multilevel workflow from modeling the system and deployments to finally developing the applications. Wrapping one's head around the complete process is a time-consuming task. In a functional automotive project, there are teams working on each level of this development work, which together execute the complete process. In the following sections, I have jotted down important points to gain a high-level understanding of AA.

Before delving more into AA, let's understand more about AUTOSAR and its developments before AA.

## What is the AUTOSAR Consortium? {#autosar-consortium}
The [AUTOSAR Consortium](https://www.autosar.org/) is a joint effort from leading automotive industry companies to create and define open system architecture standards for automotive. This includes not only providing a standardized software architecture and framework, but also the base standards for E/E architecture. It's fascinating to see how competitive automobile companies have come together to create unified standards and pave the road for future developments.

### So, what software standards are they? {#software-standards}
* *Foundation standards* - created to ensure a high degree of interoperability between components of AUTOSAR platforms, i.e., Adaptive and Classic, as well as within AUTOSAR to non-AUTOSAR platforms.
* *Platform standards* - like Classic and Adaptive AUTOSAR standards. More on this in the following sections of the article.
* *Application interfaces* - introduced various standardization processes for the communication protocols, syntax, and semantics for all applications to communicate in commonly understood terms.
* *Acceptance test packages* - various standards are set for system tests to ensure the developed applications comply with the set standards.

### More about Classic AUTOSAR {#classic-autosar}
The main purpose of Classic AUTOSAR is to achieve hardware and platform independence for AUTOSAR applications. The underlying layers of software are more dedicated to the type of hardware and platform. AUTOSAR provides a runtime environment (RTE), which is a software abstraction layer that the application software uses to work with hardware-oriented basic software (BSW). AUTOSAR also provides standardization guidelines for this BSW layer. Along with this, it has introduced common methodologies for configuring the AUTOSAR stacks. 

Classic AUTOSAR provides the base format for integrating a new ECU into the vehicle network. It mainly addresses the signal-based approach of communication, i.e., [CAN bus](https://en.wikipedia.org/wiki/CAN_bus), [LIN bus](https://en.wikipedia.org/wiki/Local_Interconnect_Network), etc. With this approach, endpoints can be easily configured with config files without changing the application software. However, for an update in the software component, an update of the entire ECU firmware is essential, which is a major drawback. Another disadvantage is that adding a new ECU usually requires a major change in the schema.

However, in the following sections, we will see how Adaptive AUTOSAR overcomes these challenges and at what cost.

## Understanding Adaptive AUTOSAR {#understanding-adaptive-autosar}
### Why are automotive software components moving towards Adaptive AUTOSAR? {#why-adaptive-autosar}
As more compute-demanding features like ADAS and V2X are being integrated, the number of ECUs and the computational capacity of the ECUs in automotive have been continually growing. This poses a challenge for designing the communication between these endpoints. Adaptive AUTOSAR (AA) proposes to integrate domain-specific high-performance ECUs in the vehicle to serve as a gateway for communication into each domain. Smaller footprint embedded ECUs directly connect to their respective domain's high-performance ECU in order to communicate with the entire vehicle network. Another advantage of an AA application is that it can be configured and integrated into the system at runtime. This allows a number of independent services to be developed, tested, and deployed as applications independently.

### Embracing the change in the **way of communication** between the software components {#communication-change}
As we have seen, there is increased usage of gateway ECUs to enhance the efficiency of the vehicle network. These domain ECUs manage the communication with smaller ECUs using a signal-based protocol and communicate with other domain ECUs using IP-based protocols to form a [domain controller architecture](https://www.vector.com/int/en/know-how/autosar/autosar-adaptive/#c122761). This allows more sophisticated frameworks like [service-oriented communication](https://en.wikipedia.org/wiki/Service-oriented_communications) to be possible in automotive software. These services can be either servers (data providers or provider ports) or clients (data consumers or required ports) and communicate in the following ways for any data transfer:
* Direct method calls
* Event-based communication
* Topic or Data field subscription

The system design manifest files define how these servers and clients are laid out in the E/E architecture. An application developer can use both [IPC](https://en.wikipedia.org/wiki/Inter-process_communication) or [RPC](https://en.wikipedia.org/wiki/Remote_procedure_call) method calls to a known service in the same manner without knowing the underlying modes of communication. AA also uses what is commonly known as the ["Service Discovery"](https://en.wikipedia.org/wiki/Service_discovery) mechanism to keep track of up and running services offered on the vehicle network.

### Adaptive AUTOSAR Architecture {#adaptive-autosar-architecture}

The Adaptive AUTOSAR (AA) software middleware stack can be thought of as a broader and wider design than Classic AUTOSAR, also known as AUTOSAR Runtime for Adaptive Applications (ARA). The modules within the ARA can be accessed through the `ara::` namespace within C++ applications and are platform-agnostic. The AA application uses ARA modules and sits at the top of the software architecture block designs, while the hardware drivers, hypervisors, and container modules sit at the bottom of the ARA components. The following is a non-exhaustive list of modules that ARA offers:
* Core platform services
  - Network
  - State management, etc.
* Platform foundation
  - Communications stack
  - Persistency
  - Logging and trace
  - Platform health, etc.
  - Includes all PSE51 POSIX APIs provided by the OS

### Process Workflow and Modelling for AA Applications {#process-workflow}
The process workflow for developing AA applications consists of modelling, auto-generating source code, and then developing the application software. The modelling steps involve filling in the details of the manifest files, which are then used to develop the auto-generated source code. Manifest files are divided into the following three parts:
* System design
* Machine and execution level
* Deployment level

### So, what is **adaptive** about Adaptive AUTOSAR? {#what-is-adaptive}
While learning about AA topics, many of us have queries centered around this question. I will attempt to explain this in my own words.

Adaptive AUTOSAR (AA) provides a platform for applications to become platform-agnostic. This means that the applications developed are not constrained to a particular platform or hardware type, as it separates configurations from the application software. It uses manifest files in the form of JSON extensions, which are configured alongside the application being developed. The final binary flashed onto the ECUs contains the application binaries and deployment configuration manifest files. These manifest files also define the service and client endpoint definitions, allowing for dynamic runtime linking between them for communication.

As we also saw earlier in this article how independent features can be divided into AA applications or services. These applications can be also tested and deployed into the ECUs making it a very easy process to roll out any AA updates into the vehicle as opposed to completely re-flashing the ECU software. This adds a lot of agility into the AA applications.

### Do you have safety-critical or hard real-time requirements for your applications? {#safety-critical}
As AA applications run on the ARA platform, which is capable of keeping the soft real-time requirements, it is not completely reliable for the hard real-time requirements. For example, engine control and brake systems. If the application's requirement is to provide safety-critical features such as air-bag ECUs, it is recommended to use classic AUTOSAR applications. However, for safety features which are not specified as hard-real time, AA applications can achieve up to ASIL-B (these days also ASIL-D) using the safety libraries provided by different vendors. As Classic AUTOSAR application does not need an OS to run, its bootup time is also quite less compared to AA applications.

## Technical criticisms on AUTOSAR {#criticisms}
Every design decision has a trade-off associated with it. AUTOSAR standards have used an approach of "one solution fits all", making it form a heavy footprint software stack. This causes application sizes to bloat up. In very resource-constrained embedded environments, this application may not be the right choice and more targeted applications could do a better job. 
There are many [criticisms](https://medium.com/volvo-cars-engineering/the-reality-of-autosar-and-the-way-forward-36af39ec4099#:~:text=One%20of%20the%20biggest%20problems,of%20OEM%2Dspecific%20software%20applications) on AUTOSAR and a lot of development entities are looking for alternative approaches.

## Further Words {#further-words}
For full disclosure, I have been learning about AA from detailed training courses from [Vector](https://www.vector.com/int/en/) in the last few days, where we delved into the implementation details of Vector's AUTOSAR products.

I hope you now have a high-level understanding of AUTOSAR, what AA is, its motivation for existence, and how AA applications are used in automotive.
