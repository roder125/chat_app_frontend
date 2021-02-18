import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/services/auth/auth.service';
import { Channel } from 'src/app/services/channel/channel.service';

@Component({
  selector: 'messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent implements OnInit {

  channel: Channel = <Channel>{};
  user: User = <User>{};

  constructor() { }

  ngOnInit() {}

  getSenderName(id: string) {
    return this.channel.members.find(m => m.id === id).name;
  }

  @Input() set setChannel(value: Channel) {
    if(value) {
      this.channel = value;
    }
  }

  @Input() set setCurrUser(value: User) {
    if(value) {
      this.user = value;
    }
  }
}
