/** What the game says to the player, in Vietnamese. */
export const MESSAGES_VI = {
  /** A shrink starts: the flood is coming in. */
  waterRising: 'Nước đang dâng! Chạy vào vùng khô ngay!',
  /** A new dry zone is set: it is marked on the map and the next shrink heads there. */
  newDryZone: 'Vùng khô mới đã xuất hiện!',
} as const;

export type MessageKey = keyof typeof MESSAGES_VI;

/** A message for the player's screen. */
export interface Announcement {
  key: MessageKey;
  /** The Vietnamese text to show. */
  text: string;
}

declare module '../core/events' {
  interface EventMap {
    announce: Announcement;
  }
}

export function announcement(key: MessageKey): Announcement {
  return { key, text: MESSAGES_VI[key] };
}
