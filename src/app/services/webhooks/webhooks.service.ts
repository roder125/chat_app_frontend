import { Injectable } from '@angular/core';
import { AuthService, User } from '../auth/auth.service';
import { ChannelService, Message } from '../channel/channel.service';
import { DjangoPushWorkerService } from '../django-push-worker/django-push-worker.service';

@Injectable({
  providedIn: 'root'
})
export class WebhooksService {

  currUser: User;

  constructor(private pushService: DjangoPushWorkerService, private auth: AuthService, private channelService: ChannelService) {

  }

  /**
   * Aktuelle Changes aus der Datenbank erhalten
   * @param token
   */
  webhooksInit(token: string) {
    this.pushService.init(token).subscribe((res: any) => {
      console.log("update service: ", res);
      if (res.head === "message") {

        let body = res.body;
        if (this.auth.currentUserValue.name !== body.user.username) {
          let message: Message = {
            message: body.message,
            user: body.user,
            date: body.date
          }
          this.channelService.updateChannelMessages(message, body.room.identifier);
        }
      }
    });
  }
}
