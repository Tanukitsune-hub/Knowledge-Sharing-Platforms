"""Inherited CODEX-08 invariant checks, updated for CODEX-09 local UI demos."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent
EXPECTED_SOURCE = "7ea55f55278bddfceb03e279f7e536e6b7590c16"
EXPECTED_NAV = [
    "ナレッジ検索",
    "記録を追加",
    "過去の記録",
    "面談先サマリー",
    "面談実績の集計",
    "プルダウンの管理",
    "管理者ページ",
]
OBSOLETE_NAV = ["面談履歴", "Workspace", "マスター管理", "AIプロバイダ設定", "面談と資料の関連"]


def require(condition, message):
    if not condition:
        raise AssertionError(message)


manifest = json.loads((ROOT / "page-manifest.json").read_text(encoding="utf-8"))
require(manifest["source_sha"] == EXPECTED_SOURCE, "manifest source SHA drift")
pages = [ROOT / item["file"] for item in manifest["pages"]]
require(len(pages) == 15, "expected 14 inherited pages plus one admin settings design state")
require(pages[0].name == "00-navigation.html", "review-only navigation reference must remain first in artifact index")
require(pages[1].name == "01-search.html", "first product surface must be Knowledge Search")
require(not (ROOT / "02-meeting-history.html").exists(), "standalone meeting history remains")
require(not (ROOT / "12-relationships.html").exists(), "standalone relationship page remains")
require((ROOT / "11-analytics-capture.html").exists(), "analytics screenshot crop is missing")
require("11-analytics-capture.html" not in [item["file"] for item in manifest["pages"]], "screenshot crop must not be a product surface")

for page in pages:
    html = page.read_text(encoding="utf-8")
    nav_match = re.search(r"<nav>(.*?)</nav>", html, re.S)
    require(nav_match, f"{page.name}: nav missing")
    nav = nav_match.group(1)
    labels = re.findall(r'<span class="nav-label">(.*?)</span>', nav, re.S)
    require(labels == EXPECTED_NAV, f"{page.name}: nav labels/order drift: {labels}")
    require("<h3" not in nav, f"{page.name}: sidebar group heading remains")
    require(len(re.findall(r'class="active"', nav)) == 1, f"{page.name}: active destination is not exactly one")
    require(nav.count('class="nav-separator"') == 1, f"{page.name}: decorative separator count drift")
    require(nav.index('class="nav-separator"') < nav.index("プルダウンの管理"), f"{page.name}: separator is not before system tools")
    require(nav.index("面談実績の集計") < nav.index('class="nav-separator"'), f"{page.name}: separator is not after normal destinations")
    require("#E1001F" not in html.upper(), f"{page.name}: ordinary red literal present")
    scripts = re.findall(r'<script[^>]*src="([^"]+)"', html)
    allowed = {'01-search.html': ['search-demo.js'], '14-mode-settings.html': ['admin-demo.js']}.get(page.name, [])
    require(scripts == allowed and html.count('<script') == len(allowed), f"{page.name}: unexpected script")
    for href in re.findall(r'href="([^"]+\.html)"', nav):
        require((ROOT / href).exists(), f"{page.name}: broken nav target {href}")
    for obsolete in OBSOLETE_NAV:
        require(obsolete not in nav, f"{page.name}: obsolete nav label {obsolete}")

overview = (ROOT / "00-navigation.html").read_text(encoding="utf-8")
require("production pageではありません" in overview, "review-only navigation boundary missing")
require("Web Appの初期画面は「ナレッジ検索」" in overview, "Knowledge Search start-surface note missing")

meeting_past = (ROOT / "05-past-records-meeting.html").read_text(encoding="utf-8")
for required in ("関連資料 3件", "Meeting_Index.Related_Pitchbook_IDs", "DOC-000201", "DOC-000202", "DOC-000299", "PITCHBOOK_NOT_FOUND", "関係の追加・削除は面談登録／編集"):
    require(required in meeting_past, f"past Meeting relationship view missing: {required}")
require("GP名の一致" not in meeting_past, "past Meeting view implies GP-name inference")

pitchbook_past = (ROOT / "06-past-records-pitchbook.html").read_text(encoding="utf-8")
for required in ("関連面談 2件", "このDocument IDを明示的に参照するMeetingのみ表示", "MTG-000101", "MTG-000102", "GP名の一致から関係を推定しません", "関係の変更は面談登録／編集"):
    require(required in pitchbook_past, f"past Pitchbook relationship view missing: {required}")

analytics = (ROOT / "11-analytics.html").read_text(encoding="utf-8")
require('type="month" value="2026-08"' in analytics, "monthly YYYY-MM selector missing")
require(analytics.count('class="analytics-pair"') == 2, "chart/table pair count drift")
require("2026年8月の面談一覧" in analytics, "monthly Meeting list missing")
require("<th>確認済み</th>" in analytics, "rightmost confirmation column missing")
require(analytics.count('data-contract="adminCheckCompleted"') == 3, "adminCheckCompleted row controls drift")
require(analytics.count('data-update-facade="updateMeetingAdminCheck"') == 3, "admin check facade mapping drift")
analytics_capture = (ROOT / "11-analytics-capture.html").read_text(encoding="utf-8")
require('class="capture-bottom"' in analytics_capture and "SCREENSHOT CROP" in analytics_capture, "analytics capture boundary missing")

meeting = (ROOT / "03-record-add-meeting.html").read_text(encoding="utf-8")
for value in ("ANNUAL_REVIEW", "OFFICE_VISIT", "ANNUAL_GENERAL_MEETING"):
    require(meeting.count(f'value="{value}"') == 1, f"Meeting Type value missing: {value}")
require("counterparty-inline-row" in meeting and "未登録の面談先を追加" in meeting, "inline quick add missing")

for name in ("04-record-add-pitchbook.html", "05-past-records-meeting.html", "06-past-records-pitchbook.html", "09-workspace-gp.html", "10-workspace-entity.html", "11-analytics.html"):
    html = (ROOT / name).read_text(encoding="utf-8")
    if "data-source-field" in html:
        require(">原資料を開く</button>" in html, f"{name}: source action missing")

search = (ROOT / "01-search.html").read_text(encoding="utf-8")
require(search.count('data-visible-model-selector="true"') == 1, "normal-user model selector count drift")
require("Thinking" not in search and "Gemini" not in search, "normal-user hidden provider policy drift")

css = (ROOT / "family.css").read_text(encoding="utf-8")
require("--sidebar-base:#182124" in css, "sidebar token drift")
require("--paper:#F4F7FA" in css, "Light page token drift")
require(css.upper().count("#E1001F") == 1, "#E1001F must exist only as active-strip token")
require("background-size:92px 92px" in css, "sayagata density drift")
require(".nav-separator" in css and "clip-path:polygon" in css, "pointed decorative separator missing")
require(".brand-title" in css and "linear-gradient" in css, "metallic brand treatment missing")
require("prefers-color-scheme" not in css and "animation:" not in css, "out-of-scope theme or animation present")

print(f"PASS: {len(pages)} pages, 7 destinations, relationship views integrated, Light-only polish verified")
