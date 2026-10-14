---
name: mynaksh-chat
description: Build and extend MyNaksh, an AI conversation screen in React Native + TypeScript with a pluggable recommendation-card framework, long-press actions, AI feedback, optimistic sending and loading/error states. Use whenever working on this project: scaffolding, adding message or recommendation types, store logic, the timeline, the composer, tests, or the README.
---

# MyNaksh AI Conversation: build guide

The product spec is `docs/product-spec.md`. Read it if it isn't already in context. This skill records *how* to build it.

## Who you're building with

The engineer is a Lead React Native engineer (~5 yrs) who has shipped production real-time chat/voice consultation apps for an astrology company. That work included WebSocket session recovery, message dedup, optimistic flows, crash hardening, and work on re-renders and startup time. They know Zustand, Redux, TanStack Query and Reanimated well.

Implications:
- Don't explain RN basics. Explain only non-obvious decisions, briefly.
- Code should read like a senior production codebase: strict types, small pure functions, no `any`, no dead code.
- Favour **architecture over polish**. Every structural choice should be easy to explain in the README.
- Show production instincts (idempotent retries, dedup by client id, unknown-type fallbacks, error isolation) but **don't over-engineer**. Put effort into completeness, tests and a clear README, not speculative abstractions. Unused abstractions are a cost, not a feature.

## Stack (decided, don't re-litigate)

- React Native CLI, latest stable, New Architecture on, TypeScript `strict`.
- **Zustand** for state, with fine-grained selectors. No Context for app state.
- **@shopify/flash-list** for the timeline. Check the installed major version's API before using props: v2 drops `estimatedItemSize` and supports `maintainVisibleContentPosition`.
- **react-native-reanimated** for press feedback, chip expand/collapse and entering animations. Prefer layout animations (`FadeIn`, `LinearTransition`) over hand-rolled ones.
- **@react-navigation/native** + native-stack: a single `Chat` screen, but navigation must be wired.
- **@react-native-clipboard/clipboard** for Copy.
- **react-native-safe-area-context**, and `KeyboardAvoidingView` (or `react-native-keyboard-controller` if it's already installed) for the composer.
- Jest for pure-logic tests. Skip UI snapshot tests.

Pin exact versions that are known to work with the RN version you scaffold. After installing any native dependency, run `cd ios && pod install`.

## Environment notes
- The project is on RN 0.87.1, Reanimated 4.7.1 + Worklets 0.13.0, and FlashList 2.3.3. All versions are pinned exactly.
- This Mac has only the Xcode Command Line Tools, so **iOS can't be built here**. Verify on the Android emulator (`Medium_Phone_API_36.1`) with `npx react-native run-android`. Pods are installed for when Xcode is available.
- Jest mocks live in `jest.setup.js`: the Worklets mock, `react-native-reanimated/mock`, and a no-op stub of Reanimated's `initializers` module (both `src/` and `lib/module/` paths). Without the stub, Reanimated 4.7 throws `setCSSEventHandler is not available` as soon as a component importing it is rendered. `setUpTests()` hits the same error.
- RNTL v14: `render` and `fireEvent` are async, so always `await` them.
- The emulator can't show a docked soft keyboard (only Gboard's floating toolbar), so keyboard avoidance has to be checked by hand.
- Imports are relative. There's no path alias, to avoid adding a Babel plugin.
- Don't use RN `Modal` for bottom sheets: on Android edge-to-edge its window stops short of the bottom even with `navigationBarTranslucent`. `MessageActionSheet` is an absolute overlay with a `BackHandler`.
- A cold start on the emulator takes about 8s before JS runs. Wait for `Running "MyNaksh"` in logcat before taking screenshots.
- `__DEV__` header toggle cycles ok → empty → error; long-pressing it injects an astrologer message after 3s (scroll up meanwhile to demo the "new messages" pill). Any message containing "fail" fails its first send attempt, which makes the retry flow easy to demo.

## Guided tour
- `src/features/tour/` is a demo layer on top of chat: `tourSteps.ts` (title, why, `run(context)`, optional `completesOn` analytics event), `tourStore.ts` (progress; subscribes to analytics via `addAnalyticsSink`), `TourSheet` and `TourButton` (header). It auto-opens once per session after the first load. New features should get a tour step.
- Bottom sheets use `shared/components/BottomSheet`.

## Folder structure

```
src/
  app/                    # App.tsx, navigation, providers
  features/chat/
    screens/ChatScreen.tsx
    components/
      timeline/           # Timeline, DateSeparator, MessageRow
      messages/           # UserMessage, AiMessage, HumanMessage, SystemMessage, MessageBubble
      composer/           # Composer, ReplyPreview
      actions/            # MessageActionSheet
      feedback/           # FeedbackBar, FeedbackChips
      states/             # LoadingState, EmptyState, ErrorState
    recommendations/
      types.ts            # discriminated union
      registry.ts         # type -> renderer map + register()
      RecommendationRail.tsx
      RecommendationCard.tsx   # shared shell (press, a11y, error boundary)
      cards/              # GemstoneCard, TarotCard, ConsultationCard, ArticleCard, PromotionCard
      actions.ts          # handleRecommendationPress (Alert today, deep link later)
    store/
      chatStore.ts
      selectors.ts
    api/
      mockData.ts         # sample API payload, extended
      chatApi.ts          # fetchConversation, sendMessage (delay + failure injection)
    model/
      types.ts            # Message union, status, feedback
      timeline.ts         # buildTimeline(): pure, tested
  shared/
    theme/                # tokens: colors, spacing, radii, typography
    components/           # Pressable wrappers, Chip, ErrorBoundary
    utils/                # id(), formatDate(), assertNever()
__tests__/
```

## Core design: follow this

### 1. Data model (`model/types.ts`)
Make messages a discriminated union on `type: 'user' | 'ai' | 'human' | 'system'`. Extend the sample API schema with:
- `createdAt: number`. The mock has no timestamps; give the seed messages times across two days so date separators show.
- `senderId?`
- `status?: 'sending' | 'sent' | 'failed'`, on user messages only.
- `clientId?`, used for optimistic sends and dedup.
- `replyTo?: { id, preview, type }`
- `feedback?: { value: 'like' | 'dislike' | null; reasons: FeedbackReason[] }`, on AI messages only.
- `recommendations?: Recommendation[]`, on AI messages only.

Use `assertNever` in every switch over a union so a new type fails at compile time.

### 2. Recommendation framework (the most important part)
- `Recommendation` is a discriminated union on `type`. Every variant shares `id`, `title`, `subtitle?`, `imageUrl?` and `cta?`. Variant-specific fields go in their own variant.
- **The registry** (`registry.ts`) is a `Record<RecommendationType, RecommendationRenderer>`. A renderer is `{ component, accent?, icon? }`. Adding a type means: add a union variant, add a card file, add one registry line. Nothing else changes. State this 3-step recipe in the README.
- Data from the server can't be trusted. Run a light type guard on incoming recommendations. If a `type` isn't registered, render nothing and `console.warn` in `__DEV__` (or use a generic fallback card; pick one and document it). An old app build must never crash on a new type.
- `RecommendationCard` is the shared shell. It handles press, Reanimated scale feedback, `accessibilityRole="button"`, and a per-card **ErrorBoundary**, so one broken card can't take down the message. The variant cards only render content.
- `RecommendationRail` is a horizontal `FlatList`, clipped to the 16px screen gutter, with `snapToOffsets` (first card under the bubble, later cards flush to the gutter) and stable keys `${messageId}:${rec.id}`. Recommendation ids are only unique within a message. Render it inside `AiMessage`.
- Tapping a card calls `handleRecommendationPress(rec)`. For now that shows an `Alert`. Keep it in one place so it can later become deep links, analytics, or server-driven `cta.action` values.

### 3. Store (`store/chatStore.ts`)
- Keep state normalized: `byId: Record<string, Message>` plus `order: string[]`. Also `loadState: 'idle' | 'loading' | 'success' | 'error'`, `replyTarget: Message | null`, and `actionTarget: string | null`.
- Actions: `load`, `send`, `retry`, `deleteMessage`, `setReplyTarget`, `setFeedback`, `toggleFeedbackReason`, `receive`. Make `receive` dedupe by `id`/`clientId`.
- Rows subscribe with `useChatStore(s => s.byId[id])`, so changing one message's feedback re-renders only that row. Use `useShallow` for derived arrays.
- Keep side effects (API calls) inside store actions. Components never call the API directly.

### 4. Timeline (`model/timeline.ts`)
- `buildTimeline(order, byId) => TimelineItem[]` is a **pure function**. It inserts `{ kind: 'date', id, label }` separators and marks each message with `isFirstInGroup` / `isLastInGroup`. A group is the same sender within 5 minutes; system messages break groups. Memoize it in the screen.
- `MessageRow` switches on message type through a small `messageRenderers` map, the same pattern as the recommendation registry. Wrap it in `React.memo`.
- Use FlashList with `getItemType` (`date` / `user` / `ai` / …) so cells recycle per type, and `keyExtractor` set to the id.
- Auto-scroll: with FlashList v2, use `maintainVisibleContentPosition={{ startRenderingFromBottom: true, autoscrollToBottomThreshold }}`. Otherwise, use an inverted list. Auto-scroll on a new message only when the user is near the bottom; this is what real chat apps do.
- Delete preserves position: remove the item from `order`, and rely on `maintainVisibleContentPosition` or inverted anchoring. Don't call scrollTo after a delete.

### 5. Conversation interactions
- **Long-press an AI message** opens `MessageActionSheet` (built on the shared `BottomSheet`: backdrop, timed slide-in, back button closes it) with Reply / Copy / Delete. Long-press on other types is optional. Trigger haptics if a haptics library is already installed.
  - Reply sets `replyTarget`. The composer shows `ReplyPreview` with a dismiss button, and the sent message carries `replyTo`.
  - Copy uses `Clipboard.setString` and shows a small toast or Alert.
  - Delete removes the message from `byId` and `order`. It must not jump the scroll position.
- **Feedback** is a 👍/👎 bar under every AI message. Choosing 👎 expands the chips (Inaccurate, Too Generic, Didn't Help, Too Long) with `entering={FadeIn}` and `layout={LinearTransition}`. Chips toggle multi-select. Choosing 👍 clears the reasons. Tapping the same thumb again deselects it.
- **Sending:**
  1. Generate a `clientId` and add the message immediately with `status: 'sending'`.
  2. Call `chatApi.sendMessage`, which waits 800–1500 ms and fails ~20% of the time (configurable).
  3. On success, set `sent`. On failure, set `failed` and show a "Failed · Retry" affordance.
  4. Retry reuses the same `clientId`, so retries stay idempotent.
  5. After a successful send, simulate an AI reply (typing indicator, then a canned AI message with 1–3 recommendations) so the framework demos live.
- **Load states:** `chatApi.fetchConversation` takes a delay and a scenario (`'ok' | 'empty' | 'error'`). The screen renders Loading / Empty ("Start your conversation.") / Error ("Unable to load conversation." + Retry). Add a `__DEV__`-only header button that cycles scenarios so all three states are easy to check and demo.

## Conventions
- Theme tokens live in `shared/theme`. Use no inline magic colors. Use `StyleSheet.create`, never inline style objects in rows.
- Callbacks passed to memoized rows go through `useCallback`. Pass ids, not whole objects, wherever a row selects from the store itself.
- Give interactive elements `accessibilityLabel`s.
- Use no `console.log` outside `__DEV__` guards.
- Use named exports. Use one component per file, unless the second is a tiny private subcomponent.

## Working approach
Work in small increments. Each one ends with a working app and a commit.

1. **Foundation:** scaffold, dependencies, pods, theme tokens, navigation, types, mock data.
2. **Conversation core:** store, `buildTimeline` with tests, the timeline, the 4 message components, the recommendation registry, the card shell, the cards and the rail. Get this solid before anything else.
3. **Interactions:** composer with optimistic send/retry, simulated AI reply with typing indicator, the action sheet, reply/copy/delete, feedback chips, load/empty/error states and the dev scenario toggle.
4. **Hardening and polish:** animations, keyboard handling on both platforms, accessibility, store/registry/component tests.
5. **Release:** README, `tsc` + lint + `jest` passing, check on iOS and Android, push.

Already built beyond the core: history pagination, the new-messages pill, the analytics hook, the Remedy card type, CI, and the guided tour. Ideas not built yet (persistence, swipe-to-reply, dark mode) live in the README's "What I'd do next".

Prefer cutting extras and polish over cutting architecture. Record anything deliberately left out in the README's trade-offs section.

## Verify before claiming done
- `npx tsc --noEmit` passes with zero errors.
- `npx jest` passes. At minimum, tests cover `buildTimeline` (separators, grouping), the store's send/retry/delete/feedback actions, and the registry's handling of unknown types.
- The app launches on the iOS simulator and/or Android emulator. Walk through the demo below.

## Demo walkthrough (2–5 min)
1. Loading state appears, then the seeded conversation (date separators, grouping, all 4 message types).
2. Horizontal recommendation rail, card tap → Alert.
3. Send a message → Sending → Sent. Force a failure → Failed → Retry → Sent. The simulated AI reply arrives with new cards.
4. Long-press an AI message → Reply (preview above the composer), Copy, Delete (position held).
5. 👍 / 👎 → chips expand → select a reason.
6. Dev toggle → Empty state → Error state → Retry.
7. Briefly walk through the code: the registry plus "how to add a new card type in 3 steps".

## README
Use `references/readme-template.md`. Keep these sections up to date: project structure, component architecture, state management, recommendation rendering strategy, performance considerations, and trade-offs.

## Git
The repo is `github.com/19rahulyadav38/MyNaksh` (branch `main`). CI runs typecheck, lint and tests on every push. Commit each increment with a clear message; the history documents the design decisions. `.claude/` is git-ignored and must stay out of the repo.
