# The teaching API contract

This contract defines the fixture's intended behavior before interpreting results.
All examples are synthetic. The process starts with zero orders and this product:

```json
{"sku":"QA-NOTEBOOK","name":"QA notebook","unitPriceCents":1299,"stock":10}
```

## Identity and transport

- Alice: `Authorization: Bearer demo-alice-token`.
- Bob: `Authorization: Bearer demo-bob-token`.
- Unknown tokens, missing authorization and a token without the Bearer scheme return
  `401` with `{"error":{"code":"UNAUTHENTICATED"}}`.
- All responses are JSON. The application binds to loopback, using HTTP for this lab.
- `GET /health` is unauthenticated and returns `{"status":"ready"}`.

## Endpoints

| Method and route | Expected behavior |
| --- | --- |
| `GET /products/QA-NOTEBOOK` | 200; current product, price and available stock |
| `POST /orders` | Accept JSON with the known `sku` and a positive safe-integer `quantity` |
| `GET /orders/{id}` | 200 for owner; 403 FORBIDDEN for another user; 404 ORDER_NOT_FOUND for absent ID |
| `GET /orders` | 200; `orders` array containing only the authenticated user's orders |

Successful creation returns 201 and a `Location: /orders/{id}` header. The response
has exactly these fields; the ID is generated for each order:

```json
{
  "id":"80983c16-591d-4f04-a756-eb5f4eac7df7",
  "owner":"alice",
  "status":"confirmed",
  "items":[{"sku":"QA-NOTEBOOK","quantity":2,"unitPriceCents":1299}],
  "totalCents":2598
}
```

Creation records one order and reduces stock by its quantity. Prices come from
the catalog; total equals quantity times unit price in integer cents. This fixture
supports only one item per order, one product and one currency with two decimal
places. Extra request fields are ignored, not accepted as authoritative prices.

## Error behavior and side effects

| Condition | HTTP | Error code |
| --- | --- | --- |
| Missing/invalid authentication | 401 | UNAUTHENTICATED |
| Unsupported request media type | 415 | UNSUPPORTED_MEDIA_TYPE |
| Malformed JSON | 400 | INVALID_JSON |
| JSON body larger than 16 KiB | 413 | PAYLOAD_TOO_LARGE |
| Missing/unknown product | 400 | INVALID_PRODUCT |
| Quantity is not a positive safe integer | 400 | INVALID_QUANTITY |
| Quantity exceeds current stock | 409 | INSUFFICIENT_STOCK |
| Another user's existing order | 403 | FORBIDDEN |
| Unknown order | 404 | ORDER_NOT_FOUND |
| Unknown authenticated route | 404 | ROUTE_NOT_FOUND |

Errors have the shape `{"error":{"code":"CODE"}}`. Rejected creations must leave
stock and order inventory unchanged. Authentication is checked before request
validation. This fixture intentionally returns 403 for another user's existing ID;
some real systems choose 404 to avoid revealing existence. Follow the real contract.

The automated case covers a selected subset of this contract. Media type, malformed
JSON, body size and unknown product checks are implemented in the fixture but are
not claimed as automated coverage. See the risk map and learning exercises.
