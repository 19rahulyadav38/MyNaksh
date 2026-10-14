# MyNaksh: AI Conversation Experience

> One-line summary + screenshots + link to a demo video.

## Running
```bash
npm install
cd ios && pod install && cd ..
npm run ios   # or: npm run android
npm test
```
Dev-only: header toggle cycles load scenarios (OK / Empty / Error). Send failure rate is set in `src/features/chat/api/chatApi.ts`.

## Project structure
<!-- tree of src/ with one-line purpose per folder -->

## Component architecture
- Screen → Timeline → MessageRow → per-type message component (renderer map)
- AiMessage composes: bubble + RecommendationRail + FeedbackBar
- Shared shells (MessageBubble, RecommendationCard) own behaviour; leaf components own content.

## State management
- Why Zustand: minimal boilerplate, selector-level subscriptions, no provider re-render cascade.
- Normalized `byId` + `order`; per-row selectors so a feedback change re-renders one row.
- Side effects live in store actions; components are declarative.
- Optimistic send with `clientId`; retries are idempotent; `receive` dedupes.

## Recommendation rendering strategy
- Discriminated union + registry (`type → renderer`).
- **Adding a new type in 3 steps:** 1) add union variant 2) add card component 3) register it.
- Unknown types are skipped safely (forward compatibility with newer backends).
- Per-card error boundary isolates failures; single press handler is the seam for deep links / analytics / server-driven CTAs.

## Performance considerations
- FlashList with `getItemType` for per-type recycling; stable keys.
- `buildTimeline` is pure and memoized; rows `React.memo`'d with id-based selectors.
- Animations on the UI thread via Reanimated layout animations.
- Horizontal rails are lightweight, fixed-width cards (no measurement).

## Trade-offs
<!-- be honest: what was cut, what you'd do next -->
- No persistence / real backend / WebSocket; mock API with injected latency + failures.
- What I'd add next: WebSocket transport with reconnection & session recovery, pagination (load older), message persistence (MMKV), analytics events on card impressions/taps, Sentry, UI tests (RNTL), server-driven card layouts.
