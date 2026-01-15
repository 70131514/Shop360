const fs = require('fs');

const FILE = 'statetransitiontests.md';
const content = fs.readFileSync(FILE, 'utf8');
const lines = content.split(/\r?\n/);

// Keep only these test cases based on functional requirements
const keepTestCases = new Set([
  // ST1: User Authentication (Registration, Login, Logout, RBAC)
  'ST1.1', 'ST1.2', 'ST1.4', 'ST1.5', 'ST1.6',
  // ST2: Order Status (Core e-commerce flow)
  'ST2.1', 'ST2.2', 'ST2.3', 'ST2.5', 'ST2.8',
  // ST3: Support Tickets (Chat with vendor)
  'ST3.1', 'ST3.2', 'ST3.4',
  // ST4: Shopping Cart (Core e-commerce)
  'ST4.1', 'ST4.4', 'ST4.5', 'ST4.6', 'ST4.8',
  // ST5: Product Stock (Product Management - Admin)
  'ST5.1', 'ST5.2',
  // ST6: Email Verification (Authentication)
  'ST6.1', 'ST6.2',
  // ST9: Wishlist (Wishlist Management)
  'ST9.1', 'ST9.2',
  // ST10: Notifications (Push Notifications)
  'ST10.1',
  // ST11: User Role (Role Based Access Control)
  'ST11.1', 'ST11.2'
]);

// Map test case ID to line number
const testCaseLines = {};
let currentSection = '';
let i = 0;

// First pass: find all test cases and their sections
while (i < lines.length) {
  const line = lines[i];
  
  // Check for section headers
  const sectionMatch = line.match(/^## (ST\d+):/);
  if (sectionMatch) {
    currentSection = sectionMatch[1];
  }
  
  // Check for test case headers
  const tcMatch = line.match(/^### (ST\d+\.\d+):/);
  if (tcMatch) {
    const tcId = tcMatch[1];
    testCaseLines[tcId] = {
      start: i,
      section: currentSection,
      keep: keepTestCases.has(tcId)
    };
  }
  
  i++;
}

// Second pass: build new content
const newLines = [];
let inTestCase = false;
let testCaseStart = -1;
let skipTestCase = false;
let currentTcId = '';

i = 0;
while (i < lines.length) {
  const line = lines[i];
  
  // Check if this is a section header
  const sectionMatch = line.match(/^## (ST\d+):/);
  if (sectionMatch) {
    const sectionId = sectionMatch[1];
    // Check if this section has any test cases to keep
    const hasKeepCases = Object.keys(testCaseLines).some(tcId => 
      testCaseLines[tcId].section === sectionId && testCaseLines[tcId].keep
    );
    
    if (hasKeepCases) {
      // Include section header and state diagram
      newLines.push(line);
      i++;
      // Include state diagram and states until first test case
      while (i < lines.length && !lines[i].match(/^### ST\d+\.\d+:/)) {
        newLines.push(lines[i]);
        i++;
      }
      i--; // Back up one line
    } else {
      // Skip entire section
      while (i < lines.length && !lines[i].match(/^## ST\d+:/)) {
        i++;
      }
      i--; // Back up to section header
    }
  }
  // Check if this is a test case header
  else if (line.match(/^### ST\d+\.\d+:/)) {
    const tcMatch = line.match(/^### (ST\d+\.\d+):/);
    if (tcMatch) {
      currentTcId = tcMatch[1];
      const shouldKeep = keepTestCases.has(currentTcId);
      
      if (shouldKeep) {
        // Start new test case
        inTestCase = true;
        testCaseStart = i;
        skipTestCase = false;
        newLines.push(line);
      } else {
        // Skip this test case
        inTestCase = true;
        skipTestCase = true;
      }
    }
  }
  // Inside a test case
  else if (inTestCase) {
    if (skipTestCase) {
      // Skip lines until next test case or section
      if (line.match(/^### ST\d+\.\d+:/) || line.match(/^## ST\d+:/)) {
        inTestCase = false;
        skipTestCase = false;
        i--; // Process this line in next iteration
      }
    } else {
      // Include line
      newLines.push(line);
      // Check if we've reached the end of this test case
      if (line.match(/^### ST\d+\.\d+:/) || line.match(/^## ST\d+:/)) {
        inTestCase = false;
        i--; // Process this line in next iteration
      }
    }
  }
  // Outside test cases - include summary and overview
  else if (!line.match(/^## ST\d+:/) && !line.match(/^### ST\d+\.\d+:/)) {
    newLines.push(line);
  }
  
  i++;
}

// Handle last test case if we're still in one
if (inTestCase && !skipTestCase) {
  // Already handled in loop
}

fs.writeFileSync(FILE, newLines.join('\n'), 'utf8');

const keptCount = Array.from(keepTestCases).length;
console.log(`Kept ${keptCount} state transition test cases out of 53 total.`);
