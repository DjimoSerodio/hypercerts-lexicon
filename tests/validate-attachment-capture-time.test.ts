import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as Attachment from "../generated/types/org/hypercerts/context/attachment";

const base = {
  $type: ids.OrgHypercertsContextAttachment,
  title: "Historical capture",
  createdAt: "2026-09-15T00:00:00Z",
};
const variants = [
  {
    $type: "org.hypercerts.defs#instant",
    value: "2019-07-14T13:22:05.123456+12:00",
  },
  { $type: "org.hypercerts.defs#localDateTime", value: "2019-07-14T13:22:05" },
  {
    $type: "org.hypercerts.defs#localDateTime",
    value: "2019-07-14T13:22:05.123456789",
  },
  { $type: "org.hypercerts.defs#calendarDate", value: "2019-07-14" },
];

describe("attachment capture time", () => {
  it.each(variants)(
    "preserves $type and value without changing createdAt",
    (capturedAt) => {
      const result = Attachment.validateMain({ ...base, capturedAt });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.capturedAt).toEqual(capturedAt);
        expect(result.value.createdAt).toBe(base.createdAt);
      }
    },
  );

  it("accepts existing and multi-capture attachments without capturedAt", () => {
    expect(Attachment.validateMain(base).success).toBe(true);
    expect(
      Attachment.validateMain({
        ...base,
        title: "June–August satellite composite",
        content: [
          {
            $type: "org.hypercerts.defs#uri",
            uri: "https://example.org/composite.tif",
          },
          {
            $type: "org.hypercerts.defs#uri",
            uri: "https://example.org/composite-stac.json",
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("accepts original and preview renditions with one capture time", () => {
    expect(
      Attachment.validateMain({
        ...base,
        capturedAt: variants[0],
        content: [
          {
            $type: "org.hypercerts.defs#uri",
            uri: "https://example.org/original.jpg",
          },
          {
            $type: "org.hypercerts.defs#uri",
            uri: "https://example.org/preview.webp",
          },
        ],
      }).success,
    ).toBe(true);
  });

  it.each([
    { capturedAt: "2019-07-14" },
    { capturedAt: { value: "2019-07-14" } },
    { capturedAt: { $type: "org.hypercerts.defs#calendarDate" } },
    {
      capturedAt: {
        $type: "org.hypercerts.defs#calendarDate",
        value: 20190714,
      },
    },
    {
      capturedAt: {
        $type: "org.hypercerts.defs#calendarDate",
        value: "2019-7-14",
      },
    },
    {
      capturedAt: {
        $type: "org.hypercerts.defs#localDateTime",
        value: "2019-07-14",
      },
    },
    {
      capturedAt: {
        $type: "org.hypercerts.defs#localDateTime",
        value: "2019-07-14T13:22:05.1234567890",
      },
    },
    {
      capturedAt: {
        $type: "org.hypercerts.defs#instant",
        value: "not a datetime",
      },
    },
  ])("rejects invalid schema shapes or bounds: %j", ({ capturedAt }) => {
    expect(
      validate(
        { ...base, capturedAt },
        ids.OrgHypercertsContextAttachment,
        "main",
        false,
      ).success,
    ).toBe(false);
  });

  it("documents that calendar correctness needs client validation", () => {
    // Length constraints cannot reject an impossible Gregorian date.
    const result = Attachment.validateMain({
      ...base,
      capturedAt: {
        $type: "org.hypercerts.defs#calendarDate",
        value: "2019-02-30",
      },
    });
    expect(result.success).toBe(true);
  });

  it("documents the installed datetime validator's offset-check limitation", () => {
    // This SDK accepts offsetless datetime strings. The proposed instant
    // semantics still require clients to check for a known offset.
    expect(
      Attachment.validateMain({
        ...base,
        capturedAt: {
          $type: "org.hypercerts.defs#instant",
          value: "2019-07-14T13:22:05",
        },
      }).success,
    ).toBe(true);
  });
});
