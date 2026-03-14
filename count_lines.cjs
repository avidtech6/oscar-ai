const fs = require('fs');
const path = require('path');

function walk(dir, extensions) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(full, extensions));
        } else {
            if (extensions.some(ext => full.endsWith(ext))) {
                results.push(full);
            }
        }
    });
    return results;
}

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte'];
const files = walk('src', extensions);
const oversized = [];
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n').length;
    if (lines > 300) {
        oversized.push({ file, lines });
    }
});

console.log('Files over 300 lines:');
oversized.forEach(({ file, lines }) => {
    console.log(`${file}: ${lines} lines`);
});