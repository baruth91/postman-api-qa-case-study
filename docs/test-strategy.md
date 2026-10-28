# Test strategy and coverage decisions

## Product context and prioritization

A customer places an order for a notebook. Incorrect totals affect money;
incorrect stock affects fulfillment; incorrect ownership exposes customer records.
These risks justify fast HTTP checks before adding browser coverage. They are
qualitative priorities for this fictional product, not measured incident frequency.

| Risk | Priority | Selected evidence |
| --- | --- | --- |
| Wrong total or requested items | High | Exact quantity, catalog price, owner, status, schema and 2,598-cent expectation on create/read |
| Wrong resource returned | High | Generated ID is used in the next request and compared again in the listing |
| Stock deducted incorrectly | High | Exact stock 10 → 8 after ordering two items |
| Unauthorized reading or creation | High | Bob denied Alice's order; missing/invalid/malformed auth rejected; isolated user listing; final state checked |
| Invalid quantity creates partial state | High | Six rejected inputs, followed by unchanged stock and empty order listing for every row |
| Response shape breaks consumers | Medium | Selected JSON schema, JSON content type, Location and explicit error bodies |

Status codes alone would miss a wrong total, wrong resource or unintended write.
Response time is recorded for diagnosis but no arbitrary laptop timing threshold
is presented as a performance requirement.

## Isolation and intentional dependencies

Each folder gets its own new API instance, with a dynamic port. Lifecycle requests
are one ordered journey: creation supplies the ID for subsequent checks. They are
not independent tests and should not be shuffled. A failed creation can cause
dependent failures; inspect the earliest failure first.

Quantity boundary rows share a fresh instance and are all rejected. Each row
checks stock ten and an empty order list. If one row unexpectedly writes data,
later rows may also fail; this exposes contamination instead of hiding it with
an unconditional reset. The entire next run starts with new state.

The collection clears the journey ID at the beginning. No fixed order ID, shared
external account, sleeps, automatic retry or bypassed assertion is needed.

## Data selection

The successful journey uses quantity two. Negative rows are zero, negative one,
one-and-a-half, the string `"2"`, null, and eleven when stock is ten. Preserve
JSON types with `JSON.stringify` in the pre-request script; quoting a number in
the raw body would test a string instead.

The next useful extensions are successful lower/upper boundaries (one and ten),
missing quantity, malformed JSON and unknown product. These are exercises, not
implemented cases. Race conditions and repeated-submit idempotency need explicit
requirements and a suitable backend before adding checks.

## What a green run proves

The selected contract works for the executed examples against the committed local
fixture using real HTTP. It does not establish production fitness, complete API
coverage, real identity-provider integration, database transactions or durability.
The same repository owns fixture and tests: review the written contract and
independent expected values to avoid encoding the same mistake in both.

## Evidence and failure investigation

JSON reports contain request/response details and named assertions. JUnit reports
support automated test tools. Console logs and summary JSON aid quick diagnosis.
Only synthetic tokens are used, since reports may contain headers and bodies.

The deliberate failure changes the expected amount by one cent. A useful outcome
is two failed total assertions, a nonzero exit code and matching evidence on both
creation and retrieval. It verifies assertion and runner behavior; it is not a
comprehensive mutation-testing campaign.
