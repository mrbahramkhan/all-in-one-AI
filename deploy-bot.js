#!/usr/bin/env node

/**
 * ALL-IN-ONE AI — Auto Deploy Bot
 * 
 * Yeh bot automatically:
 * 1. Project check karta hai
 * 2. Git repo initialize karta hai
 * 3. GitHub pe push karta hai
 * 4. Railway CLI se backend deploy karta hai
 * 5. Vercel CLI se frontend deploy karta hai
 * 6. URLs test karta hai
 * 
 * Usage: node deploy-bot.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─── Colors ───────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

const ok   = (msg) => console.log(`${C.green}  ✅  ${msg}${C.reset}`);
const fail = (msg) => console.log(`${C.red}  ❌  ${msg}${C.reset}`);
const info = (msg) => console.log(`${C.yellow}  ⏳  ${msg}${C.reset}`);
const step = (n, msg) => console.log(`\n${C.cyan}${C.bold}  ── STEP ${n}: ${msg}${C.reset}\n`);
const note = (msg) => console.log(`${C.dim}      ${msg}${C.reset}`);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(`  ${C.white}${q}${C.reset} `, resolve));

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: opts.silent ? 'pipe' : 'inherit', ...opts });
  } catch (e) {
    if (!opts.ignoreError) throw e;
    return '';
  }
}

function commandExists(cmd) {
  try { execSync(`where ${cmd} 2>nul || which ${cmd} 2>/dev/null`, { stdio: 'pipe' }); return true; }
  catch { return false; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.clear();
  console.log(`${C.cyan}${C.bold}`);
  console.log('  ╔══════════════════════════════════════════════════════════╗');
  console.log('  ║      ALL-IN-ONE AI — Auto Deploy Bot                    ║');
  console.log('  ║      GitHub → Railway → Vercel → Live!                  ║');
  console.log('  ╚══════════════════════════════════════════════════════════╝');
  console.log(`${C.reset}\n`);

  // ─── Step 1: Prerequisites ──────────────────────────────────────
  step(1, 'Prerequisites Check');

  const checks = [
    { cmd: 'node', label: 'Node.js', install: 'https://nodejs.org' },
    { cmd: 'git', label: 'Git', install: 'https://git-scm.com' },
    { cmd: 'npm', label: 'npm', install: 'https://nodejs.org' },
  ];

  let prereqOk = true;
  for (const c of checks) {
    if (commandExists(c.cmd)) {
      const ver = run(`${c.cmd} --version`, { silent: true }).trim();
      ok(`${c.label} found: ${ver}`);
    } else {
      fail(`${c.label} nahi mila — ${c.install} se install karo`);
      prereqOk = false;
    }
  }
  if (!prereqOk) { console.log('\n  Prerequisites missing. Install karo aur dobara chalao.\n'); rl.close(); return; }

  // Railway CLI check/install
  if (!commandExists('railway')) {
    info('Railway CLI install ho raha hai...');
    run('npm install -g @railway/cli', { ignoreError: true });
    if (commandExists('railway')) ok('Railway CLI install ho gaya');
    else { fail('Railway CLI install nahi hua — manually: npm install -g @railway/cli'); }
  } else ok('Railway CLI mila');

  // Vercel CLI check/install
  if (!commandExists('vercel')) {
    info('Vercel CLI install ho raha hai...');
    run('npm install -g vercel', { ignoreError: true });
    if (commandExists('vercel')) ok('Vercel CLI install ho gaya');
    else { fail('Vercel CLI install nahi hua — manually: npm install -g vercel'); }
  } else ok('Vercel CLI mila');

  // ─── Step 2: Project Check ───────────────────────────────────────
  step(2, 'Project Folder Check');

  let projectRoot = process.cwd();
  if (!fs.existsSync(path.join(projectRoot, 'backend', 'src', 'index.js'))) {
    if (fs.existsSync(path.join(projectRoot, '..', 'backend', 'src', 'index.js'))) {
      projectRoot = path.resolve(projectRoot, '..');
      process.chdir(projectRoot);
    } else {
      fail('Project folder nahi mila!');
      note('all-in-one-ai-deploy folder ke andar se yeh script chalao:');
      note('cd all-in-one-ai-deploy && node deploy-bot.js');
      rl.close(); return;
    }
  }
  ok(`Project folder: ${projectRoot}`);

  // ─── Step 3: Collect Info ───────────────────────────────────────
  step(3, 'Configuration');

  console.log('  Kuch information chahiye deploy karne ke liye:\n');

  const githubUser = await ask('GitHub username kya hai? ');
  const repoName = await ask('GitHub repo name? (default: all-in-one-ai) ') || 'all-in-one-ai';
  const openaiKey = await ask('OpenAI API Key (sk-...): ');
  const anthropicKey = await ask('Anthropic API Key (sk-ant-...) [Enter to skip]: ');
  const jwtSecret = require('crypto').randomBytes(32).toString('hex');

  console.log('');
  ok('Configuration ready');
  note(`JWT Secret auto-generated: ${jwtSecret.slice(0, 8)}...`);

  // ─── Step 4: .env Update ─────────────────────────────────────────
  step(4, '.env File Update');

  const envPath = path.join(projectRoot, '.env');
  let envContent = fs.existsSync(path.join(projectRoot, '.env.example'))
    ? fs.readFileSync(path.join(projectRoot, '.env.example'), 'utf8')
    : '';

  envContent = envContent
    .replace(/OPENAI_API_KEY=.*/,    `OPENAI_API_KEY=${openaiKey}`)
    .replace(/ANTHROPIC_API_KEY=.*/, `ANTHROPIC_API_KEY=${anthropicKey || ''}`)
    .replace(/JWT_SECRET=.*/,        `JWT_SECRET=${jwtSecret}`)
    .replace(/JWT_REFRESH_SECRET=.*/, `JWT_REFRESH_SECRET=${require('crypto').randomBytes(32).toString('hex')}`)
    .replace(/NODE_ENV=.*/,          'NODE_ENV=production');

  fs.writeFileSync(envPath, envContent);
  ok('.env file updated');

  // ─── Step 5: Git Setup ───────────────────────────────────────────
  step(5, 'Git Repository Setup');

  if (!fs.existsSync(path.join(projectRoot, '.git'))) {
    info('Git repository initialize ho raha hai...');
    run('git init');
    run('git branch -M main', { ignoreError: true });
    ok('Git initialized');
  } else {
    ok('Git already initialized');
  }

  // .gitignore
  const gitignore = `node_modules/\n.env\n.next/\ndist/\n*.log\n.DS_Store\n`;
  fs.writeFileSync(path.join(projectRoot, '.gitignore'), gitignore);

  run('git add .');
  run('git commit -m "Initial commit - All-In-One AI deploy"', { ignoreError: true });
  ok('Code committed');

  // ─── Step 6: GitHub Push ──────────────────────────────────────────
  step(6, 'GitHub Push');

  const repoUrl = `https://github.com/${githubUser}/${repoName}.git`;
  
  console.log(`  ${C.yellow}GitHub pe yeh repo banao:${C.reset}`);
  console.log(`  ${C.cyan}https://github.com/new${C.reset}\n`);
  console.log(`  Repo name: ${C.white}${repoName}${C.reset} (Public ya Private dono theek hain)\n`);
  
  await ask('Repo banana ke baad Enter dabao...');

  try {
    run(`git remote remove origin`, { ignoreError: true });
    run(`git remote add origin ${repoUrl}`);
    info('GitHub pe push ho raha hai...');
    run('git push -u origin main');
    ok(`GitHub pe push ho gaya: ${repoUrl}`);
  } catch (e) {
    fail('GitHub push fail — check karo:');
    note('1. GitHub repo actually bana hua hai?');
    note('2. Username/password theek hai?');
    note(`3. URL: ${repoUrl}`);
    const cont = await ask('Continue karna chahte ho? (y/n): ');
    if (cont.toLowerCase() !== 'y') { rl.close(); return; }
  }

  // ─── Step 7: Railway Deploy ───────────────────────────────────────
  step(7, 'Railway Deploy (Backend API)');

  console.log(`  ${C.yellow}Railway Deploy Steps:${C.reset}\n`);
  console.log(`  1. ${C.cyan}https://railway.app${C.reset} kholо`);
  console.log(`  2. "Start a New Project" → "Deploy from GitHub"`);
  console.log(`  3. ${C.white}${githubUser}/${repoName}${C.reset} select karo`);
  console.log(`  4. Root Directory: ${C.white}backend${C.reset} set karo`);
  console.log(`  5. Variables tab mein yeh paste karo:\n`);

  const envVars = [
    `NODE_ENV=production`,
    `OPENAI_API_KEY=${openaiKey}`,
    anthropicKey ? `ANTHROPIC_API_KEY=${anthropicKey}` : '',
    `JWT_SECRET=${jwtSecret}`,
  ].filter(Boolean);

  console.log(`${C.dim}  ┌─────────────────────────────────────────┐`);
  envVars.forEach(v => console.log(`  │ ${v.slice(0, 45).padEnd(44)}│`));
  console.log(`  └─────────────────────────────────────────┘${C.reset}\n`);

  // Try Railway CLI
  try {
    info('Railway CLI login ho raha hai...');
    run('railway login --browserless', { stdio: 'inherit' });
    ok('Railway login hua');

    info('Railway project create ho raha hai...');
    run('railway init', { stdio: 'inherit' });

    // Set env vars via CLI
    for (const envVar of envVars) {
      const [key, val] = envVar.split('=');
      if (key && val) {
        run(`railway variables set ${key}="${val}"`, { ignoreError: true, stdio: 'pipe' });
      }
    }
    ok('Environment variables set');

    info('Backend deploy ho raha hai (3-5 min lagenge)...');
    process.chdir(path.join(projectRoot, 'backend'));
    run('railway up', { stdio: 'inherit' });
    process.chdir(projectRoot);

    const railwayUrl = run('railway domain', { silent: true, ignoreError: true }).trim();
    if (railwayUrl) {
      ok(`Backend live: https://${railwayUrl}`);
      global.railwayUrl = `https://${railwayUrl}`;
    }
  } catch (e) {
    info('Railway CLI se deploy nahi hua — manually karo upar wale steps se');
  }

  const manualRailwayUrl = await ask('\nRailway URL kya mila? (https://xxx.up.railway.app): ');
  if (manualRailwayUrl.trim()) global.railwayUrl = manualRailwayUrl.trim();

  // Test backend
  if (global.railwayUrl) {
    info('Backend test ho raha hai...');
    await sleep(3000);
    try {
      const https = require('https');
      const testUrl = `${global.railwayUrl}/api/v1/health`;
      const result = await new Promise((resolve, reject) => {
        https.get(testUrl, (res) => {
          let data = '';
          res.on('data', d => data += d);
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });
      const parsed = JSON.parse(result);
      if (parsed.status === 'ok') ok(`Backend health check passed!`);
      else info('Backend chal raha hai lekin health check alag response diya');
    } catch { info('Backend test nahi hua — shayad ab bhi deploy ho raha hai'); }
  }

  // ─── Step 8: Vercel Deploy ─────────────────────────────────────────
  step(8, 'Vercel Deploy (Frontend)');

  const frontendDir = path.join(projectRoot, 'frontend', 'web');
  if (!fs.existsSync(frontendDir)) {
    info('Frontend directory nahi mila — skip kar raha hai');
  } else {
    process.chdir(frontendDir);

    // Update API URL in frontend
    const envLocalPath = path.join(frontendDir, '.env.local');
    const frontendEnv = `NEXT_PUBLIC_API_URL=${global.railwayUrl || 'https://your-api.up.railway.app'}\n`;
    fs.writeFileSync(envLocalPath, frontendEnv);
    ok('.env.local updated with Railway URL');

    try {
      info('Vercel login ho raha hai...');
      run('vercel login', { stdio: 'inherit' });
      ok('Vercel login hua');

      info('Frontend deploy ho raha hai...');
      run(`vercel --yes --env NEXT_PUBLIC_API_URL="${global.railwayUrl || ''}"`, { stdio: 'inherit' });

      const vercelUrl = run('vercel ls --json', { silent: true, ignoreError: true });
      ok('Frontend deploy ho gaya!');
    } catch (e) {
      info('Vercel CLI se deploy nahi hua — manually karo:');
      note('1. vercel.com kholо → New Project');
      note(`2. ${githubUser}/${repoName} import karo`);
      note('3. Root Directory: frontend/web');
      note(`4. NEXT_PUBLIC_API_URL=${global.railwayUrl || 'railway-url-yahan'}`);
    }

    process.chdir(projectRoot);
  }

  const vercelUrl = await ask('\nVercel URL kya mila? (https://xxx.vercel.app): ');

  // ─── Step 9: Final Update ──────────────────────────────────────────
  step(9, 'Final Configuration');

  if (vercelUrl && global.railwayUrl) {
    info('FRONTEND_URL Railway pe update ho rahi hai...');
    try {
      run(`railway variables set FRONTEND_URL="${vercelUrl.trim()}"`, { ignoreError: true, stdio: 'pipe' });
      ok('FRONTEND_URL updated');
    } catch { info('Manually Railway pe FRONTEND_URL set karo: ' + vercelUrl.trim()); }
  }

  // ─── Done! ─────────────────────────────────────────────────────────
  console.log('\n');
  console.log(`${C.green}${C.bold}`);
  console.log('  ╔══════════════════════════════════════════════════════════╗');
  console.log('  ║         ALL-IN-ONE AI — ONLINE HAI!  🚀                ║');
  console.log('  ╠══════════════════════════════════════════════════════════╣');
  if (vercelUrl)         console.log(`  ║   Frontend:  ${(vercelUrl.trim()).padEnd(42)} ║`);
  if (global.railwayUrl) console.log(`  ║   Backend:   ${(global.railwayUrl).padEnd(42)} ║`);
  console.log('  ║                                                          ║');
  console.log('  ║   Demo Login:                                            ║');
  console.log('  ║   demo@allinone.ai  / Demo@123456                        ║');
  console.log('  ║   admin@allinone.ai / Admin@123456                       ║');
  console.log('  ║                                                          ║');
  console.log('  ║   Ab Stripe setup karo paise kamane ke liye!            ║');
  console.log('  ╚══════════════════════════════════════════════════════════╝');
  console.log(`${C.reset}\n`);

  // Save deployment info
  const deployInfo = {
    deployedAt: new Date().toISOString(),
    frontend: vercelUrl?.trim() || null,
    backend: global.railwayUrl || null,
    github: `https://github.com/${githubUser}/${repoName}`,
    nextSteps: [
      'stripe.com pe account banao',
      'Products banao: Starter $19, Pro $49, Business $149',
      'STRIPE_SECRET_KEY Railway pe add karo',
      'Product Hunt pe launch karo',
      'Reddit/Twitter pe share karo',
    ]
  };
  fs.writeFileSync(path.join(projectRoot, 'deployment-info.json'), JSON.stringify(deployInfo, null, 2));
  ok('Deployment info saved: deployment-info.json');

  rl.close();
}

main().catch(e => {
  console.error(`\n${C.red}  Error: ${e.message}${C.reset}\n`);
  process.exit(1);
});
