
export type ZEvent = {
  [data: string]: any
}

export class EventEmitter {
  events: { [name: string]: [Function] }
  constructor() {
    this.events = {};
  }
  on(name: string, callback: Function): void {
    const callbacks = this.events[name];
    if (!callbacks) this.events[name] = [callback];
    else callbacks.push(callback);
  }
  trigger(name: string, event: ZEvent): void {
    const callbacks = this.events[name];
    if (callbacks) callbacks.forEach(callback => callback(event));
  }
  off(name: string, callback: Function): void {
    const index = this.events[name].indexOf(callback);
    if (index !== -1) {
      this.events[name].splice(index, 1);
    }
  }
}