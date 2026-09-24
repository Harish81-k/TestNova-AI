const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateQuiz = async (topic, level) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const randomSeed = Math.floor(Math.random() * 1000000);

  let prompt = `
You are an expert aptitude and reasoning question generator.

Generate EXACTLY 10 multiple-choice questions.

Topic: ${topic}
Difficulty: ${level}
Random Seed: ${randomSeed} (Use this to ensure completely unique questions each time)

Difficulty Guidelines:
- Beginner: Very easy questions, direct answers, simple concepts.
- Basic: Fundamental reasoning, simple logic, straightforward deductions.
- Intermediate: Multi-step reasoning, moderate complexity, analytical thinking.
- Advanced: Complex logical deductions, higher-order reasoning, tricky distractors.
- Pro: Interview-level, placement-level, competitive exam-level reasoning.

Rules:
1. Generate EXACTLY 10 questions.
2. Each question must have exactly 4 options.
3. Only one option must be correct.
4. Questions must match the requested difficulty.
5. Avoid duplicate questions. ENSURE HIGH VARIETY from typical examples.
6. Incorrect options should be realistic.
7. Provide a concise explanation for why the answer is correct.
8. If a question contains code, wrap the code snippet in standard markdown code blocks (using triple backticks) with the correct language identifier.
9. Output ONLY a valid JSON array of objects.

JSON Format (If no code is needed):
[
  {
    "question": "What is the capital of France?",
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "answer": "Paris",
    "explanation": "Paris is the capital of France."
  }
]

JSON Format (If code is needed, MUST INCLUDE CODE IN THE QUESTION STRING):
[
  {
    "question": "What is the output of the following Python code?\\n\`\`\`python\\nprint('Hello World')\\n\`\`\`",
    "options": ["Hello World", "Error", "Nothing", "Hello"],
    "answer": "Hello World",
    "explanation": "The print function outputs the string to the console."
  }
]
`;

  if (topic.toLowerCase() === 'reasoning') {
    prompt += `
Include a balanced mix of:
- Syllogisms, Logical Deduction, Statements and Conclusions
- Coding-Decoding, Blood Relations, Direction Sense
- Analogies, Number Series, Verbal Reasoning, Critical Thinking
`;
  }

  let retries = 3;
  let delay = 1000;
  
  while (retries > 0) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Clean markdown if present
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
      else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
      cleanText = cleanText.trim();

      const questions = JSON.parse(cleanText);
      
      // Process newlines
      const validQuestions = [];
      for (let q of questions) {
        if (q.question && q.options && q.options.length === 4 && q.answer && q.explanation) {
          let qText = q.question;
          q.question = qText;
          validQuestions.push(q);
        }
      }
      if (validQuestions.length === 0) throw new Error("No valid questions parsed.");
      console.log("GENERATED QUESTIONS:", JSON.stringify(validQuestions, null, 2));
      return validQuestions.slice(0, 10);
    } catch (error) {
      console.error('Quiz Generation Error:', error.message);
      if (
        (error.status && (error.status === 503 || error.status === 429)) || 
        (error.message && (error.message.includes("503") || error.message.includes("429") || error.message.includes("No valid")))
      ) {
        retries--;
        if (retries === 0) {
          return [];
        }
        console.log(`Retrying... attempts left: ${retries}`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      } else {
        return [];
      }
    }
  }
};

const generateCodingQuestions = async (level, language = 'python') => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const topicsByLevel = {
    basic: ["Arrays", "Strings", "Math", "Basic Loops", "Conditional Logic", "Simple Simulation", "String Manipulation", "Number Theory (Basic)"],
    intermediate: ["Hash Maps", "Two Pointers", "Sliding Window", "Sorting", "Searching", "Prefix Sum", "Recursion", "Binary Search", "Stacks", "Queues"],
    advanced: ["Dynamic Programming", "Graphs", "Trees", "Greedy", "Backtracking", "Bit Manipulation", "Intervals", "Trie", "Heaps", "Advanced Geometry"]
  };
  
  const pool = topicsByLevel[level] || topicsByLevel.intermediate;
  const selectedTopics = pool.sort(() => 0.5 - Math.random()).slice(0, 3).join(', ');
  const randomSeed = Math.floor(Math.random() * 1000000);

  const prompt = `
You are an expert programming question generator.

Generate EXACTLY 5 coding questions for a technical interview or practice test.

Language: ${language}
Difficulty: ${level}
Random Seed: ${randomSeed} (Use this to ensure completely unique questions each time)

Difficulty Guidelines:
- basic: Simple arrays, strings, loops, basic math logic. Focus on topics like: ${selectedTopics}
- intermediate: Hash maps, simple recursion, sorting, two pointers. Focus on topics like: ${selectedTopics}
- advanced: Dynamic programming, graphs, trees, complex algorithms. Focus on topics like: ${selectedTopics}

Rules:
1. Generate EXACTLY 5 coding questions specifically for ${language}.
2. Provide 'title', 'description', 'input_format', 'output_format', 'constraints', 'stub' (starter code in ${language}), 'sample_input', 'sample_output'.
CRITICAL: The 'stub' MUST BE EXTREMELY BARE-BONES. It should ONLY contain the basic main method/function and standard imports for the language. ABSOLUTELY DO NOT parse the problem's specific inputs (e.g., do not read arrays, integers, or graphs). The user must write all input reading and parsing logic themselves. Do NOT provide any solution logic or pseudo-code.
3. Include an array of 'hidden_tests', each being an object with 'input' and 'output'. Provide exactly 3 hidden tests for each question.
4. 'test_harness' MUST be an empty string (""). The user's code will be executed directly against standard input.
5. The 'stub' must be just an empty main method or entry point with a single comment: '// Write your logic here'.
6. The output must be ONLY a valid JSON array of objects.
7. HIGH VARIETY REQUIRED: Focus your questions on some of these randomly selected concepts: ${selectedTopics}. Make sure they strictly match the requested '${level}' difficulty.
8. DO NOT generate standard, overused questions like "FizzBuzz", "Two Sum", or "Reverse String" unless they have a very unique twist. Ensure every generation is distinct from typical examples.

JSON Format:
[
  {
    "title": "Title of Question",
    "description": "HTML description of the problem...",
    "input_format": "Description of input format...",
    "output_format": "Description of output format...",
    "constraints": "<ul><li>Constraint 1</li></ul>",
    "stub": "# Read from standard input and print the output\\nimport sys\\n\\nif __name__ == '__main__':\\n    # Write your logic here\\n    pass\\n",
    "test_harness": "",
    "sample_input": "1 2 3",
    "sample_output": "6",
    "hidden_tests": [
      {"input": "4 5", "output": "9"},
      {"input": "10 10", "output": "20"},
      {"input": "0 0", "output": "0"}
    ]
  }
]
`;

  let retries = 3;
  let delay = 1000;
  
  while (retries > 0) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
      else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
      cleanText = cleanText.trim();

      const questions = JSON.parse(cleanText);
      
      const barebonesStubs = {
        python: "# Read from standard input and print the output\nimport sys\n\nif __name__ == '__main__':\n    # Write your logic here\n    pass\n",
        javascript: "// Read from standard input and print the output\nconst fs = require('fs');\n\nfunction main() {\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim();\n    // Write your logic here\n}\n\nmain();\n",
        java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write your logic here\n    }\n}\n",
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your logic here\n    return 0;\n}\n"
      };
      
      const defaultStub = barebonesStubs[language.toLowerCase()] || barebonesStubs.python;
      
      return questions.map(q => ({
        ...q,
        stub: defaultStub
      }));
    } catch (error) {
      console.error('Coding Questions Generation Error:', error.message);
      if (error.status === 503 || error.status === 429 || (error.message && (error.message.includes("503") || error.message.includes("429")))) {
        retries--;
        if (retries === 0) return [];
        console.log(`Retrying... attempts left: ${retries}`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      } else {
        return [];
      }
    }
  }
};

const getHint = async (title, description) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
Give ONLY one short coding hint.

Problem:
Title: ${title}
Description: ${description}
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Hint Generation Error:', error);
    return "Could not generate hint.";
  }
};

const chatMessage = async (history, newMessage, attachments = [], isThinkingMode = false) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Format history for Gemini API
  let formattedHistory = history.map(msg => {
    let parts = [{ text: msg.content || " " }];
    if (msg.attachments && msg.attachments.length > 0) {
      const attachmentParts = msg.attachments.map(att => ({
        inlineData: { data: att.data, mimeType: att.mimeType }
      }));
      parts = [...parts, ...attachmentParts];
    }
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts: parts,
    };
  });

  // Gemini API requires the first message in history to be from 'user'
  if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
    formattedHistory = formattedHistory.slice(1);
  }

  try {
    const chat = model.startChat({
      history: formattedHistory,
    });
    
    let retries = 3;
    let delay = 1000;
    
    // Format new message with attachments
    let textPrompt = newMessage || " ";
    if (isThinkingMode) {
      textPrompt = `Before giving your final answer, first provide a detailed reasoning process enclosed in <think>...</think> tags. Then provide your final answer.\n\nUser Message: ${textPrompt}`;
    }
    
    let messageParts = [{ text: textPrompt }];
    if (attachments && attachments.length > 0) {
      const attachmentParts = attachments.map(att => ({
        inlineData: { data: att.data, mimeType: att.mimeType }
      }));
      messageParts = [...messageParts, ...attachmentParts];
    }
    
    while (retries > 0) {
      try {
        const result = await chat.sendMessage(messageParts);
        return result.response.text();
      } catch (error) {
        if (error.status === 503 || error.status === 429) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Chat Generation Error:', error);
    if (error.status === 503) {
      return "The AI service is currently overloaded. Please try sending your message again in a few seconds.";
    }
    return "I'm sorry, I encountered an error while processing your request.";
  }
};

const generatePortsData = async () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const randomSeed = Math.floor(Math.random() * 1000000);

  const prompt = `
Generate EXACTLY 15 network ports and their standard services.
Mix common ports (like HTTP/80, SSH/22) with more obscure ones to keep the game interesting.
Random Seed: ${randomSeed}

Output ONLY a valid JSON array of objects.
Format:
[
  { "port": "80", "service": "HTTP" },
  { "port": "3306", "service": "MySQL" }
]
`;

  let retries = 3;
  let delay = 1000;
  
  while (retries > 0) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      let cleanText = text.trim();
      if (cleanText.startsWith('\`\`\`json')) cleanText = cleanText.substring(7);
      else if (cleanText.startsWith('\`\`\`')) cleanText = cleanText.substring(3);
      if (cleanText.endsWith('\`\`\`')) cleanText = cleanText.substring(0, cleanText.length - 3);
      cleanText = cleanText.trim();
      return JSON.parse(cleanText);
    } catch (error) {
      retries--;
      if (retries === 0) return [];
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
};

module.exports = {
  generateQuiz,
  generateCodingQuestions,
  getHint,
  chatMessage,
  generatePortsData
};
