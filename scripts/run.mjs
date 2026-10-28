import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createApp } from '../app/server.mjs';

const wrongTotal = process.argv.includes('--wrong-total');
const reportRoot = wrongTotal ? 'reports/deliberate-failure' : 'reports/baseline';
await mkdir(reportRoot, { recursive: true });
const summaries = [];

async function runFolder(folder, slug, extra = []) {
  await rm(`${reportRoot}/${slug}.json`, { force: true });
  const app = createApp();
  app.listen(0, '127.0.0.1');
  await once(app, 'listening');
  const baseUrl = `http://127.0.0.1:${app.address().port}`;
  console.log(`\n${folder}: isolated teaching API at ${baseUrl}`);
  const args = [
    'node_modules/postman-cli/bin/postman.js', 'collection', 'run',
    'postman/orders.postman_collection.json',
    '-e', 'postman/local.postman_environment.json', '-i', folder,
    '--env-var', `baseUrl=${baseUrl}`,
    '--env-var', `expectedTotalCents=${wrongTotal ? 2599 : 2598}`,
    '--timeout', '60000', '--timeout-request', '5000', '--timeout-script', '5000',
    '--no-report-events', '--reporters', 'cli,json,junit',
    '--reporter-json-export', `${reportRoot}/${slug}.json`,
    '--reporter-junit-export', `${reportRoot}/${slug}.xml`, ...extra,
  ];
  // Spawn asynchronously so this process can serve HTTP while the CLI runs.
  // No shell: arguments containing spaces remain arguments on Windows and Linux.
  const env = { ...process.env };
  delete env.POSTMAN_API_KEY;
  const child = spawn(process.execPath, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', chunk => { output += chunk; process.stdout.write(chunk); });
  }
  try {
    const [code, signal] = await once(child, 'close');
    await writeFile(`${reportRoot}/${slug}.log`, output);
    if (signal) throw new Error(`CLI interrupted by ${signal}`);
    const report = JSON.parse(await readFile(`${reportRoot}/${slug}.json`, 'utf8'));
    const summary = report.run.summary;
    if (!summary.tests.executed || !summary.executedRequests.executed) {
      throw new Error(`No tests or requests executed for ${folder}`);
    }
    summaries.push({ folder, ...summary, durationMs: report.run.meta.duration });
    return code ?? 1;
  } finally {
    app.closeAllConnections();
    await new Promise(resolve => app.close(resolve));
  }
}

let failed = false;
for (const [folder, slug, extra] of [
  ['Lifecycle', 'lifecycle', []],
  ['Quantity boundaries', 'quantity-boundaries', ['--iteration-data', 'postman/quantity-cases.json']],
]) {
  if (wrongTotal && slug !== 'lifecycle') continue;
  const code = await runFolder(folder, slug, extra);
  failed ||= code !== 0;
}
await writeFile(`${reportRoot}/summary.json`, JSON.stringify(summaries, null, 2) + '\n');
process.exitCode = failed ? 1 : 0;
