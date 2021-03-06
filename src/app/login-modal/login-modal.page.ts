import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AuthService, User } from '../services/auth/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.page.html',
  styleUrls: ['./login-modal.page.scss'],
})
export class LoginModalPage implements OnInit {

  user: User = <User>{};
  submitted: boolean = false;
  usernameError: boolean = false;

  constructor(private modalCtrl: ModalController, private auth: AuthService) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  login(form: NgForm) {
    if(form.valid) {
      this.auth.loginUser(this.user).then(res => {
        this.usernameError = false;
        this.dismiss();
      }).catch(e => {
        this.usernameError = true;
        console.log("Ups, something went wrong: ", e.message);
      });
    }
  }
}
