import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisplayBoardPageRoutingModule } from './display-board-routing.module';

import { DisplayBoardPage } from './display-board.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisplayBoardPageRoutingModule
  ],
  declarations: [DisplayBoardPage]
})
export class DisplayBoardPageModule {}
