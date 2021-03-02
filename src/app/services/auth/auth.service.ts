import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InterceptorSkipHeader } from 'src/app/interceptors/jwtInterceptor';
import { environment } from 'src/environments/environment';
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

const HEADER = new HttpHeaders().set(InterceptorSkipHeader, ''); // skip jwt interceptor

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = environment.apiUrl;

  private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  private userTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(private storageService: StorageService, private http: HttpClient) {}

  async getUser() {
    return new Promise(async resolve => {
      this.storageService.getFromStorage(USER_KEY).then(async res => {
        if(res) {
          this.userSubject.next(res);
          this.isAuthenticated.next(true);
          this.userTokenSubject.next(res.token)
          resolve(res);
        } else {
          this.isAuthenticated.next(false);
          resolve(null);
        }
      });
    });
  }

  async loginUser(user: User) {
    // Todo add backend auth
    return new Promise((resolve, reject) => {
      let body = {
        username: user.name
      };
      this.http.post(this.url + "authenticate/", body).subscribe((res: any) => {
        user.token = res.token;
        this.userSubject.next(user);
        this.isAuthenticated.next(true);
        this.userTokenSubject.next(user.token);
        this.storageService.setInStorage(USER_KEY, user);
        resolve(user);
      }, error => {
        reject(error);
        this.isAuthenticated.next(false);
      });
    });
  }

  getUserValue() {
    return this.userSubject.asObservable();
  }


  async logout() {
    // toDo add backend logout
    return new Promise(async (resolve, reject) => {
      let body = {};
      this.http.post(this.url + "logout/", body).subscribe(res => {
        this.storageService.dumpStorage().then(() => {
          resolve(true);
          this.userSubject.next(undefined);
          this.isAuthenticated.next(false);
          this.userTokenSubject.next(undefined);
        }).catch(e => {
          console.log("error when logging out. ", e.message);
          reject(e);
        });
      }, error => {
        this.storageService.dumpStorage().then(() => {
          resolve(true);
          this.userSubject.next(undefined);
          this.isAuthenticated.next(false);
          this.userTokenSubject.next(undefined);
        }).catch(e => {
          console.log("error when logging out. ", e.message);
          reject(e);
        });
        console.log("error when logging out at server. ", error);
        reject(error);
      });
    });
  }

  public get currentUserValue() {
    return this.userSubject.value;
  }

  public get currentUserTokenValue() {
    return this.userTokenSubject.value;
  }

  public get authValue() {
    return this.isAuthenticated.value;
  }
}
