const fs = require('fs');
const path = require('path');

const OLD_NAME = 'coo50qxq';
const NEW_NAME = 'coo50qxq';

const targetDirs = [
  path.join(__dirname, '../../src'),
  path.join(__dirname, '../../server')
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

let modifiedCount = 0;

for (const dir of targetDirs) {
  const files = walk(dir);
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(OLD_NAME)) {
      content = content.replace(new RegExp(OLD_NAME, 'g'), NEW_NAME);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated: ${file}`);
      modifiedCount++;
    }
  }
}

console.log(`\nReplaced old cloud name with new cloud name in ${modifiedCount} files.`);
