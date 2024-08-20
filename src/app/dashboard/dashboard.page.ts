import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import Swiper from 'swiper';
import { DataService } from '../Shared/data.service'; // Adjust the import path as necessary
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterViewInit {
  @ViewChild('swiper', { static: false }) swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  showMenu = false;
  count! : number;

  
  documents$: Observable<any[]> | undefined;

  rolesData = [
    { role: 'Lecturer', documentName: '', url: '', status: '' },
    { role: 'External Moderator', documentName: '', url: '', status: '' },
    { role: 'Finance', documentName: '', url: '', status: '' },
    { role: 'Examination Officer', documentName: '', url: '', status: ''  },
    { role: 'Human Resource', documentName: '', url: '', status: ''  },
    { role: 'Deputy Registrar', documentName: '', url: '', status: ''  },
    { role: 'HOD', documentName: '', url: '', status: '' }
  ];

  constructor(
    private navController: NavController,
    private dataService: DataService // Inject the DataService
  ) {}

  ngOnInit() {
    // Fetch data from the service
    
    this.documents$ = this.dataService.getAllDocuments();
    
    // Assign fetched documents to predefined roles
    this.documents$.pipe(
      map(documents => this.assignDocumentsToRoles(documents))
    ).subscribe();
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

private assignDocumentsToRoles(documents: any[]) {
  // Fill the rolesData array with documents
  for (let i = 0; i < this.rolesData.length; i++) {
    if (i < documents.length) {
      // If there are enough documents, assign them
      this.rolesData[i].documentName = documents[i].documentName;
      this.rolesData[i].url = documents[i].url;
      this.rolesData[i].status = documents[i].status;
    } else {
      // If not enough documents, set default values
      this.rolesData[i].documentName = '';
      this.rolesData[i].url = '';
      this.rolesData[i].status = '';
    }
  }
}

 
}
