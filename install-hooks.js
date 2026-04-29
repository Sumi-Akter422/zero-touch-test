#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
//  Zero Touch — install-hooks.js
//  Run once: node install-hooks.js
// ─────────────────────────────────────────────────────────────

const fs      = require("fs");
const path    = require("path");
const { execSync } = require("child_process");

const IS_WINDOWS = process.platform === "win32";

// ── ANSI colors ───────────────────────────────────────────────
const C = {
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
};

const log = {
  info:    (msg) => console.log(`  ${C.cyan("i")}  ${msg}`),
  success: (msg) => console.log(`  ${C.green("v")}  ${msg}`),
  warn:    (msg) => console.log(`  ${C.yellow("!")}  ${msg}`),
  error:   (msg) => console.log(`  ${C.red("x")}  ${msg}`),
};

// ── Banner ────────────────────────────────────────────────────
console.log("");
console.log(C.cyan(C.bold("  +==========================================+")));
console.log(C.cyan(C.bold("  |   Zero Touch -- Git Hooks Installer      |")));
console.log(C.cyan(C.bold("  +==========================================+")));
console.log("");

// ── Paths ─────────────────────────────────────────────────────
const ROOT      = process.cwd();
const HOOKS_SRC = path.join(ROOT, ".hooks");
const GIT_HOOKS = path.join(ROOT, ".git", "hooks");

// ── Validation ────────────────────────────────────────────────
if (!fs.existsSync(path.join(ROOT, ".git"))) {
  log.error("Not a git repository. Run 'git init' first.");
  process.exit(1);
}

if (!fs.existsSync(HOOKS_SRC)) {
  log.error(".hooks/ folder not found in project root.");
  process.exit(1);
}

if (!fs.existsSync(GIT_HOOKS)) {
  fs.mkdirSync(GIT_HOOKS, { recursive: true });
}

// ── Install ───────────────────────────────────────────────────
const HOOKS = ["commit-msg", "pre-push"];
let installed = 0;
let skipped   = 0;

console.log(C.bold("  Installing hooks...\n"));

for (const hook of HOOKS) {
  const src  = path.join(HOOKS_SRC, hook);
  const dest = path.join(GIT_HOOKS, hook);

  if (!fs.existsSync(src)) {
    log.warn(`${hook} -- source not found, skipping`);
    skipped++;
    continue;
  }

  // Backup existing hook
  if (fs.existsSync(dest)) {
    const backup = `${dest}.backup-${Date.now()}`;
    fs.copyFileSync(dest, backup);
    log.warn(`${hook} -- existing hook backed up`);
  }

  // Copy file
  fs.copyFileSync(src, dest);

  // Make executable via bash (works on MINGW64 / Git Bash)
  try {
    execSync(`bash -c "chmod +x '${dest.replace(/\\/g, "/")}'"`);
    log.success(`${C.bold(hook)} -- installed + executable`);
  } catch (_) {
    // fallback: node chmod
    try {
      const mode = fs.statSync(dest).mode;
      fs.chmodSync(dest, mode | 0o111);
      log.success(`${C.bold(hook)} -- installed`);
    } catch (__) {
      log.warn(`${hook} -- installed but could not set executable bit`);
    }
  }

  installed++;
}

// ── Git config: ensure hooks path ────────────────────────────
try {
  execSync(`git config core.hooksPath .git/hooks`, { cwd: ROOT, stdio: "ignore" });
  execSync(`git config core.fileMode false`, { cwd: ROOT, stdio: "ignore" });
} catch (_) {}

// ── Verify ────────────────────────────────────────────────────
console.log("");
console.log(C.bold("  Verification:\n"));

for (const hook of HOOKS) {
  const dest = path.join(GIT_HOOKS, hook);
  if (fs.existsSync(dest)) {
    log.success(`${hook} -- file exists`);
  } else {
    log.error(`${hook} -- file missing!`);
  }
}

// ── Server check ──────────────────────────────────────────────
console.log("");
console.log(C.bold("  Server connection check...\n"));

const http = require("http");

const req = http.get("http://localhost:3001/health", (res) => {
  if (res.statusCode === 200) {
    log.success(`Zero Touch server online -- ${C.cyan("http://localhost:3001")}`);
  } else {
    log.warn(`Server responded with status ${res.statusCode}`);
  }
  finish();
});

req.on("error", () => {
  log.warn("Server offline -- AI suggestion will use fallback mode");
  finish();
});

req.setTimeout(3000, () => {
  req.destroy();
  log.warn("Server timeout -- AI suggestion will use fallback mode");
  finish();
});

// ── Summary ───────────────────────────────────────────────────
function finish() {
  console.log("");
  console.log(C.cyan(C.bold("  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")));

  if (installed > 0) {
    console.log(C.green(C.bold(`  [OK] ${installed} hook(s) installed successfully!`)));
    console.log("");
    console.log(`  ${C.bold("Active hooks:")}`);
    console.log(`  ${C.cyan("->")} commit-msg   ${C.yellow("validates: SBC-001: description")}`);
    console.log(`  ${C.cyan("->")} pre-push     ${C.yellow("blocks: bad branch names + .env files")}`);
    console.log("");
    console.log(`  ${C.bold("Commit format:")}  ${C.green("SBC-001: description")}`);
    console.log(`  ${C.bold("Branch format:")}  ${C.green("SBC-001-stage")}  /  ${C.green("SBC-001-release")}`);
    console.log("");
    console.log(`  ${C.yellow("Note: Use Git Bash to commit/push so hooks run correctly.")}`);
  } else {
    console.log(C.red(C.bold("  [FAIL] No hooks were installed. Check errors above.")));
  }

  console.log(C.cyan(C.bold("  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")));
  console.log("");
}
