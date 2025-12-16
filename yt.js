#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];
const args = process.argv.slice(3);
const cliPath = join(__dirname, 'index.js');

if (!command || command === '--help' || command === '-h') {
    spawn('node', [cliPath, 'help'], {
        stdio: 'inherit',
        windowsHide: false
    }).on('exit', (code) => process.exit(code));
} else {
    spawn('node', [cliPath, command, ...args], {
        stdio: 'inherit',
        windowsHide: false
    }).on('exit', (code) => process.exit(code));
}
