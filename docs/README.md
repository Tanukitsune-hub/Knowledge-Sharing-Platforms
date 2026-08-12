# Project Documentation

This directory is the durable knowledge base for the Knowledge Sharing Platforms project. The project is still in planning and has not started implementation or live operation; documents describing architecture, components, or integrations are target-state design unless explicitly stated otherwise.

## Template-provided guides

- `core-rules-changelog.md` — behavioral Core Rules history used to assess selective adoption by repositories created from earlier template versions.
- `repository-initialization.md` — detailed questionnaire and activation checklist for creating or re-profiling Repository-Specific Rules.
- `handoff-template.md` — concise structure for durable ChatGPT/Codex or agent-to-agent execution handoffs.

## Project knowledge

- `product/vision.md` — product purpose, target users, operating principles, and intended user experience.
- `architecture/target-architecture.md` — planned system architecture and component boundaries. This is not evidence that the architecture has been implemented.
- `planning/mvp-and-roadmap.md` — MVP scope, sequencing, and roadmap assumptions.
- `governance/security.md` — information handling, organizational ownership, AI, security, and governance constraints.
- `decisions/decision-log.md` — durable project decisions and rationale.
- `handoffs/` — durable execution handoffs and local handoff-authoring instructions when later work needs them.

## Documentation rules

- Keep durable design knowledge here rather than expanding root `AGENTS.md` into an encyclopedia.
- Update the relevant document when an implementation decision materially changes the target design.
- Do not describe planned integrations as deployed, approved, or operational without observed evidence.
- Do not store real meeting notes, meeting materials, personal information, unpublished fund or deal information, credentials, account identifiers, or private URLs in this repository.
- Create additional subdirectories such as `validation/` only when implementation begins and durable evidence actually exists.
