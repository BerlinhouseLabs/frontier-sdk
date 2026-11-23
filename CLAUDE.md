# frontier-sdk

`@frontiertower/frontier-sdk`: TypeScript SDK that Frontier OS apps (iframes) use to talk to the Frontier Wallet host over `postMessage`. Public, MIT, published to npm. Org-wide rules: [repo standards](https://github.com/BerlinhouseLabs/berlinhouse-labs/blob/staging/index/guidelines/repo-standards.md). Open PRs against `staging`; `main` only takes release PRs. This repo is public: never commit secrets, internal hostnames or internal process detail.

## Hard rules

1. **Public API changes are breaking for every app.** Apps pin an exact version, but keep exported types and method names stable; add, don't rename or remove, outside a major/minor bump.
2. **Permissions are part of the contract.** Each access method maps to a `category:method` permission string. When you add or rename a method, update the Permissions list in `README.md` in the same PR.
3. **Don't loosen the origin check.** Allowed host origins are listed in `src/ui-utils/detection.ts` (localhost:5173, sandbox and production wallet). Changing them changes who the SDK trusts.
4. **No publishing from CI or in a PR.** Publishing is manual (`./release.sh`); don't run `npm publish` unless asked.
5. **Amounts are `bigint` base units.** Use `parseAmount`/`formatAmount` from `src/token-amount.ts`; no floats.

## Commands

```bash
npm ci          # Node 22 (.nvmrc)
npm test        # vitest run (happy-dom)
npm run build   # tsup -> dist/ (cjs, esm, d.ts)
```

CI runs `npm ci`, build and test. `npx tsc --noEmit` currently fails on test files, so it isn't in CI yet.

## Map

- `src/sdk.ts`: `FrontierSDK` class and the postMessage request/response transport
- `src/access/*.ts`: one access class per module (wallet, user, storage, events, communities, partnerships, offices, third-party, chain, navigation)
- `src/access-controls.ts`: signature verification for verified access controls
- `src/ui-utils/`: `isInFrontierApp`, standalone fallback message (separate `/ui-utils` export)
- `src/test/`: vitest suites mirroring `src/`

## Deploys and rollback

Merging deploys nothing. Release = bump version + `./release.sh`. Roll back by publishing a fixed patch and `npm deprecate`-ing the bad version.

## Exceptions to the org repo standards

- npm publishing is manual (`release.sh`), not on merge.
- No lint/format, coverage floor, PR-title check or dependency audit in CI yet (tracked org-wide in berlinhouse-labs#18).
