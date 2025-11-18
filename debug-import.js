// Debug import.meta.url condition
console.log('🔍 Debugging import condition...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);
console.log('process.argv[1] normalized:', process.argv[1].replace(/\\/g, '/'));
console.log('Expected match:', `file://${process.argv[1].replace(/\\/g, '/')}`);
console.log('Condition result:', import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`);

// Alternative approach for ES modules
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('__filename:', __filename);
console.log('Current script being executed:', process.argv[1]);
console.log('Are they equal?', __filename === process.argv[1]);

// This is the proper way to check if running directly
if (import.meta.url.startsWith('file:') && process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
    console.log('✅ This script is being run directly!');
} else {
    console.log('❌ This script is being imported or condition failed');
}