# Attachment capture time (draft)

A photo captured in 2019 and uploaded in 2026 needs both dates. `createdAt`
continues to mean record creation; optional `capturedAt` describes capture.
It is client-declared metadata, not proof of the device clock's accuracy.

## Why explicit variants?

Blindly calling JavaScript `new Date(value).toISOString()` gives these results:

| Input                       | Viewer in UTC              | Viewer in New York (July)  |
| --------------------------- | -------------------------- | -------------------------- |
| `2019-07-14T13:22:05+12:00` | `2019-07-14T01:22:05.000Z` | Same instant               |
| `2019-07-14T13:22:05`       | `2019-07-14T13:22:05.000Z` | `2019-07-14T17:22:05.000Z` |
| `2019-07-14`                | `2019-07-14T00:00:00.000Z` | Same invented midnight     |

A local time with unknown offset and a date-only value do not identify an
instant. Explicit object variants make this distinction visible in generated
types. They do not prevent a client from using the wrong parser.

## Examples

Each object below is the value of an attachment's optional `capturedAt`.

Known offset, preserving the available fractional precision:

```json
{
  "$type": "org.hypercerts.defs#instant",
  "value": "2019-07-14T13:22:05.123456+12:00"
}
```

Local capture time without an offset, as often found in EXIF:

```json
{
  "$type": "org.hypercerts.defs#localDateTime",
  "value": "2019-07-14T13:22:05"
}
```

Only the capture date is known:

```json
{
  "$type": "org.hypercerts.defs#calendarDate",
  "value": "2019-07-14"
}
```

Keep `createdAt` as the record's creation timestamp in every case. Do not
derive capture time from upload time or treat absent metadata as midnight.
Avoid round-tripping fine fractional precision through JavaScript `Date`,
which only retains milliseconds.

## Files, captures, and temporal coverage

For field photos, one attachment per capture is a useful application
convention. Its original and preview can share that capture time. This is
not a restriction on the general attachment model: reports, survey bundles,
and raster composites may contain multiple captures.

If the attached material has no single truthful capture-time value, omit
`capturedAt`. For example, a satellite composite assembled from June through
August should retain its source acquisition interval in dataset metadata,
such as a STAC Item, rather than put its processing date in `capturedAt`.
Even when a coarser shared date is truthful, it cannot encode duration,
individual source times, or the full temporal support of a dataset.

This draft does not define video duration, capture intervals, processing
time, dataset coverage, or provenance relationships. Their eventual fields
must not reinterpret this field or `createdAt`.

## Validation and interoperability limits

The instant variant uses Lexicon's `datetime` format. Its semantic contract
requires a known offset; do not use the unknown-offset form `-00:00`.
The currently installed validator also accepts some offsetless datetime
strings, so clients must explicitly enforce the known-offset requirement.
The format annotation alone does not guarantee it in every SDK version.
The local and calendar-date variants enforce required string values and
length bounds only. Clients must additionally validate the documented
Gregorian calendar/clock syntax and ranges. Lexicon cannot express those
checks with a regex pattern or a date-only format. The schema tests are not
a complete calendar-validation suite.

Do not manufacture a common UTC sort key. Clients can group or sort by
reported date, while displaying precision and timezone uncertainty. That
ordering must not be presented as a proven chronological ordering of
instants. Unknown future union variants should be handled without guessing
their meaning.

## Decisions requested from maintainers

1. Prefer `capturedAt` and the three object variants, or one string accepting
   timestamp, local date-time, and date-only forms? A carefully validated
   string is viable and simpler on the wire, but its generated type does
   not distinguish the cases. It also needs application validation.
2. Are `instant`, `localDateTime`, and `calendarDate` suitable shared names?
3. Is the narrow single-time scope useful as proposed, leaving coverage
   intervals to a separately designed field/profile?

No new attachment category, observation lexicon, or verification semantics
are introduced here. Tags are an independent proposal.
