---
"@hypercerts-org/lexicon": patch
---

Add `app.certified.feed.like` and `app.certified.feed.repost` record types for social feedback in feeds, schema-compatible with `app.bsky.feed.like` and `app.bsky.feed.repost` (strongRef `subject`, optional `via`), and add both to the `app.certified.authWrite` permission set

Remove the "duplicate follows will be ignored by the AppView" sentence from the `app.certified.graph.follow` and `app.certified.graph.entityFollow` descriptions: deduplication is indexer behavior, not something the lexicon defines. No schema change.
