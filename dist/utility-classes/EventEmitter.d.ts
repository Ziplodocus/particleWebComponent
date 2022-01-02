export declare type ZEvent = {
    [data: string]: any;
};
export declare class EventEmitter {
    events: {
        [name: string]: [Function];
    };
    constructor();
    on(name: string, callback: Function): void;
    trigger(name: string, event: ZEvent): void;
    off(name: string, callback: Function): void;
}
