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
  filteredDocuments: any[] = []; // For displaying filtered documents
  approvedDocuments: any[] = [];
  declinedDocuments: any[] = [];
  suspendedDocuments: any[] = [];
  
  allCount = 0;
  approvedCount = 0;
  declinedCount = 0;
  suspendedCount = 0;
  
  searchTerm: string = ''; // For search input

  constructor(
    private router: Router, 
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.dataService.getAllDocuments().subscribe(docs => {
      this.documents = docs;
      this.filteredDocuments = this.documents; // Initially, all documents are filtered
      this.updateCounts();
    });
  }

  updateCounts() {
    this.approvedDocuments = this.documents.filter(doc => doc.status === 'Approved');
    this.declinedDocuments = this.documents.filter(doc => doc.status === 'Declined');
    this.suspendedDocuments = this.documents.filter(doc => doc.status === 'Suspended');

    this.allCount = this.documents.length;
    this.approvedCount = this.approvedDocuments.length;
    this.declinedCount = this.declinedDocuments.length;
    this.suspendedCount = this.suspendedDocuments.length;
  }

  filterDocuments() {
    this.filteredDocuments = this.documents.filter(doc => 
      (doc.documentName?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
       doc.email?.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
    this.updateCounts(); // Update the counts if necessary
  }
  

  showDocuments(tab: string) {
    this.activeTab = tab;
  }

  selectedDocument: any;

  selectRow(doc: any) {
    this.selectedDocument = doc;
  }

  isSelected(doc: any): boolean {
    return this.selectedDocument === doc;
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}