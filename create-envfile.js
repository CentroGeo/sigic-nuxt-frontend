#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function randomString(len = 32) {
  return crypto.randomBytes(len).toString('hex').slice(0, len);
}

const argv = yargs(hideBin(process.argv))
  .option('sample', {
    alias: 's',
    type: 'string',
    default: path.join(__dirname, '.env.sample'),
    describe: 'Archivo .env.sample base',
  })
  .option('file', {
    alias: 'f',
    type: 'string',
    describe: 'Archivo JSON con los valores a reemplazar',
  })
  .help()
  .parse();

if (!fs.existsSync(argv.sample)) {
  console.error(`❌ No existe ${argv.sample}`);
  process.exit(1);
}

let template = fs.readFileSync(argv.sample, 'utf8');
let config = {};

if (argv.file && fs.existsSync(argv.file)) {
  config = JSON.parse(fs.readFileSync(argv.file, 'utf8'));
}

for (const [key, value] of Object.entries(config)) {
  const re = new RegExp(`\\{${key}\\}`, 'g');
  const replacement = value !== undefined && value !== null ? String(value) : randomString(15);
  template = template.replace(re, replacement);
}

fs.writeFileSync(path.join(__dirname, '.env'), template, 'utf8');
