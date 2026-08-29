# Bundle integrity and installer security

Current as of: 2026-08-29

Status: Accepted clarification

Work ID: `0023`

This decision supplements `docs/decisions/modular-source-single-bundle-distribution.md`. If the documents conflict on bundle hashing, installer exposure, OAuth verification, or one-file feasibility, this clarification governs.

## 1. Purpose

Preserve the accepted distribution model:

```text
modular authoritative source under src/
-> deterministic generated distribution
-> one KnowledgeShare.bundle.gs paste
-> one idempotent installer
-> explicit minimum platform-only steps
```

The clarification closes four implementation risks before Work 0023 begins:

1. a bundle cannot contain its own ordinary final SHA-256 without a defined canonicalization rule;
2. an editor-visible Apps Script function without a trailing underscore is potentially callable from HTML Service by name;
3. the one-paste route does not itself reproduce the source-controlled manifest and OAuth contract;
4. a generated single file must be proven to fit and save in the actual Apps Script editor/runtime.

## 2. Installer invocation and authorization boundary

The intended editor entry points remain:

```text
installKnowledgeShare()
checkKnowledgeShareReadiness()
```

They are not linked from normal product pages. However, the absence of a UI button is not a security boundary. Apps Script HTML pages can call top-level server functions by name through `google.script.run`; therefore both functions must be treated as externally invocable.

### Required controls

Before any resource, setting, trigger, property, sheet, permission, deployment-related, or provider mutation, the installer wrapper must:

- require a container-bound Google Spreadsheet;
- require a non-empty active-user identity;
- on first installation, require the active and effective users to match and persist that active user as the initial installer/administrator;
- after installation state exists, require the active user to be in the authoritative administrator allowlist;
- never authorize a normal Web App caller merely because the Web App executes as the deploying user;
- fail closed before calling `kspRunSetup_()` when identity or authorization is ambiguous;
- return only a safe action/status message and no private resource identifiers;
- keep setup, validation, migration, trigger, provider, and Drive helpers private with trailing underscores.

An authorized administrator invoking the wrapper from the browser console is not an escalation, but the operation must still remain bounded, idempotent, audited at safe metadata level, and incapable of broadening access. An ordinary user or unidentified caller must be rejected.

### Required tests

- no normal HTML resource references either installer function;
- a forged normal-user `google.script.run` call is rejected before mutation;
- blank active-user identity is rejected before mutation;
- first-install active/effective-user mismatch is rejected before mutation;
- authorized editor first install succeeds;
- authorized administrator rerun is idempotent;
- public-surface validation distinguishes normal-user facades from guarded editor/operator entry points.

## 3. Non-self-referential hash model

Do not place an ordinary SHA-256 of the final bundle bytes inside those same bytes. That creates an undefined self-reference.

Use two explicit hashes:

```text
bundle_payload_sha256
  SHA-256 over canonical bundle bytes with the payload-hash field replaced by one fixed placeholder

bundle_file_sha256
  SHA-256 over the final emitted KnowledgeShare.bundle.gs bytes
```

Rules:

- the bundle header may contain `bundle_payload_sha256`, source commit, release version, schema version, and build profile;
- the canonical placeholder and normalization algorithm must be versioned and implemented once in the builder and validator;
- `dist/release-manifest.json` records both `bundle_payload_sha256` and the actual `bundle_file_sha256`;
- the installer records release version, schema version, source commit, build profile, and `bundle_payload_sha256` in installation state/Settings;
- the full-file checksum remains externally verifiable from the release manifest or release asset checksum;
- the validator recomputes both hashes and fails on mismatch;
- two builds from the same source commit and profile must remain byte-identical.

No wall-clock build timestamp may enter deterministic output. A source-commit timestamp may be included only when derived deterministically and documented.

## 4. Manifest, Advanced Service, and OAuth parity

The source-controlled `src/appsscript.json` remains the approved manifest contract. The normal one-paste route may use the Apps Script editor's generated manifest plus the documented Advanced Drive service step, while the technical route may use generated `dist/appsscript.json`.

Fresh-install qualification must prove:

- Advanced Drive v3 is available when the retained implementation requires it;
- V8 and `Asia/Tokyo` behavior are preserved;
- the actual authorization prompt/runtime grants no unexpected scope outside the approved product contract;
- Gmail scopes are absent unless a future product decision genuinely requires Gmail;
- required Drive, Docs, Sheets, trigger-management, and external-request behavior works after authorization;
- the generated manifest is semantically equivalent to the approved source manifest for the selected distribution profile.

A pasted bundle is not considered equivalent merely because its JavaScript parses.

## 5. Single-file size and paste feasibility gate

The builder and release manifest must record at least:

```text
bundle byte count
bundle character count
bundle line count
embedded HTML resource count
server source count
```

Before a release is called installable, a fresh target-runtime qualification must prove that the exact generated bundle can be pasted once, saved, parsed, selected in the function menu, and executed in the intended company-like Apps Script editor/runtime.

The release validator must check the then-current platform limits rather than hard-code an unverified permanent number. If the exact bundle cannot be saved or executed as one file, classify that as a Work 0023 blocker and perform a strategy reset. Do not silently fall back to asking the normal operator to create many source files.

## 6. HTML resource compatibility

The accepted resource-loader design remains valid:

```text
modular mode -> HtmlService file resources
bundle mode  -> generated inert HTML string map
```

The bundle path must create templates/outputs from strings through `HtmlService`, preserve all template scriptlets and includes, and never execute client JavaScript as server code. Every HTML resource and include/template reference must resolve exactly once in both modes.

## 7. Additional acceptance gates

Work 0023 acceptance adds:

```text
INSTALLER_UNAUTHORIZED_CALL_REJECTION: PASS
INSTALLER_FIRST_RUN_IDENTITY_GATE: PASS
BUNDLE_HASH_CANONICALIZATION: PASS
BUNDLE_FILE_CHECKSUM: PASS
OAUTH_AND_SERVICE_PARITY: PASS
ONE_PASTE_SAVE_AND_EXECUTE: PASS
```

These gates refine rather than expand the product scope. They protect the same objective: one low-friction company installation without weakening maintainability, security, or traceability.

## 8. Reusable standard boundary

The same controls belong in the later cross-project Apps Script standard:

- modular source remains authoritative;
- distribution hashes use a non-self-referential canonical model;
- editor-visible installer wrappers are treated as externally invocable and guarded server-side;
- manifest/OAuth parity is qualified separately from JavaScript parity;
- one-file feasibility is proven in the target runtime;
- product-specific resources, scopes, triggers, schemas, and readiness rules remain declarative extensions.
