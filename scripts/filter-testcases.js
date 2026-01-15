const fs = require('fs');

const FILE = 'testcasespecs_p_n.md';
const content = fs.readFileSync(FILE, 'utf8');
const lines = content.split(/\r?\n/);

// Track which test cases to keep
const keepTestCases = new Set();

// Map requirement to test cases
const reqToTests = {};

let currentReq = null;
let i = 0;

// First pass: collect all test cases by requirement
while (i < lines.length) {
  const line = lines[i];
  
  // Check if this is a test case header
  const tcMatch = line.match(/^###\s+TC-([A-Z0-9]+\.\d+)-(POS|NEG)-\d+/);
  if (tcMatch) {
    const req = tcMatch[1]; // e.g., "FR1.1" or "NFR1.1"
    const type = tcMatch[2]; // "POS" or "NEG"
    
    if (!reqToTests[req]) {
      reqToTests[req] = { pos: [], neg: [] };
    }
    
    reqToTests[req][type.toLowerCase()].push(i);
  }
  
  i++;
}

// Second pass: mark test cases to keep (first POS and first NEG for each requirement)
for (const req in reqToTests) {
  const tests = reqToTests[req];
  
  // Keep first positive test case
  if (tests.pos.length > 0) {
    keepTestCases.add(tests.pos[0]);
  }
  
  // Keep first negative test case
  if (tests.neg.length > 0) {
    keepTestCases.add(tests.neg[0]);
  }
}

// Third pass: build new content
const newLines = [];
let inTestCase = false;
let testCaseStart = -1;
let skipTestCase = false;

i = 0;
while (i < lines.length) {
  const line = lines[i];
  
  // Check if this is a test case header
  const tcMatch = line.match(/^###\s+TC-/);
  if (tcMatch) {
    // If we were in a test case, we've reached the next one
    if (inTestCase && !skipTestCase) {
      // Copy the previous test case
      for (let j = testCaseStart; j < i; j++) {
        newLines.push(lines[j]);
      }
    }
    
    // Start new test case
    inTestCase = true;
    testCaseStart = i;
    skipTestCase = !keepTestCases.has(i);
  } else if (inTestCase && line.match(/^###\s+[^T]/)) {
    // We've hit a new section (not a test case)
    if (!skipTestCase) {
      // Copy the previous test case
      for (let j = testCaseStart; j < i; j++) {
        newLines.push(lines[j]);
      }
    }
    inTestCase = false;
    newLines.push(line);
  } else if (!inTestCase) {
    // Not in a test case, just copy
    newLines.push(line);
  }
  
  i++;
}

// Handle last test case
if (inTestCase && !skipTestCase) {
  for (let j = testCaseStart; j < lines.length; j++) {
    newLines.push(lines[j]);
  }
}

fs.writeFileSync(FILE, newLines.join('\n'), 'utf8');

// Count kept test cases
const keptCount = keepTestCases.size;
const totalReqs = Object.keys(reqToTests).length;
console.log(`Kept ${keptCount} test cases (1 POS + 1 NEG) for ${totalReqs} requirements`);
