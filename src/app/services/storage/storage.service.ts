import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  async setInStorage(key: string, value: any) {
    await Storage.set({
      key: key,
      value: JSON.stringify(value)
    });
  }

  async getFromStorage(key: string) {
    const ret = await Storage.get({ key: key });
    return JSON.parse(ret.value);
  }

  async dumpStorage() {
    return await Storage.clear();
  }
}
