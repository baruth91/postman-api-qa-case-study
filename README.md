# Order integrity with Postman

[![Postman checks](https://github.com/baruth91/postman-api-qa-case-study/actions/workflows/api.yml/badge.svg)](https://github.com/baruth91/postman-api-qa-case-study/actions/workflows/api.yml)

A practical QA case study about order totals, stock integrity and access control.
The purpose is to share runnable examples with the QA community and explain
**what to test, why it matters and what a passing result actually proves**.

This is part of Phillip Baruth's learning-in-public portfolio. The tests and the
small application are original educational material. This is a controlled teaching
API, not a commercial product or a claim of production security certification.

## Run the complete case

Install **Node.js 22** (the verified version is in `.nvmrc`) and Git:

```sh
git clone https://github.com/baruth91/postman-api-qa-case-study.git
cd postman-api-qa-case-study
npm ci
npm test
```

No Docker, database, Postman login or API key is required. The runner starts an
HTTP API on a free loopback port for each folder, invokes the pinned Postman CLI,
writes reports, closes the API and returns a nonzero exit code if a check fails.
Internet is needed to install dependencies; requests under test use loopback HTTP.

The baseline executes **31 HTTP requests and 99 assertions**: 13 requests for
the order lifecycle, plus three requests for each of six invalid quantity inputs.
These counts describe executions, not 99 independent business scenarios.

## What this demonstrates

- Request chaining: create an order and retrieve the same generated ID.
- Independent monetary expectations: two items at 1,299 cents must total 2,598.
- State verification: stock changes from ten to eight; rejected writes leave no order.
- Authentication versus authorization: missing/invalid credentials return 401;
  another authenticated user cannot read Alice's order and receives 403.
- Data-driven negative cases: zero, negative, fractional, string, null and excess quantity.
- JSON schema, response values, headers and error contracts.
- Reproducible execution, useful reports and a deliberately failing exercise.

## Run online

Open [Actions → Postman order case checks](https://github.com/baruth91/postman-api-qa-case-study/actions/workflows/api.yml),
choose **Run workflow → main → Run workflow**, and open the resulting run.
The workflow starts its own local API inside an Ubuntu runner. Download the
`postman-order-evidence` artifact for JSON, JUnit XML, console logs and a summary.
Manual execution requires repository permissions; other learners can fork the
repository and enable Actions. Pushes and pull requests also run the baseline.

## Explore in the Postman app

1. Run `npm run app` in a terminal. It starts fresh state at `http://127.0.0.1:3000`.
2. Import `postman/orders.postman_collection.json` and
   `postman/local.postman_environment.json` into Postman; select that environment.
3. Run only the **Lifecycle** folder once, in its saved order.
4. Stop the API with Ctrl+C and run `npm run app` again to reset state.
5. Run only **Quantity boundaries**, selecting `postman/quantity-cases.json` as data.

Do not run both folders against the same instance: they deliberately require
different starting states. Do not repeat Lifecycle without resetting. The automated
runner handles this isolation for you. Use the desktop app or an agent able to
reach localhost; a remote cloud agent cannot reach your machine's loopback address.
GUI steps are a guide; execution evidence was collected with the CLI.

The collection is stored as **v2.1 JSON**, which the pinned Postman CLI executes
and can report as JSON/JUnit. The CLI also supports newer collection formats;
format migration should be verified before replacing these files.
Newman was not selected because current official documentation marks it deprecated.

## Learn and demonstrate

| Read | Purpose |
| --- | --- |
| [Test strategy](docs/test-strategy.md) | Risks, selected coverage, dependencies and exclusions |
| [API contract](docs/api-contract.md) | Explicit behavior and synthetic data |
| [Guided tutorial](docs/tutorial.md) | Variables, chaining, data types, assertions and exercises |
| [Demo script](docs/demo.md) | A practical 8–10 minute presentation |
| [Validation record](docs/validation.md) | Observed results and limitations |
| [Architecture decisions](docs/decisions.md) | Why a local API, Postman CLI and in-memory data |

To investigate a controlled failure:

```sh
npm run demo:failure
```

This command intentionally exits **1**: only the expected total is changed to
2,599 cents. The create/read total assertions should fail while the API returns
2,598. Reports go to `reports/deliberate-failure/`. Run `npm test` for the correct
baseline; source files are unchanged by the exercise.

## Scope and next step

The API stores data **in memory**. Reading an order proves retention during that
process's lifetime, not database persistence or durability. Demo bearer tokens are
public fixtures, not real credentials. TLS, OAuth/JWT, concurrency, idempotency,
performance and comprehensive security testing are outside this first slice.

The next planned case is **Python + Requests + pytest + PostgreSQL**, covering
SQL, constraints, transactions and API/database consistency in a separate repository.

## Official references and license

- [Postman CLI installation](https://learning.postman.com/docs/postman-cli/postman-cli-installation)
- [Collection commands and reports](https://learning.postman.com/docs/postman-cli/postman-cli-collections)
- [Newman status and format limitations](https://learning.postman.com/docs/reference/newman-cli/command-line-integration-with-newman)

Original repository material is MIT licensed. Postman CLI is a third-party binary
distributed under its own terms; this repository does not relicense it.
