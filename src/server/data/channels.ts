import type { ChannelType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CHANNEL_LABELS } from "@/lib/types/campaign";

export interface MediaSlotView {
  id: string;
  label: string;
  startTime: string | null;
  endTime: string | null;
  daysOfWeek: string | null;
  date: string | null;
  rate: number;
  unitType: string;
  capacity: number;
  booked: number;
  remaining: number;
  status: string;
}

export interface MediaPartnerView {
  id: string;
  inventoryCode: string;
  name: string;
  channel: string;
  channelType: string;
  city: string;
  state: string;
  locationDetails: string;
  screenSpecs: string | null;
  loopCapacity: string | null;
  availableSlots: number;
  ratePerUnit: number;
  unitType: string;
  vendorName: string;
  vendorContact: string | null;
  status: string;
  nextSlotLabel: string | null;
  slotsCount: number;
}

export interface MediaPartnerDetailView extends MediaPartnerView {
  slots: MediaSlotView[];
}

function mapSlot(slot: {
  id: string;
  label: string;
  startTime: string | null;
  endTime: string | null;
  daysOfWeek: string | null;
  date: Date | null;
  rate: number;
  unitType: string;
  capacity: number;
  booked: number;
  status: string;
}): MediaSlotView {
  return {
    id: slot.id,
    label: slot.label,
    startTime: slot.startTime,
    endTime: slot.endTime,
    daysOfWeek: slot.daysOfWeek,
    date: slot.date ? slot.date.toISOString() : null,
    rate: slot.rate,
    unitType: slot.unitType,
    capacity: slot.capacity,
    booked: slot.booked,
    remaining: Math.max(0, slot.capacity - slot.booked),
    status: slot.status,
  };
}

function mapPartner(
  partner: {
    id: string;
    inventoryCode: string;
    name: string;
    channel: string;
    city: string;
    state: string;
    locationDetails: string;
    screenSpecs: string | null;
    loopCapacity: string | null;
    availableSlots: number;
    ratePerUnit: number;
    unitType: string;
    vendorName: string;
    vendorContact: string | null;
    status: string;
    slots: {
      id: string;
      label: string;
      startTime: string | null;
      endTime: string | null;
      daysOfWeek: string | null;
      date: Date | null;
      rate: number;
      unitType: string;
      capacity: number;
      booked: number;
      status: string;
    }[];
  }
): MediaPartnerView {
  const nextSlot = partner.slots[0];
  return {
    id: partner.id,
    inventoryCode: partner.inventoryCode,
    name: partner.name,
    channel: CHANNEL_LABELS[partner.channel] || partner.channel,
    channelType: partner.channel,
    city: partner.city,
    state: partner.state,
    locationDetails: partner.locationDetails,
    screenSpecs: partner.screenSpecs,
    loopCapacity: partner.loopCapacity,
    availableSlots: partner.availableSlots,
    ratePerUnit: partner.ratePerUnit,
    unitType: partner.unitType,
    vendorName: partner.vendorName,
    vendorContact: partner.vendorContact,
    status: partner.status,
    nextSlotLabel: nextSlot
      ? `${nextSlot.label}${
          nextSlot.startTime && nextSlot.endTime
            ? ` · ${nextSlot.startTime}–${nextSlot.endTime}`
            : ""
        }`
      : null,
    slotsCount: partner.slots.length,
  };
}

export async function getChannelPartners(
  channelType: ChannelType
): Promise<MediaPartnerView[]> {
  const partners = await prisma.mediaInventory.findMany({
    where: { channel: channelType, status: "OPERATIONAL" },
    include: {
      slots: {
        where: { status: { in: ["AVAILABLE", "LIMITED"] } },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        take: 4,
      },
    },
    orderBy: [{ city: "asc" }, { name: "asc" }],
  });

  return partners.map(mapPartner);
}

export async function getChannelPartner(
  partnerId: string,
  channelType: ChannelType
): Promise<MediaPartnerDetailView | null> {
  const partner = await prisma.mediaInventory.findFirst({
    where: { id: partnerId, channel: channelType, status: "OPERATIONAL" },
    include: {
      slots: {
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!partner) return null;

  return {
    ...mapPartner(partner),
    slots: partner.slots.map(mapSlot),
  };
}
