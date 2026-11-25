# Phase 5 — Channel Builder & Media: Completion Note

**Date:** 2026-11-25
**Status:** Core slice complete. Local storage driver and client-reported audio/video metadata are the main v1 compromises.

---

## 1. What shipped

### Channel specifications
- `ChannelSpec` model with per-channel field definitions: label, input type, required, options, media kind, MIME allowlist, byte limit, dimension limits, duration limits, help text, display order and active flag.
- `src/lib/channel-specs.ts` contains 42 default fields across all eight channels.
- `npm run seed:channel-specs` upserts the defaults into the database.
- `getChannelSpecs()` loads active DB specs and falls back to code defaults per channel.
- Admin page `/admin/channel-specs` lets staff edit labels, required/active flags, byte limits, dimensions and durations. Changes apply to new campaigns.
- **Channel Specs** added to the admin sidebar.

### Media assets and uploads
- `MediaAsset` model: owner, kind, storage key/URL, MIME, bytes, width, height, duration, metadata source, checksum, scan status and validation status.
- `CampaignMediaAsset` join table links uploaded assets to campaigns by field key.
- `src/lib/media.ts` — MIME classification, allowlist, filename sanitisation.
- `src/server/storage/index.ts` — local development driver writing to `public/uploads/{userId}`.
- `src/server/media/inspect.ts` — `sharp` image inspection and dimension cap.
- `uploadMediaAssetAction` — session + rate limit + MIME + size validation, SHA-256 checksum, image inspection, asset persistence.
- `next.config.mjs` server-action body limit raised to 205 MB for media uploads.
- `/public/uploads/` is gitignored.

### Dynamic advertisement builder
- `CampaignCreateModal` now renders channel-specific fields from the spec:
  - only the selected channel's fields appear;
  - required markers and help text;
  - text, textarea, number, select, date and file inputs;
  - image preview, video player and audio playback before submission;
  - client-side metadata extraction for images, video and audio;
  - inline validation errors per field.
- Channel change resets channel-specific values and assets.
- Review summary includes configured channel values and uploaded media.
- Draft save and submit both send `channelConfigJson` and media asset IDs.
- Server actions validate channel requirements again before saving or submitting; drafts skip required checks but validate provided files.

### Server enforcement
- `createCampaignAction`:
  - resolves the channel type;
  - loads the active spec;
  - verifies every required field;
  - verifies asset ownership, kind, MIME, bytes, dimensions and duration;
  - links assets through `CampaignMediaAsset`;
  - stores `channelConfigJson` and a primary creative URL/MIME.
- `saveCampaignDraftAction` uses the same checks with `requireRequired=false`.
- `submitCampaignDraftAction` re-validates required channel fields and linked media before submission.

### Migration
- `20261125180000_phase5_media_channel_specs` applied after a fresh backup:
  - `MediaAsset`, `CampaignMediaAsset`, `ChannelSpec`
  - `User.mediaAssets`, `Campaign.mediaAssets` relations.

---

## 2. Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | **83/83 passed** |
| `npm run build` | Passed |
| `npm run seed:channel-specs` | 42 fields seeded |
| `npm run media:smoke` | Generated 640×360 PNG, stored, inspected, persisted, cleaned up |
| `/admin/channel-specs` | 200 |
| `/portal/campaigns` | 200 with specs loaded into the provider |
| `prisma migrate status` | Up to date |

---

## 3. Files added

- `src/lib/channel-specs.ts`, `src/lib/channel-validation.ts`, `src/lib/media.ts`
- `src/server/data/channel-specs.ts`
- `src/server/media/inspect.ts`, `src/server/storage/index.ts`
- `src/server/actions/media.ts`, `src/server/actions/channel-specs.ts`
- `src/app/(admin)/admin/channel-specs/{page.tsx,ChannelSpecsClient.tsx}`
- `scripts/seed-channel-specs.ts`, `scripts/media-smoke.ts`
- Tests: `channel-validation.test.ts`, `media.test.ts`
- Migration: `20261125180000_phase5_media_channel_specs`

## 4. Files modified

- `prisma/schema.prisma`
- `src/context/CampaignContext.tsx`
- `src/app/(portal)/layout.tsx`
- `src/components/portal/CampaignCreateModal.tsx`
- `src/server/actions/campaigns.ts`
- `src/lib/channels.ts`
- `src/app/(admin)/AdminShell.tsx`
- `next.config.mjs`, `.env.example`, `.gitignore`, `package.json`

---

## 5. Deferrals and production blockers

1. **Local storage driver only** — files live in `public/uploads`; production needs S3/R2/Cloudinary with signed direct uploads and a CDN.
2. **Audio/video metadata is client-reported** — images are server-inspected with `sharp`; duration/resolution for audio/video comes from the browser and is marked `metadataSource=CLIENT`. Add `music-metadata`/`mp4box` or an ffprobe worker before launch.
3. **No antivirus/scan provider** — assets are created with `scanStatus=PENDING`. A scan hook must run before media is used in a live campaign.
4. **No transcoding/thumbnails** — previews use the original file; add poster frames and compressed variants.
5. **Partner-level overrides not implemented** — specs are per channel, not per station/publisher/screen. The `ChannelSpec` model can be extended with `partnerId`.
6. **Draft autosave** — drafts save on button click, not continuously.
7. **Server action upload path** — 205 MB action bodies are acceptable for development, but direct-to-storage uploads are required for production scale and DDoS safety.
8. **Campaign detail media gallery** — campaign detail shows the legacy creative fields; add a media gallery from `CampaignMediaAsset` next.
9. **Admin spec UX** — functional but table-based; bulk reset/duplicate/versioning not built.

---

## 6. How to run

```bash
npm run db:migrate
npm run seed:channel-specs
npm run typecheck
npm test
npm run media:smoke
npm run build
npm run dev
```

Manual:
1. Sign in as `client@advers.ng` → `/portal/campaigns` → **Create campaign**.
2. Choose FM radio, Television or Newspaper and confirm only that channel's fields appear.
3. Upload an image/audio/video, preview it, complete required fields, save a draft, then submit.
4. As `admin@advers.ng`, open `/admin/channel-specs` and change a label or limit.
