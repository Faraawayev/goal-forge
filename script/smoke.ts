import fetch from 'node-fetch';

async function run() {
  const base = process.env.BASE_URL || 'http://localhost:5000';
  console.log('Checking health...');
  const h = await fetch(`${base}/api/health`);
  console.log('health', h.status, await h.json().catch(() => null));

  if (process.env.RUN_SEED === '1') {
    console.log('Attempting seed...');
    const s = await fetch(`${base}/api/dev/seed`, { method: 'POST' });
    console.log('seed', s.status, await s.json().catch(() => null));
  }
}

run().catch(err => { console.error(err); process.exit(1); });