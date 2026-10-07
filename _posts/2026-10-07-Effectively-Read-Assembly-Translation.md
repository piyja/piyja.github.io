---
layout: post
title: Effectively Read Assembly Translation
date: 2026-10-07
slug: Effectively-Read-Assembly-Translation
description: "Helper article to get started with reading assembly code"
tags: [embedded]
categories: [Field Notes]
toc:
  sidebar: left
---

For really long time I never bothered to look into the assembly translation of the application code I write. For brief amount of embedded development I occasionally peeked at the values stored into the registers while running a debugging session, but I never fully explored how high-level constructs map to low-level instructions. Although it always felt incomplete how the code is translated into machine understandable which comes quite handy when it comes to comparing alternative approaches of addressing an optimization problem. Recently I heard in one of the famous tech podcast that understanding and occassionaly peeking into the assembly can provide deep insights into performance and optimization opportunities, especially in the age of writing and imporvising codebase with coding agents.
Hence here is my attempt to document my learning about the fundamentals of assembly languages into handful of consolidated concepts and commands.

Assembly can look like a wall of cryptic abbreviations the first time you see it. It becomes much easier when you treat it as a low-level view of ideas you already know: 

1. variables live somewhere
2. expressions become operations
3. branches implement control flow 
4. function calls follow a convention.

This guide is for programmers who know C or C++ and want to read the assembly produced by a compiler. It is a **reading guide**, not a guide to writing an entire program in assembly.

> **Scope:** examples use **x86-64, Intel syntax, and the System V ABI** used by Linux and most Unix-like x86-64 systems. macOS uses the same general-purpose registers and instruction ideas, but has platform differences such as symbol naming and debugging conventions. Windows x64 uses a different calling convention. ARM64 assembly looks different; the same mental model still helps, but the instructions and registers change.

## 1. The useful mental model

At the very first lets quickly go through the basic building block of registers in assembly.

A CPU executes instructions that operate on a small set of fast storage locations called **registers**, or on bytes in memory. At this level, a source variable is not guaranteed to have a permanent “home.” The compiler may keep it in a register, place it on the stack, combine it with another value, or remove it entirely if it can prove it is unnecessary.

A C++ statement such as:

```cpp
int sum(int a, int b) {
    return a + b;
}
```

might become:

```asm
sum:
    lea     eax, [rdi + rsi]
    ret
```

That tiny function already shows several important ideas:
- `rdi` (registers destination index) and `rsi` (registers source index) carry the first two integer arguments under the System V calling convention.
- `eax` (extended accumulator) carries the integer return value.
- `lea` (load effective address) computes an address-shaped expression; here it is used simply to add.
- `ret` returns to the caller.

The compiler has not created stack slots for `a` and `b`. Their values arrive in registers, the result is computed in a register, and the function returns.

## 2. Registers you will see often

The general-purpose x86-64 registers are 64 bits wide. Many instructions can also refer to their lower 32, 16, or 8 bits. For example, `rax`, `eax`, `ax`, and `al` name overlapping parts of the same register:

```text
rax  64 bits: [----------------------------------------]
eax  32 bits:                         [----------------]
ax   16 bits:                                 [--------]
al    8 bits:                                       [--]
```

Writing a 32-bit register such as `eax` clears the upper 32 bits of `rax`. This is why compilers commonly use `eax` for 32-bit integer work even in 64-bit programs.

| Register | Common role in System V x86-64 |
|---|---|
| `rax` | Return value; also used by some arithmetic instructions |
| `rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9` | First six integer or pointer arguments, in that order |
| `rbx`, `rbp`, `r12`–`r15` | Callee-saved registers: a function that uses them must restore their incoming values |
| `rsp` | Stack pointer: points near the current top of the stack |
| `rbp` | Sometimes used as a frame pointer; often available for general use when optimization is enabled |
| `rip` | Instruction pointer; the address of the next instruction (usually seen indirectly in assembly) |

Floating-point and vector calculations commonly use `xmm0`–`xmm15` registers. The same register family can hold scalar floating-point values or packed vectors, depending on the instruction.

### The stack, briefly

The stack is a region of memory used for things such as saved registers, local storage, and outgoing call data. On x86-64, `call` pushes a return address onto the stack, and `ret` takes it back off. The stack usually grows toward lower addresses, so reserving 32 bytes often looks like:

```asm
sub     rsp, 32       ; make 32 bytes of stack space
...
add     rsp, 32       ; release it
```

Optimized functions may have no stack frame at all. A function with a frame pointer may start with a familiar pattern such as `push rbp` / `mov rbp, rsp`, but that pattern is not required by the language or the machine.

## 3. Reading an instruction

In Intel syntax, the destination usually comes first:

```asm
mov     eax, 7        ; eax = 7
add     eax, 3        ; eax = eax + 3
```

An instruction may have:

- **A mnemonic**, such as `mov` or `add`.
- **Operands**, such as registers, constants, or memory locations.
- **An operand size**, sometimes made visible by the register (`eax` is 32-bit, `rax` is 64-bit) and sometimes written explicitly (`byte ptr`, `dword ptr`, `qword ptr`).

The square brackets mean **read or write memory at this address**:

```asm
mov     eax, DWORD PTR [rdi]  ; eax = the 32-bit value stored at address rdi
mov     DWORD PTR [rdi], eax  ; store eax to the 32-bit memory location at rdi
```

By contrast, `mov eax, edi` copies a value between registers. The register `rdi` contains an address only if the code has put one there; the name of a register does not itself make it a pointer.

A memory expression such as `[base + index*scale + displacement]` computes an address:

```asm
mov     eax, DWORD PTR [rdi + rsi*4 + 8]
```

This reads four bytes at address `rdi + rsi*4 + 8`. It could correspond to an element of an `int` array, with an eight-byte offset before the indexed portion.

## 4. A core instruction vocabulary

You do not need to memorize every x86 instruction before reading compiler output. These 27 cover a large share of the patterns you are likely to meet in ordinary optimized C and C++ code. Exact choices vary with compiler, optimization level, and target CPU.

### Moving values and accessing memory

| Instruction | What it does | A useful way to read it |
|---|---|---|
| `mov` | Copies a value between registers, or between a register and memory | `mov dst, src` means “put `src` in `dst`.” It does not move data from memory unless an operand uses brackets. |
| `movzx` | Copies a smaller unsigned value and zero-extends it | A byte value like `0xff` becomes `255`, not `-1`. |
| `movsx` / `movsxd` | Copies a smaller signed value and sign-extends it | A signed byte like `0xff` becomes `-1`. `movsxd` commonly extends 32 bits to 64 bits. |
| `lea` | Computes an effective address without loading from memory | Often used for address calculation, but also for additions and small multiply-add expressions. |
| `push` | Decrements `rsp` and stores a value on the stack | Often saves a register or places a value on the stack. |
| `pop` | Loads a value from the stack and increments `rsp` | Often restores a saved register. |

### Arithmetic, bits, and comparisons

| Instruction | What it does | A useful way to read it |
|---|---|---|
| `add` | Adds source to destination | `add eax, edx` means `eax += edx`. |
| `sub` | Subtracts source from destination | `sub rsp, 16` commonly reserves stack space. |
| `imul` | Multiplies integer operands | Used for signed integer multiplication; common forms also work for ordinary low-bit results. |
| `idiv` | Signed integer division | Divides a double-width value in `rdx:rax` by its operand; quotient goes in `rax`, remainder in `rdx`. Setup instructions are often nearby. |
| `inc` / `dec` | Increments or decrements by one | `inc eax` means `++eax`. Compilers may use `add` or `sub` instead. |
| `and` | Bitwise AND | Used for masks and some alignment calculations. |
| `or` | Bitwise OR | Sets selected bits or combines flags. |
| `xor` | Bitwise XOR | Also a common way to zero a register: `xor eax, eax`. |
| `shl` / `sal` | Shifts bits left | Often implements multiplication by a power of two, subject to the integer-width behavior. |
| `shr` | Logical right shift; fills high bits with zero | Common for unsigned values. |
| `sar` | Arithmetic right shift; keeps the sign bit | Common for signed values. Rounding details can matter when mapping to division. |
| `cmp` | Sets status flags as if subtracting, without keeping the result | Usually followed by a conditional jump or `setcc`. The operand order matters. |
| `test` | Sets flags from a bitwise AND, without keeping the result | Often checks whether a value is zero or whether selected bits are set. |

### Control flow and calls

| Instruction | What it does | A useful way to read it |
|---|---|---|
| `jmp` | Unconditional jump | `goto label`. |
| `je` / `jz` | Jump if equal / zero | Often implements `==` or a zero check. These names share the same condition. |
| `jne` / `jnz` | Jump if not equal / not zero | Often implements `!=` or a nonzero check. |
| `jl`, `jle`, `jg`, `jge` | Signed less/less-or-equal/greater/greater-or-equal jumps | Used after comparisons interpreted as signed values. |
| `jb`, `jbe`, `ja`, `jae` | Unsigned below/below-or-equal/above/above-or-equal jumps | Used after comparisons interpreted as unsigned values. |
| `call` | Calls a function and saves a return address | Usually followed by the function label or an indirect target. |
| `ret` | Returns to the saved return address | The return value is normally already in the appropriate register. |
| `nop` | Does nothing | May appear for alignment, patching, or layout reasons. |

`cmp` does not decide whether numbers are signed or unsigned on its own. The **conditional jump** determines how the flags are interpreted. For example, `jl` is a signed comparison and `jb` is an unsigned comparison. When reading a condition, look at the whole sequence: the `cmp` operands plus the jump that follows it.

## 5. The System V calling convention

A **calling convention** is the agreement between compiled functions about where arguments go, where results come back, which registers must be preserved, and how the stack is managed. Under the System V x86-64 convention, the first six integer or pointer arguments are passed in:

```text
rdi, rsi, rdx, rcx, r8, r9
```

An integer or pointer result is usually returned in `rax` (or its lower part, such as `eax` for a 32-bit `int`). Floating-point arguments and results generally use XMM registers. Additional arguments are passed on the stack. Some types, including certain aggregates, have more involved rules.

Here is a small function call:

```cpp
int twice_plus_one(int x) {
    return x * 2 + 1;
}

int use_it(int value) {
    return twice_plus_one(value);
}
```

One possible optimized result is:

```asm
use_it:
    lea     edi, [rdi + rdi + 1]  ; compute 2*value + 1 in the argument register
    jmp     twice_plus_one       ; tail-call: return its result directly
```

This version has no `call` or `ret` in `use_it`: it has become a **tail call**. A different compiler or build configuration might emit an ordinary call. The important point is to identify where values enter and leave the function, then track how they move.

## 6. Match familiar C++ constructs to assembly

The examples below are illustrative. They show common shapes, not guaranteed compiler output. Compilers can reorder operations, choose different registers, inline functions, or remove code entirely.

### A conditional

```cpp
int abs_value(int x) {
    return x < 0 ? -x : x;
}
```

A branch-based version might look like:

```asm
abs_value:
    mov     eax, edi       ; copy x to the return register
    test    edi, edi       ; set flags based on x
    jns     .done          ; if x is nonnegative, skip negation
    neg     eax            ; eax = -eax (neg is another common instruction)
.done:
    ret
```

Read it as a small control-flow graph: test the input, branch around the negation when it is already nonnegative, then return. For `INT_MIN`, negation overflows in two's-complement arithmetic; in C++, signed overflow is undefined, so the source function itself does not promise a representable positive result for that input.

### A loop over an array

```cpp
int sum(const int* values, int count) {
    int total = 0;
    for (int i = 0; i < count; ++i) {
        total += values[i];
    }
    return total;
}
```

A readable, unoptimized-style shape might be:

```asm
sum:
    xor     eax, eax                 ; total = 0
    xor     ecx, ecx                 ; i = 0
    test    esi, esi                 ; is count <= 0?
    jle     .done
.loop:
    add     eax, DWORD PTR [rdi + rcx*4] ; total += values[i]
    inc     ecx                      ; ++i
    cmp     ecx, esi                  ; compare i with count
    jl      .loop                     ; continue while i < count (signed)
.done:
    ret
```

For `int` elements, the index is scaled by four because an `int` is four bytes on the target platform. Real output may use pointers that advance by four each iteration, vectorize several additions at once, or use unsigned branches depending on how the loop is written and what the compiler can prove.

### A structure field

```cpp
struct Point { int x; int y; };

int get_y(const Point* p) {
    return p->y;
}
```

If `y` is four bytes after the start of the structure, the function may be as simple as:

```asm
get_y:
    mov     eax, DWORD PTR [rdi + 4]  ; load p->y
    ret
```

This is a good example of the difference between an address and a value: `rdi` holds the pointer, `[rdi + 4]` refers to memory at an offset, and the `mov` loads the field stored there.

## 7. Signedness and width are clues

C and C++ types do not travel into machine code as labels such as `int`, `unsigned`, or `long`. Instead, you infer meaning from operation width, extension, and control flow.

- `movzx` commonly signals that a smaller **unsigned** value is being widened.
- `movsx` or `movsxd` commonly signals **signed** extension.
- `jl` / `jge` are signed conditions; `jb` / `jae` are unsigned conditions.
- `sar` is an arithmetic right shift; `shr` is a logical right shift.
- `eax` indicates a 32-bit operation; `rax` indicates a 64-bit operation.

These are clues, not a complete source-level reconstruction. Optimizations can make the original type difficult to infer, and C++ conversions can insert or remove extensions in ways that depend on context.

## 8. Why `lea` is not just “load address”

`lea` stands for **load effective address**, but it does not read memory. It calculates the address expression inside brackets and puts that number in a register.

```asm
lea     eax, [rdi + rdi*4]  ; eax = rdi + 4*rdi
```

This computes `5 * rdi`. With a final offset it can express `5*x + 3`, for example. Compilers often use `lea` for arithmetic because its addressing form conveniently combines a base, a scaled index, and a displacement.

Contrast it with:

```asm
mov     eax, DWORD PTR [rdi + rdi*4] ; read memory at that calculated address
```

Here the brackets are a memory access. With `lea`, they describe arithmetic only.

## 9. Optimization changes the story

When you inspect compiler output, remember that it represents the program **after transformations**. Some common surprises:

- **Inlining:** a function call disappears and its body appears at the call site.
- **Constant folding:** an expression such as `6 * 7` becomes `42` during compilation.
- **Dead-code elimination:** a calculation whose result is never used vanishes.
- **Register allocation:** variables move among registers; there may be no stack slot to find.
- **Strength reduction:** multiplication by a constant may become shifts, additions, or `lea`.
- **Vectorization:** a loop may process several values with XMM/YMM/ZMM registers at once.
- **Instruction selection:** the compiler may use a conditional move or `setcc` instead of a branch.
- **Control-flow restructuring:** loops and conditions may be inverted or rearranged while preserving behavior.

The most efficient-looking instruction sequence is not automatically the fastest on every CPU. Modern processors execute instructions through pipelines, caches, and execution units, and performance depends on the whole workload. For learning to read output, first establish what the sequence computes and only then it makes sense to investigate for speed optimization.

## 10. Inspecting compiler output

If you have GCC or Clang installed, start with a tiny source file and ask the compiler to emit assembly. `-S` stops after assembly generation, `-O2` enables common optimizations, and `-masm=intel` asks GCC or Clang to use Intel-style operand order where supported:

```sh
c++ -std=c++20 -O2 -S -masm=intel example.cpp -o example.s
```

To retain source lines as comments in the output, add `-fverbose-asm` (GCC) or use the compiler’s source-annotation options. For a quick terminal view without creating a separate assembly file, GCC and Clang can also print assembly to standard output using `-S -o -`:

```sh
c++ -std=c++20 -O2 -S -masm=intel -o - example.cpp
```

Note: Compiler flags differ, so check `c++ --version` and your compiler’s help if an option is unavailable. To see both a simple version and an optimized version, compile once without optimization and once with `-O2`. The unoptimized output is often easier to associate with source variables; optimized output is closer to what you want to become comfortable reading in real builds.

Keep the input small. If you want to study one function, give the compiler a source file with just that function and any required declarations. Make its result observable—for example, return the result or print it—so the compiler does not correctly remove the entire computation as unused.

## 11. A practical reading checklist

When looking at an unfamiliar function, work through it in this order:

1. **Find the function boundaries and labels.** Identify the entry point, return instructions, and branch targets.
2. **Identify the calling convention.** On System V x86-64, start by mapping `rdi`, `rsi`, `rdx`, `rcx`, `r8`, and `r9` to integer and pointer arguments.
3. **Track the return value.** For an integer or pointer result, look for the final value in `rax` or a smaller part such as `eax`.
4. **Separate register operations from memory operations.** Brackets such as `[rdi + 8]` mean a memory access; `lea` with brackets computes an address.
5. **Mark the control flow.** Draw a quick arrow for each conditional or unconditional jump. This often makes loops and `if` statements clear.
6. **Read comparisons together with their jumps.** Signed and unsigned jumps interpret flags differently.
7. **Track only the values that matter.** Give registers temporary names such as `index`, `sum`, `pointer`, or `result`; do not assume one register permanently represents one source variable.
8. **Account for the build settings.** Optimization level, target architecture, and inlining can change the shape dramatically.

The goal is not to translate every instruction back to one exact source line. Several different instruction sequences can express the same behavior, and optimized code often has no one-to-one relationship with the source. Aim to explain what values flow through the function and which paths it can take.

