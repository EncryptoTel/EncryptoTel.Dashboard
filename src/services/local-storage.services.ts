import {Injectable} from '@angular/core';
import {LoggerServices} from './logger.services';

/*
  Storage services. Read and write storage items
 */

@Injectable()
export class LocalStorageServices {
    constructor(private logger: LoggerServices) {
    }

    /*
      Storage item writing
     */
    writeItem = (name: string, data: any): void => {
        localStorage.setItem(name, JSON.stringify(data));
    };
    /*
      Read item from storage and convert it to JSON.
      If item doesn't exist - throw message to console output
     */
    readItem = (name: string) => {
        const data = localStorage.getItem(name);
        if (data) {
            return JSON.parse(data);
        } else {
            // this.logger.log(`Reading storage item ${name}`, `Item with name '${name}' was not found at storage`);
            return null;
        }
    }

    clearItem = (name: string) => {
        localStorage.removeItem(name);
    }

}
