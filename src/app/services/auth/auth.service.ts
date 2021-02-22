import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../storage/storage.service';

export interface User {
  token?: string,
  id: string,
  name: string,
  lastOnline?: string,
  online?: boolean,
  img?: string,
  color?: string
}

const USER_KEY = "chatAppUser";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  constructor(private storageService: StorageService) {
    //this.getUser();
  }

  async getUser() {
    return new Promise(async resolve => {
      this.storageService.getFromStorage(USER_KEY).then(async res => {
        console.log("auth service: ", res)
        if(res) {
          res.id = "xyz";
          this.userSubject.next(res);
          resolve(res);
        } else {
          resolve(null);
        }
      });
    });
  }

  async loginUser(user: User) {
    return new Promise((resolve, reject) => {
      this.storageService.setInStorage(USER_KEY, user).then(() => {
        user.id = "xyz";
        this.userSubject.next(user);
        resolve(user);
      }).catch(e => {
        reject(e);
      });
    });
  }

  getUserValue() {
    return this.userSubject.asObservable();
  }

  async logout() {
    return new Promise(async (resolve, reject) => {
      this.storageService.dumpStorage().then(() => {
        resolve(true);
        this.userSubject.next(undefined);
      }).catch(e => {
        console.log("error when logging out. ", e.message);
        reject(e);
      });
    });
  }
}
