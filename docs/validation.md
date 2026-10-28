# Validation record

## Baseline

Validation is recorded after execution, not inferred from implemented code.

| Environment | Scope | Result |
| --- | --- | --- |
| Windows, Node 22.23.2, Postman CLI 1.80.0 | Local collection baseline | Passed: 31 requests, 99 assertions, zero failures or skips |
| Ubuntu 24.04, same pinned runtime and CLI | GitHub Actions baseline | Pending first published run |

Expected baseline: 13 lifecycle requests / 45 assertions, and 18 quantity-boundary
requests / 54 assertions. Total: 31 requests / 99 assertions, with no skipped checks.
Request and assertion counts are not a count of independent product scenarios.
The recorded Windows folder durations were 1,277 ms and 1,668 ms. These are
observations, not performance targets, and exclude CLI startup/installation.

## Controlled failure

The local `npm run demo:failure` exercise returned exit code 1 and exactly two
failed monetary assertions: create and retrieve returned 2,598 cents while the
exercise expected 2,599. The other 43 lifecycle assertions passed. This confirms
failure detection and propagation without editing the baseline collection.

## Reproduce and inspect

Run `npm ci` then `npm test`. Inspect `reports/baseline/summary.json`, individual
JSON reports, JUnit XML and console logs. Runtime-generated IDs and dynamic ports
are expected to differ. Raw reports are ignored by Git; hosted runs preserve them
as artifacts for seven days. The linked workflow history retains job outcomes.

The GUI import procedure is documented but was not used as execution evidence.
Local checks use HTTP, public synthetic tokens and in-memory storage. They do not
prove production security, database durability, concurrency or full API coverage.
