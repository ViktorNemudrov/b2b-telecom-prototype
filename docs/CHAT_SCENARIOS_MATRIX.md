# Chat Scenarios Matrix

This matrix documents how assistant routing works after the refactor.

## Routing Order

1. `special mock` (strict allowlist)
2. `deterministic` (data-driven or calculable result)
3. `live AI` (OpenRouter)
4. `fallback-no-live` (when no API key is configured)

## Special Mock (allowlist only)

- Profanity / toxic input
- "Что ты умеешь" capability question
- Greeting / salutation small-talk
- "Как дела" small-talk

Intent phrases are controlled by `SPECIAL_MOCK_INTENTS` in `packages/shared/src/lib/assistantResponse.ts`
and protected by a snapshot test in `packages/shared/src/lib/assistantResponse.test.ts`.

## Deterministic Responses

- Invoices:
  - month filter
  - unpaid inline widget
  - totals and counters
- Calls:
  - missed calls inline widget
  - weekly summary widget
- Appeals:
  - list summary
  - active appeals navigation
- Analytics via `chatAnalytics`:
  - month compare
  - unpaid share
  - dynamics
  - top invoices
  - counts by month
  - max spend month
- Time/date
- Calculator
- Unit conversion
- Navigation intents

## Live AI

All requests that are not in special mock and are not resolved deterministically are passed to live AI when
`NEXT_PUBLIC_OPENROUTER_API_KEY` is set.

## Fallback Without Live AI

If no live key is configured and no deterministic/special route matches, user gets an explicit message that live AI is required.

## UI Smoke E2E

`e2e/assistant-routing.spec.ts` verifies UI route order:

1. special mock response
2. deterministic response with widget
3. live-or-fallback response
4. navigation to appeals from chat intent
5. navigation to invoice detail from unpaid invoices widget

## Anti-Nonsense Guard

- Live AI answers are validated by `isLiveResponseReliable(prompt, response)` in
  `packages/shared/src/lib/assistantResponse.ts`.
- If a live answer is not relevant to the prompt domain, chat shows a safe fallback response
  instead of untrusted text.
