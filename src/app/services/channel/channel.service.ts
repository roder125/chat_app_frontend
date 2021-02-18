import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService, User } from '../auth/auth.service';

export interface Channel {
  id: string,
  name?: string,
  color?: string,
  members: User[],
  lastMessage?: Message,
  messages?: Message[]
}

export interface Message {
  "message": string,
    "sent": string,
    "senderId": string
}

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  private channelsSubject: BehaviorSubject<Channel[]> = new BehaviorSubject<Channel[]>(null);

  constructor(private http: HttpClient, private auth: AuthService) {
    this.auth.getUserValue().subscribe((user: User) => {
      if(user) {
        this.getAllChannels(user.id);
      }
    })
  }

  async getAllChannels(userId: string) {
    return await this.http.get("../../../assets/mocks/channels.json").toPromise().then((res: Channel[]) => {
      if(res) {
       /*  res.map((channel: Channel) => {
          return channel.members.splice(channel.members.findIndex(m => m.id === userId));
        }); */
      } else {
        res = [];
      }
      this.setChannelsSubjectValue(res);
    });
  }

  setChannelsSubjectValue(channels: Channel[]) {
    this.channelsSubject.next(channels);
  }

  getChannelsSubjectValue() {
    return this.channelsSubject.asObservable();
  }
}
