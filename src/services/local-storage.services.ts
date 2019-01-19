import { Injectable } from '@angular/core';
import { LoggerServices } from './logger.services';

/**
 * Local Storage service. Provides read and write local storage data 
 * functionality.
 */
@Injectable()
export class LocalStorageServices {
    constructor(private logger: LoggerServices) {}

    /**
     * Stores data at the local storage by name.
     * @param name Local storage data key
     * @param data Local storage data value
     */
    writeItem(name: string, data: any): void {
        localStorage.setItem(name, JSON.stringify(data));
    }

    /**
     * Reads data from the local storage by name and converts it to JSON.
     * @param name Local storage data key
     * @param defaultValue Default value will be returned when data hasn't been set
     */
    readItem(name: string, defaultValue?: any): any {
        const data = localStorage.getItem(name);
        if (data) {
            return JSON.parse(data);
        } else {
            // this.logger.log(`Reading storage item ${name}`, `Item with name '${name}' was not found at storage`);
            return defaultValue;
        }
    }

    /**
     * Removes data from the local storage by key.
     * @param name Local storage data key
     */
    clearItem(name: string): void {
        localStorage.removeItem(name);
    }

    /**
     * Removes all local storage data.
     */
    clear(): void {
        localStorage.clear();
    }
}
