# Product Brand

Status: ACCEPTED
Decision owner: User
Applies to: user-facing product branding

## Brand name

`Private Assets Intelligence`

This is the single user-facing product brand.

## Display rule

Main application brand area:
- show exactly `Private Assets Intelligence`
- remove `Knowledge Share`
- remove the small subtitle `PRIVATE ASSETS KNOWLEDGE`
- do not add `Platform`, `Hub`, `System`, or another subtitle

Browser titles:
- main app: `Private Assets Intelligence`
- standalone Knowledge Search: `ナレッジ検索 | Private Assets Intelligence`

If the brand must wrap responsively because of available width, it remains one brand phrase; do not add a second descriptive line.

## Internal names remain unchanged

This branding decision does not rename:
- GitHub repository `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- Apps Script internal identifiers
- function / variable / path / filename names
- API / RPC contracts
- Script Properties keys
- `Knowledge Platform Backend`
- `Knowledge Platform Audit`
- `Private Assets Knowledge` Drive resource names
- deployment IDs / resource IDs
- existing historical Work / report titles

Reason:
the user requested a user-facing brand change, and renaming internal identifiers creates unnecessary migration and recovery risk.

## Migration scope

Implement as a user-facing presentation change in Work0053 together with the Japanese UI copy review.

Expected runtime source changes are limited to product-visible titles / brand markup and any CSS required to fit the longer brand cleanly.

## Acceptance

- visible `Knowledge Share` brand: 0
- visible `Knowledge Sharing Platforms` product title: 0
- visible `PRIVATE ASSETS KNOWLEDGE` subtitle: 0
- visible brand: `Private Assets Intelligence`
- main document title: `Private Assets Intelligence`
- standalone search document title: `ナレッジ検索 | Private Assets Intelligence`
- internal resource / repository identifiers unchanged
