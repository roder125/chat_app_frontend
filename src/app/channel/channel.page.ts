import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../services/auth/auth.service';
import { Channel, ChannelService, Message } from '../services/channel/channel.service';
import * as moment from 'moment';
import { IonContent, MenuController, ModalController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LoginModalPage } from '../login-modal/login-modal.page';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.page.html',
  styleUrls: ['./channel.page.scss'],
})
export class ChannelPage implements OnInit, OnDestroy {

  channel = {} as Channel;
  chatPartner = {} as User;
  user = {} as User;
  messageString: string;
  message: Message = <Message>{};

  @ViewChild('ionContent') content: IonContent;
  @ViewChild('messagesList') messagesList: ElementRef;

  channelSub: Subscription;
  userSub: Subscription;

  constructor(
    private activeRoute: ActivatedRoute,
    private channelService: ChannelService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private menuCtrl: MenuController) { }

  ngOnInit() {
    this.activeRoute.params.subscribe(params => {
      this.userSub = this.authService.getUserValue().subscribe(user => {
        console.count("user")
        this.user = user;
        if (user && user.token) {
          this.user = user;
          this.channel.name = params.id;
          this.channelSub = this.channelService.getChannelsSubjectValue().subscribe((channels: Channel[]) => {
            console.log("channels: ", channels)
            if(channels && channels.length > 0) {
              console.log("has");
              let ch = channels.find(c => c.name === this.channel.name);
              if(ch) {
                console.log("changed: ", ch)
                this.channel = ch;
                this.initScroll();
              } else {
                console.log("join channel with eyisting channels")
                this.joinChannel(user.token);
              }
            } else {
              console.log("empty channels")
              this.joinChannel(user.token);
            }
          });
        }
      });
    });
    this.menuCtrl.enable(false);
    this.message.user = { username: "" }
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.channelSub.unsubscribe();
    this.menuCtrl.enable(true);
  }

  initScroll() {
    if(!this.messagesList) {
      setTimeout(() => {
        this.initScroll();
      }, 100);
    } else {
      if(this.messagesList.nativeElement.offsetHeight === 0) {
        setTimeout(() => {
          this.initScroll();
        }, 100);
      } else {
        this.scrollContentToBottom();
      }
    }
  }

  joinChannel(token: string) {
    this.channelService.createOrJoinChannel(this.channel, token).then((res: any) => {
      if (res.status === 'joined') {
        //this.presentToast("Joined channel " + this.channel.name);
      } else {
        this.presentToast("Created channel " + this.channel.name);
      }
    });
  }

  scrollContentToBottom() {
    console.log("scroll down")
    //@ts-ignore
    let distance = (this.content.el.offsetHeight - this.messagesList.nativeElement.offsetHeight) - 16;
    distance = distance * -1;
    console.log(distance)
    this.content.scrollToPoint(0, distance, 100);
  }

  sendMessage() {
    if (this.message.message && this.message.message.length > 0) {
      this.channelService.messageChannel(this.message.message, this.channel.name).then((res: any) => {
        this.message.date = new Date().toString();
        this.message.user.username = this.user.name;
        if (res.status === "send") {
          this.channel.messages.push({ ...this.message });
          this.message.message = "";
          setTimeout(() => {
            this.scrollContentToBottom();
          }, 100);
          this.channelService.saveChannelLocal(this.channel);
        }
      }).catch(e => {
        console.log(e);
      });
    }
  }

  async presentToast(m) {
    const t = await this.toastCtrl.create({
      message: m,
      duration: 3000
    });
    await t.present();
  }
}
