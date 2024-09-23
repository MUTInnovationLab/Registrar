import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmailsPageRoutingModule } from './emails-routing.module';

import { EmailsPage } from './emails.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmailsPageRoutingModule
  ],
  declarations: [EmailsPage]
})
export class EmailsPageModule {}
