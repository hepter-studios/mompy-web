if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

document.documentElement.classList.add("reveal-ready");

const DEMO_VIDEO_SRC = "assets/media/mompy-demo.mp4";

const siteLinks = {
  github: "https://github.com/hepter-studios/mompy",
  download: "https://github.com/hepter-studios/mompy/releases/download/v0.1.2/MompySetup-v0.1.2.exe",
  issues: "https://github.com/hepter-studios/mompy/issues",
  discussions: "https://github.com/hepter-studios/mompy/discussions",
  discord: "https://discord.gg/fqxvyGFyfa",
  sponsor: "https://github.com/sponsors/macksonvictor",
};

document.querySelectorAll("[data-link]").forEach((link) => {
  const url = siteLinks[link.dataset.link];
  if (url) link.href = url;

  if (link.dataset.link === "download") {
    link.setAttribute("download", "MompySetup-v0.1.2.exe");
  }

  if (["download", "github", "issues", "discussions", "discord", "sponsor"].includes(link.dataset.link)) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
});

const demoPlayer = document.querySelector("[data-demo-player]");
const demoVideo = document.querySelector("[data-demo-video]");
const demoPlaceholder = document.querySelector("[data-demo-placeholder]");
const demoTrigger = document.querySelector("[data-demo-trigger]");
const demoModal = document.querySelector("[data-demo-modal]");
const demoClose = document.querySelector("[data-demo-close]");
const supportForm = document.querySelector("[data-support-form]");
const supportInput = document.querySelector("[data-support-input]");
const supportChat = document.querySelector("[data-support-chat]");
const supportActions = document.querySelector("[data-support-actions]");
const searchForm = document.querySelector("[data-site-search]");
const searchInput = document.querySelector("[data-site-search-input]");
const searchResults = document.querySelector("[data-site-search-results]");

const currentPage = location.pathname.split("/").pop() || "index.html";
const normalizeSearchText = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const baseSearchItems = [
  {
    title: "Home",
    text: "Retro Python learning console with Mompy mascot, download, GitHub, and sponsor actions.",
    target: "index.html#home",
  },
  {
    title: "Learn with Mompy",
    text: "Lessons, missions, feedback, progress, beginner practice, and learning path.",
    target: "learn.html",
  },
  {
    title: "Python Guide",
    text: "Official Python resources, Python.org, tutorial, introduction, and control flow.",
    target: "python.html",
  },
  {
    title: "Demo",
    text: "Watch Mompy in action with the preview video.",
    target: "index.html#demo",
  },
  {
    title: "Support",
    text: "Installation help, errors, bugs, lessons, missions, feedback, and GitHub issues.",
    target: "index.html#support",
  },
  {
    title: "Community",
    text: "Discord, GitHub discussions, ideas, questions, and learner community.",
    target: "index.html#community",
  },
  {
    title: "Docs",
    text: "Mompy documentation, install, releases, troubleshooting, contributing, security, roadmap, and official links.",
    target: "docs.html",
  },
];

const localSearchItems = Array.from(document.querySelectorAll("[data-search-title]")).map((item) => ({
  title: item.dataset.searchTitle,
  text: item.dataset.searchText || item.textContent.trim(),
  target: item.id ? `${currentPage}#${item.id}` : currentPage,
}));

const searchItems = [...baseSearchItems, ...localSearchItems].filter(
  (item, index, list) => list.findIndex((entry) => entry.title === item.title && entry.target === item.target) === index
);

const getSearchMatches = (query) => {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  return searchItems
    .map((item) => {
      const haystack = normalizeSearchText(`${item.title} ${item.text}`);
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 6);
};

const sameLocalPage = (target) => {
  const url = new URL(target, location.href);
  return url.origin === location.origin && url.pathname === location.pathname;
};

const goToSearchTarget = (target) => {
  const url = new URL(target, location.href);

  if (sameLocalPage(target) && url.hash) {
    const targetElement = document.querySelector(url.hash);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", url.hash);
      targetElement.classList.add("is-search-hit");
      window.setTimeout(() => targetElement.classList.remove("is-search-hit"), 1400);
      return;
    }
  }

  window.location.href = target;
};

const renderSearchResults = (matches) => {
  if (!searchResults) return;
  searchResults.textContent = "";

  if (!matches.length) {
    searchResults.hidden = true;
    return;
  }

  matches.forEach((match) => {
    const option = document.createElement("button");
    option.type = "button";
    option.setAttribute("role", "option");

    const title = document.createElement("strong");
    title.textContent = match.title;

    const text = document.createElement("span");
    text.textContent = match.text;

    option.append(title, text);
    option.addEventListener("click", () => {
      searchResults.hidden = true;
      goToSearchTarget(match.target);
    });
    searchResults.append(option);
  });

  searchResults.hidden = false;
};

searchInput?.addEventListener("input", () => {
  renderSearchResults(getSearchMatches(searchInput.value));
});

searchInput?.addEventListener("focus", () => {
  if (searchInput.value.trim()) renderSearchResults(getSearchMatches(searchInput.value));
});

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const [firstMatch] = getSearchMatches(searchInput?.value || "");
  if (firstMatch) {
    if (searchResults) searchResults.hidden = true;
    goToSearchTarget(firstMatch.target);
  }
});

document.addEventListener("click", (event) => {
  if (searchResults && !searchForm?.contains(event.target)) {
    searchResults.hidden = true;
  }
});

const learningBlocks = [
  {
    number: "01",
    title: "First Commands",
    missions: "Missions 01-05",
    concepts: ["print", "strings", "quotes", "parentheses", "terminal output"],
    description: "Start by making Python speak. You learn how text appears in the terminal and why small symbols matter.",
    officialUrl: "https://docs.python.org/3/tutorial/introduction.html#using-python-as-a-calculator",
  },
  {
    number: "02",
    title: "Variables and Values",
    missions: "Missions 06-10",
    concepts: ["variables", "assignment", "strings", "numbers", "printing variables"],
    description: "Give names to values so your programs can remember information and reuse it later.",
    officialUrl: "https://docs.python.org/3/tutorial/introduction.html#strings",
  },
  {
    number: "03",
    title: "Decisions",
    missions: "Missions 11-15",
    concepts: ["booleans", "if", "else", "comparisons", "indentation"],
    description: "Teach your code to choose a path. This is where programs begin to react to the player or learner.",
    officialUrl: "https://docs.python.org/3/tutorial/controlflow.html#if-statements",
  },
  {
    number: "04",
    title: "Repetition",
    missions: "Missions 16-20",
    concepts: ["for", "range", "loops", "loop variable", "indentation"],
    description: "Repeat work without repeating yourself. Loops are how tiny scripts become useful tools.",
    officialUrl: "https://docs.python.org/3/tutorial/controlflow.html#for-statements",
  },
  {
    number: "05",
    title: "Lists",
    missions: "Missions 21-25",
    concepts: ["lists", "indexes", "items", "iteration"],
    description: "Store several things in one place, then pick them, change them, or loop through them.",
    officialUrl: "https://docs.python.org/3/tutorial/datastructures.html#more-on-lists",
  },
  {
    number: "06",
    title: "Functions",
    missions: "Missions 26-30",
    concepts: ["def", "function calls", "parameters", "return"],
    description: "Package a useful action into a name so you can call it again whenever your program needs it.",
    officialUrl: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions",
  },
];

const topicDefaults = {
  Basics: "Block 01",
  Operators: "Block 03",
  "Control Flow": "Block 03",
  Loops: "Block 04",
  "Data Structures": "Block 05",
  Strings: "Block 02",
  Functions: "Block 06",
  Files: "After Block 06",
  Errors: "After Block 06",
  Modules: "After Block 06",
  Comprehensions: "After Block 05",
  OOP: "Advanced preview",
  "Modern Python": "Practical next step",
  "Advanced preview": "Advanced preview",
};

const officialTopicLinks = {
  "print()": "https://docs.python.org/3/library/functions.html#print",
  comments: "https://docs.python.org/3/tutorial/introduction.html",
  strings: "https://docs.python.org/3/tutorial/introduction.html#strings",
  numbers: "https://docs.python.org/3/tutorial/introduction.html#numbers",
  "input()": "https://docs.python.org/3/library/functions.html#input",
  variables: "https://docs.python.org/3/tutorial/introduction.html",
  "type()": "https://docs.python.org/3/library/functions.html#type",
  "arithmetic operators": "https://docs.python.org/3/reference/expressions.html#operator-precedence",
  "comparison operators": "https://docs.python.org/3/tutorial/datastructures.html#comparing-sequences-and-other-types",
  "boolean operators": "https://docs.python.org/3/library/stdtypes.html#boolean-operations-and-or-not",
  if: "https://docs.python.org/3/tutorial/controlflow.html#if-statements",
  elif: "https://docs.python.org/3/tutorial/controlflow.html#if-statements",
  else: "https://docs.python.org/3/tutorial/controlflow.html#if-statements",
  indentation: "https://docs.python.org/3/reference/lexical_analysis.html#indentation",
  for: "https://docs.python.org/3/tutorial/controlflow.html#for-statements",
  "range()": "https://docs.python.org/3/tutorial/controlflow.html#the-range-function",
  while: "https://docs.python.org/3/reference/compound_stmts.html#while",
  break: "https://docs.python.org/3/tutorial/controlflow.html#break-and-continue-statements",
  continue: "https://docs.python.org/3/tutorial/controlflow.html#break-and-continue-statements",
  lists: "https://docs.python.org/3/tutorial/datastructures.html#more-on-lists",
  dictionaries: "https://docs.python.org/3/tutorial/datastructures.html#dictionaries",
  tuples: "https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences",
  sets: "https://docs.python.org/3/tutorial/datastructures.html#sets",
  indexing: "https://docs.python.org/3/tutorial/introduction.html#strings",
  slicing: "https://docs.python.org/3/tutorial/introduction.html#strings",
  "common string methods": "https://docs.python.org/3/library/stdtypes.html#string-methods",
  "f-strings": "https://docs.python.org/3/tutorial/inputoutput.html#formatted-string-literals",
  def: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions",
  parameters: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions",
  return: "https://docs.python.org/3/reference/simple_stmts.html#the-return-statement",
  "default parameters": "https://docs.python.org/3/tutorial/controlflow.html#default-argument-values",
  "*args and **kwargs": "https://docs.python.org/3/tutorial/controlflow.html#arbitrary-argument-lists",
  "open()": "https://docs.python.org/3/library/functions.html#open",
  "read()": "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files",
  "write()": "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files",
  with: "https://docs.python.org/3/reference/compound_stmts.html#with",
  try: "https://docs.python.org/3/tutorial/errors.html#handling-exceptions",
  except: "https://docs.python.org/3/tutorial/errors.html#handling-exceptions",
  finally: "https://docs.python.org/3/tutorial/errors.html#defining-clean-up-actions",
  "common beginner errors": "https://docs.python.org/3/tutorial/errors.html",
  import: "https://docs.python.org/3/tutorial/modules.html",
  "from import": "https://docs.python.org/3/tutorial/modules.html#importing-from-a-package",
  "standard library examples": "https://docs.python.org/3/library/",
  "list comprehensions": "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions",
  "dict comprehensions": "https://docs.python.org/3/tutorial/datastructures.html#dictionaries",
  class: "https://docs.python.org/3/tutorial/classes.html",
  "__init__": "https://docs.python.org/3/tutorial/classes.html#class-objects",
  methods: "https://docs.python.org/3/tutorial/classes.html#method-objects",
  inheritance: "https://docs.python.org/3/tutorial/classes.html#inheritance",
  "type hints": "https://docs.python.org/3/library/typing.html",
  pathlib: "https://docs.python.org/3/library/pathlib.html",
  dataclasses: "https://docs.python.org/3/library/dataclasses.html",
  "virtual environments": "https://docs.python.org/3/tutorial/venv.html",
  decorators: "https://docs.python.org/3/glossary.html#term-decorator",
  generators: "https://docs.python.org/3/tutorial/classes.html#generators",
  "async/await": "https://docs.python.org/3/library/asyncio-task.html",
};

const topicGroups = {
  Basics: ["print()", "comments", "strings", "numbers", "input()", "variables", "type()"],
  Operators: ["arithmetic operators", "comparison operators", "boolean operators"],
  "Control Flow": ["if", "elif", "else", "indentation"],
  Loops: ["for", "range()", "while", "break", "continue"],
  "Data Structures": ["lists", "dictionaries", "tuples", "sets"],
  Strings: ["indexing", "slicing", "common string methods", "f-strings"],
  Functions: ["def", "parameters", "return", "default parameters", "*args and **kwargs"],
  Files: ["open()", "read()", "write()", "with"],
  Errors: ["try", "except", "finally", "common beginner errors"],
  Modules: ["import", "from import", "standard library examples"],
  Comprehensions: ["list comprehensions", "dict comprehensions"],
  OOP: ["class", "__init__", "methods", "inheritance"],
  "Modern Python": ["type hints", "pathlib", "dataclasses", "virtual environments"],
  "Advanced preview": ["decorators", "generators", "async/await"],
};

const beginnerDescriptions = {
  "print()": ["Use print() when you want Python to show a message or value in the terminal.", "It is the first tool for checking what your program is doing."],
  comments: ["Comments are notes for humans. Python ignores them, but future-you will be grateful."],
  strings: ["Strings are text values. They can hold names, messages, commands, and anything wrapped in quotes."],
  numbers: ["Python understands integers and decimals. You can calculate with them before you build bigger logic."],
  "input()": ["input() asks the user for text. It always returns a string, even if the user types a number."],
  variables: ["Variables are names attached to values. They make programs readable and let you reuse information."],
  "type()": ["type() tells you what kind of value you have. It is useful when something behaves differently than expected."],
  "arithmetic operators": ["Arithmetic operators do math: add, subtract, multiply, divide, and more."],
  "comparison operators": ["Comparisons ask questions like equal, bigger, or smaller. They return True or False."],
  "boolean operators": ["Boolean operators combine conditions. They help your program make more precise decisions."],
  if: ["if runs code only when a condition is true. It is the basic shape of choice in Python."],
  elif: ["elif means 'otherwise, check this condition'. It keeps several choices organized."],
  else: ["else is the fallback path. It runs when the earlier conditions did not pass."],
  indentation: ["Indentation is part of Python syntax. It shows which lines belong inside a decision, loop, or function."],
  for: ["for loops repeat work for every item in a sequence. They are great for lists and ranges."],
  "range()": ["range() creates a sequence of numbers for loops. It is perfect for counting missions or steps."],
  while: ["while repeats as long as a condition stays true. Use it when you do not know the exact number of repeats yet."],
  break: ["break exits a loop early. It is useful when the work is done before the loop naturally ends."],
  continue: ["continue skips the rest of the current loop turn and moves to the next one."],
  lists: ["Lists store multiple values in order. You can add, remove, index, and loop through them."],
  dictionaries: ["Dictionaries store pairs of keys and values. They are useful for settings, profiles, and lookup tables."],
  tuples: ["Tuples are ordered values that you usually do not change. They are good for fixed pairs and small records."],
  sets: ["Sets store unique values. They are handy when duplicates should disappear."],
  indexing: ["Indexing picks one item from a string or list. Python starts counting at zero."],
  slicing: ["Slicing takes a section from text or a list. It is a clean way to grab a range of items."],
  "common string methods": ["String methods clean, search, and transform text. They are everyday tools for user input."],
  "f-strings": ["f-strings put values inside text. They make messages easier to write and read."],
  def: ["def creates a function. A function is a named block of code you can reuse."],
  parameters: ["Parameters are inputs for a function. They let one function work with different values."],
  return: ["return sends a value back from a function. Use it when another part of the program needs the result."],
  "default parameters": ["Default parameters give a function a backup value when the caller does not provide one."],
  "*args and **kwargs": ["*args and **kwargs collect extra arguments. Learn them later, after normal parameters feel comfortable."],
  "open()": ["open() connects Python to a file. Use it when your program needs to read or save information."],
  "read()": ["read() pulls file contents into Python. Start small so you can see what your program receives."],
  "write()": ["write() saves text into a file. It lets your program produce notes, logs, or results."],
  with: ["with safely manages resources like files. It closes the file for you when the block ends."],
  try: ["try marks code that might fail. It keeps one error from crashing the whole program immediately."],
  except: ["except explains what to do when a specific error happens."],
  finally: ["finally runs cleanup code whether the try block worked or failed."],
  "common beginner errors": ["Most early Python errors are spelling, quotes, parentheses, indentation, or type mistakes."],
  import: ["import brings another module into your file. It lets you use Python's built-in tools."],
  "from import": ["from import brings a specific name from a module. It keeps calls shorter, but use it clearly."],
  "standard library examples": ["The standard library is Python's built-in toolbox. You can do a lot before installing packages."],
  "list comprehensions": ["List comprehensions build lists in one readable expression. Use them after loops feel clear."],
  "dict comprehensions": ["Dict comprehensions build dictionaries from loops. Keep them simple so they remain readable."],
  class: ["A class describes a kind of object. It groups data and behavior together."],
  "__init__": ["__init__ prepares a new object. It usually stores the starting values."],
  methods: ["Methods are functions that belong to an object. They usually work with that object's data."],
  inheritance: ["Inheritance lets one class reuse behavior from another. Treat it as an intro, not a first-week goal."],
  "type hints": ["Type hints document expected values. They help editors and teammates understand your code."],
  pathlib: ["pathlib makes file paths easier to work with. It is cleaner than building paths by hand."],
  dataclasses: ["dataclasses create small data objects with less boilerplate."],
  "virtual environments": ["Virtual environments keep project dependencies separate. They prevent one project from breaking another."],
  decorators: ["Decorators wrap functions with extra behavior. For now, recognize them before trying to write many."],
  generators: ["Generators produce values one at a time. They are useful for long sequences and streams."],
  "async/await": ["async and await help programs wait for slow work without freezing everything else."],
};

const practicalExamples = {
  "print()": ['>>> print("Welcome to Mompy!")', "Welcome to Mompy!"],
  comments: ['>>> # This note explains the next line', '>>> print("Mission ready")', "Mission ready"],
  strings: ['>>> mission = "First Output"', ">>> print(mission)", "First Output"],
  numbers: [">>> score = 10 + 5", ">>> print(score)", "15"],
  "input()": ['>>> name = input("What is your name?\\n")', "What is your name?", "Python", '>>> print(f"Hi, {name}.")', "Hi, Python."],
  variables: ['>>> level = "beginner"', ">>> print(level)", "beginner"],
  "type()": ['>>> type("Mompy")', "<class 'str'>", ">>> type(30)", "<class 'int'>"],
  "arithmetic operators": [">>> coins = 7 * 3", ">>> print(coins)", "21"],
  "comparison operators": [">>> xp = 12", ">>> xp >= 10", "True"],
  "boolean operators": [">>> has_code = True", ">>> passed = True", ">>> has_code and passed", "True"],
  if: [">>> xp = 12", ">>> if xp >= 10:", '...     print("Level up")', "Level up"],
  elif: [">>> score = 70", ">>> if score >= 90:", '...     print("Great")', ">>> elif score >= 60:", '...     print("Passed")', "Passed"],
  else: [">>> tries = 0", ">>> if tries > 0:", '...     print("Keep going")', ">>> else:", '...     print("Start now")', "Start now"],
  indentation: [">>> if True:", '...     print("inside")', "inside"],
  for: ['>>> for item in ["print", "if", "for"]:', "...     print(item)", "print", "if", "for"],
  "range()": [">>> for number in range(3):", "...     print(number)", "0", "1", "2"],
  while: [">>> lives = 2", ">>> while lives > 0:", "...     print(lives)", "...     lives -= 1", "2", "1"],
  break: [">>> for number in range(5):", "...     if number == 2:", "...         break", "...     print(number)", "0", "1"],
  continue: [">>> for number in range(4):", "...     if number == 1:", "...         continue", "...     print(number)", "0", "2", "3"],
  lists: ['>>> missions = ["print", "variables", "if"]', ">>> print(missions[0])", "print"],
  dictionaries: ['>>> player = {"name": "Mompy", "level": 1}', '>>> print(player["name"])', "Mompy"],
  tuples: [">>> position = (10, 20)", ">>> print(position[0])", "10"],
  sets: ['>>> badges = {"first", "first", "loop"}', ">>> print(badges)", "{'first', 'loop'}"],
  indexing: ['>>> word = "Mompy"', ">>> print(word[0])", "M"],
  slicing: ['>>> word = "Mompy"', ">>> print(word[1:4])", "omp"],
  "common string methods": ['>>> answer = " yes ".strip().upper()', ">>> print(answer)", "YES"],
  "f-strings": ['>>> name = "Mompy"', '>>> print(f"Hello, {name}!")', "Hello, Mompy!"],
  def: [">>> def greet():", '...     print("Hello, Mompy!")', ">>> greet()", "Hello, Mompy!"],
  parameters: [">>> def greet(name):", '...     print(f"Hi, {name}")', '>>> greet("Python")', "Hi, Python"],
  return: [">>> def double(x):", "...     return x * 2", ">>> print(double(4))", "8"],
  "default parameters": [">>> def greet(name=\"learner\"):", '...     print(f"Hi, {name}")', ">>> greet()", "Hi, learner"],
  "*args and **kwargs": [">>> def total(*scores):", "...     return sum(scores)", ">>> total(2, 3, 5)", "10"],
  "open()": ['>>> file = open("notes.txt", "w")', '>>> file.write("Mompy")', "5", ">>> file.close()"],
  "read()": ['>>> with open("notes.txt") as file:', "...     text = file.read()", ">>> print(text)", "Mompy"],
  "write()": ['>>> with open("log.txt", "w") as file:', '...     file.write("mission complete")'],
  with: ['>>> with open("notes.txt") as file:', "...     print(file.read())"],
  try: [">>> try:", "...     number = int(\"x\")", ">>> except ValueError:", '...     print("Use digits only")', "Use digits only"],
  except: [">>> try:", "...     print(10 / 0)", ">>> except ZeroDivisionError:", '...     print("Cannot divide by zero")', "Cannot divide by zero"],
  finally: [">>> try:", "...     print(\"run\")", ">>> finally:", '...     print("done")', "run", "done"],
  "common beginner errors": ['>>> print("missing quote)', "SyntaxError: unterminated string literal"],
  import: [">>> import random", ">>> random.randint(1, 3)", "2"],
  "from import": [">>> from math import sqrt", ">>> sqrt(9)", "3.0"],
  "standard library examples": [">>> from datetime import date", ">>> print(date.today().year)", "2026"],
  "list comprehensions": [">>> squares = [n * n for n in range(4)]", ">>> print(squares)", "[0, 1, 4, 9]"],
  "dict comprehensions": ['>>> lengths = {word: len(word) for word in ["if", "while"]}', ">>> print(lengths)", "{'if': 2, 'while': 5}"],
  class: [">>> class Player:", "...     pass", ">>> player = Player()"],
  "__init__": [">>> class Player:", "...     def __init__(self, name):", "...         self.name = name"],
  methods: [">>> class Player:", "...     def greet(self):", '...         print("hello")'],
  inheritance: [">>> class Helper:", "...     pass", ">>> class Mompy(Helper):", "...     pass"],
  "type hints": [">>> def add(a: int, b: int) -> int:", "...     return a + b"],
  pathlib: [">>> from pathlib import Path", '>>> path = Path("notes.txt")', ">>> path.name", "'notes.txt'"],
  dataclasses: [">>> from dataclasses import dataclass", ">>> @dataclass", ">>> class Mission:", "...     title: str"],
  "virtual environments": [">>> # Terminal command", "python -m venv .venv"],
  decorators: [">>> @timer", ">>> def run_mission():", "...     pass"],
  generators: [">>> def count():", "...     yield 1", "...     yield 2"],
  "async/await": [">>> async def load():", "...     await fetch_data()"],
};

const pythonTopics = Object.entries(topicGroups).flatMap(([category, titles]) =>
  titles.map((title, index) => {
    const code = practicalExamples[title] || [`>>> print("${title}")`, title];
    const basic = code.slice(0, Math.min(code.length, 3)).join("\n");
    const practical = code.join("\n");
    const tags = [category, title, topicDefaults[category], ...(title.match(/[a-zA-Z_]+/g) || [])];
    return {
      id: `${category}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      category,
      title,
      level: category === "Advanced preview" ? "ADVANCED PREVIEW" : "BEGINNER",
      relatedBlock: topicDefaults[category],
      concepts: tags,
      missionRange: topicDefaults[category],
      explanation: beginnerDescriptions[title]?.join(" ") || `${title} is a Python concept you will meet as your programs grow.`,
      whenToUse: `Use this when a mission needs ${title.replace(/[()]/g, "")} behavior in a clear, readable way.`,
      examples: [
        { label: "Basic REPL", code: basic },
        { label: "Practical REPL", code: practical },
      ],
      mistake: category === "Advanced preview"
        ? "Advanced preview: recognize the pattern now, but do not rush it before basics feel natural."
        : "Pro tip: type the example yourself once. Copying is useful, but typing teaches your eyes where mistakes happen.",
      officialUrl: officialTopicLinks[title] || "https://docs.python.org/3/",
      tags,
      order: index,
    };
  })
);

const officialPythonResources = [
  {
    title: "Python for Beginners",
    url: "https://www.python.org/about/gettingstarted/",
    description: "A beginner-friendly starting point from Python.org.",
  },
  {
    title: "Official Python Tutorial",
    url: "https://docs.python.org/3/tutorial/",
    description: "The official Python tutorial.",
  },
  {
    title: "Informal Introduction",
    url: "https://docs.python.org/3/tutorial/introduction.html",
    description: "Numbers, text, lists, and first programming steps.",
  },
  {
    title: "Control Flow",
    url: "https://docs.python.org/3/tutorial/controlflow.html",
    description: "if, for, range, functions, and program flow.",
  },
  {
    title: "Data Structures",
    url: "https://docs.python.org/3/tutorial/datastructures.html",
    description: "Lists, dictionaries, tuples, sets, and useful patterns.",
  },
  {
    title: "Python Standard Library",
    url: "https://docs.python.org/3/library/",
    description: "The official library reference.",
  },
];

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const highlightPythonRepl = (code) => {
  const escaped = escapeHtml(code);
  return escaped
    .split("\n")
    .map((line) => {
      let decorated = line
        .replace(/(#[^\n]*)/g, '<span class="tok-comment">$1</span>')
        .replace(/(".*?"|'.*?')/g, '<span class="tok-string">$1</span>')
        .replace(/\b(async|await|class|def|return|if|elif|else|for|while|break|continue|try|except|finally|with|as|import|from|in|and|or|not|True|False|None|pass|yield)\b/g, '<span class="tok-keyword">$1</span>')
        .replace(/^(&gt;&gt;&gt;|\.\.\.)/, '<span class="tok-prompt">$1</span>');

      if (!line.startsWith(">>>") && !line.startsWith("...") && line.trim()) {
        decorated = `<span class="tok-output">${decorated}</span>`;
      }

      if (/Error:|Traceback/.test(line)) {
        decorated = `<span class="tok-error">${decorated}</span>`;
      }

      return decorated;
    })
    .join("\n");
};

const renderCodeExample = (example) => `
  <div class="python-repl">
    <div class="python-repl__bar">
      <span>${example.label}</span>
      <button type="button" data-copy-code aria-label="Copy ${example.label} code">Copy</button>
    </div>
    <pre tabindex="0"><code data-raw-code="${encodeURIComponent(example.code)}">${highlightPythonRepl(example.code)}</code></pre>
  </div>
`;

const initLearnPage = () => {
  const learnPage = document.querySelector("[data-learn-page]");
  if (!learnPage) return;

  const blocksContainer = document.querySelector("[data-learning-blocks]");
  const topicsContainer = document.querySelector("[data-python-topics]");
  const resourcesContainer = document.querySelector("[data-python-resources]");
  const topicNav = document.querySelector("[data-learn-topic-nav]");
  const learnSearchInput = document.querySelector("[data-learn-search-input]");
  const learnSearchForm = document.querySelector("[data-learn-search]");
  const learnSearchCount = document.querySelector("[data-learn-search-count]");

  if (blocksContainer) {
    blocksContainer.innerHTML = learningBlocks.map((block) => `
      <article id="block-${block.number}" class="learning-block" data-topic-card data-search-title="${block.title}" data-search-text="${block.concepts.join(" ")} ${block.missions}">
        <span class="learning-block__number">Block ${block.number}</span>
        <h3>${block.title}</h3>
        <p class="learning-block__missions">${block.missions}</p>
        <p>${block.description}</p>
        <div class="learn-tags">${block.concepts.map((concept) => `<span>${concept}</span>`).join("")}</div>
        <div class="learning-block__actions">
          <a href="#topics">Learn this block</a>
          <a href="${block.officialUrl}" target="_blank" rel="noopener noreferrer">Open official docs</a>
        </div>
        <small>Install Mompy to practice this block.</small>
      </article>
    `).join("");
  }

  if (topicNav) {
    topicNav.innerHTML = [
      `<a href="#start-here" data-learn-nav="start-here">Start Here</a>`,
      `<a href="#mission-path" data-learn-nav="mission-path">Mission Path</a>`,
      ...Object.keys(topicGroups).map((category) => {
        const id = `topic-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        return `<a href="#${id}" data-learn-nav="${id}">${category}</a>`;
      }),
      `<a href="#official-python" data-learn-nav="official-python">Official Python</a>`,
    ].join("");
  }

  if (topicsContainer) {
    topicsContainer.innerHTML = Object.keys(topicGroups).map((category) => {
      const id = `topic-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const categoryTopics = pythonTopics.filter((topic) => topic.category === category);
      return `
        <section id="${id}" class="topic-group" data-topic-group data-learn-section>
          <h3>${category}</h3>
          <div>
            ${categoryTopics.map((topic) => `
              <article id="${topic.id}" class="topic-card" data-topic-card data-topic-search="${normalizeSearchText([
                topic.title,
                topic.category,
                topic.relatedBlock,
                topic.missionRange,
                topic.explanation,
                topic.whenToUse,
                topic.mistake,
                topic.tags.join(" "),
                topic.examples.map((example) => example.code).join(" "),
              ].join(" "))}">
                <div class="topic-card__head">
                  <div>
                    <span>${topic.level}</span>
                    <h4>${topic.title}</h4>
                  </div>
                  <a href="${topic.officialUrl}" target="_blank" rel="noopener noreferrer">Official docs ↗</a>
                </div>
                <p>${topic.explanation}</p>
                <p><strong>When you use this:</strong> ${topic.whenToUse}</p>
                ${topic.examples.map(renderCodeExample).join("")}
                <p class="topic-tip">${topic.mistake}</p>
                <div class="topic-card__foot">
                  <span>${topic.relatedBlock}</span>
                  <span>${topic.missionRange}</span>
                </div>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    }).join("");
  }

  if (resourcesContainer) {
    resourcesContainer.innerHTML = officialPythonResources.map((resource, index) => `
      <a class="official-resource" href="${resource.url}" target="_blank" rel="noopener noreferrer">
        <span>0${index + 1}</span>
        <h3>${resource.title}</h3>
        <p>${resource.description}</p>
        <small>External official resource ↗</small>
      </a>
    `).join("");
  }

  document.querySelectorAll("[data-copy-code]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.closest(".python-repl")?.querySelector("code");
      const raw = code ? decodeURIComponent(code.dataset.rawCode || "") : "";
      try {
        await navigator.clipboard.writeText(raw);
        button.textContent = "Copied";
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1200);
      } catch {
        button.textContent = "Select";
      }
    });
  });

  const filterTopics = () => {
    const terms = normalizeSearchText(learnSearchInput?.value || "").split(/\s+/).filter(Boolean);
    const cards = Array.from(document.querySelectorAll(".topic-card"));
    let visibleCount = 0;

    cards.forEach((card) => {
      const isVisible = !terms.length || terms.every((term) => card.dataset.topicSearch.includes(term));
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    document.querySelectorAll("[data-topic-group]").forEach((group) => {
      const hasVisibleCard = Boolean(group.querySelector(".topic-card:not([hidden])"));
      group.hidden = !hasVisibleCard;
    });

    if (learnSearchCount) {
      learnSearchCount.textContent = terms.length
        ? `Showing ${visibleCount} matching topic${visibleCount === 1 ? "" : "s"}.`
        : "Showing all topics.";
    }
  };

  learnSearchForm?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      filterTopics();
      searchResults?.setAttribute("hidden", "");
      document.querySelector("#topics")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    true
  );

  learnSearchInput?.addEventListener(
    "input",
    (event) => {
      event.stopImmediatePropagation();
      searchResults?.setAttribute("hidden", "");
      filterTopics();
    },
    true
  );

  filterTopics();

  const learnNavLinks = document.querySelectorAll("[data-learn-nav]");
  const setActiveLearnNav = (id) => {
    learnNavLinks.forEach((link) => {
      const active = link.dataset.learnNav === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window) {
    const learnObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveLearnNav(visible.target.id);
      },
      { rootMargin: "-24% 0px -58% 0px", threshold: [0.18, 0.3, 0.48] }
    );

    document.querySelectorAll("[data-learn-section]").forEach((section) => learnObserver.observe(section));
  } else {
    setActiveLearnNav("start-here");
  }
};

initLearnPage();

const openDemoModal = () => {
  if (!demoModal) return;
  demoModal.hidden = false;
  demoClose?.focus();
};

const closeDemoModal = () => {
  if (!demoModal) return;
  demoModal.hidden = true;
  demoTrigger?.focus();
};

if (demoVideo && DEMO_VIDEO_SRC) {
  if (!demoVideo.getAttribute("src")) {
    demoVideo.src = DEMO_VIDEO_SRC;
  }

  demoVideo.removeAttribute("hidden");
  demoVideo.controls = false;
  demoVideo.removeAttribute("controls");
  demoVideo.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
  demoVideo.disablePictureInPicture = true;
  demoPlayer?.classList.add("is-video-visible");
  demoPlaceholder?.setAttribute("hidden", "");

  demoVideo.addEventListener("loadeddata", () => {
    demoPlayer?.classList.add("is-ready");
  });

  demoVideo.addEventListener("error", () => {
    demoPlayer?.classList.remove("is-video-visible", "is-playing", "is-ready");
    demoVideo.setAttribute("hidden", "");
    demoPlaceholder?.removeAttribute("hidden");
  });

  demoVideo.addEventListener("play", () => {
    demoPlayer?.classList.add("is-playing", "is-video-visible");
    demoVideo.controls = false;
    demoVideo.removeAttribute("controls");
    demoPlaceholder?.setAttribute("hidden", "");
  });

  demoVideo.addEventListener("pause", () => {
    demoPlayer?.classList.remove("is-playing");
  });
}

demoTrigger?.addEventListener("click", async () => {
  if (!demoVideo || !DEMO_VIDEO_SRC) {
    demoPlayer?.classList.add("is-loading");
    openDemoModal();
    return;
  }

  demoPlayer?.classList.add("is-loading", "is-video-visible");
  demoPlaceholder?.setAttribute("hidden", "");
  demoVideo.removeAttribute("hidden");
  demoVideo.controls = false;

  try {
    await demoVideo.play();
  } catch {
    openDemoModal();
  } finally {
    window.setTimeout(() => demoPlayer?.classList.remove("is-loading"), 650);
  }
});

demoClose?.addEventListener("click", closeDemoModal);

demoModal?.addEventListener("click", (event) => {
  if (event.target === demoModal) closeDemoModal();
});

const SUPPORT_ASSISTANT_ENDPOINT = "/api/support/assistant";
const SUPPORT_BACKEND_TIMEOUT_MS = 12000;
const supportAllowedLinks = {
  docs: "#docs",
  learningPath: "learn.html",
  pythonGuide: "python.html",
  issues: siteLinks.issues,
  newIssue: `${siteLinks.issues}/new`,
  discussions: siteLinks.discussions,
  discord: siteLinks.discord,
  releases: "https://github.com/hepter-studios/mompy/releases",
};
const allowedSupportTargets = new Set(Object.values(supportAllowedLinks));

const supportRoutes = [
  {
    category: "bug",
    confidence: 0.88,
    keywords: ["bug", "error", "crash", "broken", "fail", "not working", "erro", "travou", "quebrado", "falha", "bugou", "não funciona", "nao funciona"],
    reply: "That may be a bug, but I need a little more detail first. What screen or mission were you on, and what did Mompy show?",
    reportKind: "bug",
    actions: [
      { label: "Open Discussions", type: "external", target: supportAllowedLinks.discussions },
      { label: "Read Docs", type: "scroll", target: supportAllowedLinks.docs },
    ],
  },
  {
    category: "installation",
    confidence: 0.82,
    keywords: ["install", "installation", "setup", "download", "installation error", "setup error", "baixar", "instalar", "instalação", "instalacao", "erro na instalação", "erro na instalacao", "setup"],
    reply: "This sounds like installation trouble. Start with docs, then confirm you are using the latest release.",
    actions: [
      { label: "Read Docs", type: "scroll", target: supportAllowedLinks.docs },
      { label: "Download Latest Version", type: "external", target: supportAllowedLinks.releases },
      { label: "Open Discussions", type: "external", target: supportAllowedLinks.discussions },
    ],
  },
  {
    category: "startup",
    confidence: 0.82,
    keywords: ["open", "start", "run", "launch", "startup", "abrir", "abre", "não abre", "nao abre", "mompy não abre", "mompy nao abre", "iniciar", "rodar", "executar"],
    reply: "This sounds like a startup issue. Tell me what happens when you open Mompy: blank screen, crash, error text, or nothing at all?",
    reportKind: "startup",
    actions: [
      { label: "Read Docs", type: "scroll", target: supportAllowedLinks.docs },
      { label: "Download Latest Version", type: "external", target: supportAllowedLinks.releases },
      { label: "Open Discussions", type: "external", target: supportAllowedLinks.discussions },
    ],
  },
  {
    category: "lesson",
    confidence: 0.78,
    keywords: ["lesson", "exercise", "aula", "lição", "licao", "exercício", "exercicio", "não entendi", "nao entendi"],
    reply: "This sounds like a lesson question. Open the learning path first, then use docs or community help if you are stuck.",
    actions: [
      { label: "Open Learning Path", type: "external", target: supportAllowedLinks.learningPath },
      { label: "Read Docs", type: "scroll", target: supportAllowedLinks.docs },
      { label: "Ask Community", type: "external", target: supportAllowedLinks.discord },
    ],
  },
  {
    category: "mission",
    confidence: 0.78,
    keywords: ["mission", "challenge", "missão", "missao", "desafio", "listas", "list", "loop", "function", "função", "funcao"],
    reply: "This looks like a mission question. Use the learning path and docs, then ask the community with the mission number.",
    actions: [
      { label: "Open Learning Path", type: "external", target: supportAllowedLinks.learningPath },
      { label: "Read Docs", type: "scroll", target: supportAllowedLinks.docs },
      { label: "Ask Community", type: "external", target: supportAllowedLinks.discord },
    ],
  },
  {
    category: "feature request",
    confidence: 0.82,
    keywords: ["idea", "suggestion", "feature", "ideia", "sugestão", "sugestao", "recurso", "melhoria"],
    reply: "That sounds like feedback for improving Mompy. Tell me what you expected Mompy to explain, and what it showed instead.",
    reportKind: "feature",
    actions: [
      { label: "Open Discussions", type: "external", target: supportAllowedLinks.discussions },
      { label: "Open Learning Path", type: "external", target: supportAllowedLinks.learningPath },
    ],
  },
  {
    category: "documentation",
    confidence: 0.76,
    keywords: ["docs", "documentation", "guide", "python", "documentação", "documentacao", "guia"],
    reply: "This sounds documentation-related. Start with the docs section or the Python guide.",
    actions: [
      { label: "Read Docs", type: "scroll", target: supportAllowedLinks.docs },
      { label: "Python Guide", type: "external", target: supportAllowedLinks.pythonGuide },
      { label: "Open Discussions", type: "external", target: supportAllowedLinks.discussions },
    ],
  },
  {
    category: "account/community",
    confidence: 0.72,
    keywords: ["discord", "community", "chat", "comunidade", "conversar", "alguém", "alguem", "ajuda ao vivo"],
    reply: "For quick conversation, use Discord. For searchable questions, use GitHub Discussions.",
    actions: [
      { label: "Join Discord", type: "external", target: supportAllowedLinks.discord },
      { label: "Open Discussions", type: "external", target: supportAllowedLinks.discussions },
    ],
  },
];

let supportReportDraft = "";
let supportConversationHistory = [];

const portugueseSupportReplies = {
  bug: "Pode ser um bug, mas preciso entender melhor primeiro. Em qual tela ou missão isso aconteceu, e que mensagem o Mompy mostrou?",
  installation: "Isso parece problema de instalação. Comece pela documentação e confirme se está usando a versão mais recente.",
  startup: "Isso parece problema para abrir o Mompy. Me diga o que acontece quando você tenta iniciar: tela preta, fecha sozinho, aparece algum texto de erro ou nada acontece?",
  lesson: "Isso parece uma dúvida de aula. Abra a trilha de aprendizado primeiro; se ainda travar, use a documentação ou a comunidade.",
  mission: "Isso parece uma dúvida de missão. Use a trilha de aprendizado e a documentação; se perguntar na comunidade, mande o número da missão.",
  "feature request": "Entendi como sugestão. Me conta como você queria que o Mompy explicasse melhor: mostrar a linha, o motivo, o resultado esperado ou uma dica passo a passo?",
  documentation: "Isso parece relacionado à documentação. Comece pela seção de docs ou pelo guia de Python.",
  "account/community": "Para conversa rápida, use o Discord. Para perguntas que precisam ficar registradas, use o GitHub Discussions.",
};

const isPortugueseSupportMessage = (text) =>
  /\b(oi|ola|olhe|bom dia|boa tarde|boa noite|voce|tu|nao|sem|so|estou|testando|teste|conversa|normal|erro|ajuda|instalar|abrir|missao|licao|problema|sugestao|melhoria|coisa|entendi|disse)\b/i.test(
    normalizeSearchText(text)
  );

const isSupportGreetingOnly = (text) =>
  /^(oi|ola|hi|hello|hey|olhe|look|bom dia|boa tarde|boa noite|e ai)[\s!.?]*$/i.test(normalizeSearchText(text));

const hasSupportBugNegation = (text) =>
  /\b(sem|no|not|nao)\s+(bug|erro|crash|problema|problem|issue)\b/i.test(normalizeSearchText(text));

const looksLikeSupportFeedbackSuggestion = (text) =>
  /\b(sugestao|melhoria|melhor|dica|explicar|explica|linha|motivo|esperava|deveria|feedback|nao e bug|nao eh bug)\b/i.test(
    normalizeSearchText(text)
  );

const refineLocalSupportResponse = (message, response) => {
  const normalized = normalizeSearchText(message);
  const previousText = normalizeSearchText(supportConversationHistory.map((item) => item.text).join("\n"));
  const portuguese = isPortugueseSupportMessage(message);
  const confusion =
    /\b(o que|que\?|nao entendi|tu nem sabe|voce nem sabe|porque me disse|por que me disse|como isso resolve|o que eu tenho a ver)\b/.test(
      normalized
    );
  const languageCorrection = /\b(eu falo portugues|portugues|nao falo ingles|traduz|traduza)\b/.test(normalized);
  const lessonFeedbackComplaint =
    /\b(licao|lesson|missao|aula)\b/.test(normalized) &&
    /\b(erro|errado|dando erro|feedback|linha|motivo|explica|explicar|onde errei|nao mostra)\b/.test(normalized);

  if (languageCorrection) {
    return {
      ...response,
      reply:
        "Perfeito, vou falar em português. Me diga em uma frase o que aconteceu no Mompy e eu vou tentar separar o problema em passos claros antes de encaminhar qualquer coisa.",
      category: response.category === "unclear" ? "conversation" : response.category,
    };
  }

  if (confusion) {
    return {
      ...response,
      reply: portuguese
        ? "Você tem razão: eu me adiantei. Primeiro eu preciso entender o caso, não sair dizendo que é relatório. Me diga qual tela ou missão estava aberta e o que o Mompy mostrou quando você tentou avançar."
        : "You're right: I got ahead of myself. First I need to understand the case, not jump to a report. Tell me which screen or mission was open and what Mompy showed.",
      category: "unclear",
    };
  }

  if (lessonFeedbackComplaint || (looksLikeSupportFeedbackSuggestion(message) && /\b(erro|errado|licao|missao)\b/.test(`${normalized} ${previousText}`))) {
    return {
      ...response,
      reply: portuguese
        ? "Entendi melhor: isso parece uma melhoria no feedback das lições, não necessariamente um bug. O ideal é o Mompy dizer onde o aluno errou, por que errou e qual resultado era esperado. Para eu te ajudar a transformar isso em algo útil para a equipe, me manda: número da missão, o código que você escreveu e a mensagem exata que apareceu."
        : "I understand better: this sounds like an improvement to lesson feedback, not necessarily a bug. Mompy should tell learners where the answer went wrong, why, and what output was expected. Send me the mission number, the code you wrote, and the exact message Mompy showed.",
      category: "feature request",
      actions: [
        { label: "Open Discussions", type: "external", target: supportAllowedLinks.discussions },
        { label: "Open Learning Path", type: "external", target: supportAllowedLinks.learningPath },
      ],
    };
  }

  return response;
};

const scrollSupportChatToLatest = () => {
  if (!supportChat) return;

  supportChat.scrollTop = supportChat.scrollHeight;
  window.requestAnimationFrame(() => {
    supportChat.scrollTop = supportChat.scrollHeight;
  });
  window.setTimeout(() => {
    supportChat.scrollTop = supportChat.scrollHeight;
  }, 80);
};

const appendSupportMessage = (kind, text, author = kind === "user" ? "You" : "Mompy Assistant") => {
  if (!supportChat) return;

  const message = document.createElement("div");
  message.className = `support-message is-${kind}`;

  const label = document.createElement("span");
  label.textContent = author;

  const body = document.createElement("p");
  body.textContent = text;

  message.append(label, body);
  supportChat.append(message);
  scrollSupportChatToLatest();
  return message;
};

const buildSupportReport = (message) => [
  "Mompy issue report",
  "",
  "What happened:",
  message,
  "",
  "Expected behavior:",
  "- ",
  "",
  "What I tried:",
  "- ",
  "",
  "Environment:",
  "- OS:",
  "- Mompy version:",
].join("\n");

const buildFeatureDraft = (message) => [
  "Mompy feature request",
  "",
  "Idea:",
  message,
  "",
  "Why it helps learners:",
  "- ",
  "",
  "Suggested behavior:",
  "- ",
].join("\n");

const clearSupportActions = () => {
  if (supportActions) supportActions.textContent = "";
};

const isAllowedSupportAction = (action) => {
  if (!action || typeof action.label !== "string" || typeof action.type !== "string") return false;
  if (["copy", "issue_draft"].includes(action.type)) return true;
  if (action.type === "scroll") return action.target === supportAllowedLinks.docs;
  if (action.type === "external") return allowedSupportTargets.has(action.target);
  return false;
};

const normalizeSupportResponse = (response, originalMessage) => {
  const fallback = getLocalSupportResponse(originalMessage);
  if (!response || typeof response.reply !== "string") return fallback;

  const actions = Array.isArray(response.actions)
    ? response.actions
        .filter(isAllowedSupportAction)
        .map((action) => ({
          label: action.label,
          type: action.type,
          target: action.target,
          payload: action.payload,
        }))
        .slice(0, 4)
    : fallback.actions;

  return {
    reply: response.reply,
    category: response.category || "unclear",
    confidence: Number.isFinite(response.confidence) ? response.confidence : 0.5,
    actions,
    reportDraft: response.reportDraft || fallback.reportDraft || "",
  };
};

const getLocalSupportResponse = (message) => {
  const normalized = normalizeSearchText(message);
  const portuguese = isPortugueseSupportMessage(message);

  if (isSupportGreetingOnly(message)) {
    return {
      reply:
        supportConversationHistory.length > 1
          ? portuguese
            ? "Estou aqui. Me diz em uma frase o que você quer fazer agora no Mompy, ou qual parte ficou confusa."
            : "I'm here. Tell me in one sentence what you want to do next in Mompy, or which part felt confusing."
          : portuguese
            ? "Oi. Me conta o que aconteceu no Mompy: instalação, erro, missão, aula ou uma ideia? Se puder, diga também em qual tela isso aparece."
            : "Hi. Tell me what happened in Mompy: installation, an error, a mission, a lesson, or an idea? If you can, mention which screen shows it.",
      category: "unclear",
      confidence: 0.35,
      actions: [
        { label: "Read Docs", type: "scroll", target: supportAllowedLinks.docs },
        { label: "Ask Community", type: "external", target: supportAllowedLinks.discord },
      ],
      reportDraft: "",
    };
  }

  const bugNegated = hasSupportBugNegation(message);
  const feedbackSuggestion = looksLikeSupportFeedbackSuggestion(message);
  const route = supportRoutes
    .map((item) => ({
      ...item,
      score:
        bugNegated && ["bug", "startup"].includes(item.category)
          ? 0
          : item.keywords.filter((keyword) => normalized.includes(normalizeSearchText(keyword))).length +
            (feedbackSuggestion && item.category === "feature request" ? 2 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.confidence - a.confidence)[0];

  if (!route) {
    return refineLocalSupportResponse(message, {
      reply: portuguese
        ? "Entendi. Me da so mais um detalhe: isso e sobre instalar ou abrir o Mompy, algum erro, uma aula, uma missao ou uma sugestao?"
        : "I understand. Give me one more detail: is this about installing or opening Mompy, an error, a lesson, a mission, or a suggestion?",
      category: "unclear",
      confidence: 0.35,
      actions: [
        { label: "Read Docs", type: "scroll", target: supportAllowedLinks.docs },
        { label: "Ask Community", type: "external", target: supportAllowedLinks.discord },
      ],
      reportDraft: "",
    });
  }

  const reportDraft = route.reportKind === "feature" ? buildFeatureDraft(message) : route.reportKind ? buildSupportReport(message) : "";

  return refineLocalSupportResponse(message, {
    reply: portuguese ? portugueseSupportReplies[route.category] || route.reply : route.reply,
    category: route.category,
    confidence: route.confidence,
    actions: route.actions.map((action) => ({
      ...action,
      payload: action.type === "issue_draft" ? reportDraft : action.payload,
    })),
    reportDraft,
  });
};

const requestSupportAssistant = async (message) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SUPPORT_BACKEND_TIMEOUT_MS);

  try {
    const response = await fetch(SUPPORT_ASSISTANT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        page: location.href,
        userAgent: navigator.userAgent,
        context: document.body.dataset.activeSection || "",
        history: supportConversationHistory.slice(-8),
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error("Support backend unavailable");
    return normalizeSupportResponse(await response.json(), message);
  } catch {
    return getLocalSupportResponse(message);
  } finally {
    window.clearTimeout(timeout);
  }
};

const addSupportAction = (action) => {
  if (!supportActions) return;

  if (action.type === "external") {
    const link = document.createElement("a");
    link.href = action.target;
    if (/^https?:\/\//i.test(action.target)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    link.textContent = action.label;
    supportActions.append(link);
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = action.label;

  if (action.type === "scroll") {
    button.addEventListener("click", () => {
      document.querySelector(action.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", action.target);
    });
  }

  if (action.type === "copy") {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(supportReportDraft);
        button.textContent = "Copied";
      } catch {
        appendSupportMessage("assistant", "Copy failed. Select the report text above and copy it manually.");
      }
    });
  }

  if (action.type === "issue_draft") {
    button.addEventListener("click", () => {
      supportReportDraft = action.payload || supportReportDraft;
      button.textContent = "Report Ready";
    });
  }

  supportActions.append(button);
};

const respondToSupportMessage = async (message) => {
  clearSupportActions();
  const pendingMessage = appendSupportMessage("assistant", isPortugueseSupportMessage(message) ? "Pensando" : "Thinking");
  pendingMessage?.classList.add("is-thinking");

  const response = await requestSupportAssistant(message);
  supportReportDraft = response.reportDraft || "";

  if (pendingMessage) {
    pendingMessage.classList.remove("is-thinking");
    pendingMessage.querySelector("p").textContent = response.reply;
    scrollSupportChatToLatest();
  } else {
    appendSupportMessage("assistant", response.reply);
  }

  supportConversationHistory.push({ role: "assistant", text: response.reply });
  supportConversationHistory = supportConversationHistory.slice(-10);
  response.actions.forEach(addSupportAction);
  scrollSupportChatToLatest();
};

supportForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = supportInput?.value.trim();
  if (!message) return;

  appendSupportMessage("user", message);
  supportConversationHistory.push({ role: "user", text: message });
  supportConversationHistory = supportConversationHistory.slice(-10);
  supportInput.value = "";
  window.setTimeout(() => respondToSupportMessage(message), 180);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && searchResults && !searchResults.hidden) {
    searchResults.hidden = true;
    searchInput?.blur();
  }

  if (event.key === "Escape" && demoModal && !demoModal.hidden) {
    closeDemoModal();
  }
});

const revealTargets = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.22 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const header = document.querySelector(".site-header");
const navLinks = document.querySelectorAll("[data-nav-link]");
const sections = document.querySelectorAll("main > .screen-section[id]");

const setActiveSection = (sectionId) => {
  document.body.dataset.activeSection = sectionId;

  navLinks.forEach((link) => {
    const isActive = link.dataset.navLink === sectionId;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const updateActiveSectionFromScroll = () => {
  const anchor = window.scrollY + window.innerHeight * 0.38;
  let currentId = sections[0]?.id;

  sections.forEach((section) => {
    if (section.offsetTop <= anchor) currentId = section.id;
  });

  if (currentId) setActiveSection(currentId);
};

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target.id) setActiveSection(visible.target.id);
    },
    {
      rootMargin: "-32% 0px -45% 0px",
      threshold: [0.18, 0.32, 0.5, 0.68],
    }
  );

  sections.forEach((section) => navObserver.observe(section));
} else {
  updateActiveSectionFromScroll();
}

window.addEventListener(
  "scroll",
  () => {
    const currentY = window.scrollY;
    header?.classList.toggle("is-compact", currentY > 80);
    updateActiveSectionFromScroll();
  },
  { passive: true }
);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", href);
  });
});

updateActiveSectionFromScroll();
