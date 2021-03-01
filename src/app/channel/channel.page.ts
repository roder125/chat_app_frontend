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
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private menuCtrl: MenuController) { }

  ngOnInit() {
    this.activeRoute.params.subscribe(params => {
      this.userSub = this.authService.getUserValue().subscribe(user => {
        this.user = user;
        if (user && user.token) {
          this.user = user;
          this.channel.name = params.id;
          this.channelSub = this.channelService.getChannelsSubjectValue().subscribe((channels: Channel[]) => {
            if (!channels) {
              // no channels yet so join
              this.joinChannel();
            } else {
              let ch = channels.find(c => c.name === this.channel.name);
              if (!ch) {
                this.joinChannel();
              } else {
                this.channel = ch;
                this.initScroll();
              }
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

  ionViewDidEnter() {
    this.initScroll();
  }

  initScroll() {
    if(this.messagesList.nativeElement.offsetHeight === 0) {

      setTimeout(() => {
        this.initScroll();
      }, 100);
    } else {
      this.scrollContentToBottom();
    }
  }

  joinChannel() {
    this.channelService.createOrJoinChannel(this.channel).then((res: any) => {
      if (res.status === 'joined') {
        //this.presentToast("Joined channel " + this.channel.name);
      } else {
        this.presentToast("Created channel " + this.channel.name);
      }
    });
  }

  async openLoginModal() {
    const m = await this.modalCtrl.create({
      component: LoginModalPage,
      backdropDismiss: false
    });
    await m.present();
  }

  scrollContentToBottom() {
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
