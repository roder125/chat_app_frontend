import { Injectable } from '@angular/core';
import {DjangoPushWorkerService} from '../django-push-worker/django-push-worker.service';

@Injectable({
  providedIn: 'root'
})
export class WebhooksService {

  constructor(private pushService: DjangoPushWorkerService) { }

  /**
   * Aktuelle Changes aus der Datenbank erhalten
   * @param token
   */
  webhooksInit(token: string){
    this.pushService.init(token).subscribe((res: any) => {
      console.log(res);
      if(res.event === "list.message"){
        console.log("Got Message");

      }
    });
 }
}
