import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/Shared/data.service'; // Adjust the path as needed
import { DocumentItem } from 'src/app/Model/document-item'; // Adjust the path as needed
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-rejection',
  templateUrl: './rejection.page.html',
  styleUrls: ['./rejection.page.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateY(0)' })),
      state('out', style({ transform: 'translateY(100%)' })),
      transition('in => out', [
        animate('0.3s ease-in-out')
      ]),
      transition('out => in', [
        animate('0.3s ease-in-out')
      ])
    ])
  ]
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

  // Method to toggle the details view
  toggleDetails(doc: DocumentItem) {
    doc.showDetails = !doc.showDetails;
  }

  loadDeclinedDocuments() {
    this.dataService.getRejectedDocuments().subscribe(docs => {
      this.declinedDocuments = docs;
      this.checkForDocuments();
    });
  }

  getDocumentsToDisplay() {
    return this.declinedDocuments;
  }

  checkForDocuments() {
    this.showNoDocumentsCard = this.declinedDocuments.length === 0;
  }
  
  goBack() {
    this.router.navigate(['/home']);
  }
}