// A deliberately small YAML subset — enough for sources.yaml, catalog card
// frontmatter and semantic-skill frontmatter, with no dependencies.
//
// Supports: nested maps by indentation, block lists of scalars, block lists of
// maps, inline flow lists, quoted/unquoted scalars, # comments, and `key: |`
// block scalars. Nothing else. If a file needs more than this, simplify the
// file rather than growing the parser.

const scalar = (raw) => {
  const s = raw.trim();
  if (s === '' || s === '~' || s === 'null') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (/^-?\d+$/.test(s)) return Number(s);
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return splitFlow(inner).map(scalar);
  }
  return s;
};

// Split a flow list on commas that are not inside quotes.
function splitFlow(s) {
  const out = [];
  let cur = '', q = null;
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === ',') { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

const indentOf = (l) => l.length - l.trimStart().length;

function parseBlock(lines, i, indent) {
  // Decide list vs map by looking at the first meaningful line at this indent.
  const first = lines[i];
  if (first !== undefined && indentOf(first) === indent && first.trimStart().startsWith('- ')) {
    return parseList(lines, i, indent);
  }
  return parseMap(lines, i, indent);
}

function parseMap(lines, i, indent) {
  const obj = {};
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    const ind = indentOf(line);
    if (ind < indent) break;
    if (ind > indent) { i++; continue; } // defensive; children consumed below
    const text = line.trim();
    if (text.startsWith('- ')) break; // a list at our level ends this map
    const m = text.match(/^([^:]+):\s*(.*)$/);
    if (!m) { i++; continue; }
    const key = m[1].trim();
    const rest = m[2];

    // Block scalars, including chomping/indent indicators: | > |- >- |+ >2
    const block = rest.match(/^([|>])([-+]?)(\d*)$/);
    if (block) {
      const folded = block[1] === '>';
      const buf = [];
      i++;
      while (i < lines.length && (lines[i].trim() === '' || indentOf(lines[i]) > indent)) {
        buf.push(lines[i].trim() === '' ? '' : lines[i].slice(indent + 2));
        i++;
      }
      while (buf.length && buf[buf.length - 1] === '') buf.pop();
      // Folded style joins on blank lines; literal style keeps newlines.
      obj[key] = folded
        ? buf.reduce((acc, l) => (l === '' ? acc + '\n\n' : acc + (acc && !acc.endsWith('\n') ? ' ' : '') + l), '').trim()
        : buf.join('\n').trim();
      continue;
    }

    if (rest !== '') { obj[key] = scalar(rest); i++; continue; }

    // Empty value: a nested block, or null.
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length && indentOf(lines[j]) > indent) {
      const [val, next] = parseBlock(lines, j, indentOf(lines[j]));
      obj[key] = val;
      i = next;
    } else {
      obj[key] = null;
      i = j;
    }
  }
  return [obj, i];
}

function parseList(lines, i, indent) {
  const arr = [];
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    const ind = indentOf(line);
    if (ind < indent) break;
    const text = line.trim();
    if (ind !== indent || !text.startsWith('- ')) break;
    const rest = text.slice(2).trim();

    // A colon only opens a mapping when followed by whitespace or end of line.
    // "- a:b" is the scalar "a:b" (e.g. a plugin-qualified skill id), not a map.
    if (/^[^:\s][^:]*:(\s|$)/.test(rest)) {
      // "- key: value" — an inline map that may continue on following lines,
      // indented to line up past the dash.
      const childIndent = ind + 2;
      const synthetic = [' '.repeat(childIndent) + rest, ...lines.slice(i + 1)];
      const [val, next] = parseMap(synthetic, 0, childIndent);
      arr.push(val);
      i = i + next; // `next` counts the synthetic line, which stands in for line i
      continue;
    }
    arr.push(scalar(rest));
    i++;
  }
  return [arr, i];
}

export function parseYaml(text) {
  const lines = text
    .split('\n')
    .map((l) => (l.trimStart().startsWith('#') ? '' : l.replace(/\s+#\s.*$/, '')))
    .map((l) => l.replace(/\s+$/, ''));
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i >= lines.length) return {};
  const [val] = parseBlock(lines, i, indentOf(lines[i]));
  return val;
}

/** Split `---\n<yaml>\n---\n<body>` into { data, body }. */
export function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: text };
  const raw = text.slice(text.indexOf('\n') + 1, end);
  const body = text.slice(text.indexOf('\n', end + 1) + 1);
  return { data: parseYaml(raw), body };
}
