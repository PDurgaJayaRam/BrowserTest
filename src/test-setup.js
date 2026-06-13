/**
 * Setup verification script
 */

console.log('🧪 Verifying scraper setup...\n');

// Check Node version
console.log(`✅ Node.js version: ${process.version}`);

// Check for required environment variables
const required = ['NVIDIA_NIM_API_KEY', 'NVIDIA_NIM_BASE_URL', 'NVIDIA_NIM_MODEL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.log('⚠️ Missing environment variables:', missing);
  console.log('💡 Copy .env.example to .env and add your NVIDIA NIM API key');
} else {
  console.log('✅ All environment variables configured');
}

console.log('\n📦 Installing dependencies (required for Puppeteer)...');
console.log('💡 Run: npm install');

console.log('\n🚀 Starting server: npm run dev');
console.log('📝 API will be available at http://localhost:10000');

process.exit(0);