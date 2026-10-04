#!/usr/bin/env python3
"""tqdm-style Claude Code statusline: context load + 5h/weekly limits (Claude + Codex).

Reads the statusline JSON on stdin. `--test` runs the self-check.
"""
import glob
import json
import os
import subprocess
import sys
import time

WARN, DANGER = 40, 60          # context % zones: green < WARN <= yellow < DANGER <= red
WIDTH = 10
CACHE = os.path.expanduser("~/.claude/.usage-bar-ccusage.json")
CACHE_TTL = 60

GREEN, YELLOW, RED, DIM, RESET = "\033[32m", "\033[33m", "\033[31m", "\033[2m", "\033[0m"
PARTIALS = " ▏▎▍▌▋▊▉"


def bar(pct, width=WIDTH):
    pct = max(0.0, min(100.0, pct))
    eighths = round(pct / 100 * width * 8)
    full, part = divmod(eighths, 8)
    s = "█" * full + (PARTIALS[part] if part else "")
    return "▕" + s.ljust(width, "░") + "▏"


def zone(pct):
    return RED if pct >= DANGER else YELLOW if pct >= WARN else GREEN


def meter(label, pct, color=None):
    c = color or zone(pct)
    return f"{label} {c}{bar(pct)}{pct:3.0f}%{RESET}"


def tail_lines(path, nbytes=256_000):
    with open(path, "rb") as f:
        f.seek(0, 2)
        f.seek(max(0, f.tell() - nbytes))
        return f.read().decode("utf-8", "ignore").splitlines()[::-1]


def context_pct(data):
    cw = data.get("context_window") or {}
    if cw.get("used_percentage") is not None:
        return float(cw["used_percentage"])
    size = cw.get("context_window_size") or (1_000_000 if "[1m]" in json.dumps(data.get("model", "")) else 200_000)
    path = data.get("transcript_path")
    if not path or not os.path.exists(path):
        return None
    for line in tail_lines(path):
        try:
            e = json.loads(line)
        except ValueError:
            continue
        u = (e.get("message") or {}).get("usage") if e.get("type") == "assistant" else None
        if u and not e.get("isSidechain"):
            used = u.get("input_tokens", 0) + u.get("cache_read_input_tokens", 0) + u.get("cache_creation_input_tokens", 0)
            return 100 * used / size
    return None


def claude_limits(data):
    rl = data.get("rate_limits") or {}
    out = []
    for key, label in (("five_hour", "5h"), ("seven_day", "wk")):
        pct = (rl.get(key) or {}).get("used_percentage")
        if pct is not None:
            out.append(meter(label, float(pct)))
    return out or claude_block_fallback()


def claude_block_fallback():
    """No rate_limits on stdin: show active 5h block cost + time left (from ccusage, cached)."""
    try:
        cached = json.load(open(CACHE))
    except (OSError, ValueError):
        cached = None
    if not cached or time.time() - os.path.getmtime(CACHE) > CACHE_TTL:
        # refresh in the background; never block the statusline on npx
        subprocess.Popen(
            ["sh", "-c", f"npx -y ccusage@latest claude blocks --active --json > {CACHE}.tmp && mv {CACHE}.tmp {CACHE}"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True,
        )
    blocks = (cached or {}).get("blocks") or []
    if not blocks:
        return []
    b = blocks[0]
    mins = (b.get("projection") or {}).get("remainingMinutes", 0)
    return [f"5h {DIM}${b.get('costUSD', 0):.2f} · {mins // 60}h{mins % 60:02d}m left{RESET}"]


def codex_limits(now=None):
    now = now or time.time()
    days = sorted(glob.glob(os.path.expanduser("~/.codex/sessions/*/*/*")))[-2:]
    files = [f for d in days for f in glob.glob(os.path.join(d, "*.jsonl"))]
    for path in sorted(files, key=os.path.getmtime, reverse=True)[:5]:  # fresh sessions have no token event yet
        for line in tail_lines(path):
            if '"rate_limits"' not in line:
                continue
            try:
                rl = json.loads(line)["payload"]["rate_limits"]
            except (ValueError, KeyError, TypeError):
                continue
            out = []
            for key, label in (("primary", "5h"), ("secondary", "wk")):
                w = rl.get(key) or {}
                if w.get("used_percent") is not None and w.get("resets_at", now + 1) > now:
                    out.append(meter(label, float(w["used_percent"])))
            return out
    return []


def render(data, tool="CC"):
    parts = []
    ctx = context_pct(data)
    if ctx is not None:
        warn = f" {RED}⚠ /compact or /clear{RESET}" if ctx >= DANGER else ""
        parts.append(meter("ctx", ctx) + warn)
    if tool == "CC":
        parts += claude_limits(data)
    # NOTE: Copilot's stdin schema is undocumented; run with USAGE_BAR_DUMP=1 to capture it
    line = f"{tool} " + " │ ".join(parts)
    cx = codex_limits()
    if cx:
        line += f"   {DIM}CX{RESET} " + " │ ".join(cx)
    return line


def test():
    assert bar(0) == "▕" + "░" * WIDTH + "▏"
    assert bar(100) == "▕" + "█" * WIDTH + "▏"
    assert bar(150) == bar(100) and bar(-5) == bar(0)
    assert bar(55) == "▕█████▌░░░░▏", bar(55)
    assert all(len(bar(p)) == WIDTH + 2 for p in range(101))
    assert zone(WARN - 0.1) == GREEN and zone(WARN) == YELLOW and zone(DANGER) == RED
    assert context_pct({"context_window": {"used_percentage": 42}}) == 42
    assert "wk" in claude_limits({"rate_limits": {"five_hour": {"used_percentage": 10}, "seven_day": {"used_percentage": 70}}})[1]
    print("ok")


if __name__ == "__main__":
    if "--test" in sys.argv:
        test()
    else:
        tool = "CP" if "--copilot" in sys.argv else "CC"
        try:
            raw = sys.stdin.read()
            if os.environ.get("USAGE_BAR_DUMP"):  # capture stdin to map new fields
                with open(os.path.expanduser(f"~/.claude/.usage-bar-last-{tool}.json"), "w") as f:
                    f.write(raw)
            print(render(json.loads(raw), tool))
        except Exception as e:  # a broken statusline is worse than a terse one
            print(f"usage-bar: {e}")
