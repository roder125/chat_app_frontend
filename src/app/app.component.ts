import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LoginModalPage } from './login-modal/login-modal.page';
import { AuthService, User } from './services/auth/auth.service';
import { ChannelService } from './services/channel/channel.service';
import { WebhooksService } from './services/webhooks/webhooks.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit ,OnDestroy {

  user: User = <User>{};

  //subs
  userSub: Subscription;

  constructor(private auth: AuthService, private modalCtrl: ModalController, private channelsService: ChannelService, private webhookService: WebhooksService) {}

  ngOnInit() {
    this.auth.getUser().then((res: User) => {
      if(!res) {
        this.openLoginModal();
      } else {
        this.user = res;
      }
    });

    this.userSub = this.auth.getUserValue().subscribe(res => {
      this.user = res;
      if(res && res.token) {
        // ToDo Init web hook service
        console.log("init webhooks: ", res)
        this.webhookService.webhooksInit(res.token);
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

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  logout() {
    this.auth.logout().then(() => {
      this.channelsService.setChannelsSubjectValue([]);
    });
  }
}
