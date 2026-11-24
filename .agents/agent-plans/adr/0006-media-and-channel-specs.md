# ADR-0006: Media Assets and Channel Specifications

**Status:** Proposed — pending sign-off
**Date:** 2026-11-24
**Deciders:** Engineering, Product, Media Ops

## Context

The ad builder (`src/components/portal/CampaignCreateModal.tsx`) is generic: channel is a free string, the creative is a pasted URL, and format is free text. `MediaInventory.screenSpecs` and `loopCapacity` are free-text fields. There is no upload pipeline, no metadata extraction, and no per-channel or per-partner validation.

The brief requires channel-first forms, only relevant fields, image/video preview, audio playback, validation of type/size/dimensions/resolution/duration, clear errors, a final summary, drafts, and configurable provider requirements (radio/TV/publisher/billboard/podcast rules differ).

The media spike (`.agents/agent-plans/phase-0/media-spike.md`) confirmed `sharp` works, while ffprobe/ffmpeg are not installed.

## Decision

1. **Storage adapter.** `StorageAdapter` interface (`put`, `getSignedUploadUrl`, `getSignedDownloadUrl`, `delete`, `head`) with a local/dev driver and a production driver (S3-compatible/R2/Cloudinary). Client uploads go directly to storage via a short-lived signed URL; the server confirms and inspects.
2. **`MediaAsset` model:** `id`, `ownerId`, `kind` (`IMAGE` | `VIDEO` | `AUDIO` | `DOCUMENT`), `storageKey`, `mime`, `bytes`, `width?`, `height?`, `durationSec?`, `codec?`, `checksum`, `scanStatus` (`PENDING` | `CLEAN` | `INFECTED` | `NEEDS_REVIEW`), `status` (`UPLOADED` | `VALIDATED` | `REJECTED`), `createdAt`. Assets are referenced by campaigns, profiles, portfolio items, and proofs.
3. **`ChannelSpec` model:** `channelType`, optional `partnerId` override, `fieldKey`, `label`, `inputType` (`TEXT` | `TEXTAREA` | `NUMBER` | `SELECT` | `DATE` | `MEDIA`), `required`, `optionsJson`, `mediaKind`, `mimeAllowlist`, `maxBytes`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `minDurationSec`, `maxDurationSec`, `aspectRatio`, `helpText`, `sortOrder`, `active`. Specs are versioned (`ChannelSpecVersion`) so an advert can be validated against the rules that were live at submission.
4. **One validation engine**, server-authoritative:
   - `ChannelSpec` rules → generic checks,
   - `MediaInspector` → extracted metadata,
   - `validateSubmission` → field-level error codes with human-readable messages.
   The client may pre-validate for UX, but the server re-runs everything on confirmation and submission.
5. **Inspectors:**
   - Images: `sharp.metadata()`.
   - Audio: `music-metadata`.
   - Video: `mp4box` (MP4/M4V), with ffprobe as an optional V2 enhancement.
   - Unparseable files: `scanStatus = NEEDS_REVIEW`, blocked from submission until admin approval.
6. **No trust in client metadata.** Client-declared width/height/duration is display-only; persisted values come from the inspector.
7. **Dynamic form shape.** The builder renders groups in a fixed order: channel → objective/audience/location/budget/schedule → channel-specific creative fields → contact/CTA → review. Only fields for the selected channel/partner are shown; mandatory fields are marked.
8. **Draft model.** Drafts store partial JSON keyed by field key plus asset references; incomplete drafts are allowed, but submission runs full validation.
9. **Provider configurability.** Media Ops edits `ChannelSpec` rows in admin; no deploy is needed for a new station/publisher rule. Changes are audited.
10. **Security.** MIME sniffing on the server (not just extension), size caps before buffering, image dimension caps to prevent decompression bombs, filename sanitisation, checksum dedupe, and a virus-scan hook before an asset can be used in a live campaign.

## Consequences

- Positive: one builder handles eight channels without hardcoded branches; new partners are configuration.
- Positive: preview and validation errors become consistent and testable.
- Negative: `ChannelSpec` seeding is real Media Ops work, not a code task; spec data quality determines UX quality.
- Negative: V1 video validation is limited to MP4-family containers; other formats need manual review or V2 ffprobe.
- Operational: storage credentials, CORS, signed-URL expiry, and a scan provider must be configured per environment.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Hardcode per-channel forms in React | Unmaintainable across 8 channels × N partners; contradicts "provider requirements must be configurable" |
| Single generic form with all fields visible | Brief explicitly requires avoiding irrelevant fields |
| Store media in the database | Poor performance, backup bloat, no CDN |
| Trust client-reported metadata | Trivially spoofed; breaks provider compliance |
| Require ffprobe at launch | Adds a hosting dependency before it is proven necessary |

## Open questions

- Storage vendor (S3/R2/Cloudinary) and scan provider.
- Whether `ChannelSpecVersion` is needed in v1 or can be added later (recommendation: add the column now, populate in v1).
- Whether partner-level overrides are editable by media partners themselves or only by ADVERS staff (recommendation: staff only in v1).
