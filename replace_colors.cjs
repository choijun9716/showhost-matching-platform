const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.git')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.endsWith('.jsx') || dirFile.endsWith('.css') || dirFile.endsWith('.js')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Indigo -> White
  content = content.replace(/#818cf8/gi, '#ffffff');
  content = content.replace(/#6366f1/gi, '#ffffff');
  content = content.replace(/rgba\(\s*129\s*,\s*140\s*,\s*248/gi, 'rgba(255, 255, 255');
  content = content.replace(/rgba\(\s*99\s*,\s*102\s*,\s*241/gi, 'rgba(255, 255, 255');

  // Cyan -> Silver/Gray
  content = content.replace(/#38bdf8/gi, '#e5e5e5');
  content = content.replace(/rgba\(\s*56\s*,\s*189\s*,\s*248/gi, 'rgba(229, 229, 229');

  // Specific button gradient in index.css
  content = content.replace(/linear-gradient\(135deg, rgba\(110, 80, 250, 0\.3\) 0%, rgba\(0, 242, 254, 0\.3\) 100%\)/gi, 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)');
  content = content.replace(/rgba\(0, 242, 254, 0\.2\)/gi, 'rgba(255, 255, 255, 0.1)');

  // Fix text-gradient-cyan definition in index.css just in case
  content = content.replace(/text-gradient-cyan/gi, 'text-gradient-primary');

  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
  }
});
