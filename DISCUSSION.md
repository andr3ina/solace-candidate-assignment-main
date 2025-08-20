**Frontend**

Virtualized table: Switched to react-virtuoso (TableVirtuoso) so only visible rows render, keeping the UI responsive with thousands of items.

Explicit search trigger: Added a Search button (Enter submits) to avoid spamming the API on every keystroke. (Follow-up: add 200–300ms debounce.)

Server-driven results: Input → /api/advocates?q=...; removed client-side full-dataset filtering.

Basic caching & cancellation: Cache results by query and cancel stale requests.

UI polish: Improve design using Tailwind, labeled search input, and result count.

**Backend**

Search endpoint: GET /api/advocates?q= performs server-side filtering; we no longer send the full dataset to the browser.

Indexing plan (follow-up for scale): Add a generated lower-cased search_blob for fast substring search?
