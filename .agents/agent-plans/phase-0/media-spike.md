# Phase 0 — Media Validation Spike

**Date:** 2026-11-24
**Status:** Complete
**Question:** Can we validate image, audio, and video dimensions/duration/format server-side with the current runtime, or do we need a new worker and binaries?

---

## 1. Environment results

| Check | Result | Evidence |
|---|---|---|
| Node runtime | **v24.16.0** | `node --version` |
| `sharp` installed and functional | **Yes** | Generated an 8×8 PNG and read back `{ width: 8, height: 8, format: "png" }` |
| `ffprobe` on PATH | **No** | `FFPROBE_NOT_FOUND` |
| `ffmpeg` on PATH | **No** | `FFMPEG_NOT_FOUND` |
| Hosting target known | **No** | No Vercel/Docker/Railway/Fly config in the repo |

`sharp` is already a project dependency (`package.json`) and works on this Windows machine without extra setup. That covers **images** completely: dimensions, format, EXIF orientation, and re-encoding if needed.

---

## 2. Implications

- **Images:** solved. `sharp.metadata()` gives width, height, format, orientation, and can enforce conversion/size limits.
- **Audio duration:** not solved by `sharp`. Options are `music-metadata` (pure JS, reads MP3/AAC/M4A/WAV/OGG headers) or ffprobe.
- **Video duration/resolution/codec:** not solved by `sharp`. Options are `mp4box` (ISO BMFF parser, MP4/M4V), `mediainfo.js` (WASM), or ffprobe.
- **No ffmpeg binary** means any solution that shells out to ffprobe needs a container/deployment change. That is a real ops dependency, not a code detail.
- **Browser metadata is not authoritative.** The client can report duration/dimensions, but the server must re-derive them before accepting an asset.

---

## 3. Recommended approach

### V1 (no new binaries)
- **Images:** `sharp.metadata()`.
- **Audio:** `music-metadata` (pure Node) for duration, codec, sample rate, channels, bitrate.
- **Video:** `mp4box` for MP4/M4V duration and track dimensions; reject containers it cannot parse or flag them for manual review.
- **Defence in depth:** client-side preview validation for immediate UX; server-side re-validation on upload confirmation; store extracted metadata in `MediaAsset`.
- **Fallback:** if a file cannot be parsed server-side, mark `scanStatus = "NEEDS_REVIEW"` and block submission until an admin approves. Never trust client-declared metadata.

### V2 (optional hardening)
- Add ffprobe (ffmpeg static build) in a container worker for deeper codec/profile/bitrate checks, HLS/MPEG-TS support, and audio loudness measurement.
- Only do this if provider specs require codec-level validation, or if `mp4box` rejection rates are high.

### Minimum viable codec/spec checks for V1
- MIME allowlist per channel (from `ChannelSpec`).
- Byte-size limit per channel.
- Image: min/max width and height, aspect ratio tolerance, format allowlist.
- Audio: min/max duration, format allowlist.
- Video: min/max duration, min/max resolution, aspect ratio tolerance, container allowlist.
- Optional: checksum dedupe, filename sanitisation, and a virus-scan hook before publish.

---

## 4. Deployment note

`sharp` already ships native binaries and works in the current setup, so it does not add a new deployment constraint. `music-metadata` and `mp4box` are pure JS/WASM and also portable.

If V2 is adopted, the host must:
- run Linux with ffmpeg/ffprobe available on PATH, or
- run a separate worker container with ffmpeg, invoked via a queue.

**Decision owner:** D-14 in `decisions-log.md`.

---

## 5. Validation plan for Phase 5

1. Fixture set: 1 valid + 2 invalid files per channel (wrong MIME, too large, wrong ratio, too long, corrupt).
2. Unit tests for the validator: each rule returns a specific, user-facing error code.
3. Integration test: upload → confirm → metadata persisted → spec validation → submit.
4. Manual: preview playback in Chrome/Safari/Firefox, mobile Safari, and a low-bandwidth throttle.
5. Security: double extension, MIME spoofing, zip-bomb image, oversized dimensions, zero-byte file.

---

## 6. Exit status

- [x] `sharp` proof-of-concept executed.
- [x] ffprobe/ffmpeg availability checked.
- [x] Fallback path documented.
- [ ] `music-metadata` and `mp4box` proof-of-concept (Phase 5 kickoff; not needed for Phase 1).
- [ ] Hosting target confirmed (D-14).
