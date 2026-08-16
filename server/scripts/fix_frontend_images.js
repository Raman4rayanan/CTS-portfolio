const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'coo50qxq',
  api_key: '624219237837967',
  api_secret: 'm_sTF118dCeuB6daNzbt0TjD_tw'
});

const uploadPreset = 'CTS_preset';

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

const urlCache = {};

async function uploadAndReplace(file) {
  let content = fs.readFileSync(file, 'utf8');
  const regex = /https:\/\/res\.cloudinary\.com\/coo50qxq\/image\/upload\/([^'"\s)]+)/g;
  
  let matches = [...content.matchAll(regex)];
  if (matches.length === 0) return false;

  let modified = false;

  for (const match of matches) {
    const brokenUrl = match[0];
    
    // If the URL already looks like a properly generated one from the new account (e.g. has samples/ecommerce or doesn't have v178...), we might want to skip, 
    // but honestly the easiest way to identify broken ones is if they still have the old folder structures like /port/ or /ecomm/placeholder
    if (!brokenUrl.includes('/port/') && !brokenUrl.includes('/ecomm/')) {
        continue; // Probably a genuinely new URL
    }

    // Reconstruct the OLD working URL
    const oldWorkingUrl = brokenUrl.replace('coo50qxq', 'dzfuhxr2z').replace('f_auto,q_auto/', '');

    let newValidUrl = urlCache[oldWorkingUrl];

    if (!newValidUrl) {
      try {
        console.log(`Uploading fallback: ${oldWorkingUrl}`);
        const result = await cloudinary.uploader.upload(oldWorkingUrl, {
          upload_preset: uploadPreset
        });
        newValidUrl = result.secure_url;
        urlCache[oldWorkingUrl] = newValidUrl;
      } catch (err) {
        console.error(`Failed to upload ${oldWorkingUrl}: ${err.message}`);
        continue;
      }
    }

    if (newValidUrl) {
      // Replace exactly the broken URL string with the new valid URL
      content = content.split(brokenUrl).join(newValidUrl);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed hardcoded URLs in: ${file}`);
  }
  return modified;
}

async function run() {
  console.log("Starting hardcoded URL fix...");
  let totalFixed = 0;
  for (const dir of targetDirs) {
    const files = walk(dir);
    for (const file of files) {
      const fixed = await uploadAndReplace(file);
      if (fixed) totalFixed++;
    }
  }
  console.log(`\nFinished! Fixed URLs in ${totalFixed} files.`);
}

run();
