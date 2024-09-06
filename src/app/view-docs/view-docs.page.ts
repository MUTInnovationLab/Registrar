import { Component, OnInit } from '@angular/core';
import { DataService } from '../Shared/data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-docs',
  templateUrl: './view-docs.page.html',
  styleUrls: ['./view-docs.page.scss'],
})
export class ViewDocsPage implements OnInit {
  activeTab: string = 'all';
  documents: any[] = [];
  filteredDocuments: any[] = [];
  selectedDocument: any;

  allCount = 0;
  approvedCount = 0;
  declinedCount = 0;
  suspendedCount = 0;

  searchTerm: string = '';

  // Properties for side panel functionality
  isPanelHidden: boolean = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      this.loadDocuments(email); // Pass email to loadDocuments
    });
  }

  loadDocuments(email?: string) {
    this.dataService.getAllDocuments().subscribe(docs => {
      if (email) {
        this.documents = docs.filter(doc => doc.email === email); // Filter based on email
      } else {
        this.documents = docs; // Load all documents if no email is provided
      }
      console.log('Documents Loaded:', this.documents);
      this.updateCounts();
      this.filterDocuments(); // Initial filtering
    });
  }

  
  

  updateCounts() {
    this.allCount = this.documents.length;
    this.approvedCount = this.documents.filter(doc => doc.status.toLowerCase() === 'approved').length;
    this.declinedCount = this.documents.filter(doc => doc.status.toLowerCase() === 'declined').length;
    this.suspendedCount = this.documents.filter(doc => doc.status.toLowerCase() === 'suspended').length;
  }

  filterDocuments() {
    let filtered = this.documents;

    // Filter by active tab
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(doc => doc.status.toLowerCase() === this.activeTab);
    }

    // Further filter by search term
    if (this.searchTerm.trim()) {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        (doc.documentName || doc.fileName || '').toLowerCase().includes(lowerSearchTerm) ||
        (doc.email || doc.uploadedBy || '').toLowerCase().includes(lowerSearchTerm) ||
        (doc.status || 'N/A').toLowerCase().includes(lowerSearchTerm) ||
        (doc.module || '').toLowerCase().includes(lowerSearchTerm) ||
        (doc.uploadDate || doc.submissionDate || '').toLowerCase().includes(lowerSearchTerm)
      );
    }

    this.filteredDocuments = filtered;
    console.log('Filtered Documents:', this.filteredDocuments);
  }

  showDocuments(tab: string) {
    this.activeTab = tab;
    this.filterDocuments();
  }


  selectRow(doc: any) {
    this.selectedDocument = doc;
    
  }

  isSelected(doc: any): boolean {
    return this.selectedDocument === doc;
  }
  

  goBack() {
    this.router.navigate(['/home']);
  }

  trackByDocument(index: number, doc: any): number {
    return doc.id; // Assuming each document has a unique id
  }

  // Method to toggle the visibility of the side panel
  toggleSidePanel() {
    this.isPanelHidden = !this.isPanelHidden;
  }
}
