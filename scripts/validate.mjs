#!/usr/bin/env node
// Structural checks that catch the packaging mistakes this repo is most exposed
// to: a manifest pointing at a skill that does not exist, and raw_source/ drifting
// somewhere it would be auto-registered as 82 of your own skills.

import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from './lib/yaml-lite.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
let failed = 0;
const check = (cond, msg) => {
  process.stdout.write((cond ? '  ok   ' : '  FAIL ') + msg + '\n');
  if (!cond) failed++;
};

const mpPath = path.join(ROOT, '.claude-plugin', 'marketplace.json');
if (!fs.existsSync(mpPath)) {
  // A repo with no marketplace yet is valid, not broken. Only the vendor-side
  // checks below apply.
  process.stdout.write('no .claude-plugin/marketplace.json yet; skipping plugin checks\n');
  check(!fs.existsSync(path.join(ROOT, 'skills')),
    'no top-level skills/ dir (it would swallow raw_source/)');
  process.stdout.write(failed ? '\n' + failed + ' check(s) failed\n' : '\nall checks passed\n');
  process.exit(failed ? 1 : 0);
}

const mp = JSON.parse(fs.readFileSync(mpPath, 'utf8'));
process.stdout.write('marketplace: ' + mp.name + '\n');

for (const p of mp.plugins) {
  const src = path.join(ROOT, p.source);
  check(fs.existsSync(src), 'source dir exists: ' + p.source);
  const pj = path.join(src, '.claude-plugin', 'plugin.json');
  check(fs.existsSync(pj), 'plugin.json exists for ' + p.name);
  if (!fs.existsSync(pj)) continue;

  const d = JSON.parse(fs.readFileSync(pj, 'utf8'));
  check(d.name === p.name, 'plugin.json name matches marketplace entry: ' + d.name);

  for (const s of d.skills ?? []) {
    const sp = path.join(src, s, 'SKILL.md');
    check(fs.existsSync(sp), 'declared skill exists: ' + p.name + ' -> ' + s);
    if (!fs.existsSync(sp)) continue;

    const { data } = parseFrontmatter(fs.readFileSync(sp, 'utf8'));
    check(!!data.name, s + ': has a name');
    check(!!data.description, s + ': has a description (this is what auto-routes)');
    check(['lab', 'core'].includes(data.maturity), s + ': maturity is lab or core');
    check(Array.isArray(data.upstream) && data.upstream.length > 0,
      s + ': declares at least one upstream');
    for (const u of data.upstream ?? []) {
      const [id, sha] = String(u.src ?? '').split('@');
      check(/^[0-9a-f]{7,40}$/.test(sha ?? ''), s + ': ' + id + ' pinned to a real sha');
      check(!!u.took, s + ': ' + id + ' records what it took');
    }

    // supersedes is optional, but a malformed entry silently supersedes nothing
    // and leaves a competing skill installed — the exact outcome it exists to prevent.
    for (const sup of data.supersedes ?? []) {
      check(typeof sup === 'string' && /^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/.test(sup),
        s + ': supersedes entry is <plugin>:<skill> — ' + JSON.stringify(sup));
    }
  }

  // raw_source/ inside a plugin root would ship, and inside skills/ would be
  // auto-registered as dozens of skills that are not ours.
  check(!fs.existsSync(path.join(src, 'vendor')), p.name + ': no raw_source/ inside the plugin root');
}

check(!fs.existsSync(path.join(ROOT, 'skills')),
  'no top-level skills/ dir (it would swallow raw_source/)');

process.stdout.write(failed ? '\n' + failed + ' check(s) failed\n' : '\nall checks passed\n');
process.exit(failed ? 1 : 0);
