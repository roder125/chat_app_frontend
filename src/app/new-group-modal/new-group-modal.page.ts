import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../services/auth/auth.service';
import { Channel } from '../services/channel/channel.service';

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

  constructor(private modalCtrl: ModalController, private auth: AuthService) { }

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
    if(this.user) {
      if(form.valid) {
        let colors = ['primary','secondary', 'tertiary', 'success', 'warning', 'danger', 'dark'];
        this.channel.color = colors[Math.floor(Math.random() * colors.length)];
        this.channel.messages = [];
        this.channel.members = [this.user];
        console.log("channel: ", this.channel)
      }
    }
  }
}
