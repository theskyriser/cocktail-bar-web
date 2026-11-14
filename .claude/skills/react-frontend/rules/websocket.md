---
paths:
  - "**/*.{ts,tsx}"
---

# Realtime / WebSockets

**There is no realtime in this project.** No Laravel Echo, no Pusher, no broadcaster, no socket —
and `cocktail-bar-api` broadcasts nothing. Read this before adding the first channel, and note
that every piece of it is a new dependency needing approval.

Applies when this app would subscribe to `cocktail-bar-api` over broadcasting — typically Laravel
Echo against a Pusher-compatible broadcaster.

Channel and event names are a **contract shared with the backend**. Both sides must use identical
keys, so renaming one without the other breaks the feature silently at runtime rather than loudly
at build time. That makes it exactly the kind of cross-repo change the root `CLAUDE.md` says to
call out in the PR.

## Shape to build

- **One module owns the connection.** Create it once and reuse it; never `new Echo` from a
  component. A second connection per component multiplies the server's subscriber count and the
  browser's open sockets.
- **Private channels need an authorizer** that posts to the API's broadcasting auth endpoint with
  the session cookie and CSRF token, and exchanges them for a channel token. That request must go
  through `fetchApi`, for the same reasons every other request does.
- **Declare channel and event names in one place** as typed consts, so a rename is a type error
  rather than a dead subscription.
- **Subscribe through one hook**, which owns subscribe-on-mount and unsubscribe-on-cleanup. If you
  find yourself managing listeners by hand in a component, you have bypassed it.

## Rules

- **Scope a channel to one resource instance** — include the id in the channel name, so a user
  only receives events for records they are authorised to see. A broad channel is an
  authorisation bug delivered over a socket.
- **Realtime is an enhancement, never a source of truth.** Treat an event as a signal to
  `invalidateQueries`, and let TanStack Query refetch. Writing the event payload straight into the
  cache means trusting a message that never went through a parser at a boundary, and in this app
  the server owns every decision that matters.
- **The feature must work correctly if the socket never connects.** Flaky networks, blocked
  WebSockets on corporate proxies and a cold backend are all normal. Build the polling or
  on-focus-refetch path first and layer realtime on top.
- **Always unsubscribe on unmount**, and remember `StrictMode` double-invokes effects in
  development — a subscription without cleanup shows up as duplicate handlers, which looks like
  the server sending each event twice.
- A socket event that would make this app re-rank or re-score anything is still forbidden. It can
  tell the app *that* something changed; the API still decides *what* the new answer is.
