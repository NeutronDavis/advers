import test from "node:test";
import assert from "node:assert/strict";
import { validateChannelSubmission } from "../channel-validation";
import type { ChannelSpecField } from "../channel-specs";

const fields: ChannelSpecField[] = [
  {
    key: "audio_file",
    label: "Audio spot",
    inputType: "FILE",
    required: true,
    mediaKind: "AUDIO",
    accept: "audio/mpeg",
    maxBytes: 10_000_000,
    maxDurationSec: 60,
    groupName: "Channel requirements",
    sortOrder: 1,
  },
  {
    key: "spot_duration",
    label: "Spot duration",
    inputType: "SELECT",
    required: true,
    options: ["15 seconds", "30 seconds"],
    groupName: "Channel requirements",
    sortOrder: 2,
  },
];

test("a complete channel submission validates", () => {
  const result = validateChannelSubmission({
    fields,
    config: { audio_file: "asset-1", spot_duration: "30 seconds" },
    assets: {
      "asset-1": {
        id: "asset-1",
        kind: "AUDIO",
        mime: "audio/mpeg",
        bytes: 2_000_000,
        width: null,
        height: null,
        durationSec: 30,
      },
    },
  });
  assert.equal(result.valid, true);
});

test("missing required fields are reported", () => {
  const result = validateChannelSubmission({
    fields,
    config: {},
    assets: {},
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.audio_file, /required/);
  assert.match(result.errors.spot_duration, /required/);
});

test("media kind, MIME, size and duration are enforced", () => {
  const result = validateChannelSubmission({
    fields,
    config: { audio_file: "asset-1", spot_duration: "15 seconds" },
    assets: {
      "asset-1": {
        id: "asset-1",
        kind: "VIDEO",
        mime: "video/mp4",
        bytes: 20_000_000,
        width: 1920,
        height: 1080,
        durationSec: 90,
      },
    },
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.audio_file, /audio/);
});

test("drafts can skip required checks but still validate provided values", () => {
  const result = validateChannelSubmission({
    fields,
    config: {},
    assets: {},
    requireRequired: false,
  });
  assert.equal(result.valid, true);
});
