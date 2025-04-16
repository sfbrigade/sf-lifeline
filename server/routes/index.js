import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readIndexFile () {
  const filePath = path.join(__dirname, '../../client/dist', 'index.html');
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, { encoding: 'utf8' });
  }
  return '';
}
const HTML = readIndexFile();

export default async function (fastify, _opts) {
  // catch-all route serves single-page app
  fastify.get('*', async function (_request, reply) {
    const env = {};
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('VITE_')) {
        env[key] = process.env[key];
      }
    });
    reply.header('Content-Type', 'text/html');
    reply.send(
      HTML.replace('window.env = null;', `window.env=${JSON.stringify(env)};`)
    );
  });
}
