import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BrevoPageRoutingModule } from './brevo-routing.module';

import { BrevoPage } from './brevo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BrevoPageRoutingModule
  ],
  declarations: [BrevoPage]
})
export class BrevoPageModule {}
