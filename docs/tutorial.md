# Learn the case one decision at a time

## 1. Read the risk before the assertion

Read the strategy and API contract. Predict the expected response for quantity two,
then for quantity zero. Explain why a 201 response is insufficient evidence that
the customer will be charged correctly.

Checkpoint: calculate `2 * 1299 = 2598` without reading an API response. This is an
independent expectation; copying `response.totalCents` into the expected value
would make the check meaningless.

## 2. Understand a request

In Postman, open `Lifecycle / 02 - Create a two-item order`. Identify the method,
base URL, route, authorization header, content type and JSON body. The demo token
identifies Alice. It is a fixture value, not a login implementation.

```json
{"sku":"QA-NOTEBOOK","quantity":2}
```

Checkpoint: explain the difference between request headers and body, and between
the number `2` and the string `"2"`.

## 3. Follow variables and identity

The environment provides `baseUrl`, `aliceToken`, `bobToken` and
`expectedTotalCents`. The runner overrides the URL with the new instance's port.
The collection variable `orderId` is assigned only after successful creation:

```javascript
if (pm.response.code === 201 && order.id) {
  pm.collectionVariables.set("orderId", order.id);
}
```

The next request calls `/orders/{{orderId}}`. This proves the API can retrieve the
resource it just created. The first request clears a stale ID from a previous GUI
run. Restart the API before a complete repeat.

Checkpoint: describe why a hard-coded ID could retrieve an unrelated fixture and
give misleading confidence.

## 4. Separate transport, schema and business checks

```javascript
pm.test("HTTP 201", () => pm.response.to.have.status(201));
pm.test("Order total equals independently calculated cents", () => {
  pm.expect(pm.response.json().totalCents)
    .to.eql(Number(pm.environment.get("expectedTotalCents")));
});
```

The status tells us the operation was accepted. The JSON schema checks structure
and types. The total assertion checks business meaning. The following GET checks
retention in memory, and the product GET checks a related state change.

Checkpoint: give an example that passes schema validation but fails a business
assertion. A positive integer total of 2,599 is one example.

## 5. Distinguish authentication from authorization

Alice and Bob both have valid demo identities. Bob receives 403 when requesting
Alice's order. An anonymous request receives 401. Bob's own list is empty.

Checkpoint: explain why testing only a missing token would not detect broken
resource ownership checks. Do not call these examples a complete security audit.

## 6. Preserve types in data-driven tests

Open `postman/quantity-cases.json`. Each row names the case, gives a typed value
and states the expected status and error code. The pre-request script constructs
the body with that value:

```javascript
pm.variables.set("invalidOrder", JSON.stringify({
  sku: "QA-NOTEBOOK",
  quantity: pm.iterationData.get("quantity")
}));
```

The same three requests run for each row: reject creation, inspect stock, list
orders. Those last checks make unintended side effects visible.

Checkpoint: explain why all rows must reject writes if they share this state.

## 7. Diagnose a controlled failure

Run `npm run demo:failure`. Expect exit code 1 and two total assertion failures.
Open `reports/deliberate-failure/lifecycle.json` or its log. The API returned
2,598, while the exercise asked for 2,599. This is an intentionally wrong test
expectation, not an application defect. Run `npm test` to return to the baseline.

Checkpoint: classify a connection refusal, a 403 instead of 200, and a wrong
expected total. Explain which evidence you would inspect before blaming the API.

## 8. Make a small independent change

Exercise A: copy the negative folder into a separate exercise collection. Add a
missing-quantity case using `{sku:"QA-NOTEBOOK"}`; expect 400 INVALID_QUANTITY and
unchanged state. Do not confuse an absent property with JSON null.

Exercise B: add an isolated valid-quantity journey for ten items. Predict status
201, total 12,990 and stock zero. Add a subsequent one-item request and expect 409
with no additional order. Use a new instance; do not insert this into the existing
journey without changing its starting-state assumptions.

Exercise C: design a malformed-JSON check. Explain why the request body cannot be
generated with JSON.stringify if the goal is invalid JSON.

Suggested answers: A has one rejection and no state change; B has one confirmed
order and zero stock even after the second request; C sends deliberately invalid
raw JSON and expects 400 INVALID_JSON. The exercises are not counted in baseline
coverage until implemented and executed.

## 9. Teach what the result means

Present one risk, one assertion and one failure. Say explicitly that this API has
no database. The next project will verify PostgreSQL persistence and transaction
behavior. Being able to explain the distinction is part of the learning outcome.
