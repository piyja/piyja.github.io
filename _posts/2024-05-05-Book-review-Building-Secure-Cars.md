---
layout: post
title: 
date: 2024-05-05
description: Book review - Building secure cars - Assuring the Automotive Software Development Lifecycle - by Dennis Kengo Oka
tags: Automotive, Security
categories: [Field Notes]
chart:
  vega_lite: true
giscus_comments: false
toc:
  sidebar: left
---

## How I got around the book {#how-i-found-it}
On the quest of learning the horizontals topics in automotive software, I found myself willing to know more about the security features and measures used in automotive software development. As developer within the infotainment business of the automotive I find security as growing requirement as the capabilities of it are ever-growing. Infotainment Electronic Control Units (ECUs) have emerged as potent components within vehicles, often handling critical functionalities.
My expectation from the book was to gain insights into how security is intricately woven into the software development lifecycle. I anticipated learning about various security features implemented in automotive systems, as well as the diverse types of security testing conducted. This knowledge would not only enrich my understanding of current practices but also equip me with the necessary tools to navigate and contribute effectively within the humungous landscape of automotive software development.

## What did I learn from the book {#learnings}
The author effectively underscores the critical importance of security and adeptly caters to newcomers by providing detailed explanations. While seasoned professionals may find some concepts verbose, this approach ultimately deepens understanding. Key concepts that stood out and are worthy of highlighting are mentioned in the below part of the blog:
### Importance of security in automotive {#importance-of-security}
Given the rapid evolution and increasing complexity of modern vehicles following are points which state why software security is crucial:
1. Growing Capabilities and Dependency on Software: Modern vehicles are becoming increasingly sophisticated, relying heavily on software to manage everything from basic functions to advanced features like autonomous driving. This growing dependency means that the integrity and security of the software are paramount.
2. Increased Code Complexity and Potential Vulnerabilities: As the amount of code within a vehicle's systems increases, so does the potential for vulnerabilities. More lines of code create more opportunities for bugs and security flaws, making robust security measures essential.
3. Elevated Risk Factors: With the introduction of more capabilities, the risk associated with potential vulnerabilities also rises. Security breaches can have severe consequences, affecting not only the vehicle’s functionality but also the safety of passengers and pedestrians.
4. Necessity for Updated Security Features and Testing: The dynamic nature of automotive technology demands the most current security features to protect against emerging threats. Regular and thorough security testing is crucial to identify and address vulnerabilities early in the development process, ensuring that vehicles remain secure against potential attacks.

### How can we make automotive more secure - Static approaches {#static-approaches}

#### Secure hardware solutions {#secure-hardware}
Hardware solutions play a crucial role in enhancing the security of automotive software by enabling privileged access to applications and ensuring the integrity of the system. Key hardware-based security features include secure boot, secure flash, secure log, and secure debug. These mechanisms ensure that only authorized software can run on the vehicle's systems, protecting against unauthorized access and tampering.

Additionally, trust-based systems can be implemented to physically isolate sensitive data and manage secure connections. This can be achieved through secure trust zones, which create a dedicated and protected environment within the hardware. These secure zones store sensitive information and control access using robust security protocols, thereby enhancing the overall security posture of the automotive system. By leveraging these hardware security measures, automotive manufacturers can provide a more secure and resilient platform for their vehicles, safeguarding against a wide range of potential threats.

#### Software composition analysis of open source components {#sca-oss}
Software composition analysis involves understanding the various components that make up an application and the dependencies it relies on. By thoroughly analyzing the composition of your software, you can identify all the open-source components integrated into your application. It helps in recognizing known vulnerabilities and flaws associated with these open-source components. Many open-source libraries and modules have publicly documented security issues, and being aware of these can prevent the introduction of potential security risks into your software. It enables proactive management of software updates and patches, ensuring that any vulnerabilities discovered in the open-source components are promptly addressed. It also supports compliance with industry standards and regulations, thereby contributing to the creation of a secure and reliable automotive software environment.


#### Static code analysis (SCA) {#static-code-analysis}
Static code analysis (or linters) are means of checking software code for abiding to the coding standards by parsing the source code. These checks are run without executing the code on the software code base. The checks are not just on a particular statement or definition but can also detect issues in a block of related source code. It can find both syntactic and semantic code violations within the code base. Specific to automotive industry some consortiums have developed coding standards to be followed in automotive software, like [MISRA](https://misra.org.uk/) and [AUTOSAR](https://www.autosar.org/fileadmin/standards/R22-11/AP/AUTOSAR_RS_CPP14Guidelines.pdf). There are many open sources projects which offers many of these standards included in the SCA tooling software. As well there few proprietary software like, [Coverity]() covers about the majority of the coding standards into their linter and has about 400 coding guidelines which it covers. These standards are split in categories of severeness - mandatory, required and advised. For safety related code within automotive there are stricter guidelines which are covered in ASIL-D <(ISO, SIL B-C??)> coding standards. Not all software component would need to abide by all coding standards and can be configured according to the functional severity. Albeit, one thing is worth mentioning some violations could be false positive and there are provisions to bypass this and allow deviations case by case, although this requires human code review.

For the legacy code where we would get unmanageable amount of code violations at first, one has to set up a framework to be able to introduce this gradually into the full working. This could mean segregation of the software components based on the functional severity and enabling the coding guidelines as per this severity. Then case by case going through the violations to identify which ones should be resolved at a priority hierarchy.

### How can we make automotive more secure {#dynamic-approaches}

#### By Shifting left {#shift-left}
By introducing security testing approaches in the (software development V cycle)[] we can bring more robustness into the software. These testing can be performed in the cycle to expose vulnerability earlier and to avoid making security being an afterthought at the verifications step.

#### Theoretical Approach {#tara}
Theoretical approaches like Threat Analysis and Risk Assessment (TARA) can prove to be a beneficial starting step to analyze the software. It involves identifying the assets and threat scenarios and creating risk assessment of the identifies threats. It proves to be greatly beneficial if carried out multiple times in the development cycle. The final output of this analysis is list of identifies threats and associated risks with it which can be sorted by their priorities. There are good open source tools like (pyTM)[https://github.com/izar/pytm] which can be used create a graphical output of the analysis using graphviz. Albeit, TARA would also be classified as a static approach in identifying threats.

To make automotive more secure, more than static approaches are essential, by dynamic I mean in which we emulate close to actual use case of the automotive systems. From testing point of view this involves controlling the external environment for the system under test (SUT) and monitoring its behavior. In the following section we will see more about them.

#### Practical testing approaches {#practical-testing}
Practical testing approaches can be divided into following sections:

##### Functional security testing {#functional-security-testing}
Akin to system function testing, the focus is on validating the effectiveness of essential security functionalities. This encompasses rigorous testing of critical security features integrated into the communication stack, such as SecOC (Secure Onboard Communication), and evaluating standard encryption mechanisms applied to cryptographic algorithms for handling sensitive data. Additionally, assessing the reliability and performance of components like the true random generator is vital.

##### Vulnerability testing {#vulnerability-testing}
In vulnerability testing, the initial phase involves comprehensive information gathering focused on understanding the system's core components. This process employs various scanning techniques from multiple perspectives to thoroughly examine the software. Communication ports are scanned to identify potential vulnerabilities, while configurations used within the software are meticulously scrutinized. Additionally, critical details such as the communication protocols utilized by the target system are analyzed to gain deeper insights into its operational structure. Once these key components are identified, the next step involves gathering and analyzing potential threats. This proactive approach ensures that developers can anticipate security risks early in the development process, thereby integrating robust defensive measures into the automotive software.

##### Fuzz testing {#fuzz-testing}
Fuzz testing is a method used to evaluate the behavior and robustness of an application by providing randomly generated data as input and observing how the system responds. It is highly adaptable, with no single fixed approach and also incorporate model-based input generation, which systematically produces random data inputs to enhance the testing process. This technique is instrumental in identifying vulnerabilities and weaknesses within the software.

A typical fuzz testing setup involves three main components:
* Engine: Responsible for generating randomized inputs.
* Injector: Introduces these inputs into the application under test.
* Monitor: Observes and checks the application's behavior for any anomalies or crashes.

There are three main types of fuzz testing:
* Black Box Testing: Testers have no knowledge of the internal workings of the application. Inputs are generated and injected without any insight into the system's internals.
* Grey Box Testing: Involves partial knowledge of the system, allowing testers to create more informed and targeted inputs while still retaining some randomness.
* White Box Testing: Testers have full knowledge of the system, enabling them to create highly specific and strategic inputs to probe for vulnerabilities.
The author covers fuzz testing in great detail across many chapters of the book. This comprehensive exploration provides a deeper understanding of how fuzz testing can be effectively employed to enhance the security and reliability of automotive software. We will cover key information here in the blog but for more detailed explanations and advanced topics on fuzz testing, refer to the later sections of the book.

###### Testing classical AUTOSAR components {#testing-classic-autosar}
"Shifting-left" approach in the software development [V model](https://en.wikipedia.org/wiki/V-model_(software_development)) pushes us to integrate testing earlier in the development process to identify and resolve issues sooner. Owning to the vast security knowledge coming from IT industry, testing automotive specific CAN protocol based Classic AUTOSAR components can be particularly challenging, necessitating the use of Hardware-in-the-Loop (HIL) testing to ensure thorough and accurate validation. HIL testing involves two primary types of result monitoring:
* White Box Testing: This approach involves monitoring the internal states of the System Under Test (SUT). It provides detailed insights into the internal workings and allows for the identification of specific issues within the system's components.
* Black Box Testing: In this method, the overall behavior of the system is monitored without focusing on its internal states. Usually in the case system's performance is compared against an identical reference behavior to ensure it operates as expected.

The integration of HIL in fuzz testing offers significant benefits, particularly in terms of quality of the feedback. By simulating real-world conditions we can get the closer to real life feedback from the hardware interactions, which helps in identifying and catching exceptions that might not be evident through software-only testing. This approach leads to the development of more robust and reliable automotive software, ensuring the system meets the stringent requirements of modern automotive applications.

###### Testing Services Within Operating Systems (OS) {#testing-os-services}
As automotive software becomes increasingly complex with the integration of custom OS, it is essential to adapt our testing strategies accordingly. One effective approach is white box fuzz testing, which employs agents to monitor and capture detailed information about various processes composed in the automotive OS. These agents track critical OS details such as memory corruptions (e.g., use-after-free errors), heap and stack checks, initialization order problems, memory leaks, core dumps, process monitoring, system logs etc.

External agents play a significant role in monitoring the communication layer, including protocols like Bluetooth, WiFi, MQTT, and file formats. This comprehensive monitoring helps in identifying vulnerabilities and ensuring the robustness of the automotive software.

There are two primary types of monitoring methodologies:
* Asynchronous Monitoring: random inputs are provided without waiting for corresponding results. The advantage of asynchronous monitoring is the speed at which results are delivered. However, the downside is that there are fewer options for tracking and tracing the outcomes, which can make it harder to diagnose issues.
* Synchronous Monitoring: This method involves waiting for the results of each input action before proceeding to the next which cause delays. The main advantage of synchronous monitoring is that it allows for easy tracking and tracing of results, making it simpler to identify and resolve issues.

##### Penetration testing {#penetration-testing}
Penetration testing is a crucial security evaluation performed in the final stages of product development. Its primary objective is to identify and exploit potential vulnerabilities within the system to understand how it might fail under various attack scenarios. This type of testing requires detailed understanding of the system to create situations that could lead to application failures.

* Black Box Testing: In this approach, the tester has an understanding of the system behavior but no insider knowledge of its internal workings. The tester uses this information to attempt to exploit the system, identifying vulnerabilities that an external attacker might find.

* White Box Testing: This method involves the tester having comprehensive insider knowledge of the system. While it can be debated how realistic such attack scenarios might be, this approach is invaluable for understanding the risks associated with internal threats. By leveraging detailed system information, testers can perform more targeted and thorough security assessments.

Penetration testing provides a holistic view of the system's security posture, helping developers identify and mitigate potential risks before the product is released. This ensures that the releases are more robust and resilient against potential attacks.

#### Robust frameworks are required {#robust-frameworks}
While various tests are crucial for proving the robustness of a system, merely having test suites is insufficient. To ensure comprehensive security testing throughout the product development and maintenance lifecycle, a robust framework is essential. Such a framework provides a systematic approach to security testing, ensuring that all aspects of the system are thoroughly evaluated, and any potential vulnerabilities are addressed promptly. A robust framework must contain following steps: Analyse the problems, set the goals, Identify the current state, define strategy to archive goals and execution. 

### Continuous monitoring {#continuous-monitoring}
Performing security tests once is not sufficient to ensure the ongoing robustness and security of automotive software systems. Continuous monitoring is essential to maintain a high level of security and quickly identify and address new vulnerabilities as they arise.
Such a system continuously monitors the application and its environment for potential security threats and anomalies. This approach ensures that any new vulnerabilities or changes in the system's behavior are detected promptly, allowing for immediate corrective actions.

Hope you enjoyed reading the blog and learned new concepts about security testing. If this blog intrigued I would recommend diving further into the book.
