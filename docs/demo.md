# An 8–10 minute demonstration

## Preparation

Run `npm ci` before presenting. Keep the README, collection, strategy and one JSON
report open. For a GUI demonstration, start `npm run app` and import the collection
and environment. Use fresh state and only the Lifecycle folder. Desktop execution
is optional; the CLI is the verified baseline.

## Suggested narrative

1. **Problem, one minute.** “A green HTTP status does not prove an order is correct.
   I selected money, stock and ownership risks for this controlled example.”
2. **Contract, one minute.** Show the initial ten notebooks at 1,299 cents each.
   Predict the two-item total and final stock before running anything.
3. **Code, two minutes.** Show the create body, total assertion, schema check and
   saved order ID. Follow that ID into the GET. Explain environment versus
   collection variables and why the folder is an ordered journey.
4. **Run, one minute.** Execute `npm test`. Explain why it starts two fresh API
   instances and why each rejected quantity gets follow-up state checks.
5. **Access control, one minute.** Show Bob's rejected read and empty listing.
   Distinguish missing authentication from a valid identity lacking access.
6. **Failure, one minute.** Run `npm run demo:failure`, show the two failed total
   assertions and exit code. Explain why the expectation is deliberately wrong.
7. **Online evidence and limits, one minute.** Open the successful Actions run and
   artifacts. Explain in-memory state, synthetic tokens and planned PostgreSQL work.

Avoid reading the script word for word. The goal is to explain each choice and
respond to questions, not to memorize a tool demo.

## Questions to practice

- Why test through HTTP instead of calling the application function directly?
- Which expected values are independent of the implementation?
- Why is a JSON schema insufficient for monetary correctness?
- Why does the invalid-input suite inspect both stock and orders?
- What is intentionally dependent, and what is isolated between runs?
- What does the green workflow not establish about security or durability?
- Why Postman CLI rather than Newman? What would format migration affect?
- What would you test next if the business introduced multiple currencies?

A strong answer identifies a concrete risk and oracle, states assumptions and
acknowledges the limits of the current evidence.
