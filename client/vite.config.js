import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read backend port from server/.env if it exists
let serverPort = 5000;
try {
  const envPath = path.resolve(__dirname, '../server/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const portMatch = envContent.match(/^PORT\s*=\s*(\d+)/m);
    if (portMatch) {
      serverPort = portMatch[1];
    }
  }
} catch (err) {
  console.log('Could not read server/.env, using default port 5000');
}
console.log('Vite proxy target port:', serverPort);


export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${serverPort}`,
        changeOrigin: true,
      },
      '/socket.io': {
        target: `http://127.0.0.1:${serverPort}`,
        ws: true,
      }
    }
  }

});
