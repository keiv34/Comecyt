const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'RedesSociales');
const targetDir = path.join(root, 'src');

function walk(dir) {
  let files = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files = files.concat(walk(full));
    } else if (full.endsWith('.js') || full.endsWith('.jsx') || full.endsWith('.ts') || full.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(targetDir);
let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes('http://localhost:4000')) {
    const newText = text.split('http://localhost:4000').join('');
    fs.writeFileSync(file, newText, 'utf8');
    console.log('Patched:', path.relative(process.cwd(), file));
    changed++;
  }
}
console.log('Done. Files changed:', changed);
