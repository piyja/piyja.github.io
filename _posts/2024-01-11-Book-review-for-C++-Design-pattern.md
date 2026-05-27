---
layout: post
title: 
date: 2024-01-11 00:20:00
description: Book-review for C++ Design pattern – Klaus Iglberger
tags: Design, Book-reviews, C++
categories: [Field Notes]
chart:
  vega_lite: true
giscus_comments: false
toc:
  sidebar: left
---
# About the book {#about}

Recently I got an opportunity to read C++ Software Design by Dr Klaus Iglberger. I find the concepts presented in the book if not to cover basics but quite intriguing to further the thought process. As a software developer, I do regularly of think of design patterns and use them aiming to make the codebase more modular, scalable, reusable, less coupled. Albeit I found a holistic view of the design patterns from this book and would recommend it to a seasoned software developer. In this post, I am aiming to give a summary of the book but it is not a promotional blog by any means. You can treat it as a nonexhaustive abstract of what the book covers but if you are intrigued more please dive into the book.

The book is about 400 pages and is divided into 39 digestible guidelines. In my opinion, the best part about this book is the footnotes and further reading material the author provides us. If you have attended/heard Dr Klaus's talks you can imagine his voice while reading the book. The author writes a lot about readers' reactive comments while introducing the concepts, which might annoy few but also helps in covering all-around discussions on it. After going through some pages you can even anticipate when these takes are coming ;-)

Alright, let's dive in. Following are the sections giving the summary of the book.

# [1/3] Basic Software Development principles and what they mean from architectural pov {#part-1}

In this first part of the book, the author introduces both what software design is and why it is important in any software project. If we go to the first principle it is nothing but the "Art of managing dependencies and abstraction". The author represents software development in three levels of 

1.	Software architecture
2.	Software design
3.	Implementation details

and explains the differences in the architecture and design of the software. The author gives us a helpful perspective to look at any software designs, ie from high level (fairly stable) and low level (prone to change).

The author emphasizes how **change is constant** and **design for extension** and we developers should persistently keep this in the back of our minds. The author covers the most famous software principles like SOLID, DRY, ISP (and many more) but more importantly there are discusssions on how to interpret these principles while creating the low-level designs of the software. Most of his takes boils down to a single aspect while creating the designs to think about the "separation of concerns". Separation of concerns sits at the base for most of the design patterns, if I were to zoom into it further, separations of concerns can be thought of from these two lenses - 

1.	Decreasing coupling (be it artificial coupling)
2.	Increasing cohesion

The section **Design for testability** resurfaces the problems we often face while unit testing *badly* designed classes. The mitigation approach is to have white-boxed tested classes, which could be enough but is not the best approach for testing. Again the solution to this appeared to be in thinking of separating concerns at the early development stage.

In the next section, the author takes us into the **Art of building abstraction** to effectively place the requirements and expectations into the code. In OOP-based languages, abstractions are usually built using base classes and also can be built using concepts (or equivalent). Many times these introduce more problems where we can use abstractions using free functions. This aspect is touched on in many ways later to show how we can achieve decoupling and separate concerns. Nevertheless, in all these forms of abstraction building it is important to adhere to LSP to forward the expectations correctly and DIP to think in terms of ownership of the introduced abstractions.
Next the author talks about what purpose the design patterns serve - to provide a blueprint for the organizational software to be built upon.
Naming design patterns with commonly known patterns helps to pass on intent and information to developers. The author again emphasizes that design patterns are not only limited to OOP or dynamic polymorphism, they can be very well extended to functional or generic programming.

The open-for-extension guideline in OCP can be interpreted in two ways: open for extending types or open for extending operations. Procedural programming gives us ease of adding new code for extending the operations but gets tougher to add new polymorphic types. On the other hand with OOP, we get the ease of adding new polymorphic types but it is tougher or impossible for adding new operations without recompiling the base classes. In the early stage of the project, one must make a conscious decision about which path of extension he/she wants to follow. It is important to understand that no design fits all-purpose and has its advantages and disadvantages.

# [2/3] Strategy pattern, Observer and CRTP {#part-2}
Slowly the the design topics starts getting a bit complex.

From the second tierce of the book, we start to get into various design patterns of both structural and behavioral patterns. First, we cover the visitor pattern and embrace it to solve our problems with the extension of operation in the inheritance hierarchy using double dispatch. Although naturally with this approach it gets tougher to add new types. We also learn that since we have double indirections used this design becomes quite inefficient by design. Next author introduces the std::variant style of visitor pattern, with which creating abstraction becomes quite easy. With std::variant we can group any unrelated types and based on the the type present at the call we can perform operations accordingly with the help of std::visit(). The new operations logic can be added on top without going back and changing any of these classes. While looking at the benchmarked result, it is worth mentioning that there are further nuances of these of writing your own get_if() functions to call particular operations based on the type provided. Refer the book to see various interesting benchmarks reported by the author.

Then we move to cover the strategy pattern and command pattern. The strategy pattern intends to extend the polymorphic types of a class without much fuss. Strategy class can be thought of as serving complimentary aspect of open for extension as of visitor and also can be thought of as extracting the complex algorithms into separate entities being it a class or free function. Strategy entity can be injected as a dependency into the subject class. One of the downside in this pattern (also to be able to follow SRP) is that for each operation we need to add one strategy. One can use a **Policy-based strategy design pattern** by passing a policy in the form of a function object or lambda.
We investigate the command design pattern next, which looks very similar and has the same implementation as that of the strategy design pattern. The only difference comes from the architectural point of view. For that matter even from the type of structural pattern, the adaptor design patterns strike as similar to strategy but the intent it serves is different. It becomes easy to think about the design when you think from the perspective of what intent they serve. We also cover differences in reference semantics (used often by OOP-based) and value-based designs. In this case, our policy-based designs emphasize the point of value-based semantics.

Next, we go through the Adaptor pattern, the Observer pattern, and the CRTP pattern. Adaptor patterns are used to standardize the interfaces or to introduce a shim layer between the client and implementation details. Adaptors can be formed through creating an intermediate class or even by functions. Observer pattern is used where we require a notification system for a state change of the data, we are interested in. It creates a one-to-many relation between the subject (data we are interested in) and the observers. It is good to be aware of the further niche of this design: push observer and pull observer. It is also important to highlight that the observer pattern can be attained via value semantics as well.
The CRTP pattern creates a compile-time abstraction for a family of related types. This is attained by using templates of the derived type, where we static cast this pointer to the derived class and access the methods we want to call. Note here since we use a template for the base class, we do not have the same base class for all derived types. C++20 concepts help us to implement this pattern.

# [3/3] Bridge, prototype and type erasure pattern {#part-3}

The final third part of the book contains few of the most complex design patterns. If I were to go back referring to this book it would be mostly for this part of the book. The bridge pattern (belongs to the structural pattern domain ) can be used to isolate different concerns and bridge them. We can remove direct physical dependency between modules so that either end can evolve without affecting others (like retriggering recompilation etc.). The Pimpl Idiom is a more famous part of the bridge pattern. We can achieve ABI stability with this pattern. If we introduce more abstraction layers (and more indirections) it may appear that the efficiency could take a toll, which is true in most of the cases, but refer to the book to see where it can be even better than the unaltered design.

The prototype pattern is used to self-clone concrete types from its base class object pointer. It is equivalent to having a virtual copy constructor.
External polymorphism is a non-intrusive method to lets the user use the non-related (no-inheritance) classes to be treated polymorphically. There are new terms like concepts class (base) and model classes (derived from concept class) used. The important thing to know is that for different types of classes, there are different base classes (which could be templatized). This pattern takes advantage of it being non-polymorphic (fewer indirections), can be easily extendable according to OCP, and follows DRY and DIP. However, this pattern does not follow value semantics.

The intent of the type erasure design pattern is to provide value-based non-intrusive abstraction for unrelated types but with the same semantic behavior. The type erasure design pattern contains a combination of external polymorphism, bridge pattern, and potentially prototype design pattern. It got its name because of the fact that the abstract class does not store the information about the concrete type of the object hence the type is erased. The author also adds optimization techniques like using SBO instead of dynamic memory to allocate and deallocate memory or manual dispatch instead of virtual table indirections.

Decorator pattern allows dynamically attaching new functionality to the existing types without changing the types. In other words, it is a flexible alternative to subclassing for extending functionality. The author tells the reference from the GoF book about how the analogy of strategy being the gut of the object and decorator being the skin. The author also gave a quick tour of the Singleton pattern. Singleton pattern is infamous for the issues with SIOF, hindrance to testability, etc. The author shows us how strategy patterns could be used to invert dependency of the singleton pattern easily for testability.

I hope you enjoyed reading this summarisation and find it helpful. If you decide to read the book do enjoy it! If you have already read the book, let me know if you have something more to add.

# Abbreviations {#abbreviations}

*	OOP: Object Oriented Programming
*	DRY: Do Not Repeat yourself
*	SOLID: 5 most famous software programming principle next in line -
*	SRP: Sinogle Responsibility Principle
*	OCP : Open Close Principle
*	LSP: Liskov's Substitution Principle
*	ISP: Interface Segregation Principle
*	DIP: Dependency Inversion Principle
*	CRTP: Curiously Recurring Template Pattern
*	SBO: Small buffer optimization
*	SIOF: Static initialization order fiasco
*	GoF: Gang of four book - Design Patterns: Elements of Reusable Object-oriented software
