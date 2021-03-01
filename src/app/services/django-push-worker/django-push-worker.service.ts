import { Injectable, EventEmitter } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { url, HOST_VAPID_KEY, webpush_offset_url } from './settings.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DjangoPushWorkerService {

  constructor(private swPush: SwPush,
    private swUpdate: SwUpdate,
    private http: HttpClient) { }

  init(auth_token): Observable<object> {
    if (this.swPush.isEnabled) {
      this.swPush.requestSubscription({ serverPublicKey: HOST_VAPID_KEY })
        .then(sub => {
          console.log("requested sub: ", sub)
          this.postSubscription('subscribe', sub, auth_token).subscribe();
        })
        .catch(err => {
          console.log("error in requestSubscription: ", err);
        });
      return this.swPush.messages;
    } else {
      console.log('error: push not enabled.');
    }
  }

  postSubscription(statusType, sub, auth_token) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Token ' + auth_token
      })
    };
    const browser = navigator.userAgent.match(/(firefox|msie|chrome|safari|trident)/ig)[0].toLowerCase();
    console.log("Browser: ", browser)
    const data = {
      status_type: statusType,
      subscription: sub.toJSON(),
      browser: browser
    };
    return this.http.post(url + webpush_offset_url, data, httpOptions);
  }
}
