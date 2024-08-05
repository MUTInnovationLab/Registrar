import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import Swiper from 'swiper';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterViewInit {
  @ViewChild('swiper', { static: false }) swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  constructor(private navController:NavController) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }
Upload(){
  this.navController.navigateForward('/upload');
}

View(){
  this.navController.navigateForward('/view-docs');
}

  goNext() {
    this.swiper?.slideNext();
  }

  goPrev() {
    this.swiper?.slidePrev();
  }

  swiperSlideChanged(e: any) {
    console.log('Changed', e);
  }
}
