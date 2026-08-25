import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const dbPlugin = () => ({
  name: 'db-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/db') {
        const dbPath = path.resolve(__dirname, 'db.json');
        if (req.method === 'GET') {
          const data = fs.readFileSync(dbPath, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
          return;
        }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            // Write to db.json with formatting
            const parsed = JSON.parse(body);
            fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          });
          return;
        }
      }
      next();
    });
  }
});

export default defineConfig({
    server: {
        port: 3000,
        host: '0.0.0.0',
        watch: {
            ignored: ['**/db.json']
        }
    },
    plugins: [react(), dbPlugin()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        }
    }
});
