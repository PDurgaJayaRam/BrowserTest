import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('📦 Building for Alibaba Cloud deployment...');

// Create dist directory
const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy source files
const srcDir = path.join(process.cwd(), 'src');
const files = fs.readdirSync(srcDir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    fs.copyFileSync(
      path.join(srcDir, file),
      path.join(distDir, file)
    );
  }
});

// Copy package files
fs.copyFileSync(
  path.join(process.cwd(), 'package.json'),
  path.join(distDir, 'package.json')
);

console.log('✅ Build complete!');
console.log('📁 Ready for deployment in /dist');