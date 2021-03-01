import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NewGroupModalPage } from '../new-group-modal/new-group-modal.page';
import { ChannelService } from '../services/channel/channel.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private modalCtrl: ModalController, private channelService: ChannelService) {}

  async createNewGroup() {
    const m = await this.modalCtrl.create({
      component: NewGroupModalPage
    });
    await m.present();
  }
}
