#!/usr/bin/env python3
"""Validate the Knowledge Sharing Platforms agent/governance foundation."""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
AGENTS = ROOT / "AGENTS.md"
README = ROOT / "README.md"
DOCS_README = ROOT / "docs" / "README.md"
WORK_CONTROL = ROOT / "docs" / "agent-governance" / "work-control.md"
DISPATCH_CONTROL = ROOT / "docs" / "agent-governance" / "dispatch-control.md"
HANDOFF = ROOT / "docs" / "handoff-template.md"
PR_TEMPLATE = ROOT / ".github" / "pull_request_template.md"
TARGET_DECISION = ROOT / "docs" / "decisions" / "target-runtime-first-development.md"
OLD_DECISION = ROOT / "docs" / "decisions" / "implementation-first-final-live-qualification.md"
IMPLEMENTATION_PLAN = ROOT / "docs" / "planning" / "apps-script-implementation-plan.md"
ROADMAP = ROOT / "docs" / "planning" / "mvp-and-roadmap.md"
ARCHITECTURE = ROOT / "docs" / "architecture" / "target-architecture.md"
RUNTIME_POLICY = ROOT / "docs" / "operations" / "runtime-policy.md"
SECURITY = ROOT / "docs" / "governance" / "security.md"
GEMINI = ROOT / "docs" / "ai" / "gemini-file-search.md"
REPOSITORY_INITIALIZATION = ROOT / "docs" / "repository-initialization.md"
DECISION_LOG = ROOT / "docs" / "decisions" / "decision-log.md"
CHANGELOG = ROOT / "docs" / "core-rules-changelog.md"

REQUIRED_PATHS = [
    AGENTS,
    README,
    DOCS_README,
    WORK_CONTROL,
    DISPATCH_CONTROL,
    HANDOFF,
    PR_TEMPLATE,
    TARGET_DECISION,
    OLD_DECISION,
    IMPLEMENTATION_PLAN,
    ROADMAP,
    ARCHITECTURE,
    RUNTIME_POLICY,
    SECURITY,
    GEMINI,
    REPOSITORY_INITIALIZATION,
    DECISION_LOG,
    CHANGELOG,
]

ACTIVE_POLICY_PATHS = [
    AGENTS,
    README,
    DOCS_README,
    WORK_CONTROL,
    HANDOFF,
    PR_TEMPLATE,
    TARGET_DECISION,
    IMPLEMENTATION_PLAN,
    ROADMAP,
    ARCHITECTURE,
    RUNTIME_POLICY,
    SECURITY,
    GEMINI,
    REPOSITORY_INITIALIZATION,
    DECISION_LOG,
]

REQUIRED_CORE_TOKENS = [
    "CORE_RULES_VERSION: 2.2",
    "target-runtime-first",
    "LOGIC_VALIDATION",
    "TARGET_RUNTIME_QUALIFICATION",
    "SIDE_EFFECT_STATE",
    "docs/agent-governance/work-control.md",
    "docs/agent-governance/dispatch-control.md",
    "docs/decisions/target-runtime-first-development.md",
]

REQUIRED_WORK_CONTROL_TOKENS = [
    "### BUILD",
    "### INCIDENT_RECOVERY",
    "### INVESTIGATION",
    "### QUALIFICATION",
    "## 3. Target-runtime-first development",
    "### Separate staging decision gate",
    "LOGIC_VALIDATION",
    "TARGET_RUNTIME_QUALIFICATION",
    "SIDE_EFFECT_STATE",
]

REQUIRED_DISPATCH_TOKENS = [
    "<WORK_ID>-CODEX-<NN>",
    "CHATGPT",
    "CODEX",
    "USER",
    "NONE",
    "READY",
    "ACTION_REQUIRED",
    "RETURNED",
    "ACCEPTED",
    "<WORK_ID>-dispatches.md",
]

REQUIRED_HANDOFF_TOKENS = [
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
]

REQUIRED_PR_TOKENS = [
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
]

BANNED_CURRENT_POLICY = [
    "DEV and PROD use separate Apps Script projects and resource sets",
    "feature-complete後までApps Script / Workspace / Gemini実機確認を原則行わない",
    "standard live qualification only after feature freeze",
    "開発中は原則としてlocal / static / mock / contract validationだけを行う",
]


def require_tokens(text: str, tokens: list[str], label: str, errors: list[str]) -> None:
    for token in tokens:
        if token not in text:
            errors.append(f"{label} missing token: {token}")


def main() -> int:
    errors: list[str] = []

    for path in REQUIRED_PATHS:
        if not path.is_file():
            errors.append(f"missing required path: {path.relative_to(ROOT)}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    agents = AGENTS.read_text(encoding="utf-8")
    if len(agents.encode("utf-8")) > 12_288:
        errors.append("AGENTS.md exceeds 12 KiB compact-context budget")
    if len(agents.splitlines()) > 180:
        errors.append("AGENTS.md exceeds 180-line compact-context budget")

    for marker in [
        "<!-- CORE_RULES_START -->",
        "<!-- CORE_RULES_END -->",
        "<!-- REPOSITORY_SPECIFIC_RULES_START -->",
        "<!-- REPOSITORY_SPECIFIC_RULES_END -->",
    ]:
        if agents.count(marker) != 1:
            errors.append(f"AGENTS.md must contain marker exactly once: {marker}")

    require_tokens(agents, REQUIRED_CORE_TOKENS, "AGENTS.md", errors)

    status_match = re.search(r"REPOSITORY_RULES_STATUS:\s*(\w+)", agents)
    if not status_match or status_match.group(1) != "ACTIVE":
        errors.append("REPOSITORY_RULES_STATUS must be ACTIVE")

    work_control = WORK_CONTROL.read_text(encoding="utf-8")
    require_tokens(work_control, REQUIRED_WORK_CONTROL_TOKENS, "work-control guide", errors)

    dispatch_control = DISPATCH_CONTROL.read_text(encoding="utf-8")
    require_tokens(dispatch_control, REQUIRED_DISPATCH_TOKENS, "dispatch-control guide", errors)

    handoff = HANDOFF.read_text(encoding="utf-8")
    require_tokens(handoff, REQUIRED_HANDOFF_TOKENS, "handoff template", errors)

    pr_template = PR_TEMPLATE.read_text(encoding="utf-8")
    require_tokens(pr_template, REQUIRED_PR_TOKENS, "pull request template", errors)

    target_decision = TARGET_DECISION.read_text(encoding="utf-8")
    require_tokens(
        target_decision,
        [
            "Status: Accepted",
            "TARGET_RUNTIME",
            "ISOLATED_TEST_DATA",
            "SIDE_EFFECT_STATE",
            "Separate staging decision gate",
            "LOGIC_VALIDATION",
            "TARGET_RUNTIME_QUALIFICATION",
            "Work 0014",
        ],
        "target-runtime decision",
        errors,
    )

    old_decision = OLD_DECISION.read_text(encoding="utf-8")
    require_tokens(
        old_decision,
        [
            "Status: Superseded on 2026-08-26",
            "docs/decisions/target-runtime-first-development.md",
            "Why superseded",
        ],
        "historical live-qualification decision",
        errors,
    )

    plan = IMPLEMENTATION_PLAN.read_text(encoding="utf-8")
    require_tokens(
        plan,
        [
            "shortest coherent vertical slice",
            "production source path",
            "LOGIC_VALIDATION",
            "TARGET_RUNTIME_QUALIFICATION",
            "SIDE_EFFECT_STATE",
            "production business helpers must live in production source",
        ],
        "implementation plan",
        errors,
    )

    roadmap = ROADMAP.read_text(encoding="utf-8")
    require_tokens(
        roadmap,
        [
            "shortest coherent production-source vertical slice",
            "actual target runtime",
            "isolated synthetic/anonymized test data/resources",
            "LOGIC_VALIDATION",
            "TARGET_RUNTIME_QUALIFICATION",
        ],
        "roadmap",
        errors,
    )

    architecture = ARCHITECTURE.read_text(encoding="utf-8")
    require_tokens(
        architecture,
        [
            "A separate DEV/Staging runtime is optional",
            "Production business helpers must exist in production source",
            "Target-runtime qualification",
            "Work 0014",
        ],
        "target architecture",
        errors,
    )

    runtime_policy = RUNTIME_POLICY.read_text(encoding="utf-8")
    require_tokens(
        runtime_policy,
        [
            "A separate DEV/Staging runtime is not the default",
            "Isolated test data/resources",
            "Consequential effects",
            "LOGIC_VALIDATION",
            "TARGET_RUNTIME_QUALIFICATION",
        ],
        "runtime policy",
        errors,
    )

    security = SECURITY.read_text(encoding="utf-8")
    require_tokens(
        security,
        [
            "Target runtime is not production exposure",
            "Production business helpers must exist in production source",
            "Current policy redacts",
            "LOGIC_VALIDATION",
            "TARGET_RUNTIME_QUALIFICATION",
        ],
        "security baseline",
        errors,
    )

    gemini = GEMINI.read_text(encoding="utf-8")
    require_tokens(
        gemini,
        [
            "Target runtime, test data, and side effects",
            "Current policy redacts the question/additional-instruction text",
            "LOGIC_VALIDATION",
            "TARGET_RUNTIME_QUALIFICATION",
            "SIDE_EFFECT_STATE",
        ],
        "Gemini design",
        errors,
    )

    repository_initialization = REPOSITORY_INITIALIZATION.read_text(encoding="utf-8")
    require_tokens(
        repository_initialization,
        [
            "Default BUILD work to the actual target runtime",
            "Separate staging decision",
            "Logic validation",
            "Target-runtime qualification",
            "python tools/validate_agent_foundation.py",
        ],
        "repository initialization",
        errors,
    )

    decision_log = DECISION_LOG.read_text(encoding="utf-8")
    require_tokens(
        decision_log,
        [
            "## 2026-08-26 — Target-runtime-first development",
            "permanent DEV/PROD project separation is superseded",
            "docs/decisions/target-runtime-first-development.md",
        ],
        "decision log",
        errors,
    )

    changelog = CHANGELOG.read_text(encoding="utf-8")
    require_tokens(changelog, ["## 2.2 — 2026-08-26", "target-runtime-first"], "Core changelog", errors)

    for path in ACTIVE_POLICY_PATHS:
        text = path.read_text(encoding="utf-8")
        for token in BANNED_CURRENT_POLICY:
            if token in text:
                errors.append(
                    f"{path.relative_to(ROOT)} contains superseded active-policy text: {token}"
                )

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print(
        "PASS: KSP agent foundation is compact, target-runtime-first, "
        "dispatch-traceable, security-aligned, and explicit about data/side-effect boundaries"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
