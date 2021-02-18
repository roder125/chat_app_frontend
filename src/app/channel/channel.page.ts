import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../services/auth/auth.service';
import { Channel, ChannelService, Message } from '../services/channel/channel.service';
import * as moment from 'moment';
import { IonContent, MenuController, ModalController, NavController } from '@ionic/angular';
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
    private navCtrl: NavController,
    private menuCtrl: MenuController) { }

  ngOnInit() {
    this.activeRoute.params.subscribe(params => {
      this.userSub = this.authService.getUserValue().subscribe(user => {
        console.log("USER ---  : ", user)
        this.user = user;
        if (user) {
          console.log("hat user: ", user)
          this.user = user;
          this.channelSub = this.channelService.getChannelsSubjectValue().subscribe((channels: Channel[]) => {
            if (channels && user) {
              this.channel = channels.find(c => c.id === params.id);
              this.chatPartner = this.channel.members.find(m => m.id !== this.user.id);
            }
          });
        }
      });
    });
    this.menuCtrl.enable(false);
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.channelSub.unsubscribe();
    this.menuCtrl.enable(true);
  }

  async openLoginModal() {
    const m = await this.modalCtrl.create({
      component: LoginModalPage,
      backdropDismiss: false
    });
    await m.present();
  }

  scrollContentToBottom() {
    console.log(this.messagesList.nativeElement.offsetHeight)

    //@ts-ignore
    let distance = (this.content.el.offsetHeight - this.messagesList.nativeElement.offsetHeight) - 16;
    distance = distance * -1;
    console.log(distance)

    this.content.scrollToPoint(0, distance, 100);
    //this.content.scrollToBottom(100);
  }

  sendMessage() {
    if (this.message.message && this.message.message.length > 0) {
      //this.message.
      this.message.senderId = this.user.id;
      this.message.sent = moment().format("HH:mm MM-DD");
      console.log(this.message.sent)
      this.channel.messages.push({ ...this.message });

      this.message.message = "";
      this.message.sent = "";
      setTimeout(() => {
        this.scrollContentToBottom();
      }, 100);
    }
  }

}
