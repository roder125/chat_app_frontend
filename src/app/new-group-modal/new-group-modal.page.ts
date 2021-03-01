import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../services/auth/auth.service';
import { Channel, ChannelService } from '../services/channel/channel.service';

@Component({
  selector: 'app-new-group-modal',
  templateUrl: './new-group-modal.page.html',
  styleUrls: ['./new-group-modal.page.scss'],
})
export class NewGroupModalPage implements OnInit, OnDestroy {

  channel: Channel = <Channel>{};
  user: User = <User>{};
  submitted: boolean = false;

  //subs
  userSub: Subscription;

  constructor(
    private modalCtrl: ModalController,
    private auth: AuthService,
    private channelsService: ChannelService,
    private toastCtrl: ToastController,
    private router: Router) { }

  ngOnInit() {
    this.userSub = this.auth.getUserValue().subscribe(res => {
      this.user = res;
    })
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  saveChannel(form: NgForm) {
    if (this.user) {
      if (form.valid) {
        this.channelsService.createOrJoinChannel(this.channel).then((res: any) => {
          if (res.status === 'joined') {
            this.presentToast("Joined channel " + this.channel.name);
          } else {
            this.presentToast("Created channel " + this.channel.name);
          }
          this.dismiss();
          this.router.navigate(['/channel/', this.channel.name]);
        });
      }
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
