#!/usr/bin/env python3
"""Validate the Knowledge Sharing Platforms agent/governance foundation."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PATHS = {
    "agents": ROOT / "AGENTS.md",
    "readme": ROOT / "README.md",
    "docs_readme": ROOT / "docs" / "README.md",
    "work_control": ROOT / "docs" / "agent-governance" / "work-control.md",
    "dispatch_control": ROOT / "docs" / "agent-governance" / "dispatch-control.md",
    "handoff": ROOT / "docs" / "handoff-template.md",
    "pr_template": ROOT / ".github" / "pull_request_template.md",
    "target_decision": ROOT / "docs" / "decisions" / "target-runtime-first-development.md",
    "old_decision": ROOT / "docs" / "decisions" / "implementation-first-final-live-qualification.md",
    "implementation_plan": ROOT / "docs" / "planning" / "apps-script-implementation-plan.md",
    "roadmap": ROOT / "docs" / "planning" / "mvp-and-roadmap.md",
    "architecture": ROOT / "docs" / "architecture" / "target-architecture.md",
    "runtime_policy": ROOT / "docs" / "operations" / "runtime-policy.md",
    "security": ROOT / "docs" / "governance" / "security.md",
    "gemini": ROOT / "docs" / "ai" / "gemini-file-search.md",
    "repository_initialization": ROOT / "docs" / "repository-initialization.md",
    "decision_log": ROOT / "docs" / "decisions" / "decision-log.md",
    "changelog": ROOT / "docs" / "core-rules-changelog.md",
}

REQUIRED_TOKENS = {
    "agents": [
        "CORE_RULES_VERSION: 2.2",
        "REPOSITORY_RULES_STATUS: ACTIVE",
        "target-runtime-first",
        "LOGIC_VALIDATION",
        "TARGET_RUNTIME_QUALIFICATION",
        "SIDE_EFFECT_STATE",
        "docs/agent-governance/work-control.md",
        "docs/agent-governance/dispatch-control.md",
        "docs/decisions/target-runtime-first-development.md",
    ],
    "work_control": [
        "### BUILD",
        "### INCIDENT_RECOVERY",
        "### INVESTIGATION",
        "### QUALIFICATION",
        "## 3. Target-runtime-first development",
        "### Separate staging decision gate",
        "LOGIC_VALIDATION",
        "TARGET_RUNTIME_QUALIFICATION",
        "SIDE_EFFECT_STATE",
    ],
    "dispatch_control": [
        "<WORK_ID>-CODEX-<NN>",
        "CHATGPT",
        "CODEX",
        "USER",
        "NONE",
        "ACTION_REQUIRED",
        "RETURNED",
        "ACCEPTED",
        "<WORK_ID>-dispatches.md",
    ],
    "handoff": [
        "WORK_ID:",
        "DISPATCH_ID:",
        "MODE:",
        "BALL:",
        "STATUS:",
        "## Target Runtime, Test Data, and Side Effects",
        "TARGET_RUNTIME",
        "ISOLATED_TEST_DATA",
        "SIDE_EFFECT_STATE",
        "### Logic Validation",
        "### Target-Runtime Qualification",
        "LOGIC_VALIDATION",
        "TARGET_RUNTIME_QUALIFICATION",
        "READY:",
    ],
    "pr_template": [
        "WORK_ID:",
        "ACTIVE_DISPATCH_ID:",
        "BALL:",
        "STATUS:",
        "MODE:",
        "## Runtime and Data Boundary",
        "LOGIC_VALIDATION:",
        "TARGET_RUNTIME_QUALIFICATION:",
        "READY:",
        "## Work Control",
    ],
    "target_decision": [
        "Status: Accepted",
        "TARGET_RUNTIME",
        "ISOLATED_TEST_DATA",
        "SIDE_EFFECT_STATE",
        "## Separate staging decision gate",
        "LOGIC_VALIDATION",
        "TARGET_RUNTIME_QUALIFICATION",
        "Work 0014",
    ],
    "old_decision": [
        "Status: Superseded on 2026-08-26",
        "docs/decisions/target-runtime-first-development.md",
        "## Why superseded",
    ],
    "implementation_plan": [
        "shortest coherent vertical slice",
        "production source path",
        "LOGIC_VALIDATION",
        "TARGET_RUNTIME_QUALIFICATION",
        "SIDE_EFFECT_STATE",
        "production business helpers must live in production source",
    ],
    "roadmap": [
        "shortest coherent production-source vertical slice",
        "actual target runtime",
        "isolated synthetic/anonymized test data/resources",
        "LOGIC_VALIDATION",
        "TARGET_RUNTIME_QUALIFICATION",
    ],
    "architecture": [
        "A separate DEV/Staging runtime is optional",
        "Production business helpers must exist in production source",
        "Target-runtime qualification covers",
        "Work 0014",
    ],
    "runtime_policy": [
        "A separate DEV/Staging runtime is not the default",
        "### Isolated test data/resources",
        "### Consequential effects",
        "LOGIC_VALIDATION",
        "TARGET_RUNTIME_QUALIFICATION",
    ],
    "security": [
        "Target runtime is not production exposure",
        "Production business helpers must exist in production source",
        "Do not store:",
        "prompts/questions/additional instructions",
        "TARGET_RUNTIME_QUALIFICATION",
    ],
    "gemini": [
        "Target runtime, test data, and side effects",
        "Current policy redacts the question/additional-instruction text",
        "LOGIC_VALIDATION",
        "TARGET_RUNTIME_QUALIFICATION",
        "SIDE_EFFECT_STATE",
    ],
    "repository_initialization": [
        "Default BUILD work to the actual target runtime",
        "## 5. Separate staging decision",
        "Logic validation",
        "Target-runtime qualification",
        "python tools/validate_agent_foundation.py",
    ],
    "decision_log": [
        "## 2026-08-26 — Target-runtime-first development",
        "permanent DEV/PROD project separation is superseded",
        "docs/decisions/target-runtime-first-development.md",
    ],
    "changelog": [
        "## 2.2 — 2026-08-26",
        "target-runtime-first",
    ],
}

# These are current guidance surfaces where the old delivery model must not be
# reintroduced as an active instruction. Decision/history documents are excluded
# because they must quote the superseded policy accurately.
ACTIVE_POLICY_KEYS = [
    "agents",
    "readme",
    "docs_readme",
    "work_control",
    "handoff",
    "pr_template",
    "implementation_plan",
    "roadmap",
    "architecture",
    "runtime_policy",
    "security",
    "gemini",
    "repository_initialization",
]

BANNED_CURRENT_POLICY = [
    "DEV and PROD use separate Apps Script projects and resource sets",
    "feature-complete後までApps Script / Workspace / Gemini実機確認を原則行わない",
    "standard live qualification only after feature freeze",
    "開発中は原則としてlocal / static / mock / contract validationだけを行う",
]

MARKERS = [
    "<!-- CORE_RULES_START -->",
    "<!-- CORE_RULES_END -->",
    "<!-- REPOSITORY_SPECIFIC_RULES_START -->",
    "<!-- REPOSITORY_SPECIFIC_RULES_END -->",
]


def main() -> int:
    errors: list[str] = []
    texts: dict[str, str] = {}

    for key, path in PATHS.items():
        if not path.is_file():
            errors.append(f"missing required path: {path.relative_to(ROOT)}")
            continue
        texts[key] = path.read_text(encoding="utf-8")

    if errors:
        return report(errors)

    agents = texts["agents"]
    if len(agents.encode("utf-8")) > 12_288:
        errors.append("AGENTS.md exceeds 12 KiB compact-context budget")
    if len(agents.splitlines()) > 180:
        errors.append("AGENTS.md exceeds 180-line compact-context budget")
    for marker in MARKERS:
        if agents.count(marker) != 1:
            errors.append(f"AGENTS.md must contain marker exactly once: {marker}")

    for key, tokens in REQUIRED_TOKENS.items():
        text = texts[key]
        for token in tokens:
            if token not in text:
                errors.append(f"{PATHS[key].relative_to(ROOT)} missing token: {token}")

    for key in ACTIVE_POLICY_KEYS:
        text = texts[key]
        for token in BANNED_CURRENT_POLICY:
            if token in text:
                errors.append(
                    f"{PATHS[key].relative_to(ROOT)} contains superseded active-policy text: {token}"
                )

    if errors:
        return report(errors)

    print(
        "PASS: KSP foundation is compact, target-runtime-first, dispatch-traceable, "
        "security-aligned, and explicit about data/side-effect boundaries"
    )
    return 0


def report(errors: list[str]) -> int:
    for error in errors:
        print(f"ERROR: {error}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
