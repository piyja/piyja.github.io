---
layout: post
title: 
date: 2024-03-09 00:20:00
description: Book review for Fundamentals of Software Architecture - Mark Richards and Neal Ford  
tags: Book-reviews, Architecture, Design
categories: [Field Notes]
chart:
  vega_lite: true
giscus_comments: false
toc:
  sidebar: left
---

# Why did I pick this book? {#why}
Coming from a product design background and writing software in embedded products, curiosity drives me to go beyond software design and development layers. Just like any hardware-based product, software products are an amalgamation of different software principles. This natural curve 
opened an opportunity for me to take on architectural tasks within the scope of my development activities. Offlate I have been getting involved at the system level components and piecing out the different information points into the system architecture. To take this further into streamlined learning, it is impossible not to stumble upon the famous book - [Fundamentals of Software Architecture by Mark Richards and Neal Ford](https://fundamentalsofsoftwarearchitecture.com/).

In the following part of this article, I have tried to give you a brief introduction to the book and give you my personal learnings from it. This article is purely for academic purposes and is part of my contribution to the software community world. If this interests you, I would highly recommend reading the book further.

# Structure of the book {#structure}
This book is written in three independent sections to cover the holistic view of software architecture.  
*Part I*: Covers the foundation of the software architecture, defining it and breaking it down into its core blocks. It also covers means of identifying, measuring, and governing architectural characteristics.  
*Part II*: Here it covers different architectural designs and assessment of the characteristics of it in star rating format.  
*Part III*: Then it talks techniques and the soft skills to be an effective architect. Author talks about recording architectural decisions - on useful methods and tools to do it.  

Following are the key highlights I have noted and written in my words.

# What software architecture is about? {#what-is-software-architecture}
## Defining the architecture {#defining-architecture}
On the same lines of Martin Fowler's definition in his famous article ["Who needs an architect"](https://martinfowler.com/ieeeSoftware/whoNeedsArchitect.pdf) quoted "Software Architecture is about the important stuff, whatever that is", the authors re-enforces this and has made an excellent attempt to explains us to why that is true. In the age of the programming world, software architecture has a constantly evolving role and hence its definition. In the most general terms, it can be equivalent to understanding the system which is divided into its components and connected with interfaces. As the authors quoted  
> It is the highest level concept of the expert developers and their shared understanding
The focus of software architecture should be more on the `WHY` than the `HOW` part.

## Software architecture's 4 sides {#four-sides}
The designing process of an effective piece of software can be further split into following steps:  
* Structure - The base technology stack which forms the structural part of your software
* Characteristics - The technological properties which want your software to bring across
* Decisions - The decision tree which led to final software product  
* Design principles - The principles which were closely followed while development

The authors have provided easy to understand pictorial depictions for the above point which is helpfully embossing.
 
### Architectural thinking - broadening the breadth {#architectural-thinking}  
A developer's mindset is to dig deeper into few chosen / relevant topics, while an architect needs to have an overview on a range of different technologies. Surely an architect needs to know a few topics well in depth but the part where they start making the difference is having an overview of the technologies used in the product.

#### Defining architectural characteristics {#defining-characteristics}  
There are two types of architecture characteristics - explicit and implicit. Explicit characteristics are the ones which directly surface based on the solution provided and are non-domain specific design considerations. On the other hand implicit characteristics are the ones which are influenced from the structural aspects of the designs and are generally related to the domain specific knowledge. 
Let us take an example of designing a website for an online ticket booking system - here the characteristics such as reliability, availability, performance, scalability, etc. are explicitly covered while aspects such extensibility, upgradability, privacy, security etc. could be classified as implicit. I agree it is not 100% clear on how to label the characteristics, but the important point is to think from the perspective of the difference in domains and non-domain related characteristics.  

#### Identifying architectural characteristics in a given use case {#identifying-characteristics}
One of the initial steps while architecting is to identify the characteristics. They can be extracted from the domain knowledge and the requirement documents. There is no specific set of rules to follow while identifying them, but one can practice through architectural Kata exercises. Please refer below what architectural Katas are.  

#### **Measuring** and **Governing** these characteristics {#measuring-governing}
Authors show us the importance of measuring the measurable characteristics as a means of justifying your decisions. Authors introduced techniques to measure characteristics of modularity via cohesion, coupling and connascence properties. This would help quantify the characteristics which sets a good platform for comparing decisions. For effective decision-making it is important to analyse the detailed output and form fitness functions. From these reports an architect gets the opportunity to govern the decision-making process.

#### Component based thinking - Conways Law {#conways-law}
Conways Law suggests that the organisation's communication structure heavily influences the design structure of the product it is developing. The flow of information in an organisation is affected by how the teams are structured which then affects the decision-making process. Based on the decision the ownership of the different building blocks aka components are influenced and hence the overall design structure gets altered. As Martin Fowler mentioned there are three ways to deal with this law:

1. Ignore - it is proven to be ineffective to fight against it
2. Accept - make sure your architecture incorporates the designers communications pattern
3. Inverse Conway Maneuver - make changes in the communication patterns to achieve design architecture

The identification of the software components of a product can be done either based on technical or domain related. It is important to understand both divisions inorder to make knowledgeable trade off decision.

### Brief introductions into the architectural patterns {#architectural-patterns}
The author covered detailed definitions, descriptions and purpose of the various architectural designs. The designs covered are the following - 

- Big ball of mud
- Monolithic architecture
- Component based design
- Service oriented architecture
- Service defined architecture
- Microservices
- Space based architecture

I will not go further into the design patterns in this article as it will not do the justice to all of them in a short article. But if you are interested to know further I encourage reading up further in the book and other online resources. The interesting part in this book is about the comparison which was made on all the designs. The following mentioned architectural characteristics are used as the comparison - Deployability, Elasticity, Evolutionary, Fault tolerance, Modularity, Cost, Performance, Reliability, Scalability, Simplicity and Testability.

## Techniques for practicing architecture {#techniques}  
#### Practicing with Architectural Katas {#architectural-katas}  
To become a good architect one needs to practice making architects designs. In the beginning of my journey into this I struggled to find platforms to exercise architecture and the decision-making process. This book introduces the concept of architectural katas, a concept originally formed by [Ted Neward](https://www.architecturalkatas.com/). It is an exercise where a bunch of enthusiasts come together to design a different system and a moderator who not only assigns the tasks but also keeps track of the time. <ins> I plan to organise such events in the near future, so if you are interested do drop a message below</ins>.  

#### Architectural Decisions Records {#adr}  
Logging architectural decisions enables people from an organisation to take further design decisions abiding to the agreed ones. It allows to have a place where one can fall back for referring to the previous decisions taken and get away from [email driven architectural decisions](https://softwarearchitecturezen.blog/2010/01/27/architecture-anti-patterns-pattern-1-architecture-by-e-mail/). To create a high level understanding, it is mandatory to refer to the older superseded decisions while creating new decisions. Having a standard template for such decisions helps to create standardised records. There are various open source tools as such [adr-tools](https://github.com/npryce/adr-tools) to help align the ADRs process and become coherent with the software development process. Records could also include various types of pictorial diagrams, class diagram, state machines diagram, flow diagram etc, created with [UMLs](https://en.wikipedia.org/wiki/Unified_Modeling_Language) to convey the idea effectively.  

#### Developing your unique Architectural path {#architectural-path}  
Becoming an effective architect is a time consuming process and requires detailed path planning. In the final concluding chapter the authors gave us useful tips on laying down the path to become an architect. Everybody's path to become an architect is a unique one and hence there are no specific rules for it. Author suggested creating a personalised radar for the technologies we are interested in and to pay close attention to the developments in it. They have given a example of such radars which they create within their organisation called [Technology Radar](https://www.thoughtworks.com/en-de/radar).

Hope this article gave you a good insight into the field of software architecture and what this book has to offer. Do drop me [a connect on linkedin](https://www.linkedin.com/in/piyushdjadhav/) to get to know further updates from me such topics.  

Have a happy learning!