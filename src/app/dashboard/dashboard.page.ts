import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import Swiper from 'swiper';
import { DataService } from '../Shared/data.service'; // Adjust the import path as necessary
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterViewInit {
  @ViewChild('swiper', { static: false }) swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  showMenu = false;

  modules$: Observable<any[]> | undefined;
  progressStatus$: Observable<any[]> | undefined;
  documents$: Observable<any[]> | undefined;

  constructor(
    private navController: NavController,
    private dataService: DataService // Inject the DataService
  ) {}

  ngOnInit() {
    // Fetch data from the service
    this.modules$ = this.dataService.getAllModules();
    this.progressStatus$ = this.dataService.getProgressStatus();
    this.documents$ = this.dataService.getAllDocuments();
  }

  ngAfterViewInit() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  Upload() {
    this.navController.navigateForward('/upload');
  }

  View() {
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
  downloadDocument(url: string) {
    window.open(url, '_blank');
  }
  previewDocument(url: string) {
    window.open(url, '_blank');
  }
}
