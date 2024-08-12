import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  profileVisible: boolean = false;

  constructor() {}

  ngOnInit() {}

  toggleProfile() {
    this.profileVisible = !this.profileVisible;
  }
}
