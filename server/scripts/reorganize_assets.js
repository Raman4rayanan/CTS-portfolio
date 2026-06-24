const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../../PUBLIC');
const portDir = path.join(publicDir, 'port');
const ecommDir = path.join(publicDir, 'ecomm');
const adminDir = path.join(publicDir, 'admin');

// Create directories if they don't exist
[portDir, ecommDir, adminDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Read files from PUBLIC
const files = fs.readdirSync(publicDir);

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  const stat = fs.statSync(filePath);

  if (stat.isFile()) {
    let destDir;
    if (file === 'logo.png' || file === 'favicon.svg' || file === 'icons.svg') {
      destDir = adminDir;
    } else if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      destDir = portDir;
    }

    if (destDir) {
      const destPath = path.join(destDir, file);
      fs.renameSync(filePath, destPath);
      console.log(`Moved ${file} -> ${path.relative(publicDir, destPath)}`);
    }
  }
});

console.log('Reorganization complete!');
