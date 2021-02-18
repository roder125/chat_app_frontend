import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService, User } from 'src/app/services/auth/auth.service';
import { Channel, ChannelService } from 'src/app/services/channel/channel.service';

@Component({
  selector: 'channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss'],
})
export class ChannelListComponent implements OnInit, OnDestroy {

  channels: Channel[] = [];
  user = {} as User;

  //subs
  channelsSub: Subscription;

  constructor(private channelService: ChannelService, private auth: AuthService) { }

  ngOnInit() {
    this.auth.getUserValue().subscribe((user: User) => {
      this.user = user;
      if(user) {
        this.channelsSub = this.channelService.getChannelsSubjectValue().subscribe((channels: Channel[]) => {
          if(channels) {
            this.channels = channels;
          }
        });
      } else {
        this.channels = [];
      }
    });

  }

  ngOnDestroy() {
    this.channelsSub.unsubscribe();
  }

}
