"""Build README.md and the website data from tools.yaml.

Usage:
    python scripts/build.py            # regenerate README.md + docs/data/tools.json
    python scripts/build.py --stats    # ... and fetch GitHub stars/last update into docs/data/stats.json
    python scripts/build.py --check    # exit with 1 if README.md or tools.json are out of date

Requires PyYAML. `--stats` uses $GITHUB_TOKEN if set (recommended to avoid rate limits).
"""
import argparse
import datetime
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "tools.yaml"
TEMPLATE = ROOT / "scripts" / "README.template.md"
README = ROOT / "README.md"
SITE_DATA = ROOT / "docs" / "data"

LANGUAGES = ("r", "python", "web")
STATUSES = ("stable", "wip", "restricted")
SUPPORT = ("dedicated", "generic")
PEOPLE_GROUPS = ("core", "major", "contributor")


def load():
    with open(DATA) as f:
        data = yaml.safe_load(f)
    validate(data)
    return data


def validate(data):
    """Catch typos early - the README and website both rely on these."""
    ids = [t["id"] for t in data["tools"]]
    dupes = {i for i in ids if ids.count(i) > 1}
    assert not dupes, f"Duplicate tool ids: {dupes}"
    ids = set(ids)
    cats = {c["id"] for c in data["categories"]}
    dsets = {d["id"] for d in data["datasets"]}
    for t in data["tools"]:
        where = f"tool '{t['id']}'"
        for field in ("name", "language", "category", "url", "summary"):
            assert field in t, f"{where} is missing '{field}'"
        assert t["language"] in LANGUAGES, f"{where}: unknown language {t['language']!r}"
        assert t["category"] in cats, f"{where}: unknown category {t['category']!r}"
        assert t.get("status", "stable") in STATUSES, f"{where}: unknown status {t.get('status')!r}"
        for d, s in (t.get("datasets") or {}).items():
            assert d in dsets, f"{where}: unknown dataset {d!r}"
            assert s in SUPPORT, f"{where}: dataset support must be one of {SUPPORT}"
        for d in t.get("depends", []):
            assert d in ids, f"{where}: unknown dependency {d!r}"
        for ref in re.findall(r"{@([\w.-]+)}", t.get("readme") or ""):
            assert ref == "self" or ref in ids, f"{where}: unknown reference {{@{ref}}}"
    for p in data["pairs"]:
        for i in p.get("r", []) + p.get("python", []):
            assert i in ids, f"pair '{p['what']}': unknown tool {i!r}"
    for r in data["recipes"]:
        for lang, links in (r.get("tutorials") or {}).items():
            assert lang in ("r", "python"), f"recipe '{r['id']}': tutorials for unknown language {lang!r}"
            for link in links:
                assert {"title", "url"} <= set(link), f"recipe '{r['id']}': tutorial links need a title and url"
                assert link["url"].startswith("https://"), f"recipe '{r['id']}': tutorial URL must be https"
    pubs = data.get("publications", {})
    for kind, entries in (("cite", pubs.get("cite", [])), ("selected", pubs.get("selected", []))):
        for e in entries:
            where = f"publication {e.get('doi')!r}"
            for field in ("title", "doi") + (("authors", "venue", "year") if e.get("kind", "paper") == "paper" else ()):
                assert field in e, f"{where} is missing '{field}'"
            assert re.fullmatch(r"10\.\d{4,9}/\S+", str(e["doi"])), f"{where}: malformed DOI"
            for i in e.get("for" if kind == "cite" else "uses", []):
                assert i == "natverse" or i in ids, f"{where}: unknown tool {i!r}"
    for person in data.get("people", []):
        where = f"person '{person.get('name')}'"
        for field in ("name", "github", "group"):
            assert field in person, f"{where} is missing '{field}'"
        assert person["group"] in PEOPLE_GROUPS, f"{where}: unknown group {person['group']!r}"
        assert re.fullmatch(r"[A-Za-z0-9-]+", person["github"]), f"{where}: invalid GitHub handle"
        for i in person.get("packages", []):
            assert i in ids, f"{where}: unknown package {i!r}"


def readme_section(tool):
    return tool.get("readme_section", f"{tool['language']}/{tool['category']}")


def render_readme(data):
    tools = {t["id"]: t for t in data["tools"]}

    def link(tid):
        t = tools[tid]
        return f"[`{t['name']}`]({t['url']})"

    def entry(t):
        return re.sub(r"{@([\w.-]+)}",
                      lambda m: link(t["id"] if m.group(1) == "self" else m.group(1)),
                      t["readme"])

    template = TEMPLATE.read_text()
    used = set()

    def section(m):
        key = m.group(1)
        items = [t for t in data["tools"] if t.get("readme") and readme_section(t) == key]
        assert items, f"No tools for README section {{{{{key}}}}}"
        used.add(key)
        return "\n".join(f"{i}. {entry(t)}" for i, t in enumerate(items, 1))

    out = re.sub(r"{{([\w/]+)}}", section, template)
    orphans = {readme_section(t) for t in data["tools"] if t.get("readme")} - used
    assert not orphans, f"README template has no placeholder for: {orphans}"
    return out


def site_json(data):
    out = {k: data[k] for k in ("datasets", "categories", "pairs", "recipes")}
    out["people"] = data.get("people", [])
    out["publications"] = data.get("publications", {"cite": [], "selected": []})
    out["tools"] = []
    for t in data["tools"]:
        t = {k: v for k, v in t.items() if k not in ("readme", "readme_section")}
        t.setdefault("status", "stable")
        t.setdefault("datasets", {})
        t.setdefault("depends", [])
        out["tools"].append(t)
    return json.dumps(out, indent=1, ensure_ascii=False) + "\n"


def fetch_stats(data):
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "flyconnectome-tools"}
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    stats = {}
    for repo in sorted({t["repo"] for t in data["tools"] if t.get("repo")}):
        req = urllib.request.Request(f"https://api.github.com/repos/{repo}", headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                info = json.load(r)
        except Exception as e:  # don't fail the build over a single repo
            print(f"  ! {repo}: {e}", file=sys.stderr)
            continue
        stats[repo] = {"stars": info["stargazers_count"], "pushed_at": info["pushed_at"]}
    return {"updated": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
            "repos": stats}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--stats", action="store_true", help="fetch GitHub stats")
    parser.add_argument("--check", action="store_true", help="only check that outputs are up to date")
    args = parser.parse_args()

    data = load()
    outputs = {README: render_readme(data), SITE_DATA / "tools.json": site_json(data)}

    if args.check:
        stale = [p for p, txt in outputs.items() if not p.exists() or p.read_text() != txt]
        for p in stale:
            print(f"{p.relative_to(ROOT)} is out of date - run `python scripts/build.py`", file=sys.stderr)
        sys.exit(1 if stale else 0)

    SITE_DATA.mkdir(parents=True, exist_ok=True)
    for p, txt in outputs.items():
        p.write_text(txt)
        print(f"Wrote {p.relative_to(ROOT)}")

    if args.stats:
        stats = fetch_stats(data)
        (SITE_DATA / "stats.json").write_text(json.dumps(stats, indent=1) + "\n")
        print(f"Wrote docs/data/stats.json ({len(stats['repos'])} repos)")


if __name__ == "__main__":
    main()
