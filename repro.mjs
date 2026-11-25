// Starts `vite dev`, makes each step's requests, and prints whether the server logged
// `ssr_fetch_eager` during it and whether `globalThis.fetch` is still the one it started with.
//
//   npm install && node repro.mjs
//   LOG=1 node repro.mjs     also prints what the server logged in each step
import { spawn } from 'node:child_process';

const PORT = 5199;
const dev = spawn(
	process.execPath,
	['node_modules/vite/bin/vite.js', 'dev', '--port', String(PORT), '--strictPort'],
	{ cwd: import.meta.dirname }
);
let log = '';
dev.stdout.on('data', (chunk) => (log += chunk));
dev.stderr.on('data', (chunk) => (log += chunk));
process.on('exit', () => dev.kill());

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const get = (path) => fetch(`http://localhost:${PORT}${path}`).then((res) => res.text());

// Wait for the server, then compile every route once so timing isn't compile time.
for (;;) {
	try {
		await get('/check');
		break;
	} catch {
		await sleep(300);
	}
}
await get('/');
await get('/eager');
await get('/api');
await sleep(1500);

const rows = [];
const logs = [];
async function step(name, run) {
	log = '';
	await run();
	await sleep(500);
	const warned = log.includes('[sveltekit] ssr_fetch_eager');
	logs.push(`# ${name}\n${log.trim()}`);
	rows.push(`| ${name} | ${warned ? '**yes**' : 'no'} | ${await get('/check')} |`);
}

await step('`GET /eager`, a component fetching as it renders', () => get('/eager'));
await step('`GET /api` alone', () => get('/api'));
await step('`GET /api` while `GET /` is rendering', async () => {
	const page = get('/');
	await sleep(500);
	await get('/api');
	await page;
});
await step('two `GET /` overlapping by 1.5 s, no fetch anywhere', async () => {
	const first = get('/');
	await sleep(500);
	await Promise.all([first, get('/')]);
});
await step('`GET /api` alone, nothing rendering', () => get('/api'));
await step('`GET /` alone', () => get('/'));
await step('`GET /api` alone, nothing rendering', () => get('/api'));

console.log('| Step | `ssr_fetch_eager` logged | `globalThis.fetch` after |');
console.log('| --- | --- | --- |');
for (const row of rows) console.log(row);
if (process.env.LOG) console.log(`\n${logs.join('\n\n')}`);
process.exit(0);
