import { Component, OnInit } from '@angular/core';
import { DataService } from '../Shared/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-docs',
  templateUrl: './view-docs.page.html',
  styleUrls: ['./view-docs.page.scss'],
})
export class ViewDocsPage implements OnInit {
  activeTab: string = 'all';
  documents: any[] = [];
  filteredDocuments: any[] = [];

  allCount = 0;
  approvedCount = 0;
  declinedCount = 0;
  suspendedCount = 0;

  searchTerm: string = '';

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.dataService.getAllDocuments().subscribe((docs) => {
      this.documents = docs;
      console.log('Documents Loaded:', this.documents);
      this.documents.forEach(doc => console.log('Document URL:', doc.url));
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

  selectedDocument: any;

  selectRow(doc: any) {
    this.selectedDocument = doc;
    
  }

  isSelected(doc: any): boolean {
    return this.selectedDocument === doc;
  }
  

  goBack() {
    this.router.navigate(['../']);
  }

  trackByDocument(index: number, doc: any): number {
    return doc.id; // Assuming each document has a unique id
  }
}
