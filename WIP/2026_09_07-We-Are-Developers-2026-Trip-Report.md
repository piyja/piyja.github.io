

Trip report - WAD 26 Berlin

Things which caught my attention
10+ track on tech talks
6+ workshops for 2 hours each
Booth visits

It is impossible to catch even 10-15% of the content happening
You have to be selective in what your interests are and what info would be specific to the conference only
Almost most of the talks are available on YouTube later on to attend

I spent most of the time at conference in attending hands on workshops, talking with people to catch key insights on Edge AI apps development, visit booths scanning on what they do and how can they help us and finally some talks.

Company booth visits: 
1. Antithesis - great potential for tests generations from the “key property” based testing
2. Qualcomm + Arduino + Edge Impulse - Edge AI - Qualcomm spin off for edge compute - collect and train data with their SW 
3. Snowflakes - understand the cloud services provided 
4. OpenSearch - open source search platform
5. Neo4j - graphs search
6. Vercel - AI powered platform - agents, skills etc 
7. LaunchDarkly - runs tests automatically to find vulnerabilities and reverts automatically 

Talks:
Day 0: Overcrowded talks - attended only one 
* Co-Pilot inside IntellJ IDEs 
	Practices shown were quite regular for us now 
	New learning - containerized method to run parallel tasks to run multiple tasks with coding agent at once, can also use work tree to do something similar

Day 1:
* Thomas Dohmke - Entire : The agentic Assembly line
	- Store context and memory which can be transferred to new sessions
	- Along with git commit also store context and chat history as memory to understand how the solution space was reached0
* The R in RAG: Why retrieval is often the weakest link (and how to fix it)
    * 
* Goodbye Microservices, Hello Self-Contained Systems
    * 
* Owning the Inference Layer: When and How to Run your Own Models
* The Retrieval Layer for Edge AI
    * Demo session on what edge AI app can do - glasses - detecting the objects
* Inside Mercedes-Benz: 140 Years of Heritage meet AI
    * 
* Nemotron: NVIDIA's open model strategy for developers
    * 
* Building the Nervous System of AI
    * 
* Physical AI for the Next Wave of Industrial Digitalisation
    * Nvidia Omniverse() + Cosmos (synthetic data generation)+ Issac (physical AI foundational models)
    * Open source models, blue prints to run into hardware

Day 2:
* Future of Mobile AI. What On-Device Intelligence Means for App Developers
    - Models are small enough for running on devices - 300M to 1B - 3B - Gemma, Qwen, phi. 
    - Runtimes - onnx-rt, llama.cpp
    - Frameworks - media pipe, cactus, 
    - Hardware - NPU, TPUs - FLOP/s, TOP/s
    - Arbitration approaches - mobile/cloud first, intent classification, cascading approach

Workshops:
Day 1:
* Accelerating AI Inference at Scale: A Deep Dive Into NVIDIA Dynamo on Kubernetes
	- Hands on notebook session with 2 H100 dedicated GPU for the session
	- Basics on inferencing and tokenization process inside the LLM
	- Disaggregation optimization techniques 
	- AI perf on LLM inferencing
* Speculative decoding - (Did not attend)
    * WIP to gather info 
    * 
* Edge Impulse - Ducks, Sensors & Agents: Hands-On Edge AI with Arduino UNO Q
    * Used Arduino Q with Qualcomm chip for Edge AI apps on image recognition and gyroscope data
    * Collecting data on the edge Impulse cloud instance
    * Training of the models with the data
    * Deploying on the Arduino and run inference to classify duck or not
Day 2
* Compress, Cut, and Distill: The Latest Gen AI Model Compression Techniques in Practice
    * Quantization
    * Depth wide prunning 
    * Breath wide prunning
    * Distillation techniques
* Generate Synthetic Data for Physical AI with NVIDIA Cosmos World Foundation Models
    * What is cosmos models 
    * Generation synthetic data with these models for training
    * 
