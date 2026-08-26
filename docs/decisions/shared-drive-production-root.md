# Production Shared Drive root decision

## Status

Accepted and closed.

## Production storage boundary

Production deployment does not use or transit through the deploying user's My Drive.

The operator selects a specific folder inside the organization-controlled Google Shared Drive and configures that folder as `knowledgeParentFolderId`.

The application then creates or reuses the authoritative knowledge root beneath that selected folder:

```text
Selected Shared Drive folder
└─ Private Assets Knowledge
   ├─ Meeting Records
   └─ Pitchbooks
```

`Private Assets Knowledge` is application-managed beneath the selected Shared Drive folder; the selected folder itself is not renamed or repurposed as the authoritative root.

`Meeting Records` and `Pitchbooks` remain the authoritative source locations. My Drive is not an accepted production fallback or staging location.

Derived `Knowledge Exports` may remain a sibling of `Private Assets Knowledge` under the same configured `knowledgeParentFolderId`, preserving the authoritative/derived boundary.

Administrative resources continue to use a separately configured `controlFolderId` with restricted access. It may also be located in an organization-controlled Shared Drive, but it must remain distinct from `knowledgeParentFolderId` and retain the restricted administrative access boundary.

No real folder IDs, Drive IDs, URLs, account identifiers, or organization-specific paths belong in GitHub. Production values are supplied only through the approved Apps Script runtime configuration / Script Properties.

## Consequences

- Production setup must accept a Shared Drive folder as `knowledgeParentFolderId`.
- Production qualification must verify the created/reused folders are direct descendants of that configured Shared Drive folder.
- No production workflow may silently fall back to My Drive if Shared Drive access is unavailable.
- DEV-only My Drive fallback evidence does not qualify Shared Drive-specific production behavior.
