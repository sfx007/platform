/**
 * Seed script: C++ Modules 05-09 — exercises, skills, flashcards
 *
 * Run with: npx tsx scripts/seed-cpp-modules.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── MODULES ──────────────────────────────────────────────────

const MODULES = [
  {
    number: 5,
    title: "Repetition and Exceptions",
    slug: "cpp05",
    description:
      "Design exception hierarchies, practice RAII, and master the Orthodox Canonical Form through a bureaucratic nightmare of offices, corridors, forms, and waiting queues.",
    order: 1,
  },
  {
    number: 6,
    title: "C++ Casts",
    slug: "cpp06",
    description:
      "Master the four C++ cast operators: static_cast, dynamic_cast, const_cast, and reinterpret_cast. Each exercise requires a specific casting type.",
    order: 2,
  },
  {
    number: 7,
    title: "C++ Templates",
    slug: "cpp07",
    description:
      "Implement function templates and class templates. Build generic, type-safe code that works with any data type while maintaining compile-time type checking.",
    order: 3,
  },
  {
    number: 8,
    title: "Templated Containers, Iterators, Algorithms",
    slug: "cpp08",
    description:
      "Your first encounter with the STL. Use containers (vector, list, stack), iterators, and algorithms from the <algorithm> header.",
    order: 4,
  },
  {
    number: 9,
    title: "STL",
    slug: "cpp09",
    description:
      "Advanced STL mastery: choose the right container for each problem. Each container can only be used once across all exercises. Performance measurement required.",
    order: 5,
  },
];

// ── EXERCISES ────────────────────────────────────────────────

const EXERCISES = [
  // MODULE 05
  {
    moduleSlug: "cpp05",
    number: 0,
    slug: "cpp05-ex00",
    title: "Bureaucrat",
    description:
      "Create a Bureaucrat class with constant name, grade 1-150, increment/decrement, and nested exception classes GradeTooHighException and GradeTooLowException.",
    difficulty: "medium",
    estimatedHours: 4,
    filesRequired: '["Makefile","main.cpp","Bureaucrat.hpp","Bureaucrat.cpp"]',
    skillsSummary: "Exception hierarchies, OCF, operator<< overload",
    order: 0,
  },
  {
    moduleSlug: "cpp05",
    number: 1,
    slug: "cpp05-ex01",
    title: "Form",
    description:
      "Create a Form class with sign/execute grades. Implement beSigned() on Form and signForm() on Bureaucrat with proper exception handling.",
    difficulty: "medium",
    estimatedHours: 4,
    filesRequired:
      '["Makefile","main.cpp","Bureaucrat.hpp","Bureaucrat.cpp","Form.hpp","Form.cpp"]',
    skillsSummary: "Exception safety, RAII, class interaction",
    order: 1,
  },
  {
    moduleSlug: "cpp05",
    number: 2,
    slug: "cpp05-ex02",
    title: "No, you need form 28B, not 28C...",
    description:
      "Create AForm abstract base class and 3 concrete forms: ShrubberyCreationForm, RobotomyRequestForm, PresidentialPardonForm. Implement execute() with grade checks.",
    difficulty: "hard",
    estimatedHours: 6,
    filesRequired:
      '["Makefile","main.cpp","Bureaucrat.hpp","Bureaucrat.cpp","AForm.hpp","AForm.cpp","ShrubberyCreationForm.hpp","ShrubberyCreationForm.cpp","RobotomyRequestForm.hpp","RobotomyRequestForm.cpp","PresidentialPardonForm.hpp","PresidentialPardonForm.cpp"]',
    skillsSummary: "Abstract classes, polymorphism, virtual functions",
    order: 2,
  },
  {
    moduleSlug: "cpp05",
    number: 3,
    slug: "cpp05-ex03",
    title: "At least this beats coffee-making",
    description:
      "Create an Intern class with makeForm() factory method. Create forms dynamically by name string without using if/else chains.",
    difficulty: "medium",
    estimatedHours: 3,
    filesRequired:
      '["Makefile","main.cpp","Bureaucrat.hpp","Bureaucrat.cpp","AForm.hpp","AForm.cpp","ShrubberyCreationForm.hpp","ShrubberyCreationForm.cpp","RobotomyRequestForm.hpp","RobotomyRequestForm.cpp","PresidentialPardonForm.hpp","PresidentialPardonForm.cpp","Intern.hpp","Intern.cpp"]',
    skillsSummary: "Factory pattern, string dispatch",
    order: 3,
  },

  // MODULE 06
  {
    moduleSlug: "cpp06",
    number: 0,
    slug: "cpp06-ex00",
    title: "Conversion of scalar types",
    description:
      "Write a ScalarConverter class with a static convert() method. Detect literal type (char/int/float/double) and convert to all four scalar types with proper formatting.",
    difficulty: "hard",
    estimatedHours: 6,
    filesRequired: '["Makefile","*.cpp","*.hpp"]',
    skillsSummary: "static_cast, type detection, parsing, edge cases (nan, inf)",
    order: 0,
  },
  {
    moduleSlug: "cpp06",
    number: 1,
    slug: "cpp06-ex01",
    title: "Serialization",
    description:
      "Implement a Serializer class with static serialize(Data* ptr) → uintptr_t and deserialize(uintptr_t raw) → Data*. Verify round-trip pointer equality.",
    difficulty: "medium",
    estimatedHours: 3,
    filesRequired: '["Makefile","*.cpp","*.hpp"]',
    skillsSummary: "reinterpret_cast, pointer serialization, uintptr_t",
    order: 1,
  },
  {
    moduleSlug: "cpp06",
    number: 2,
    slug: "cpp06-ex02",
    title: "Identify real type",
    description:
      "Implement identify(Base* p) and identify(Base& p) using dynamic_cast to determine the actual derived type (A, B, or C) at runtime.",
    difficulty: "medium",
    estimatedHours: 3,
    filesRequired: '["Makefile","*.cpp","*.hpp"]',
    skillsSummary: "dynamic_cast, RTTI, polymorphism, reference vs pointer casting",
    order: 2,
  },

  // MODULE 07
  {
    moduleSlug: "cpp07",
    number: 0,
    slug: "cpp07-ex00",
    title: "Start with a few functions",
    description:
      "Implement function templates: swap(), min(), max(). They must work with any type that supports comparison operators.",
    difficulty: "easy",
    estimatedHours: 2,
    filesRequired: '["Makefile","main.cpp","whatever.hpp"]',
    skillsSummary: "Function templates, type deduction, template syntax",
    order: 0,
  },
  {
    moduleSlug: "cpp07",
    number: 1,
    slug: "cpp07-ex01",
    title: "Iter",
    description:
      "Implement iter(array, length, function) template that applies a function to every element. Must support both const and non-const elements.",
    difficulty: "medium",
    estimatedHours: 3,
    filesRequired: '["Makefile","main.cpp","iter.hpp"]',
    skillsSummary: "Function templates, function pointers, const correctness",
    order: 1,
  },
  {
    moduleSlug: "cpp07",
    number: 2,
    slug: "cpp07-ex02",
    title: "Array",
    description:
      "Develop a class template Array<T> with bounds-checked operator[], size(), copy construction, and assignment. Must pass the provided main.cpp test.",
    difficulty: "hard",
    estimatedHours: 5,
    filesRequired: '["Makefile","main.cpp","Array.hpp"]',
    skillsSummary: "Class templates, operator overload, exception on out-of-bounds",
    order: 2,
  },

  // MODULE 08
  {
    moduleSlug: "cpp08",
    number: 0,
    slug: "cpp08-ex00",
    title: "Easy find",
    description:
      "Write a function template easyfind that finds the first occurrence of an integer in any container of integers. Throw an exception if not found.",
    difficulty: "easy",
    estimatedHours: 2,
    filesRequired: '["Makefile","main.cpp","easyfind.hpp"]',
    skillsSummary: "STL algorithms (std::find), iterators, containers",
    order: 0,
  },
  {
    moduleSlug: "cpp08",
    number: 1,
    slug: "cpp08-ex01",
    title: "Span",
    description:
      "Develop a Span class storing up to N integers. Implement addNumber(), shortestSpan(), longestSpan(), and a range-based addNumber using iterators.",
    difficulty: "medium",
    estimatedHours: 4,
    filesRequired: '["Makefile","main.cpp","Span.hpp","Span.cpp"]',
    skillsSummary: "std::vector, STL algorithms (sort, adjacent_difference), iterators",
    order: 1,
  },
  {
    moduleSlug: "cpp08",
    number: 2,
    slug: "cpp08-ex02",
    title: "Mutated abomination",
    description:
      "Create MutantStack: a std::stack that is iterable. Add begin(), end(), rbegin(), rend() by exposing the underlying container's iterators.",
    difficulty: "medium",
    estimatedHours: 3,
    filesRequired: '["Makefile","main.cpp","MutantStack.hpp"]',
    skillsSummary: "Container adaptation, std::stack internals, iterator exposure",
    order: 2,
  },

  // MODULE 09
  {
    moduleSlug: "cpp09",
    number: 0,
    slug: "cpp09-ex00",
    title: "Bitcoin Exchange",
    description:
      "Program btc that reads a CSV price database and an input file, outputs value × exchange rate for the closest lower date. Use std::map.",
    difficulty: "medium",
    estimatedHours: 5,
    filesRequired:
      '["Makefile","main.cpp","BitcoinExchange.hpp","BitcoinExchange.cpp"]',
    skillsSummary: "std::map, lower_bound, file I/O, CSV parsing, date validation",
    order: 0,
  },
  {
    moduleSlug: "cpp09",
    number: 1,
    slug: "cpp09-ex01",
    title: "Reverse Polish Notation",
    description:
      'Build an RPN calculator. Process expressions like "8 9 * 9 - 4 -" = 59. Use std::stack for operand management.',
    difficulty: "medium",
    estimatedHours: 3,
    filesRequired: '["Makefile","main.cpp","RPN.hpp","RPN.cpp"]',
    skillsSummary: "std::stack, string tokenization, postfix evaluation",
    order: 1,
  },
  {
    moduleSlug: "cpp09",
    number: 2,
    slug: "cpp09-ex02",
    title: "PmergeMe",
    description:
      "Implement Ford-Johnson merge-insert sort using two different containers (std::vector and std::deque). Measure and compare performance with 3000+ elements.",
    difficulty: "hard",
    estimatedHours: 8,
    filesRequired: '["Makefile","main.cpp","PmergeMe.hpp","PmergeMe.cpp"]',
    skillsSummary:
      "std::vector, std::deque, algorithm complexity, performance measurement",
    order: 2,
  },
];

// ── SKILLS (15 C++ skills) ───────────────────────────────────

const CPP_SKILLS = [
  // Module 05 (3 skills)
  {
    slug: "exception-hierarchies",
    title: "Exception Hierarchies",
    description:
      "Design exception class hierarchies with nested exception classes, proper inheritance from std::exception, and meaningful what() messages.",
    category: "exception",
    moduleNumber: 5,
    unlockExercise: "cpp05-ex00",
    careerValue:
      "Used in every C++ codebase for error handling. Interview topic: 'Design an exception hierarchy for X'.",
    proofCriteria:
      '["Exceptions inherit from std::exception","what() provides meaningful messages","Catch blocks ordered specific→general","No exception leaks"]',
  },
  {
    slug: "raii",
    title: "RAII (Resource Acquisition Is Initialization)",
    description:
      "Manage resources safely using constructors/destructors, ensuring cleanup even when exceptions are thrown. Foundation of smart pointers.",
    category: "exception",
    moduleNumber: 5,
    unlockExercise: "cpp05-ex01",
    careerValue:
      "Foundation of smart pointers, file handles, locks. Interview: 'How do you prevent resource leaks?'",
    proofCriteria:
      '["Resources always released even on exception","No memory leaks","Destructors never throw","Can explain stack unwinding"]',
  },
  {
    slug: "orthodox-canonical-form",
    title: "Orthodox Canonical Form",
    description:
      "Implement the Rule of Three: default constructor, copy constructor, assignment operator, destructor. Prevent shallow copies and double frees.",
    category: "exception",
    moduleNumber: 5,
    unlockExercise: "cpp05-ex00",
    careerValue:
      "Prevents memory leaks, double frees, shallow copies. Foundation for understanding smart pointers.",
    proofCriteria:
      '["Deep copy works correctly","Self-assignment handled","No memory leaks on copy/assign","Can explain when NOT to use OCF"]',
  },
  // Module 06 (3 skills)
  {
    slug: "static-casting",
    title: "Static Casting",
    description:
      "Use static_cast for compile-time checked conversions between related types: numeric conversions, base↔derived (when type is known), enum conversions.",
    category: "cast",
    moduleNumber: 6,
    unlockExercise: "cpp06-ex00",
    careerValue:
      "Most common C++ cast. Replaces C-style casts for type safety. Compiler catches invalid conversions.",
    proofCriteria:
      '["Correct numeric conversions","Handles overflow/underflow","Proper char↔int conversion","No information loss warnings"]',
  },
  {
    slug: "dynamic-casting",
    title: "Dynamic Casting",
    description:
      "Use dynamic_cast for runtime polymorphic type checking. Safely downcast Base* to Derived* with nullptr checks, or Base& with exception handling.",
    category: "cast",
    moduleNumber: 6,
    unlockExercise: "cpp06-ex02",
    careerValue:
      "Essential for plugin systems, type-safe downcasting. Interview: 'When would you use dynamic_cast vs static_cast?'",
    proofCriteria:
      '["nullptr check after pointer cast","try/catch for reference cast","Requires virtual functions (RTTI)","Understands performance cost"]',
  },
  {
    slug: "reinterpret-casting",
    title: "Reinterpret Casting",
    description:
      "Use reinterpret_cast for low-level bit reinterpretation: pointer↔integer, void*↔T*, and cross-type pointer conversions for serialization.",
    category: "cast",
    moduleNumber: 6,
    unlockExercise: "cpp06-ex01",
    careerValue:
      "Used in serialization, networking, hardware access. Must understand when it's safe vs undefined behavior.",
    proofCriteria:
      '["Round-trip pointer conversion works","Understands aliasing rules","Uses uintptr_t correctly","No undefined behavior"]',
  },
  // Module 07 (3 skills)
  {
    slug: "function-templates",
    title: "Function Templates",
    description:
      "Write generic function templates with automatic type deduction. Create reusable algorithms that work with any type meeting requirements.",
    category: "template",
    moduleNumber: 7,
    unlockExercise: "cpp07-ex00",
    careerValue:
      "Foundation of generic programming. STL algorithms are all function templates. Interview: 'Write a generic sort/find'.",
    proofCriteria:
      '["Template syntax correct","Type deduction works","Works with custom types","Compiler error messages understood"]',
  },
  {
    slug: "class-templates",
    title: "Class Templates",
    description:
      "Design generic container classes with type parameters. Implement constructors, operators, and member functions that work with any element type.",
    category: "template",
    moduleNumber: 7,
    unlockExercise: "cpp07-ex02",
    careerValue:
      "STL containers (vector, map, set) are all class templates. Interview: 'Implement a simple container class'.",
    proofCriteria:
      '["Template class compiles for multiple types","operator[] with bounds checking","Deep copy works for any T","size() and empty array handling"]',
  },
  {
    slug: "template-specialization",
    title: "Template Specialization",
    description:
      "Understand full and partial template specialization. Support both const and non-const contexts in template parameters.",
    category: "template",
    moduleNumber: 7,
    unlockExercise: "cpp07-ex01",
    careerValue:
      "Enables type-specific optimizations. Used in STL (e.g., vector<bool>). Key for library design.",
    proofCriteria:
      '["iter works with const and non-const","Function pointer and template function both work","Understands instantiation","Can explain SFINAE basics"]',
  },
  // Module 08 (3 skills)
  {
    slug: "stl-containers",
    title: "STL Containers",
    description:
      "Use vector, list, stack, deque, and other sequence containers. Understand their memory models, iterator invalidation, and when to use each.",
    category: "stl",
    moduleNumber: 8,
    unlockExercise: "cpp08-ex01",
    careerValue:
      "Daily use in every C++ project. Interview: 'When would you use vector vs list vs deque?'",
    proofCriteria:
      '["Correct container choice for problem","Proper iterator usage","No iterator invalidation bugs","Understands push_back vs emplace_back"]',
  },
  {
    slug: "stl-iterators",
    title: "STL Iterators",
    description:
      "Master iterator categories (input, output, forward, bidirectional, random-access). Use begin/end, rbegin/rend, and custom iterator exposure.",
    category: "stl",
    moduleNumber: 8,
    unlockExercise: "cpp08-ex02",
    careerValue:
      "Iterators are the bridge between containers and algorithms. Understanding them unlocks the full power of the STL.",
    proofCriteria:
      '["Expose underlying container iterators","Range-based operations work","begin/end/rbegin/rend implemented","Understands iterator categories"]',
  },
  {
    slug: "stl-algorithms",
    title: "STL Algorithms",
    description:
      "Use <algorithm> functions: find, sort, transform, accumulate, adjacent_difference, min_element, max_element, and more.",
    category: "stl",
    moduleNumber: 8,
    unlockExercise: "cpp08-ex00",
    careerValue:
      "Replaces hand-written loops with tested, optimized library code. Interview: 'Solve X using STL algorithms'.",
    proofCriteria:
      '["std::find used correctly","sort + adjacent_difference for span","Understands predicate functions","Correct algorithm complexity"]',
  },
  // Module 09 (3 skills)
  {
    slug: "container-selection",
    title: "Container Selection",
    description:
      "Choose the optimal container for each problem. Understand trade-offs: map for sorted key-value, stack for LIFO, vector for random access, deque for double-ended.",
    category: "advanced-stl",
    moduleNumber: 9,
    unlockExercise: "cpp09-ex00",
    careerValue:
      "Wrong container = 10-100x performance penalty. Interview: 'Which container would you use for X and why?'",
    proofCriteria:
      '["std::map chosen for date lookup","Explains why lower_bound is O(log n)","Each exercise uses different container","Can justify container choice"]',
  },
  {
    slug: "algorithm-complexity",
    title: "Algorithm Complexity",
    description:
      "Analyze and compare algorithm complexity. Measure real-world performance with timing. Understand Big-O for all common operations.",
    category: "advanced-stl",
    moduleNumber: 9,
    unlockExercise: "cpp09-ex02",
    careerValue:
      "Every senior C++ interview involves complexity analysis. Critical for performance-sensitive systems.",
    proofCriteria:
      '["Correct Big-O analysis","Performance measured with clock()","Comparison between two containers","Can explain merge-insert sort complexity"]',
  },
  {
    slug: "stl-performance",
    title: "STL Performance Optimization",
    description:
      "Optimize STL usage: reserve capacity, avoid unnecessary copies, use move semantics concepts, choose cache-friendly containers.",
    category: "advanced-stl",
    moduleNumber: 9,
    unlockExercise: "cpp09-ex02",
    careerValue:
      "Differentiates senior from junior. Understanding cache locality, allocation patterns, and move semantics.",
    proofCriteria:
      '["vector::reserve used when size known","No unnecessary copies","Timing comparison shows understanding","Can explain cache locality impact"]',
  },
];

// ── FLASHCARDS (80 cards across modules 05-09) ───────────────

const CPP_FLASHCARDS = [
  // ── MODULE 05: Exceptions (20 cards) ───────────────────────

  // Card 1: OCF concept
  {
    moduleNumber: 5,
    cardType: "concept",
    front: "What is the Orthodox Canonical Form in C++?",
    back: 'The "Rule of Three" ensuring proper resource management:\n\n1. **Default Constructor** — `ClassName();`\n2. **Copy Constructor** — `ClassName(const ClassName& other);`\n3. **Assignment Operator** — `ClassName& operator=(const ClassName& other);`\n4. **Destructor** — `~ClassName();`\n\n**Without these**, default behavior can cause:\n- Shallow copies (shared pointers)\n- Double frees (same memory deleted twice)\n- Memory leaks (resources not cleaned up)',
    difficulty: "medium",
    exerciseSlug: "cpp05-ex00",
  },
  {
    moduleNumber: 5,
    cardType: "code",
    front: "Implement a nested exception class `GradeTooHighException` inside a Bureaucrat class that inherits from `std::exception`.",
    back: '```cpp\nclass Bureaucrat {\nprivate:\n    int _grade;\npublic:\n    class GradeTooHighException : public std::exception {\n    public:\n        virtual const char* what() const throw() {\n            return "Grade too high (minimum is 1)";\n        }\n    };\n    \n    void incrementGrade() {\n        if (_grade <= 1)\n            throw GradeTooHighException();\n        _grade--;\n    }\n};\n```\n\n**Key points:** Inherits `std::exception`, `what()` is `const throw()`, catch by `const T&`.',
    difficulty: "medium",
    exerciseSlug: "cpp05-ex00",
  },
  {
    moduleNumber: 5,
    cardType: "debug",
    front: "BUG: This copy constructor causes a double-free. Why?\n\n```cpp\nclass Form {\n    std::string* _name;\npublic:\n    Form(const Form& other) {\n        _name = other._name;  // Copy pointer\n    }\n};\n```",
    back: "**PROBLEM:** Shallow copy — both objects point to the SAME string.\n\nWhen one destructor runs: `delete _name;`\nWhen the second runs: `delete _name;` → **CRASH** (already deleted!)\n\n**FIX:** Deep copy:\n```cpp\nForm(const Form& other) {\n    _name = new std::string(*other._name);\n}\n```\n\n**Rule:** If your class has pointers/dynamic memory → you MUST deep copy.",
    difficulty: "hard",
    exerciseSlug: "cpp05-ex00",
  },
  {
    moduleNumber: 5,
    cardType: "decision",
    front: "When should you throw an exception vs return an error code in C++?",
    back: "**THROW EXCEPTION when:**\n✅ Error is exceptional/unexpected\n✅ Caller can't immediately handle it\n✅ Multiple layers need to unwind\n✅ Partial work must be undone\n\n**RETURN ERROR CODE when:**\n✅ Error is expected/common\n✅ Caller can handle immediately\n✅ Performance critical (exceptions are slow)\n✅ Failure is a valid state\n\n**Rule of thumb:** Exceptions for programming errors and exceptional conditions. Error codes for expected failures and validation.",
    difficulty: "medium",
    exerciseSlug: "cpp05-ex00",
  },
  {
    moduleNumber: 5,
    cardType: "gotcha",
    front: "GOTCHA: Why does this code leak memory?\n\n```cpp\nvoid processForm(Form* form) {\n    if (form->getGrade() < 1)\n        throw std::runtime_error(\"Invalid\");\n    form->sign();\n    delete form;\n}\n```",
    back: "**PROBLEM:** Exception thrown before `delete`.\n\nControl flow:\n1. form allocated\n2. `getGrade() < 1` → TRUE\n3. `throw` → jumps out of function\n4. `delete` never reached → **LEAK**\n\n**FIX (RAII):**\n```cpp\nvoid processForm(Form* form) {\n    std::auto_ptr<Form> ptr(form);\n    if (ptr->getGrade() < 1)\n        throw std::runtime_error(\"Invalid\");\n    ptr->sign();\n    // auto deleted when ptr goes out of scope\n}\n```\n\n**Lesson:** Exception safety requires thinking about ALL cleanup paths. RAII handles this automatically.",
    difficulty: "hard",
    exerciseSlug: "cpp05-ex01",
  },
  {
    moduleNumber: 5,
    cardType: "concept",
    front: "What is stack unwinding in C++?",
    back: "When an exception is thrown, C++ **destroys all local objects** in reverse order as it exits each scope looking for a matching catch block.\n\n```cpp\nvoid f() {\n    A a;  // constructed\n    B b;  // constructed\n    throw std::runtime_error(\"oops\");\n    // ~B() called, then ~A() called\n}\n```\n\n**Why it matters:**\n- RAII objects get properly cleaned up\n- Destructors MUST NOT throw during unwinding\n- Resources in raw pointers are NOT cleaned up (use RAII!)",
    difficulty: "hard",
    exerciseSlug: "cpp05-ex01",
  },
  {
    moduleNumber: 5,
    cardType: "code",
    front: "Write the operator<< overload for a Bureaucrat class that prints:\n`<name>, bureaucrat grade <grade>.`",
    back: '```cpp\n// In header (declaration):\nstd::ostream& operator<<(std::ostream& os, const Bureaucrat& b);\n\n// In .cpp (implementation):\nstd::ostream& operator<<(std::ostream& os, const Bureaucrat& b) {\n    os << b.getName() << ", bureaucrat grade " << b.getGrade() << ".";\n    return os;\n}\n```\n\n**Key:** Return `ostream&` for chaining. Take `const Bureaucrat&`. This is a **non-member** function (not `friend` — use getters instead).',
    difficulty: "easy",
    exerciseSlug: "cpp05-ex00",
  },
  {
    moduleNumber: 5,
    cardType: "concept",
    front: "What is an abstract class in C++ and how does AForm use it?",
    back: "An **abstract class** has at least one **pure virtual function** (`= 0`). It cannot be instantiated directly.\n\n```cpp\nclass AForm {\npublic:\n    virtual void execute(Bureaucrat const& executor) const = 0;\n    // pure virtual → AForm is abstract\n};\n\nclass ShrubberyCreationForm : public AForm {\npublic:\n    void execute(Bureaucrat const& executor) const override {\n        // concrete implementation\n    }\n};\n```\n\n**Why:** Forces derived classes to implement `execute()` while sharing common Form logic (name, grades, signing).",
    difficulty: "medium",
    exerciseSlug: "cpp05-ex02",
  },
  {
    moduleNumber: 5,
    cardType: "comparison",
    front: "Compare: virtual function vs pure virtual function vs non-virtual function.",
    back: "**Non-virtual:** Resolved at **compile time** (static binding).\n```cpp\nvoid doThing(); // Always calls THIS class version\n```\n\n**Virtual:** Resolved at **runtime** (dynamic binding). Can have default implementation.\n```cpp\nvirtual void doThing(); // Calls derived version through pointer\n```\n\n**Pure virtual:** No default implementation. Makes class abstract.\n```cpp\nvirtual void doThing() = 0; // Derived MUST implement\n```\n\n**In CPP05:** `AForm::execute()` is pure virtual. Each form (Shrubbery, Robotomy, Pardon) must provide its own implementation.",
    difficulty: "medium",
    exerciseSlug: "cpp05-ex02",
  },
  {
    moduleNumber: 5,
    cardType: "code",
    front: "Implement the Factory pattern for Intern::makeForm() without using if/else chains.",
    back: '```cpp\ntypedef AForm* (*FormCreator)(const std::string& target);\n\nstruct FormEntry {\n    std::string name;\n    FormCreator creator;\n};\n\nAForm* Intern::makeForm(const std::string& name,\n                         const std::string& target) {\n    FormEntry forms[] = {\n        {"shrubbery creation", &createShrubbery},\n        {"robotomy request", &createRobotomy},\n        {"presidential pardon", &createPardon},\n    };\n    for (int i = 0; i < 3; i++) {\n        if (forms[i].name == name)\n            return forms[i].creator(target);\n    }\n    throw std::runtime_error("Unknown form: " + name);\n}\n```\n\n**Pattern:** Array of {name, function pointer} pairs. Scales without adding branches.',
    difficulty: "hard",
    exerciseSlug: "cpp05-ex03",
  },
  {
    moduleNumber: 5,
    cardType: "gotcha",
    front: "GOTCHA: Why must destructors never throw exceptions?",
    back: "During **stack unwinding** (when an exception is propagating), if a destructor throws a **second exception**, C++ calls `std::terminate()` — your program **crashes immediately**.\n\n```cpp\n~Form() {\n    if (cleanup_fails())\n        throw std::runtime_error(\"cleanup\"); // FATAL if during unwinding!\n}\n```\n\n**Rule:** Destructors should catch all exceptions internally:\n```cpp\n~Form() {\n    try { cleanup(); }\n    catch (...) { /* log but don't throw */ }\n}\n```",
    difficulty: "hard",
    exerciseSlug: "cpp05-ex01",
  },
  {
    moduleNumber: 5,
    cardType: "concept",
    front: "What is the difference between `throw;` and `throw e;` inside a catch block?",
    back: "`throw;` — **Re-throws** the original exception, preserving its dynamic type (slicing doesn't occur).\n\n`throw e;` — Throws a **copy** of `e`. If `e` was caught as a base class reference, this **slices** the derived exception!\n\n```cpp\ntry { /* ... */ }\ncatch (const std::exception& e) {\n    // throw;   ← correct: re-throws original (maybe derived type)\n    // throw e; ← WRONG: slices to std::exception copy\n}\n```\n\n**Always use `throw;`** to re-throw.",
    difficulty: "hard",
    exerciseSlug: "cpp05-ex00",
  },
  {
    moduleNumber: 5,
    cardType: "decision",
    front: "Should you catch exceptions by value, pointer, or reference? Why?",
    back: "**Catch by const reference** (`const T&`) — always.\n\n❌ **By value** → slices derived exceptions, copies object\n❌ **By pointer** → who deletes? Memory leak risk\n✅ **By const reference** → no slicing, no copy, no ownership issues\n\n```cpp\ntry { throw Bureaucrat::GradeTooHighException(); }\ncatch (const std::exception& e) {  // ✅ catches any derived\n    std::cerr << e.what() << std::endl;\n}\n```\n\n**Order:** Catch most derived first → base class last.",
    difficulty: "medium",
    exerciseSlug: "cpp05-ex00",
  },
  {
    moduleNumber: 5,
    cardType: "code",
    front: "Write a correct assignment operator for a class that manages a dynamically-allocated string.",
    back: '```cpp\nBureaucrat& Bureaucrat::operator=(const Bureaucrat& other) {\n    if (this != &other) {  // self-assignment check\n        // _name is const, so we don\'t copy it\n        _grade = other._grade;\n    }\n    return *this;\n}\n\n// For a class with dynamic memory:\nForm& Form::operator=(const Form& other) {\n    if (this != &other) {\n        delete _data;                    // free old\n        _data = new Data(*other._data);  // deep copy\n    }\n    return *this;\n}\n```\n\n**Critical:** Self-assignment check prevents `delete` then reading deleted memory.',
    difficulty: "medium",
    exerciseSlug: "cpp05-ex00",
  },
  {
    moduleNumber: 5,
    cardType: "concept",
    front: "What are the 3 concrete forms in CPP05 Ex02 and what does each one do?",
    back: "**ShrubberyCreationForm** (sign: 145, exec: 137)\n- Creates a file `<target>_shrubbery` with ASCII trees\n- Tests: file I/O + ofstream\n\n**RobotomyRequestForm** (sign: 72, exec: 45)\n- Makes drilling noises, 50% chance of success\n- Tests: rand() + output formatting\n\n**PresidentialPardonForm** (sign: 25, exec: 5)\n- Informs target has been pardoned by Zaphod Beeblebrox\n- Tests: High grade requirement (only top bureaucrats)\n\n**All share:** AForm base with `execute()` that checks: is signed? bureaucrat grade high enough?",
    difficulty: "easy",
    exerciseSlug: "cpp05-ex02",
  },
  {
    moduleNumber: 5,
    cardType: "debug",
    front: "BUG: This code compiles but crashes at runtime. Why?\n\n```cpp\nAForm* f = NULL;\nBureaucrat b(\"John\", 1);\nb.executeForm(*f);  // crash\n```",
    back: "**PROBLEM:** Dereferencing a NULL pointer (`*f` when `f == NULL`) is **undefined behavior** — usually a segfault.\n\n**Fix:** Check before dereferencing:\n```cpp\nif (f != NULL)\n    b.executeForm(*f);\nelse\n    std::cerr << \"Form is null\" << std::endl;\n```\n\n**Lesson:** When using polymorphism with pointers (AForm*), always:\n1. Check for NULL before dereferencing\n2. Use references when possible (can't be null)\n3. In modern C++, use smart pointers",
    difficulty: "medium",
    exerciseSlug: "cpp05-ex02",
  },
  {
    moduleNumber: 5,
    cardType: "concept",
    front: "What is the Liskov Substitution Principle and how does it apply to AForm?",
    back: "**LSP:** Any code that works with AForm* must work correctly with any derived form (Shrubbery, Robotomy, Pardon).\n\n```cpp\nvoid processForms(AForm** forms, int count, Bureaucrat& b) {\n    for (int i = 0; i < count; i++) {\n        b.signForm(*forms[i]);\n        b.executeForm(*forms[i]);\n        // Must work regardless of concrete type!\n    }\n}\n```\n\n**In practice:** All derived forms must:\n- Accept the same `execute(Bureaucrat const&)` signature\n- Throw expected exceptions (not new ones)\n- Not strengthen preconditions",
    difficulty: "hard",
    exerciseSlug: "cpp05-ex02",
  },
  {
    moduleNumber: 5,
    cardType: "gotcha",
    front: "GOTCHA: What happens if you forget `virtual` on the base class destructor?",
    back: "**Memory leak and undefined behavior!**\n\n```cpp\nclass AForm {\npublic:\n    ~AForm() { }  // NOT virtual!\n};\n\nAForm* f = new ShrubberyCreationForm(\"home\");\ndelete f;  // Only calls ~AForm(), NOT ~ShrubberyCreationForm()!\n```\n\n**ShrubberyCreationForm's destructor never runs** → any resources it holds are leaked.\n\n**Rule:** If a class has virtual functions, its destructor MUST be virtual:\n```cpp\nvirtual ~AForm() { }\n```",
    difficulty: "hard",
    exerciseSlug: "cpp05-ex02",
  },
  {
    moduleNumber: 5,
    cardType: "comparison",
    front: "Compare: `const` member function vs `const` parameter vs `const` return type.",
    back: '**`const` member function** — promises not to modify `this`:\n```cpp\nint getGrade() const;  // can be called on const objects\n```\n\n**`const` parameter** — won\'t modify the argument:\n```cpp\nvoid signForm(const Form& f);  // f is read-only\n```\n\n**`const` return type** — returned value is read-only:\n```cpp\nconst std::string& getName() const;  // caller can\'t modify\n```\n\n**In CPP05:** Getters are `const` member functions returning `const&`. `what()` in exceptions is `const throw()`.', 
    difficulty: "easy",
    exerciseSlug: "cpp05-ex00",
  },
  {
    moduleNumber: 5,
    cardType: "concept",
    front: "What does `throw()` (or `noexcept`) mean after a function declaration?",
    back: "**`throw()`** (C++98) / **`noexcept`** (C++11) = this function **promises not to throw** any exceptions.\n\n```cpp\nconst char* what() const throw();  // C++98 style\nconst char* what() const noexcept;  // C++11 style\n```\n\n**If it throws anyway:** `std::unexpected()` → `std::terminate()` → program crashes.\n\n**Used in:**\n- `std::exception::what()` — must not throw\n- Destructors — should always be noexcept\n- Move constructors — for strong exception guarantee",
    difficulty: "medium",
    exerciseSlug: "cpp05-ex00",
  },

  // ── MODULE 06: Casts (15 cards) ────────────────────────────

  {
    moduleNumber: 6,
    cardType: "comparison",
    front: "Compare the 4 C++ cast operators: static_cast, dynamic_cast, const_cast, reinterpret_cast.",
    back: "**static_cast:** Compile-time checked. `int↔float`, `Base*→Derived*` (unsafe!). Most common.\n\n**dynamic_cast:** Runtime check with RTTI. `Base*→Derived*` (safe). Returns `nullptr` on failure. Requires virtual functions.\n\n**const_cast:** Add/remove `const` only. Modifying truly const data = UB.\n\n**reinterpret_cast:** Low-level bit reinterpretation. `Pointer↔int`, `void*↔T*`. No safety checks.\n\n**Rule:** Use the MOST RESTRICTIVE cast that works:\n`static_cast` > `dynamic_cast` > `const_cast` > `reinterpret_cast`",
    difficulty: "medium",
    exerciseSlug: "cpp06-ex00",
  },
  {
    moduleNumber: 6,
    cardType: "code",
    front: "How do you detect if a string is a char literal, int, float, or double in C++98?",
    back: "```cpp\nbool isChar(const std::string& s) {\n    return s.length() == 1 && !isdigit(s[0]);\n}\n\nbool isInt(const std::string& s) {\n    char* end;\n    long val = strtol(s.c_str(), &end, 10);\n    return *end == '\\0' && val >= INT_MIN && val <= INT_MAX;\n}\n\nbool isFloat(const std::string& s) {\n    if (s == \"nanf\" || s == \"+inff\" || s == \"-inff\") return true;\n    char* end;\n    strtof(s.c_str(), &end);\n    return *end == 'f' && *(end+1) == '\\0';\n}\n\nbool isDouble(const std::string& s) {\n    if (s == \"nan\" || s == \"+inf\" || s == \"-inf\") return true;\n    char* end;\n    strtod(s.c_str(), &end);\n    return *end == '\\0' && s.find('.') != std::string::npos;\n}\n```",
    difficulty: "hard",
    exerciseSlug: "cpp06-ex00",
  },
  {
    moduleNumber: 6,
    cardType: "gotcha",
    front: "GOTCHA: Why does this ScalarConverter output look wrong?\n\n```\n./convert 42\nchar: '*'\nint: 42\nfloat: 42f      ← missing .0\ndouble: 42      ← missing .0\n```",
    back: "**PROBLEM:** When a float/double has no fractional part, `cout` doesn't print the decimal point by default.\n\n**FIX:** Use `std::fixed` and `std::setprecision`, or check manually:\n```cpp\nfloat f = 42.0f;\nif (f == static_cast<int>(f))\n    std::cout << \"float: \" << f << \".0f\" << std::endl;\nelse\n    std::cout << \"float: \" << f << \"f\" << std::endl;\n```\n\n**Expected output:**\n```\nfloat: 42.0f\ndouble: 42.0\n```",
    difficulty: "medium",
    exerciseSlug: "cpp06-ex00",
  },
  {
    moduleNumber: 6,
    cardType: "code",
    front: "Implement serialize() and deserialize() using reinterpret_cast.",
    back: "```cpp\nstruct Data {\n    int n;\n    std::string s;\n};\n\nclass Serializer {\nprivate:\n    Serializer();\n    Serializer(const Serializer&);\n    Serializer& operator=(const Serializer&);\n    ~Serializer();\n\npublic:\n    static uintptr_t serialize(Data* ptr) {\n        return reinterpret_cast<uintptr_t>(ptr);\n    }\n    \n    static Data* deserialize(uintptr_t raw) {\n        return reinterpret_cast<Data*>(raw);\n    }\n};\n```\n\n**Test:** `assert(Serializer::deserialize(Serializer::serialize(&data)) == &data);`",
    difficulty: "medium",
    exerciseSlug: "cpp06-ex01",
  },
  {
    moduleNumber: 6,
    cardType: "concept",
    front: "What is RTTI and when is it needed?",
    back: "**RTTI = Run-Time Type Information**\n\nC++ stores type info for polymorphic classes (those with virtual functions). Used by:\n\n1. **dynamic_cast** — safe downcasting\n2. **typeid** — get type name at runtime\n\n```cpp\nBase* ptr = getRandomObject();\n\n// dynamic_cast approach\nif (Derived* d = dynamic_cast<Derived*>(ptr))\n    d->derivedMethod();\n\n// typeid approach\nstd::cout << typeid(*ptr).name(); // prints mangled type name\n```\n\n**Cost:** Small memory overhead (vtable pointer + type_info). Some embedded systems disable RTTI.\n\n**Required:** At least one virtual function in the base class.",
    difficulty: "medium",
    exerciseSlug: "cpp06-ex02",
  },
  {
    moduleNumber: 6,
    cardType: "code",
    front: "Implement identify(Base* p) and identify(Base& p) to detect type A, B, or C.",
    back: "```cpp\n// Pointer version: check for nullptr\nvoid identify(Base* p) {\n    if (dynamic_cast<A*>(p))\n        std::cout << \"A\" << std::endl;\n    else if (dynamic_cast<B*>(p))\n        std::cout << \"B\" << std::endl;\n    else if (dynamic_cast<C*>(p))\n        std::cout << \"C\" << std::endl;\n}\n\n// Reference version: catch exception\nvoid identify(Base& p) {\n    try {\n        (void)dynamic_cast<A&>(p);\n        std::cout << \"A\" << std::endl; return;\n    } catch (...) {}\n    try {\n        (void)dynamic_cast<B&>(p);\n        std::cout << \"B\" << std::endl; return;\n    } catch (...) {}\n    std::cout << \"C\" << std::endl;\n}\n```\n\n**Key difference:** Pointer returns `nullptr` on fail; reference throws `std::bad_cast`.",
    difficulty: "medium",
    exerciseSlug: "cpp06-ex02",
  },
  {
    moduleNumber: 6,
    cardType: "decision",
    front: "When should you use static_cast vs dynamic_cast for downcasting?",
    back: "**Use static_cast when:**\n✅ You are 100% certain of the type\n✅ Performance matters (no runtime cost)\n✅ In a closed type system (switch/enum)\n\n**Use dynamic_cast when:**\n✅ Type is uncertain (runtime polymorphism)\n✅ Plugin/extension systems\n✅ Safety > performance\n\n**static_cast danger:**\n```cpp\nBase* b = new Base();\nDerived* d = static_cast<Derived*>(b);  // COMPILES!\nd->derivedMethod();  // UNDEFINED BEHAVIOR!\n```\n\n**dynamic_cast safety:**\n```cpp\nDerived* d = dynamic_cast<Derived*>(b);\nif (d) d->derivedMethod();  // Safe!\n```",
    difficulty: "medium",
    exerciseSlug: "cpp06-ex02",
  },
  {
    moduleNumber: 6,
    cardType: "gotcha",
    front: "GOTCHA: Why can't you dynamic_cast if the base class has no virtual functions?",
    back: "**dynamic_cast needs RTTI**, which is stored in the **vtable**. A class only gets a vtable when it has at least one virtual function.\n\n```cpp\nclass Base { };  // no vtable\nclass Derived : public Base { };\n\nBase* b = new Derived();\nDerived* d = dynamic_cast<Derived*>(b);\n// ❌ COMPILE ERROR: 'Base' is not polymorphic\n```\n\n**Fix:** Add a virtual destructor:\n```cpp\nclass Base {\npublic:\n    virtual ~Base() { }  // Now polymorphic!\n};\n```\n\n**Rule:** If a class will ever be used polymorphically, give it a virtual destructor.",
    difficulty: "hard",
    exerciseSlug: "cpp06-ex02",
  },
  {
    moduleNumber: 6,
    cardType: "concept",
    front: "What is `uintptr_t` and why is it used for serialization?",
    back: "**`uintptr_t`** is an unsigned integer type guaranteed to be large enough to hold any pointer value.\n\nDefined in `<cstdint>` (or `<stdint.h>`).\n\n**Why use it:**\n- Pointer → integer conversion needs an integer big enough\n- `int` might be 32-bit on 64-bit systems (pointer won't fit!)\n- `uintptr_t` is always pointer-sized\n\n```cpp\nData* ptr = new Data();\nuintptr_t raw = reinterpret_cast<uintptr_t>(ptr);\nData* back = reinterpret_cast<Data*>(raw);\nassert(ptr == back);  // guaranteed\n```\n\n**Note:** The actual integer value is implementation-defined (memory address).",
    difficulty: "easy",
    exerciseSlug: "cpp06-ex01",
  },
  {
    moduleNumber: 6,
    cardType: "concept",
    front: "Why must ScalarConverter and Serializer be non-instantiable?",
    back: "Both are **utility classes** with only static methods — no state to store.\n\n**How to prevent instantiation (C++98):**\n```cpp\nclass Serializer {\nprivate:  // hide all 4 OCF members\n    Serializer();\n    Serializer(const Serializer&);\n    Serializer& operator=(const Serializer&);\n    ~Serializer();\npublic:\n    static uintptr_t serialize(Data* ptr);\n    static Data* deserialize(uintptr_t raw);\n};\n```\n\n**C++11 way:** `Serializer() = delete;`\n\n**Why:** Creating an instance is meaningless — all functionality is in static methods. Preventing it makes the intent clear.",
    difficulty: "easy",
    exerciseSlug: "cpp06-ex00",
  },
  {
    moduleNumber: 6,
    cardType: "debug",
    front: "BUG: This ScalarConverter fails on input `0`. Why?\n\n```cpp\nif (isChar(s)) convertChar(s);\nelse if (isInt(s)) convertInt(s);\nelse if (isFloat(s)) convertFloat(s);\nelse if (isDouble(s)) convertDouble(s);\n```",
    back: "**PROBLEM:** `\"0\"` has length 1 and `isdigit('0')` is true. If `isChar()` only checks `s.length() == 1`, it matches `'0'` as a char!\n\n**Fix `isChar()`:**\n```cpp\nbool isChar(const std::string& s) {\n    return s.length() == 1 && !isdigit(s[0]);\n}\n```\n\n**Better: Check order matters.** Try int/float/double first, char last (since single chars that aren't digits are the rarest case).\n\n**Edge cases to handle:** `'0'` (char literal with quotes), `0` (int), `0.0f` (float), `0.0` (double).",
    difficulty: "medium",
    exerciseSlug: "cpp06-ex00",
  },
  {
    moduleNumber: 6,
    cardType: "comparison",
    front: "Compare C-style cast vs C++ named casts.",
    back: "**C-style cast:** `(int)x` — tries ALL conversions, no safety:\n```cpp\n(Derived*)basePtr;  // Might be static, const, or reinterpret!\n```\n\n**C++ named casts** — explicit intent, easier to find:\n```cpp\nstatic_cast<int>(x);       // Numeric/related types\ndynamic_cast<D*>(bPtr);    // Runtime type check\nconst_cast<T*>(constPtr);  // Remove const\nreinterpret_cast<int*>(p); // Bit reinterpretation\n```\n\n**Why named casts are better:**\n1. **Searchable** — grep for `static_cast` vs `(`\n2. **Intentional** — reader knows what conversion\n3. **Safer** — compiler catches wrong cast type\n4. **42 requirement** — specific cast per exercise!",
    difficulty: "easy",
    exerciseSlug: "cpp06-ex00",
  },
  {
    moduleNumber: 6,
    cardType: "gotcha",
    front: "GOTCHA: What happens with `static_cast<char>(300)` on a system where char is signed?",
    back: "**Overflow!** If `char` is 8-bit signed (range -128 to 127), casting 300 causes **implementation-defined behavior**.\n\n```cpp\nint i = 300;\nchar c = static_cast<char>(i);\n// c is probably 44 (300 % 256) but NOT guaranteed!\n```\n\n**In ScalarConverter, you must check:**\n```cpp\nif (value < 0 || value > 127)\n    std::cout << \"char: impossible\" << std::endl;\nelse if (!isprint(value))\n    std::cout << \"char: Non displayable\" << std::endl;\nelse\n    std::cout << \"char: '\" << static_cast<char>(value) << \"'\";\n```",
    difficulty: "medium",
    exerciseSlug: "cpp06-ex00",
  },
  {
    moduleNumber: 6,
    cardType: "concept",
    front: "How do you handle `nan`, `inf`, `-inf` in ScalarConverter?",
    back: "**Special float/double values:**\n```cpp\n#include <cmath>\n#include <limits>\n\n// Detection:\nstd::isnan(value);  // NaN\nstd::isinf(value);  // +inf or -inf\n\n// String pseudo-literals:\n// Float: nanf, +inff, -inff\n// Double: nan, +inf, -inf\n```\n\n**Conversion rules:**\n- `nan` → char: impossible, int: impossible\n- `inf` → char: impossible, int: impossible\n- `nanf` → double: `nan`, float: `nanf`\n\n```\n./convert nan\nchar: impossible\nint: impossible\nfloat: nanf\ndouble: nan\n```",
    difficulty: "medium",
    exerciseSlug: "cpp06-ex00",
  },

  // ── MODULE 07: Templates (15 cards) ────────────────────────

  {
    moduleNumber: 7,
    cardType: "code",
    front: "Implement function templates swap(), min(), and max().",
    back: "```cpp\ntemplate <typename T>\nvoid swap(T& a, T& b) {\n    T temp = a;\n    a = b;\n    b = temp;\n}\n\ntemplate <typename T>\nconst T& min(const T& a, const T& b) {\n    return (a < b) ? a : b;  // if equal, return b\n}\n\ntemplate <typename T>\nconst T& max(const T& a, const T& b) {\n    return (a > b) ? a : b;  // if equal, return b\n}\n```\n\n**Key:** When equal, return **second** parameter (per subject). Type T must support `<` and `>` operators and copy constructor.",
    difficulty: "easy",
    exerciseSlug: "cpp07-ex00",
  },
  {
    moduleNumber: 7,
    cardType: "concept",
    front: "How does C++ template instantiation work?",
    back: "**Templates are not code** — they're **blueprints**.\n\nThe compiler generates real code only when you **use** a template:\n\n```cpp\ntemplate <typename T>\nvoid swap(T& a, T& b) { T temp = a; a = b; b = temp; }\n\nint x = 1, y = 2;\nswap(x, y);  // Compiler generates: void swap(int&, int&)\n\nstd::string s1 = \"a\", s2 = \"b\";\nswap(s1, s2);  // Compiler generates: void swap(string&, string&)\n```\n\n**Each unique type = new function generated.**\n\n**Implications:**\n- Template code must be in headers (compiler needs to see it)\n- Compile time increases (more code generated)\n- Binary size increases (code for each type)",
    difficulty: "medium",
    exerciseSlug: "cpp07-ex00",
  },
  {
    moduleNumber: 7,
    cardType: "code",
    front: "Implement iter() that applies a function to every element of an array.",
    back: "```cpp\n// For non-const elements:\ntemplate <typename T>\nvoid iter(T* array, size_t length, void (*func)(T&)) {\n    for (size_t i = 0; i < length; i++)\n        func(array[i]);\n}\n\n// For const elements:\ntemplate <typename T>\nvoid iter(const T* array, size_t length, void (*func)(const T&)) {\n    for (size_t i = 0; i < length; i++)\n        func(array[i]);\n}\n\n// Usage:\nvoid printInt(const int& n) { std::cout << n << std::endl; }\n\nint arr[] = {1, 2, 3};\niter(arr, 3, printInt);\n```\n\n**Key:** Two overloads handle both const and non-const arrays. The function parameter can also be a template.",
    difficulty: "medium",
    exerciseSlug: "cpp07-ex01",
  },
  {
    moduleNumber: 7,
    cardType: "gotcha",
    front: "GOTCHA: Why does this template fail to compile?\n\n```cpp\ntemplate <typename T>\nT min(T a, T b) { return (a < b) ? a : b; }\n\nmin(42, 42.0);  // ERROR!\n```",
    back: "**PROBLEM:** Template deduction conflict — `42` is `int`, `42.0` is `double`. The compiler can't deduce a single `T`.\n\n**Fixes:**\n```cpp\n// 1. Explicit template argument:\nmin<double>(42, 42.0);\n\n// 2. Cast argument:\nmin(static_cast<double>(42), 42.0);\n\n// 3. Two template parameters (not for this exercise):\ntemplate <typename T, typename U>\nauto min(T a, U b) -> decltype(a < b ? a : b);\n```\n\n**Lesson:** Both arguments must be the SAME type for single-parameter templates. The compiler won't do implicit conversions during deduction.",
    difficulty: "hard",
    exerciseSlug: "cpp07-ex00",
  },
  {
    moduleNumber: 7,
    cardType: "code",
    front: "Implement the Array<T> class template with bounds-checked operator[].",
    back: "```cpp\ntemplate <typename T>\nclass Array {\nprivate:\n    T*           _arr;\n    unsigned int _size;\n\npublic:\n    Array() : _arr(NULL), _size(0) {}\n    \n    Array(unsigned int n) : _arr(new T[n]()), _size(n) {}\n    \n    Array(const Array& other) : _arr(NULL), _size(0) {\n        *this = other;\n    }\n    \n    Array& operator=(const Array& other) {\n        if (this != &other) {\n            delete[] _arr;\n            _size = other._size;\n            _arr = new T[_size];\n            for (unsigned int i = 0; i < _size; i++)\n                _arr[i] = other._arr[i];\n        }\n        return *this;\n    }\n    \n    ~Array() { delete[] _arr; }\n    \n    T& operator[](int index) {\n        if (index < 0 || (unsigned int)index >= _size)\n            throw std::out_of_range(\"Index out of bounds\");\n        return _arr[index];\n    }\n    \n    unsigned int size() const { return _size; }\n};\n```",
    difficulty: "hard",
    exerciseSlug: "cpp07-ex02",
  },
  {
    moduleNumber: 7,
    cardType: "concept",
    front: "Why must template implementations be in header files (not .cpp)?",
    back: "**The compiler needs to see the full template code** at the point of instantiation.\n\nWhen you write `Array<int> a(5);`, the compiler must generate the complete `Array<int>` class — it can't do that if the implementation is in a separate .cpp file.\n\n**Options in C++98:**\n1. **All in .hpp** — most common\n2. **Declaration in .hpp, implementation in .tpp** — cleaner:\n```cpp\n// Array.hpp\ntemplate <typename T>\nclass Array { /* declarations */ };\n#include \"Array.tpp\"  // include at bottom\n\n// Array.tpp\ntemplate <typename T>\nArray<T>::Array() : _arr(NULL), _size(0) {}\n```\n\n**Note:** `.tpp` is still included by the header — it's just organizational.",
    difficulty: "medium",
    exerciseSlug: "cpp07-ex02",
  },
  {
    moduleNumber: 7,
    cardType: "debug",
    front: "BUG: This Array<T> fails the test `main.cpp`. The copy in the SCOPE block modifies the original. Why?",
    back: "**PROBLEM:** Shallow copy in copy constructor or assignment operator.\n\n```cpp\n// WRONG:\nArray(const Array& other) {\n    _arr = other._arr;  // Both point to same memory!\n    _size = other._size;\n}\n```\n\nWhen `tmp` and `test` are destroyed in the scope, they delete the array that `numbers` still uses.\n\n**FIX:** Deep copy:\n```cpp\nArray(const Array& other) : _arr(new T[other._size]), _size(other._size) {\n    for (unsigned int i = 0; i < _size; i++)\n        _arr[i] = other._arr[i];\n}\n```\n\n**Test from main.cpp checks this:** After SCOPE exits, original values must be intact.",
    difficulty: "hard",
    exerciseSlug: "cpp07-ex02",
  },
  {
    moduleNumber: 7,
    cardType: "decision",
    front: "When should you use `typename` vs `class` in template parameters?",
    back: "**They are identical** in template parameter declarations:\n```cpp\ntemplate <typename T>  // same as:\ntemplate <class T>\n```\n\n**Convention:**\n- `typename` — preferred for generic types (any type)\n- `class` — when you expect a class type specifically\n\n**Where `typename` is REQUIRED:**\n```cpp\ntemplate <typename T>\nvoid foo() {\n    typename T::iterator it;  // MUST use typename!\n    // Tells compiler T::iterator is a TYPE, not a value\n}\n```\n\n**For 42 projects:** Either works. Be consistent.",
    difficulty: "easy",
    exerciseSlug: "cpp07-ex00",
  },
  {
    moduleNumber: 7,
    cardType: "gotcha",
    front: "GOTCHA: Why does `new T[n]` not zero-initialize, but `new T[n]()` does?",
    back: "**C++ initialization rules:**\n\n```cpp\nnew int[5];    // UNINITIALIZED — garbage values!\nnew int[5]();  // VALUE-INITIALIZED — all zeros!\n```\n\nThe `()` triggers **value initialization**:\n- Primitives (int, float, char) → zero\n- Classes → default constructor called\n- Arrays → each element value-initialized\n\n**In Array<T>:**\n```cpp\nArray(unsigned int n) : _arr(new T[n]()), _size(n) {}\n//                                    ^^ important!\n```\n\n**Without `()`:** `Array<int> a(5)` would have garbage values, failing the test.",
    difficulty: "medium",
    exerciseSlug: "cpp07-ex02",
  },
  {
    moduleNumber: 7,
    cardType: "concept",
    front: "What requirements does a type T need to satisfy to be used with Array<T>?",
    back: "**Implicit requirements (concepts before C++20):**\n\nFor `Array<T>` to work, T must have:\n\n1. **Default constructor** — `new T[n]()` calls it\n2. **Copy assignment** — `_arr[i] = other._arr[i]`\n3. **Destructor** — `delete[] _arr` calls it\n\n**Not required:**\n- operator< or operator> (no sorting)\n- operator== (no comparison)\n- operator<< (no printing)\n\n**If T lacks any required operation:**\n```cpp\nArray<NoDefaultCtor> a(5);  // COMPILE ERROR\n// error: no matching function for call to 'NoDefaultCtor::NoDefaultCtor()'\n```\n\n**This is called \"duck typing\"** — if it has the right methods, it works.",
    difficulty: "medium",
    exerciseSlug: "cpp07-ex02",
  },
  {
    moduleNumber: 7,
    cardType: "comparison",
    front: "Compare function templates vs function overloading.",
    back: "**Function overloading** — write N separate functions:\n```cpp\nvoid swap(int& a, int& b) { ... }\nvoid swap(double& a, double& b) { ... }\nvoid swap(std::string& a, std::string& b) { ... }\n// Repetitive, but customizable per type\n```\n\n**Function template** — write 1 template:\n```cpp\ntemplate <typename T>\nvoid swap(T& a, T& b) { T temp = a; a = b; b = temp; }\n// Works for ALL types automatically\n```\n\n**When to use which:**\n- Template: Same logic for all types\n- Overload: Different logic per type\n- Both: Template for general case, overload for special cases\n\n**Resolution order:** Exact match overload > template specialization > template",
    difficulty: "medium",
    exerciseSlug: "cpp07-ex00",
  },

  // ── MODULE 08: STL Basics (15 cards) ───────────────────────

  {
    moduleNumber: 8,
    cardType: "code",
    front: "Implement easyfind: find first occurrence of an int in any container.",
    back: "```cpp\ntemplate <typename T>\ntypename T::iterator easyfind(T& container, int value) {\n    typename T::iterator it = std::find(\n        container.begin(), container.end(), value\n    );\n    if (it == container.end())\n        throw std::runtime_error(\"Value not found\");\n    return it;\n}\n```\n\n**Usage:**\n```cpp\nstd::vector<int> v;\nv.push_back(1); v.push_back(2); v.push_back(3);\ntry {\n    std::vector<int>::iterator it = easyfind(v, 2);\n    std::cout << *it << std::endl;  // 2\n} catch (...) {\n    std::cout << \"Not found\" << std::endl;\n}\n```\n\n**Note:** `typename` needed before `T::iterator` (dependent type).",
    difficulty: "easy",
    exerciseSlug: "cpp08-ex00",
  },
  {
    moduleNumber: 8,
    cardType: "concept",
    front: "What are the 5 STL iterator categories?",
    back: "From weakest to strongest:\n\n1. **Input** — read forward once (istream_iterator)\n2. **Output** — write forward once (ostream_iterator)\n3. **Forward** — read/write forward, multi-pass (forward_list)\n4. **Bidirectional** — forward + backward (list, set, map)\n5. **Random Access** — any position in O(1) (vector, deque)\n\n```\nInput ← Forward ← Bidirectional ← RandomAccess\nOutput ↗\n```\n\n**Why it matters:** Algorithms require minimum iterator category:\n- `std::find` needs Input iterator\n- `std::reverse` needs Bidirectional\n- `std::sort` needs Random Access\n\n**vector::iterator** is Random Access (supports `it + 5`, `it[3]`)\n**list::iterator** is Bidirectional (only `++it`, `--it`)",
    difficulty: "medium",
    exerciseSlug: "cpp08-ex00",
  },
  {
    moduleNumber: 8,
    cardType: "code",
    front: "Implement Span::shortestSpan() efficiently.",
    back: "```cpp\nunsigned int Span::shortestSpan() const {\n    if (_numbers.size() <= 1)\n        throw std::runtime_error(\"Not enough numbers\");\n    \n    std::vector<int> sorted(_numbers);  // copy\n    std::sort(sorted.begin(), sorted.end());\n    \n    unsigned int shortest = UINT_MAX;\n    for (size_t i = 1; i < sorted.size(); i++) {\n        unsigned int diff = sorted[i] - sorted[i-1];\n        if (diff < shortest)\n            shortest = diff;\n    }\n    return shortest;\n}\n```\n\n**Complexity:** O(n log n) due to sort.\n\n**Alternative with adjacent_difference:**\n```cpp\nstd::vector<int> diffs(sorted.size());\nstd::adjacent_difference(sorted.begin(), sorted.end(), diffs.begin());\n// diffs[0] = sorted[0], diffs[i] = sorted[i] - sorted[i-1]\nunsigned int shortest = *std::min_element(diffs.begin() + 1, diffs.end());\n```",
    difficulty: "medium",
    exerciseSlug: "cpp08-ex01",
  },
  {
    moduleNumber: 8,
    cardType: "code",
    front: "How do you add a range of numbers to Span using iterators?",
    back: "```cpp\nclass Span {\n    std::vector<int> _numbers;\n    unsigned int     _maxSize;\npublic:\n    // Single add:\n    void addNumber(int n) {\n        if (_numbers.size() >= _maxSize)\n            throw std::runtime_error(\"Span is full\");\n        _numbers.push_back(n);\n    }\n    \n    // Range add with iterators:\n    template <typename InputIt>\n    void addNumber(InputIt begin, InputIt end) {\n        while (begin != end) {\n            addNumber(*begin);  // reuse single-add + check\n            ++begin;\n        }\n    }\n};\n\n// Usage:\nstd::vector<int> v(10000);\nstd::generate(v.begin(), v.end(), rand);\nSpan sp(10000);\nsp.addNumber(v.begin(), v.end());\n```",
    difficulty: "medium",
    exerciseSlug: "cpp08-ex01",
  },
  {
    moduleNumber: 8,
    cardType: "code",
    front: "How does MutantStack expose iterators from the underlying container?",
    back: "```cpp\ntemplate <typename T>\nclass MutantStack : public std::stack<T> {\npublic:\n    typedef typename std::stack<T>::container_type::iterator iterator;\n    typedef typename std::stack<T>::container_type::const_iterator const_iterator;\n    typedef typename std::stack<T>::container_type::reverse_iterator reverse_iterator;\n    \n    iterator begin() { return this->c.begin(); }\n    iterator end()   { return this->c.end(); }\n    reverse_iterator rbegin() { return this->c.rbegin(); }\n    reverse_iterator rend()   { return this->c.rend(); }\n    \n    // OCF:\n    MutantStack() {}\n    MutantStack(const MutantStack& other) : std::stack<T>(other) {}\n    MutantStack& operator=(const MutantStack& other) {\n        std::stack<T>::operator=(other);\n        return *this;\n    }\n    ~MutantStack() {}\n};\n```\n\n**Key:** `this->c` is the protected underlying container (default: `std::deque<T>`).",
    difficulty: "hard",
    exerciseSlug: "cpp08-ex02",
  },
  {
    moduleNumber: 8,
    cardType: "gotcha",
    front: "GOTCHA: Why doesn't `std::stack` have iterators by default?",
    back: "**By design!** `std::stack` is a **container adaptor** — it provides a restricted interface (LIFO only):\n\n```cpp\npush(x);   // add to top\npop();     // remove from top\ntop();     // peek at top\nsize();\nempty();\n```\n\n**No:** `begin()`, `end()`, `operator[]`, `at()`, random access.\n\n**Why:** The stack abstraction means you should ONLY access the top. Iterating violates the LIFO contract.\n\n**MutantStack breaks this** intentionally by exposing the underlying container's iterators via `this->c` (protected member).\n\n**The underlying container** is `std::deque<T>` by default, which HAS iterators. MutantStack just passes them through.",
    difficulty: "medium",
    exerciseSlug: "cpp08-ex02",
  },
  {
    moduleNumber: 8,
    cardType: "comparison",
    front: "Compare vector vs list vs deque: when to use each?",
    back: "**std::vector:**\n✅ Random access O(1)\n✅ Cache-friendly (contiguous memory)\n✅ Fast push_back (amortized O(1))\n❌ Slow insert/erase in middle O(n)\n**Use:** Default choice. Arrays, sorting.\n\n**std::list:**\n✅ Fast insert/erase anywhere O(1)\n✅ No iterator invalidation on insert\n❌ No random access\n❌ Cache-unfriendly (scattered memory)\n**Use:** Frequent insert/remove, splice operations.\n\n**std::deque:**\n✅ Random access O(1)\n✅ Fast push_front AND push_back O(1)\n❌ Slightly slower than vector for iteration\n**Use:** Double-ended queues, stack underlying container.\n\n**Rule of thumb:** Start with vector. Switch only if profiling shows a bottleneck.",
    difficulty: "medium",
    exerciseSlug: "cpp08-ex01",
  },
  {
    moduleNumber: 8,
    cardType: "concept",
    front: "What is iterator invalidation and when does it happen?",
    back: "**Iterator invalidation** = an iterator becomes unusable after a container operation.\n\n**std::vector:**\n- `push_back` → ALL iterators invalid if reallocation occurs\n- `erase` → iterators at/after erased element invalid\n- `insert` → ALL iterators invalid if reallocation occurs\n\n**std::list:**\n- `push_back/insert` → NO invalidation (ever!)\n- `erase` → ONLY erased element's iterator\n\n**std::deque:**\n- `push_back/push_front` → ALL iterators invalid\n- `erase` → ALL iterators invalid\n\n**Dangerous pattern:**\n```cpp\nfor (it = v.begin(); it != v.end(); ++it)\n    if (*it == 5) v.erase(it);  // ❌ it is invalid after erase!\n```\n\n**Fix:** `it = v.erase(it);` (erase returns next valid iterator).",
    difficulty: "hard",
    exerciseSlug: "cpp08-ex01",
  },
  {
    moduleNumber: 8,
    cardType: "decision",
    front: "Should you use `std::find` from <algorithm> or write your own loop?",
    back: "**Always prefer STL algorithms.** Here's why:\n\n```cpp\n// ❌ Hand-written loop:\nstd::vector<int>::iterator it;\nfor (it = v.begin(); it != v.end(); ++it) {\n    if (*it == target) break;\n}\n\n// ✅ STL algorithm:\nstd::vector<int>::iterator it = std::find(v.begin(), v.end(), target);\n```\n\n**Benefits of STL:**\n1. **Tested** — no off-by-one bugs\n2. **Optimized** — may use SIMD, parallelism\n3. **Readable** — intent is clear from name\n4. **Generic** — works with any container\n5. **42 requirement** — Module 08 MUST use STL\n\n**Exception:** When you need complex logic not covered by standard algorithms.",
    difficulty: "easy",
    exerciseSlug: "cpp08-ex00",
  },
  {
    moduleNumber: 8,
    cardType: "debug",
    front: "BUG: `longestSpan()` returns wrong result for negative numbers.\n\n```cpp\nunsigned int Span::longestSpan() {\n    return *std::max_element(v.begin(), v.end())\n         - *std::min_element(v.begin(), v.end());\n}\n```",
    back: "**PROBLEM:** When max is positive and min is negative, the subtraction is correct mathematically, but converting to `unsigned int` can overflow/wrap!\n\n```cpp\n// max=100, min=-50: result should be 150 ✅\n// max=2147483647, min=-1: result should be 2147483648\n//   but that overflows int! (undefined behavior)\n```\n\n**Fix:** Use larger type for calculation:\n```cpp\nunsigned int Span::longestSpan() {\n    long max = *std::max_element(v.begin(), v.end());\n    long min = *std::min_element(v.begin(), v.end());\n    return static_cast<unsigned int>(max - min);\n}\n```\n\n**Or combine into one pass** with `std::minmax_element`.",
    difficulty: "hard",
    exerciseSlug: "cpp08-ex01",
  },

  // ── MODULE 09: Advanced STL (15 cards) ─────────────────────

  {
    moduleNumber: 9,
    cardType: "concept",
    front: "Why is `std::map` ideal for the Bitcoin Exchange exercise?",
    back: "**Requirements:**\n1. Store date→price pairs\n2. Find closest lower date\n3. Dates are naturally ordered\n\n**std::map provides:**\n- **Sorted by key** — dates in order automatically\n- **`lower_bound()`** — finds closest date ≥ target in O(log n)\n- **Unique keys** — one price per date\n\n```cpp\nstd::map<std::string, float> db;\ndb[\"2011-01-03\"] = 0.3;\n\nstd::map<std::string, float>::iterator it = db.lower_bound(\"2011-01-05\");\nif (it == db.begin()) throw \"Date too early\";\n--it;  // Go to closest LOWER date\nfloat price = it->second;\n```\n\n**Complexity:** O(log n) per lookup vs O(n) for unsorted containers.",
    difficulty: "medium",
    exerciseSlug: "cpp09-ex00",
  },
  {
    moduleNumber: 9,
    cardType: "code",
    front: "Implement a basic RPN calculator using `std::stack`.",
    back: "```cpp\nint evaluateRPN(const std::string& expr) {\n    std::stack<int> stack;\n    std::istringstream iss(expr);\n    std::string token;\n    \n    while (iss >> token) {\n        if (token == \"+\" || token == \"-\" ||\n            token == \"*\" || token == \"/\") {\n            if (stack.size() < 2)\n                throw std::runtime_error(\"Invalid expression\");\n            int b = stack.top(); stack.pop();\n            int a = stack.top(); stack.pop();\n            if (token == \"+\") stack.push(a + b);\n            else if (token == \"-\") stack.push(a - b);\n            else if (token == \"*\") stack.push(a * b);\n            else {\n                if (b == 0) throw std::runtime_error(\"Division by zero\");\n                stack.push(a / b);\n            }\n        } else {\n            stack.push(std::atoi(token.c_str()));\n        }\n    }\n    if (stack.size() != 1) throw std::runtime_error(\"Invalid\");\n    return stack.top();\n}\n```",
    difficulty: "medium",
    exerciseSlug: "cpp09-ex01",
  },
  {
    moduleNumber: 9,
    cardType: "concept",
    front: "What is Ford-Johnson merge-insert sort and why is it special?",
    back: "**Ford-Johnson (merge-insertion sort)** minimizes the number of **comparisons** needed to sort n elements.\n\n**Algorithm:**\n1. **Pair** elements and find larger of each pair → n/2 comparisons\n2. **Recursively sort** the larger elements\n3. **Insert** the smaller elements using binary search with **Jacobsthal numbers** for optimal insertion order\n\n**Jacobsthal sequence:** 0, 1, 1, 3, 5, 11, 21, 43, ...\nUsed to determine insertion order to minimize worst-case comparisons.\n\n**Why special:**\n- Achieves near-optimal comparison count\n- Important in theory (lower bound of sorting)\n- Not practical (overhead > simple sorts for real data)\n\n**42 requirement:** Implement with 2 different containers (vector + deque) and compare performance.",
    difficulty: "hard",
    exerciseSlug: "cpp09-ex02",
  },
  {
    moduleNumber: 9,
    cardType: "code",
    front: "How do you parse a CSV file and populate a std::map in C++?",
    back: "```cpp\nvoid BitcoinExchange::loadDatabase(const std::string& filename) {\n    std::ifstream file(filename.c_str());\n    if (!file.is_open())\n        throw std::runtime_error(\"Cannot open database\");\n    \n    std::string line;\n    std::getline(file, line);  // skip header\n    \n    while (std::getline(file, line)) {\n        size_t pos = line.find(',');\n        if (pos == std::string::npos) continue;\n        \n        std::string date = line.substr(0, pos);\n        float price = std::atof(line.substr(pos + 1).c_str());\n        _database[date] = price;\n    }\n}\n```\n\n**Validation needed:**\n- Date format: YYYY-MM-DD\n- Valid month (1-12), day (1-31)\n- Price ≥ 0\n- Input value: 0 to 1000",
    difficulty: "medium",
    exerciseSlug: "cpp09-ex00",
  },
  {
    moduleNumber: 9,
    cardType: "gotcha",
    front: "GOTCHA: In the Bitcoin Exchange, what if the input date is earlier than any date in the database?",
    back: "**`lower_bound()` returns `begin()` and you decrement past it!**\n\n```cpp\nstd::map<std::string, float>::iterator it = db.lower_bound(date);\n--it;  // ❌ UNDEFINED BEHAVIOR if it == begin()!\n```\n\n**Fix:** Check before decrementing:\n```cpp\nit = db.lower_bound(date);\nif (it == db.end() || it->first != date) {\n    if (it == db.begin()) {\n        std::cerr << \"Error: date too early\" << std::endl;\n        continue;\n    }\n    --it;  // Now safe — closest lower date\n}\nfloat price = it->second;\n```\n\n**Also handle:** exact match (no need to decrement).",
    difficulty: "hard",
    exerciseSlug: "cpp09-ex00",
  },
  {
    moduleNumber: 9,
    cardType: "comparison",
    front: "Compare `std::vector` vs `std::deque` for PmergeMe sorting performance.",
    back: "**std::vector:**\n- Contiguous memory → cache-friendly\n- Random access O(1)\n- Insert in middle: O(n) (shift elements)\n- Push_back: amortized O(1)\n- **Typically faster** for sorting (cache locality)\n\n**std::deque:**\n- Block-based memory (not contiguous)\n- Random access O(1) (but slightly slower)\n- Push_front AND push_back: O(1)\n- Insert in middle: O(n)\n- **Slightly slower** for sorting (cache misses between blocks)\n\n**Expected PmergeMe results (3000 elements):**\n```\nTime to process with std::vector: 52000 us\nTime to process with std::deque:  78000 us\n```\n\n**Why vector wins:** Cache locality during the many comparisons and swaps in sorting.",
    difficulty: "medium",
    exerciseSlug: "cpp09-ex02",
  },
  {
    moduleNumber: 9,
    cardType: "code",
    front: "How do you measure execution time in C++98?",
    back: "```cpp\n#include <ctime>\n#include <sys/time.h>\n\n// Method 1: clock() — CPU time\nclock_t start = clock();\n// ... sorting ...\nclock_t end = clock();\ndouble cpu_us = (double)(end - start) / CLOCKS_PER_SEC * 1000000;\n\n// Method 2: gettimeofday() — wall time\nstruct timeval tv_start, tv_end;\ngettimeofday(&tv_start, NULL);\n// ... sorting ...\ngettimeofday(&tv_end, NULL);\nlong wall_us = (tv_end.tv_sec - tv_start.tv_sec) * 1000000\n             + (tv_end.tv_usec - tv_start.tv_usec);\n\nstd::cout << \"Time to process a range of 3000 elements \"\n          << \"with std::vector: \" << wall_us << \" us\" << std::endl;\n```\n\n**For PmergeMe:** Measure each container separately and display both.",
    difficulty: "easy",
    exerciseSlug: "cpp09-ex02",
  },
  {
    moduleNumber: 9,
    cardType: "decision",
    front: "Which container for each CPP09 exercise and why?",
    back: "**Ex00 (Bitcoin Exchange) → `std::map`**\n- Sorted key-value pairs\n- `lower_bound()` for closest date\n- O(log n) lookups\n\n**Ex01 (RPN Calculator) → `std::stack`**\n- LIFO operations only\n- Push operands, pop for operations\n- Clean abstraction for postfix evaluation\n\n**Ex02 (PmergeMe) → `std::vector` + `std::deque`**\n- Both support random access (needed for sorting)\n- Compare performance between contiguous (vector) and block-based (deque) memory\n\n**Remember:** Each container can only be used ONCE across the module. After using `std::map` in Ex00, you can't use it in Ex01 or Ex02.",
    difficulty: "medium",
    exerciseSlug: "cpp09-ex00",
  },
  {
    moduleNumber: 9,
    cardType: "gotcha",
    front: "GOTCHA: Why does `std::atoi` silently return 0 on invalid input?",
    back: "**`std::atoi(\"abc\")` returns `0`** — no error indication!\n\nThis is a C function with no error handling.\n\n```cpp\nint n = std::atoi(\"not_a_number\");  // returns 0\nint m = std::atoi(\"42abc\");         // returns 42 (stops at 'a')\nint o = std::atoi(\"2147483648\");    // UNDEFINED (overflow!)\n```\n\n**Better alternatives in C++98:**\n```cpp\n// Use strtol for error detection:\nchar* end;\nlong val = strtol(str.c_str(), &end, 10);\nif (*end != '\\0')  // didn't consume entire string\n    throw std::runtime_error(\"Invalid number\");\nif (val > INT_MAX || val < INT_MIN)\n    throw std::runtime_error(\"Number out of range\");\n```\n\n**Or use `std::istringstream`:**\n```cpp\nstd::istringstream iss(str);\nint val;\nif (!(iss >> val)) throw ...;\n```",
    difficulty: "medium",
    exerciseSlug: "cpp09-ex00",
  },
  {
    moduleNumber: 9,
    cardType: "concept",
    front: "What are Jacobsthal numbers and how are they used in Ford-Johnson sort?",
    back: "**Jacobsthal sequence:** 0, 1, 1, 3, 5, 11, 21, 43, 85, ...\n\n**Formula:** `J(n) = J(n-1) + 2*J(n-2)`\n\n**Used in Ford-Johnson to determine insertion order:**\n\nAfter pairing and sorting the larger elements, the smaller elements are inserted using binary search. The ORDER of insertion matters:\n\n```\nPending elements: b1, b2, b3, b4, b5, b6, b7, ...\nInsertion order:  b1, b3, b2, b5, b4, b11, b10, b9, ...\n                  (groups defined by Jacobsthal numbers)\n```\n\n**Why this order:** It minimizes the worst-case number of comparisons by inserting into sorted sequences of optimal length (powers of 2 minus 1).\n\n**Group k inserts elements from J(k+1) down to J(k)+1.**",
    difficulty: "hard",
    exerciseSlug: "cpp09-ex02",
  },
  {
    moduleNumber: 9,
    cardType: "debug",
    front: "BUG: RPN calculator gives wrong result for `\"8 9 * 9 - 4 -\"`. Expected 59, got error.",
    back: "**Check the operand order!** Common bug: swapping `a` and `b`.\n\n```cpp\n// ❌ WRONG:\nint a = stack.top(); stack.pop();\nint b = stack.top(); stack.pop();\nstack.push(a - b);  // 9 - 72 = -63!\n\n// ✅ CORRECT:\nint b = stack.top(); stack.pop();  // second operand\nint a = stack.top(); stack.pop();  // first operand\nstack.push(a - b);  // 72 - 9 = 63, then 63 - 4 = 59\n```\n\n**Trace:**\n- `8 9 *` → push 8, push 9, pop 9 (b), pop 8 (a), push 8*9=72\n- `9 -` → push 9, pop 9 (b), pop 72 (a), push 72-9=63\n- `4 -` → push 4, pop 4 (b), pop 63 (a), push 63-4=**59** ✅",
    difficulty: "medium",
    exerciseSlug: "cpp09-ex01",
  },
  {
    moduleNumber: 9,
    cardType: "concept",
    front: "What does `lower_bound` vs `upper_bound` return for a std::map?",
    back: "For a `std::map<K,V>` with keys {1, 3, 5, 7}:\n\n**`lower_bound(key)`** → first element **≥** key:\n```cpp\nmap.lower_bound(3) → points to {3, ...}  // exact match\nmap.lower_bound(4) → points to {5, ...}  // next higher\nmap.lower_bound(8) → end()               // nothing ≥ 8\n```\n\n**`upper_bound(key)`** → first element **>** key:\n```cpp\nmap.upper_bound(3) → points to {5, ...}  // strictly greater\nmap.upper_bound(4) → points to {5, ...}  // same as lower_bound\nmap.upper_bound(7) → end()               // nothing > 7\n```\n\n**For Bitcoin Exchange** (closest lower date):\n```cpp\nit = map.lower_bound(date);\nif (it->first != date) --it;  // go to lower date\n```",
    difficulty: "medium",
    exerciseSlug: "cpp09-ex00",
  },
  {
    moduleNumber: 9,
    cardType: "gotcha",
    front: "GOTCHA: What happens if PmergeMe receives duplicate numbers or a single number?",
    back: "**Duplicates are valid!** Your sort must handle them:\n```\n./PmergeMe 5 3 5 1 5\nBefore: 5 3 5 1 5\nAfter:  1 3 5 5 5\n```\n\n**Edge cases to handle:**\n- **0 arguments** → error message\n- **1 argument** → already sorted, display only\n- **2 arguments** → simple swap if needed\n- **Negative numbers** → error (subject says positive integers)\n- **MAX_INT** → should work (use proper types)\n- **Already sorted** → algorithm should still work (no crash)\n\n**Common bug with Ford-Johnson:**\nOdd number of elements → the unpaired element must be handled separately (inserted at the end of the merge-insert process).",
    difficulty: "medium",
    exerciseSlug: "cpp09-ex02",
  },
];

// ── MAIN SEED FUNCTION ───────────────────────────────────────

async function seed() {
  console.log("🎓 Seeding C++ Modules 05-09...\n");

  // 1. Seed Modules
  console.log("📦 Seeding modules...");
  for (const mod of MODULES) {
    await prisma.cppModule.upsert({
      where: { slug: mod.slug },
      update: { title: mod.title, description: mod.description, order: mod.order },
      create: mod,
    });
    console.log(`  ✓ Module ${mod.number}: ${mod.title}`);
  }

  // 2. Seed Exercises
  console.log("\n📝 Seeding exercises...");
  for (const ex of EXERCISES) {
    const mod = await prisma.cppModule.findUnique({ where: { slug: ex.moduleSlug } });
    if (!mod) {
      console.error(`  ✗ Module not found: ${ex.moduleSlug}`);
      continue;
    }
    const { moduleSlug, ...data } = ex;
    await prisma.cppExercise.upsert({
      where: { slug: ex.slug },
      update: { ...data, moduleId: mod.id },
      create: { ...data, moduleId: mod.id },
    });
    console.log(`  ✓ ${ex.slug}: ${ex.title}`);
  }

  // 3. Seed Skills
  console.log("\n🎯 Seeding C++ skills...");
  for (const skill of CPP_SKILLS) {
    await prisma.cppSkill.upsert({
      where: { slug: skill.slug },
      update: skill,
      create: skill,
    });
    console.log(`  ✓ ${skill.slug}: ${skill.title}`);
  }

  // 4. Seed Flashcards
  console.log("\n🃏 Seeding flashcards...");
  let cardCount = 0;
  for (const card of CPP_FLASHCARDS) {
    // Upsert by front text (unique enough)
    const existing = await prisma.cppFlashcard.findFirst({
      where: { front: card.front },
    });
    if (existing) {
      await prisma.cppFlashcard.update({
        where: { id: existing.id },
        data: card,
      });
    } else {
      await prisma.cppFlashcard.create({ data: card });
    }
    cardCount++;
  }
  console.log(`  ✓ ${cardCount} flashcards seeded`);

  // 5. Assign flashcards to all users with passwords
  console.log("\n👤 Assigning flashcards to users...");
  const users = await prisma.user.findMany({
    where: { passwordHash: { not: "" } },
  });
  const allCards = await prisma.cppFlashcard.findMany();

  for (const user of users) {
    let assigned = 0;
    for (const card of allCards) {
      const exists = await prisma.userCppFlashcard.findUnique({
        where: { userId_cardId: { userId: user.id, cardId: card.id } },
      });
      if (!exists) {
        await prisma.userCppFlashcard.create({
          data: { userId: user.id, cardId: card.id },
        });
        assigned++;
      }
    }
    console.log(`  ✓ ${user.username}: ${assigned} new cards assigned (${allCards.length} total)`);
  }

  console.log("\n✅ C++ Modules seeding complete!");
  console.log(`   ${MODULES.length} modules`);
  console.log(`   ${EXERCISES.length} exercises`);
  console.log(`   ${CPP_SKILLS.length} skills`);
  console.log(`   ${CPP_FLASHCARDS.length} flashcards`);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
