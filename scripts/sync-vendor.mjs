#!/usr/bin/env node
// Fetch, prune and commit upstream skills into raw_source/, rebuild the mechanical
// catalog index, and report drift.
//
//   node scripts/sync-vendor.mjs [--check]
//
// --check writes nothing and exits 1 if anything DECLARED has drifted. That is
// what CI runs. Curation (status/reason) in catalog/index.json is preserved
// across runs: it is authored data, not derived data.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseYaml, parseFrontmatter } from './lib/yaml-lite.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW = path.join(ROOT, 'raw_source');
const INDEX = path.join(ROOT, 'catalog', 'index.json');
const CARDS = path.join(ROOT, 'catalog', 'cards');
// --upstream resolves each source's branch HEAD instead of the pinned ref, to
// answer the question CI actually asks: has upstream moved past our pin in a
// way that touches something we declare? Implies --check (never writes).
const UPSTREAM = process.argv.includes('--upstream');
const CHECK = UPSTREAM || process.argv.includes('--check');

function resolveHead(repo) {
  const out = execFileSync('bash', ['-c',
    'curl -sfL https://api.github.com/repos/' + repo + '/commits/HEAD' +
    ' -H "Accept: application/vnd.github.sha"' +
    (process.env.GITHUB_TOKEN ? ' -H "Authorization: Bearer $GITHUB_TOKEN"' : ''),
  ], { encoding: 'utf8' }).trim();
  if (!/^[0-9a-f]{40}$/.test(out)) throw new Error('could not resolve HEAD for ' + repo + ': ' + out);
  return out;
}

const PLUGINS = ['stack-hub-core', 'stack-hub-lab', 'stack-hub-playbooks'];

// A sha is always a string. yaml-lite numifies all-digit scalars, and a falsy
// 0 would silently disable the drift check for that declaration.
const shaStr = (v) => (v == null ? '' : String(v).trim());

function globToRe(g) {
  let out = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*' && g[i + 2] === '/') { out += '(?:.*/)?'; i += 2; }
      else if (g[i + 1] === '*') { out += '.*'; i += 1; }
      else out += '[^/]*';
    } else if (c === '?') {
      out += '[^/]';
    } else if ('.+^${}()|[]\\'.includes(c)) {
      out += '\\' + c;
    } else {
      out += c;
    }
  }
  return new RegExp('^' + out + '$');
}

// git's own object id, so a vendored file's sha is directly comparable to what
// `git ls-tree` reports upstream.
const gitBlobSha = (buf) =>
  createHash('sha1').update('blob ' + buf.length + '\0').update(buf).digest('hex');

const walk = (dir, base = dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p, base) : [path.relative(base, p)];
  });

function fetchSource(name, src, tmp) {
  const dest = path.join(tmp, name);
  fs.mkdirSync(dest, { recursive: true });
  const url = 'https://codeload.github.com/' + src.repo + '/tar.gz/' + src.ref;
  execFileSync('bash', ['-c',
    'curl -sfL ' + JSON.stringify(url) + ' | tar -xz -C ' + JSON.stringify(dest) + ' --strip-components=1',
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
  return dest;
}

function build() {
  const cfg = parseYaml(fs.readFileSync(path.join(ROOT, 'sources.yaml'), 'utf8'));
  const keep = (cfg.prune?.keep ?? []).map(globToRe);
  const drop = (cfg.prune?.drop ?? []).map(globToRe);

  // Curation is authored in catalog/exclusions.yaml. catalog/index.json is
  // derived and disposable — never read curation back out of it.
  const exPath = path.join(ROOT, 'catalog', 'exclusions.yaml');
  const excluded = fs.existsSync(exPath)
    ? (parseYaml(fs.readFileSync(exPath, 'utf8')).exclude ?? {})
    : {};

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stack-hub-'));
  const entries = [];
  const sourcesOut = {};

  for (let [name, src] of Object.entries(cfg.sources ?? {})) {
    if (UPSTREAM) {
      const head = resolveHead(src.repo);
      if (head !== src.ref) {
        process.stderr.write('  ' + name + ': pin ' + src.ref.slice(0, 7) + ' -> HEAD ' + head.slice(0, 7) + '\n');
      }
      src = { ...src, ref: head };
    }
    process.stderr.write('  fetching ' + name + ' (' + src.repo + '@' + src.ref.slice(0, 7) + ')\n');
    const extracted = fetchSource(name, src, tmp);
    const sub = path.join(extracted, src.subpath ?? '');
    if (!fs.existsSync(sub)) throw new Error('subpath missing for ' + name + ': ' + src.subpath);

    const out = path.join(RAW, name);
    if (!CHECK) {
      fs.rmSync(out, { recursive: true, force: true });
      fs.mkdirSync(out, { recursive: true });
    }

    const all = walk(sub);
    let kept = 0;
    for (const rel of all) {
      if (drop.some((r) => r.test(rel))) continue;
      if (!keep.some((r) => r.test(rel))) continue;
      const buf = fs.readFileSync(path.join(sub, rel));
      if (!CHECK) {
        const target = path.join(out, rel);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, buf);
      }
      kept++;

      if (path.basename(rel) !== 'SKILL.md') continue;
      const dir = path.dirname(rel);
      const id = name + '/' + dir;
      const { data } = parseFrontmatter(buf.toString('utf8'));
      const reason = excluded[id];
      entries.push({
        id,
        source: name,
        name: data.name ?? path.basename(dir),
        path: 'raw_source/' + name + '/' + rel,
        sha: gitBlobSha(buf),
        bytes: buf.length,
        description: data.description ?? null,
        frontmatter_keys: Object.keys(data),
        status: reason ? 'excluded' : 'active',
        ...(reason ? { reason } : {}),
      });
    }

    // MIT requires the licence text travel with the copy. Walk up from the
    // subpath to the repo root: a monorepo subdir (pstack) carries its own
    // LICENSE below the root, and that is the one that governs it.
    if (!CHECK) {
      let dir = sub;
      let found = false;
      while (!found && dir.startsWith(extracted)) {
        for (const cand of ['LICENSE', 'LICENSE.md', 'LICENCE', 'LICENSE.txt']) {
          const lp = path.join(dir, cand);
          if (fs.existsSync(lp)) { fs.copyFileSync(lp, path.join(out, 'LICENSE')); found = true; break; }
        }
        if (dir === extracted) break;
        dir = path.dirname(dir);
      }
      if (!found) process.stderr.write('    WARNING: no LICENSE found for ' + name + '\n');
    }

    process.stderr.write('    ' + name + ': ' + all.length + ' files -> ' + kept + ' kept\n');
    sourcesOut[name] = {
      repo: src.repo, ref: src.ref, subpath: src.subpath ?? '',
      license: src.license ?? null, url: src.url ?? null,
    };
  }

  fs.rmSync(tmp, { recursive: true, force: true });
  entries.sort((a, b) => a.id.localeCompare(b.id));

  // A typo'd exclusion silently excludes nothing, which is worse than an error.
  const ids = new Set(entries.map((e) => e.id));
  const orphans = Object.keys(excluded).filter((id) => !ids.has(id));
  if (orphans.length) {
    process.stderr.write('\nERROR: catalog/exclusions.yaml names ids that do not exist:\n');
    for (const o of orphans) process.stderr.write('  ' + o + '\n');
    process.exit(2);
  }

  // No timestamp: the index must be a pure function of (sources.yaml, upstream
  // content, exclusions), so re-running on unchanged inputs is byte-identical.
  // A derived file that changes on every run is noise in the one channel that
  // has to stay quiet for drift to be worth reading.
  const index = { sources: sourcesOut, entries };
  if (!CHECK) {
    fs.mkdirSync(path.dirname(INDEX), { recursive: true });
    fs.writeFileSync(INDEX, JSON.stringify(index, null, 2) + '\n');
    writeNotice(sourcesOut, entries);
  }
  return index;
}

// Generated, so attribution cannot drift from what is actually vendored.
function writeNotice(sources, entries) {
  const lines = [
    '# NOTICE',
    '',
    'stack-hub vendors upstream skills into `raw_source/`, pinned by commit and pruned to',
    'skill-bearing files. Each copy keeps its original `LICENSE` verbatim. This file is',
    'generated by `scripts/sync-vendor.mjs` — edit `sources.yaml`, not this.',
    '',
  ];
  for (const [name, s] of Object.entries(sources)) {
    const n = entries.filter((e) => e.source === name).length;
    lines.push(
      '## ' + name,
      '',
      '- Upstream: ' + (s.url ?? s.repo),
      '- Repository: `' + s.repo + '`',
      '- Pinned commit: `' + s.ref + '`',
      '- Subpath: `' + (s.subpath || '/') + '`',
      '- Licence: ' + (s.license ?? 'see raw_source/' + name + '/LICENSE') +
        ' — full text at `raw_source/' + name + '/LICENSE`',
      '- Skills vendored: ' + n,
      '',
    );
  }
  lines.push(
    'Semantic skills under `plugins/` are original work that draws on the above. Each',
    'records what it took and what it rejected, per source, in its `upstream:` frontmatter.',
    '',
  );
  fs.writeFileSync(path.join(ROOT, 'NOTICE.md'), lines.join('\n'));
}

/** Who declares this upstream id? Cards and semantic skills — not the index. */
function declarations() {
  const decl = new Map();
  const add = (id, d) => decl.set(id, [...(decl.get(id) ?? []), d]);

  if (fs.existsSync(CARDS)) {
    for (const f of fs.readdirSync(CARDS).filter((f) => f.endsWith('.md'))) {
      const { data } = parseFrontmatter(fs.readFileSync(path.join(CARDS, f), 'utf8'));
      if (data.id && data.status !== 'excluded') {
        // Always a string: an all-digit sha would otherwise parse as a number,
        // and a falsy 0 would silently skip the drift check.
        add(data.id, { kind: 'card', file: 'catalog/cards/' + f, sha: shaStr(data.sha) });
      }
    }
  }

  for (const plugin of PLUGINS) {
    const dir = path.join(ROOT, 'plugins', plugin, 'skills');
    if (!fs.existsSync(dir)) continue;
    for (const s of fs.readdirSync(dir)) {
      const sk = path.join(dir, s, 'SKILL.md');
      if (!fs.existsSync(sk)) continue;
      const { data } = parseFrontmatter(fs.readFileSync(sk, 'utf8'));
      for (const u of data.upstream ?? []) {
        const [id, sha] = String(u.src ?? '').split('@');
        if (id) add(id, { kind: 'skill', file: 'plugins/' + plugin + '/skills/' + s + '/SKILL.md', sha: shaStr(sha) });
      }
    }
  }
  return decl;
}

const index = build();
const decl = declarations();
const byId = new Map(index.entries.map((e) => [e.id, e]));

// Drift is reported only for upstream that something actually DECLARES.
// Churn in an excluded skill is not news.
const drift = [];
for (const [id, ds] of decl) {
  const cur = byId.get(id);
  if (!cur) {
    drift.push({ id, why: 'declared, but no longer present upstream', ds });
    continue;
  }
  for (const d of ds) {
    const short = shaStr(d.sha);
    // A too-short sha would false-match via startsWith and silently disable the
    // check, which is worse than no sha at all.
    if (!/^[0-9a-f]{7,40}$/.test(short)) {
      drift.push({ id, why: 'declared sha is missing or malformed (' + (short || 'none') + ')', ds: [d] });
      continue;
    }
    if (!cur.sha.startsWith(short)) {
      drift.push({ id, why: 'moved ' + short.slice(0, 7) + ' -> ' + cur.sha.slice(0, 7), ds: [d] });
    }
  }
}

const excluded = index.entries.filter((e) => e.status === 'excluded').length;
process.stderr.write(
  '\n' + index.entries.length + ' skills indexed' +
  (excluded ? ' (' + excluded + ' excluded)' : '') +
  ', ' + decl.size + ' declared, ' + drift.length + ' drifted\n',
);

if (drift.length) {
  process.stderr.write('\nDRIFT - regenerate these, then review what cites them:\n');
  for (const d of drift) {
    process.stderr.write('  ' + d.id + ': ' + d.why + '\n');
    for (const x of d.ds) process.stderr.write('      ' + x.kind + ': ' + x.file + '\n');
  }
  if (CHECK) process.exit(1);
}
