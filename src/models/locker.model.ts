import { TimerObservable } from "rxjs/observable/TimerObservable";

/**
 * interface Lockable
 * declares ability of the object to count locks
 */
export interface Lockable {
    locker: Locker;
}

/**
 * class Locker
 * Implements interface to count locks for on the object
 */
export class Locker {
    private _lockCount: number;
    
    get free(): boolean {
        return this._lockCount == 0;
    }

    constructor() {
        this._lockCount = 0;
    }

    public lock(): void {
        this._lockCount ++;
    }

    public unlock(): void {
        this._lockCount --;
        if (this._lockCount < 0) this._lockCount = 0;
    }
}

/**
 * Waits for specified locker to be released for
 */
export class Waiter {

    /**
     * Awaits for specified locker to be released for specified period of time. Returns Promise object.
     * @param observable object that signals about some external operation completed
     * @param period starting delay and repeat time between checks in ms
     * @param maxAttemptCount max number of attempts to check observable element state
     * @param showLog flag to turn on and off log messages
     */
    public static await(observable: Locker, period: number = 100, maxAttemptCount: number = 50, showLog: boolean = false): Promise<void> {
        let promise = new Promise<void>((resolve, reject) => {
            if (showLog) console.log('[waiter] started');
            let attemptCount = 0;
            let timer = TimerObservable.create(period, period).subscribe(() => {
                if (observable.free) {
                    if (showLog) console.log('[waiter] success, execution time', attemptCount * period);
                    timer.unsubscribe();
                    resolve();
                }
                else if (++ attemptCount > maxAttemptCount) {
                    if (showLog) console.log('[waiter] timeout, execution time', attemptCount * period);
                    timer.unsubscribe();
                    reject();
                }
                else {
                    if (showLog) console.log('[waiter] tick, execution time', attemptCount * period);
                }
            });        
        });
        return promise;
    }
}
