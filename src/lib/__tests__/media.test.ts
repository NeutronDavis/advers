import test from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedMediaMime,
  mediaKindFromMime,
  sanitizeFileName,
} from "../media";

test("mediaKindFromMime maps supported MIME types", () => {
  assert.equal(mediaKindFromMime("image/jpeg"), "IMAGE");
  assert.equal(mediaKindFromMime("video/mp4"), "VIDEO");
  assert.equal(mediaKindFromMime("audio/mpeg"), "AUDIO");
  assert.equal(mediaKindFromMime("application/pdf"), "DOCUMENT");
  assert.equal(mediaKindFromMime("application/zip"), null);
});

test("isAllowedMediaMime rejects unknown types", () => {
  assert.equal(isAllowedMediaMime("image/png"), true);
  assert.equal(isAllowedMediaMime("text/html"), false);
});

test("sanitizeFileName strips paths and unsafe characters", () => {
  assert.equal(sanitizeFileName("C:\\fakepath\\My File (1).png"), "My-File-1-.png");
  assert.equal(sanitizeFileName("../../etc/passwd"), "passwd");
  assert.equal(sanitizeFileName(""), "upload");
});
