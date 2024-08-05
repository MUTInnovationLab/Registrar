import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RejectionPageRoutingModule } from './rejection-routing.module';

import { RejectionPage } from './rejection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RejectionPageRoutingModule
  ],
  declarations: [RejectionPage]
})
export class RejectionPageModule {}
