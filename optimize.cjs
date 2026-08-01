const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.jsx', 'utf8');

// Insert import at top
if (!content.includes('optimizeCloudinaryUrl')) {
  content = content.replace(/import React/g, "import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';\nimport React");
}

// Replace .images?.[0] in src attributes
content = content.replace(/src=\{([a-zA-Z]+)\.images\?\.\[0\]([^}]*)\}/g, 'src={optimizeCloudinaryUrl($1.images?.[0])$2}');

// Replace map img src
content = content.replace(/src=\{img\}/g, 'src={optimizeCloudinaryUrl(img)}');

fs.writeFileSync('src/components/AdminPanel.jsx', content);
console.log('AdminPanel images optimized!');
