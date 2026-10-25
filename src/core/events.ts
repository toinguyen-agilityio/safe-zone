/** Feature files extend this with `declare module './events' { interface EventMap { ... } }`. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventMap {}

type Listener<T> = (payload: T) => void;

export class EventBus {
  private readonly listeners = new Map<keyof EventMap, Set<Listener<never>>>();

  on<K extends keyof EventMap>(type: K, listener: Listener<EventMap[K]>): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(listener as Listener<never>);
    return () => this.off(type, listener);
  }

  off<K extends keyof EventMap>(type: K, listener: Listener<EventMap[K]>): void {
    this.listeners.get(type)?.delete(listener as Listener<never>);
  }

  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]): void {
    for (const listener of [...(this.listeners.get(type) ?? [])]) {
      (listener as Listener<EventMap[K]>)(payload);
    }
  }
}
