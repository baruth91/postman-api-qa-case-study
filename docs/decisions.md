# Architecture decisions

## A controlled local teaching application

Public demonstration APIs can change state, go offline or return canned responses.
This small original application makes starting data and behavior reviewable and
repeatable. Real HTTP requests still cross a process boundary between Postman CLI
and Node. It is a deliberately limited teaching fixture, not an adopted third-party
business application. A real project also needs agreement with product owners on
requirements; here the written contract makes those assumptions explicit.

## Postman CLI 1.80.0, installed locally

Current official documentation marks Newman deprecated and directs users to
Postman CLI. The npm dependency and lockfile pin CLI 1.80.0 and platform binary
integrities. No global installation is needed. All HTTP tests and assertions live
in the collection; Node only serves the API and coordinates execution.

The v2.1 JSON format is used for readable portable import and verified JSON/JUnit
reporting. This does not mean the project uses Newman. Newer v3 formats are an
optional later migration with their own reporter compatibility to verify.

## In-memory state now; PostgreSQL later

The first slice teaches HTTP contracts, chaining and side-effect oracles without a
database prerequisite. New API instances reset all state. Database persistence,
constraints, migrations and transaction isolation belong to the planned Python /
Requests / PostgreSQL case. Keeping that distinction prevents overstating evidence.

## No implicit cloud dependency

The runner passes local collection/environment paths, disables run-event reporting
and does not supply a Postman API key. CLI 1.80.0 emits a login/publishing notice
when unauthenticated; local assertions still run and their exit status is respected.
There is no Postman workspace binding or cloud collection ID in this repository.
The CLI remains a third-party application; this is not a guarantee of zero outbound
traffic or a replacement for reviewing its terms and telemetry settings.

## Integer money and exact state expectations

The fictional domain uses integer cents to avoid binary floating-point arithmetic
for money. The tests compare concrete independent expectations instead of deriving
the expected total from the returned total. Stock and order listings expose partial
writes in the selected rejection cases.

## Explicit exclusions

No payment provider, tax rules, discounts, real identity provider, transport security,
load testing or cross-process concurrency is implemented. A single Node process
has no await between stock validation and mutation, but that does not demonstrate
distributed atomicity or database transaction behavior.

References: [Postman CLI install](https://learning.postman.com/docs/postman-cli/postman-cli-installation),
[collection commands](https://learning.postman.com/docs/postman-cli/postman-cli-collections),
[Newman status](https://learning.postman.com/docs/reference/newman-cli/command-line-integration-with-newman).
