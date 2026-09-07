"""CODEX-10 Light invariant checks for the record-centric design artifact."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent
EXPECTED_SOURCE = "9fa668619a0b91fb60ed53f696363d3954cf709e"
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
require(len(pages) == 12, "expected the 12 current record-centric design pages")
require(pages[0].name == "00-navigation.html", "review-only navigation reference must remain first in artifact index")
require(pages[1].name == "01-search.html", "first product surface must be Knowledge Search")
require(not (ROOT / "02-meeting-history.html").exists(), "standalone meeting history remains")
require(not (ROOT / "04-record-add-pitchbook.html").exists(), "standalone Pitchbook registration remains")
require(not (ROOT / "06-past-records-pitchbook.html").exists(), "standalone Pitchbook list remains")
require(not (ROOT / "08-pitchbook-edit.html").exists(), "standalone Pitchbook edit remains")
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
require("記録種別 = 面談 / データ受領" in overview, "record-centric add surface missing")
require("資料→関連面談surface" in overview, "record-centric reverse surface boundary missing")

meeting_past = (ROOT / "05-past-records-meeting.html").read_text(encoding="utf-8")
for required in ("記録一覧", "面談", "データ受領", "関連資料 3件", "Meeting_Index.Related_Pitchbook_IDs", "DOC-000201", "DOC-000202", "DOC-000299", "PITCHBOOK_NOT_FOUND", "資料を追加", "削除（紐付け解除）", "親Meeting_ID = MTG-000101"):
    require(required in meeting_past, f"past Meeting relationship view missing: {required}")
require("GP名の一致" not in meeting_past, "past Meeting view implies GP-name inference")
require('class="subtabs"' not in meeting_past, "past Records subtabs remain")
require("資料→関連面談" not in meeting_past, "reverse relation surface remains")

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
for required in ("記録種別", "MEETING", "面談", "DATA_RECEIPT", "データ受領", "親記録を先に登録", "stable <code>Meeting_ID</code>", "関連資料（任意）", "受領資料（必須）", "受領背景メモ", "親記録の作成に失敗した場合", "no standalone Pitchbook route"):
    require(required in meeting, f"record-centric creation surface missing: {required}")
require('class="subtabs"' not in meeting, "record creation subtabs remain")
for value in ("ANNUAL_REVIEW", "OFFICE_VISIT", "ANNUAL_GENERAL_MEETING"):
    require(meeting.count(f'value="{value}"') == 1, f"Meeting Type value missing: {value}")
require("counterparty-inline-row" in meeting and "未登録の面談先を追加" in meeting, "inline quick add missing")

for name in ("03-record-add-meeting.html", "05-past-records-meeting.html", "07-meeting-edit.html", "09-workspace-gp.html", "10-workspace-entity.html", "11-analytics.html"):
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
