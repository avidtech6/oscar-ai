import fs from 'fs';
import path from 'path';

// Simple browser-compatible event emitter
const createEventEmitter = () => ({
  events: {},
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
});

// Process a single file
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Node.js imports
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]fs['"];?/g,
    "import { $1 } from 'fs-browser';"
  );
  
  content = content.replace(
    /import\s+\*\s+as\s+\w+\s+from\s+['"]fs['"];?/g,
    "import * as fs from 'fs-browser';"
  );
  
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]path['"];?/g,
    "import { $1 } from 'path-browser';"
  );
  
  content = content.replace(
    /import\s+\*\s+as\s+\w+\s+from\s+['"]path['"];?/g,
    "import * as path from 'path-browser';"
  );
  
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]events['"];?/g,
    "import { $1 } from 'events-browser';"
  );
  
  content = content.replace(
    /import\s+EventEmitter\s+from\s+['"]events['"];?/g,
    "import { EventEmitter } from 'events-browser';"
  );
  
  content = content.replace(
    /import\s+EventEmitter\s+from\s+['"]\.\.\/events['"];?/g,
    "import { EventEmitter } from './events-browser';"
  );
  
  // Replace file system operations with localStorage
  content = content.replace(/process\.cwd\(\)/g, "'/'");
  
  content = content.replace(
    /join\(([^,]+),\s*['"]workspace['"],\s*['"]([^'"]+)['"]\)/g,
    "'/$2'"
  );
  
  content = content.replace(
    /join\(([^,]+),\s*['"]([^'"]+)['"]\)/g,
    "'/$2'"
  );
  
  content = content.replace(
    /if\s*\(\s*!existsSync\(([^)]+)\)\s*\)\s*\{[^}]*\}/g,
    "if (!localStorage.getItem($1)) {"
  );
  
  content = content.replace(
    /const\s+data\s*=\s*readFileSync\(([^,]+),\s*['"]utf-8['"]\);/g,
    "const data = localStorage.getItem($1) || '[]';"
  );
  
  content = content.replace(
    /writeFileSync\(([^,]+),\s*([^,]+),\s*['"]utf-8['"]\);/g,
    "localStorage.setItem($1, $2);"
  );
  
  // Replace EventEmitter usage
  content = content.replace(
    /private\s+eventEmitter\s*=\s*new\s+EventEmitter\(\);/g,
    "private eventEmitter = createEventEmitter();"
  );
  
  // Add EventEmitter import if needed
  if (content.includes('createEventEmitter') && !content.includes('createEventEmitter =')) {
    content = content.replace(
      /^\/\*\*[\s\S]*?\*\/\s*/gm,
      ""
    );
    content = `// Simple browser-compatible event emitter
const createEventEmitter = () => ({
  events: {},
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
});

${content}`;
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
}

// Process all TypeScript files in the intelligence directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir, { recursive: true });
  
  files.forEach(file => {
    if (file.endsWith('.ts') && !file.includes('node_modules')) {
      const filePath = path.join(dir, file);
      try {
        processFile(filePath);
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    }
  });
}

// Process the intelligence directory
processDirectory('./src/lib/intelligence');

console.log('Browser compatibility fixes completed!');