export type ChannelTypeValue =
  | "DIGITAL_BILLBOARD"
  | "STATIC_BILLBOARD"
  | "FM_RADIO"
  | "TELEVISION"
  | "NEWSPAPER"
  | "PODCAST"
  | "ADBOOSTERS"
  | "INFLUENCER";

export type ChannelGroup =
  | "OUTDOOR"
  | "BROADCAST"
  | "PRINT"
  | "DIGITAL"
  | "CROWD";

export interface ChannelCatalogItem {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  tag: string;
  channelType: ChannelTypeValue;
  group: ChannelGroup;
  partnerKind: "MEDIA" | "INFLUENCER" | "BOOSTER";
}

export const CHANNEL_CATALOG: ChannelCatalogItem[] = [
  {
    slug: "digital-billboards",
    label: "Digital billboards",
    shortLabel: "Digital billboards",
    description:
      "High-brightness LED screens in busy commercial and transit locations.",
    icon: "▣",
    tag: "DOOH",
    channelType: "DIGITAL_BILLBOARD",
    group: "OUTDOOR",
    partnerKind: "MEDIA",
  },
  {
    slug: "static-billboards",
    label: "Static billboards",
    shortLabel: "Static billboards",
    description:
      "Large-format outdoor displays for sustained brand presence.",
    icon: "▧",
    tag: "OOH",
    channelType: "STATIC_BILLBOARD",
    group: "OUTDOOR",
    partnerKind: "MEDIA",
  },
  {
    slug: "fm-radio",
    label: "FM radio",
    shortLabel: "FM radio",
    description:
      "Drive-time spots, jingles and OAP endorsements across partnering stations.",
    icon: "♫",
    tag: "Audio",
    channelType: "FM_RADIO",
    group: "BROADCAST",
    partnerKind: "MEDIA",
  },
  {
    slug: "television",
    label: "Television",
    shortLabel: "Television",
    description:
      "Prime-time commercials and sponsorship slots on national and regional TV.",
    icon: "▣",
    tag: "Broadcast",
    channelType: "TELEVISION",
    group: "BROADCAST",
    partnerKind: "MEDIA",
  },
  {
    slug: "newspapers",
    label: "Newspapers",
    shortLabel: "Newspapers",
    description:
      "Print notices, features and display adverts in national and regional press.",
    icon: "▤",
    tag: "Print",
    channelType: "NEWSPAPER",
    group: "PRINT",
    partnerKind: "MEDIA",
  },
  {
    slug: "podcasts",
    label: "Podcast advertising",
    shortLabel: "Podcasts",
    description:
      "Host-read sponsorships and episode credits with trusted creators.",
    icon: "🎙",
    tag: "Audio",
    channelType: "PODCAST",
    group: "DIGITAL",
    partnerKind: "MEDIA",
  },
  {
    slug: "adboosters",
    label: "AdBoosters",
    shortLabel: "AdBoosters",
    description:
      "Verified community promoters and referral partners who share approved campaigns.",
    icon: "✦",
    tag: "Crowd",
    channelType: "ADBOOSTERS",
    group: "CROWD",
    partnerKind: "BOOSTER",
  },
  {
    slug: "influencers",
    label: "Influencer Hub",
    shortLabel: "Influencer Hub",
    description:
      "Discover creators, review audience and rates, and request collaborations.",
    icon: "◎",
    tag: "Creators",
    channelType: "INFLUENCER",
    group: "DIGITAL",
    partnerKind: "INFLUENCER",
  },
];

export function getChannelBySlug(
  slug: string
): ChannelCatalogItem | undefined {
  return CHANNEL_CATALOG.find((channel) => channel.slug === slug);
}

export function getChannelByLabel(
  label: string
): ChannelCatalogItem | undefined {
  return CHANNEL_CATALOG.find(
    (channel) =>
      channel.label === label ||
      channel.shortLabel === label ||
      (channel.channelType === "INFLUENCER" &&
        label === "Influencer marketplace")
  );
}

export function getChannelByType(
  channelType: ChannelTypeValue
): ChannelCatalogItem | undefined {
  return CHANNEL_CATALOG.find(
    (channel) => channel.channelType === channelType
  );
}

export function channelHref(slug: string): string {
  return `/portal/channels/${slug}`;
}

export function partnerHref(slug: string, partnerId: string): string {
  return `/portal/channels/${slug}/${partnerId}`;
}
