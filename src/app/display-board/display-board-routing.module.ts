import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisplayBoardPage } from './display-board.page';

const routes: Routes = [
  {
    path: '',
    component: DisplayBoardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisplayBoardPageRoutingModule {}
