import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/Shared/data.service'; // Adjust the path as needed
import { DocumentItem } from 'src/app/Model/document-item'; // Adjust the path as needed
import { Router } from '@angular/router';

@Component({
  selector: 'app-rejection',
  templateUrl: './rejection.page.html',
  styleUrls: ['./rejection.page.scss'],
})
export class RejectionPage implements OnInit {
  declinedDocuments: DocumentItem[] = [];
  showNoDocumentsCard: boolean = true;

  constructor(
    private router: Router, 
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadDeclinedDocuments();
  }

  loadDeclinedDocuments() {
    this.declinedDocuments = this.dataService.getDeclinedDocuments();
    this.checkForDocuments();
  }

  getDocumentsToDisplay() {
    return this.declinedDocuments;
  }

  checkForDocuments() {
    this.declinedDocuments = this.getDocumentsToDisplay();
    this.showNoDocumentsCard = this.declinedDocuments.length === 0;
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
