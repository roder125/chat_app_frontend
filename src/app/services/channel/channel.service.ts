import { HttpClient } from '@angular/common/http';
import { CoreEnvironment } from '@angular/compiler/src/compiler_facade_interface';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService, User } from '../auth/auth.service';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage.service';

const CHANNELS_KEY = "chat_app_channels";

export interface Channel {
  id: string,
  name?: string,
  messages?: Message[]
}

export interface Message {
  message: string,
  user: {
    username: string
  },
  date: string
}

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  private url = environment.apiUrl;

  private channelsSubject: BehaviorSubject<Channel[]> = new BehaviorSubject<Channel[]>(null);

  constructor(private http: HttpClient, private auth: AuthService, private storage: StorageService) {
    this.auth.getUserValue().subscribe((user: User) => {
      if (user) {
        this.getAllChannels();
      }
    })
  }

  async getAllChannels() {
    this.storage.getFromStorage(CHANNELS_KEY).then(res => {
      console.log(res);
      this.channelsSubject.next(res);
    });
  }

  setChannelsSubjectValue(channels: Channel[]) {
    this.channelsSubject.next(channels);
  }

  getChannelsSubjectValue() {
    return this.channelsSubject.asObservable();
  }

  /**
   * return or create a channel by its name
   * @param name
   */
  createOrJoinChannel(channel: Channel) {
    return new Promise((resolve, reject) => {
      let body = {
        identifier: channel.name
      }
      this.http.post(this.url + "rooms/join_or_create/", body).subscribe(async (res: any) => {
        console.log("res: ", res)
        if (res) {
          channel.messages = res.messages;
          let channels = this.channelsSubject.getValue();
          if (channels) {
            channels.push(channel);
          } else {
            channels = [channel];
          }
          this.channelsSubject.next(channels);
          console.log("channels")
          //await this.storage.setInStorage(CHANNELS_KEY, []);
          resolve(res);
        }
      }, error => {
        console.log("error: ", error)
        reject(error);
      });
    })

  }

  messageChannel(m: string, channel: string) {
    return new Promise((resolve, reject) => {
      let body = {
        identifier: channel,
        message: m
      }
      this.http.post(this.url + "rooms/message/", body).subscribe(res => {
        console.log("res: ", res)
        resolve(res);
      }, error => {
        reject(error);
        console.log("error: ", error)
      });
    })

  }
}
