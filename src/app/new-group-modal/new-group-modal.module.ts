import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewGroupModalPageRoutingModule } from './new-group-modal-routing.module';

import { NewGroupModalPage } from './new-group-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewGroupModalPageRoutingModule
  ],
  declarations: [NewGroupModalPage]
})
export class NewGroupModalPageModule {}
