"""Deterministic checks for the Work 0028 CODEX-07 inert design family."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent
EXPECTED_SOURCE = "02cc825fce3ed7debdeaaefe6ff5dd97f926e9f1"
EXPECTED_NAV = [
    "ナレッジ検索",
    "記録を追加",
    "過去の記録",
    "面談先サマリー",
    "面談実績の集計",
    "面談と資料の関連",
    "プルダウンの管理",
    "管理者ページ",
]
OBSOLETE_NAV = ["面談履歴", "Workspace", "マスター管理", "AIプロバイダ設定"]


def require(condition, message):
    if not condition:
        raise AssertionError(message)


manifest = json.loads((ROOT / "page-manifest.json").read_text(encoding="utf-8"))
require(manifest["source_sha"] == EXPECTED_SOURCE, "manifest source SHA drift")
pages = [ROOT / item["file"] for item in manifest["pages"]]
require(len(pages) == 15, "expected 15 final Light pages")
require(not (ROOT / "02-meeting-history.html").exists(), "standalone meeting history remains")

for page in pages:
    html = page.read_text(encoding="utf-8")
    nav_match = re.search(r"<nav>(.*?)</nav>", html, re.S)
    require(nav_match, f"{page.name}: nav missing")
    nav = nav_match.group(1)
    labels = re.findall(r'<span class="nav-label">(.*?)</span>', nav, re.S)
    require(labels == EXPECTED_NAV, f"{page.name}: nav labels/order drift: {labels}")
    require("<h3" not in nav, f"{page.name}: sidebar group heading remains")
    require(len(re.findall(r'class="active"', nav)) == 1, f"{page.name}: active destination is not exactly one")
    require("#E1001F" not in html.upper(), f"{page.name}: ordinary red literal present")
    require("<script" not in html.lower(), f"{page.name}: inert page contains script")
    for href in re.findall(r'href="([^"]+\.html)"', nav):
        require((ROOT / href).exists(), f"{page.name}: broken nav target {href}")
    for obsolete in OBSOLETE_NAV:
        require(obsolete not in nav, f"{page.name}: obsolete nav label {obsolete}")

analytics = (ROOT / "11-analytics.html").read_text(encoding="utf-8")
require('type="month" value="2026-08"' in analytics, "monthly YYYY-MM selector missing")
require(analytics.count('class="analytics-pair"') == 2, "chart/table pair count drift")
require("期間別推移" in analytics and "選択した内訳" in analytics, "analytics sections missing")
require("2026年8月の面談一覧" in analytics, "monthly Meeting list missing")
require("<th>確認済み</th>" in analytics, "rightmost confirmation column missing")
require(analytics.count('data-contract="adminCheckCompleted"') == 3, "adminCheckCompleted row controls drift")
require(analytics.count('data-update-facade="updateMeetingAdminCheck"') == 3, "admin check facade mapping drift")
require("月次管理反映済み" not in analytics, "separate monthly management card remains")
require("面談履歴" not in analytics, "standalone history wording remains")

meeting = (ROOT / "03-record-add-meeting.html").read_text(encoding="utf-8")
for value in ("ANNUAL_REVIEW", "OFFICE_VISIT", "ANNUAL_GENERAL_MEETING"):
    require(meeting.count(f'value="{value}"') == 1, f"Meeting Type value missing: {value}")
require("counterparty-inline-row" in meeting and "未登録の面談先を追加" in meeting, "inline quick add missing")

for name in ("04-record-add-pitchbook.html", "05-past-records-meeting.html", "06-past-records-pitchbook.html", "09-workspace-gp.html", "10-workspace-entity.html", "11-analytics.html", "12-relationships.html"):
    html = (ROOT / name).read_text(encoding="utf-8")
    require("原資料を開く ↗" not in html, f"{name}: source action label drift")
    if "data-source-field" in html:
        require(">原資料を開く</button>" in html, f"{name}: source action missing")

gp = (ROOT / "09-workspace-gp.html").read_text(encoding="utf-8")
entity = (ROOT / "10-workspace-entity.html").read_text(encoding="utf-8")
for value in ("Fund / Strategy", "面談記録", "Pitchbook / 資料", "面談 ↔ 資料"):
    require(value in gp, f"GP content missing: {value}")
for value in ("Direct / related context", "Mixes / Follow-ups", "明示的にリンクされたPitchbook", "Activity timeline"):
    require(value in entity, f"non-GP content missing: {value}")

search = (ROOT / "01-search.html").read_text(encoding="utf-8")
require(search.count('data-visible-model-selector="true"') == 1, "normal-user model selector count drift")
require("Thinking" not in search and "Gemini" not in search, "normal-user hidden provider policy drift")

css = (ROOT / "family.css").read_text(encoding="utf-8")
require("--sidebar-base:#182124" in css, "sidebar token drift")
require("--paper:#F4F7FA" in css, "Light page token drift")
require(css.upper().count("#E1001F") == 1, "#E1001F must exist only as active-strip token")
require("background-size:92px 92px" in css, "sayagata density drift")

print(f"PASS: {len(pages)} pages, 8 flat destinations, merged analytics contract references verified")
