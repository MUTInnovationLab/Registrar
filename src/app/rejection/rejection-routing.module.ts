import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RejectionPage } from './rejection.page';

const routes: Routes = [
  {
    path: '',
    component: RejectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RejectionPageRoutingModule {}
