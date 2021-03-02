import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private channelsSubject: BehaviorSubject<Channel[]> = new BehaviorSubject<Channel[]>([]);

  constructor(private http: HttpClient, private storage: StorageService) {
    this.getAllChannels();
  }

  async getAllChannels() {
    this.storage.getFromStorage(CHANNELS_KEY).then(res => {
      if(res) {
        this.channelsSubject.next(res);
      } else {
        this.channelsSubject.next([]);
      }
    });
  }

  setChannelsSubjectValue(channels: Channel[]) {
    this.channelsSubject.next(channels);
  }

  getChannelsSubjectValue() {
    return this.channelsSubject.asObservable();
  }

  async saveChannelLocal(channel: Channel) {
    let channels = this.channelsSubject.getValue();
    if(channels) {
      let index =  channels.findIndex(c => c.name === channel.name);
      if(index > -1 ) {
        channels[index] = channel;
      }
    }
    await this.storage.setInStorage(CHANNELS_KEY, channels);
  }

  async updateChannelMessages(message: Message, channelName: string) {
    let channels = this.channelsSubject.getValue();
    if(channels) {
      let channel =  channels.find(c => c.name === channelName);
      if(channel) {
        if(channel.messages && channel.messages.length > 0) {
          channel.messages.push(message);
        } else {
          channel.messages = [message];
        }
      }
    }
    this.channelsSubject.next(channels);
    await this.storage.setInStorage(CHANNELS_KEY, channels);
  }

  /**
   * return or create a channel by its name
   * @param name
   */
  createOrJoinChannel(channel: Channel, token: string) {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders({
        'Authorization': 'Token ' + token
      })
      let body = {
        identifier: channel.name
      }
      console.log("POST: --- create or join channel");
      this.http.post(this.url + "rooms/join_or_create/", body, {headers: headers}).subscribe(async (res: any) => {
        if (res) {
          channel.messages = res.messages;
          let channels = this.channelsSubject.getValue();
          if (channels) {
            let index = channels.findIndex(c => c.name === channel.name);
            if(index > -1) {
              channels[index] = channel;
            } else {
              channels.push(channel);
            }
          } else {
            channels = [channel];
          }
          this.channelsSubject.next(channels);
          await this.storage.setInStorage(CHANNELS_KEY, channels);
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
