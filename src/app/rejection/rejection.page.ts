import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/Shared/data.service'; // Adjust the path as needed
import { DocumentItem } from 'src/app/Model/document-item'; // Adjust the path as needed
import { ActivatedRoute, Router } from '@angular/router';
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
    private dataService: DataService,
    private route: ActivatedRoute  
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      this.loadDeclinedDocuments(email); // Pass email to loadDocuments
    });

    
  }

  // Method to toggle the details view
  toggleDetails(doc: DocumentItem) {
    doc.showDetails = !doc.showDetails;
  }

  loadDeclinedDocuments(email?: string) {
    this.dataService.getRejectedDocuments().subscribe(docs => {
      // Filter documents based on the email if provided
      this.declinedDocuments = email 
        ? docs.filter(doc => doc.email === email) 
        : docs;
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
