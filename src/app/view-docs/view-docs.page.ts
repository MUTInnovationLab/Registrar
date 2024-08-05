import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-docs',
  templateUrl: './view-docs.page.html',
  styleUrls: ['./view-docs.page.scss'],
})
export class ViewDocsPage implements OnInit {
  activeTab: string = 'all';

  allDocuments = [
    { email: 'user1@example.com', name: 'Doc 1', status: 'Approved'},
    { email: 'user2@example.com', name: 'Doc 2', status: 'Declined'},
    { email: 'user3@example.com', name: 'Doc 3', status: 'Suspended'},
    { email: 'user4@example.com', name: 'Doc 4', status: 'Suspended'},
    { email: 'user5@example.com', name: 'Doc 5', status: 'Approved'},
    { email: 'user6@example.com', name: 'Doc 6', status: 'Declined'},
    { email: 'user7@example.com', name: 'Doc 7', status: 'Approved'},
    { email: 'user8@example.com', name: 'Doc 8', status: 'Declined'},
    { email: 'user9@example.com', name: 'Doc 9', status: 'Suspended'},
    { email: 'user10@example.com', name: 'Doc 10', status: 'Suspended'},
    { email: 'user11@example.com', name: 'Doc 11', status: 'Approved'},
    { email: 'user12@example.com', name: 'Doc 12', status: 'Declined'},
    { email: 'user13@example.com', name: 'Doc 13', status: 'Approved'},
    { email: 'user14@example.com', name: 'Doc 14', status: 'Declined'},
    { email: 'user15@example.com', name: 'Doc 15', status: 'Suspended'},
    { email: 'user16@example.com', name: 'Doc 16', status: 'Suspended'},
    { email: 'user17@example.com', name: 'Doc 17', status: 'Approved'},
    { email: 'user18@example.com', name: 'Doc 18', status: 'Declined'},
    { email: 'user19@example.com', name: 'Doc 19', status: 'Approved'},
    { email: 'user20@example.com', name: 'Doc 20', status: 'Declined'},
    { email: 'user21@example.com', name: 'Doc 21', status: 'Suspended'},
    { email: 'user22@example.com', name: 'Doc 22', status: 'Suspended'},
    { email: 'user23@example.com', name: 'Doc 23', status: 'Approved'},
    { email: 'user24@example.com', name: 'Doc 24', status: 'Declined'},
    { email: 'user25@example.com', name: 'Doc 25', status: 'Approved'},
    { email: 'user26@example.com', name: 'Doc 26', status: 'Approved'},
    { email: 'user27@example.com', name: 'Doc 27', status: 'Declined'},
    { email: 'user28@example.com', name: 'Doc 28', status: 'Approved'},
    { email: 'user29@example.com', name: 'Doc 29', status: 'Declined'},
    { email: 'user30@example.com', name: 'Doc 30', status: 'Suspended'},
    { email: 'user31example.com', name: 'Doc 31', status: 'Suspended'},
    { email: 'user5@example.com', name: 'Doc 32', status: 'Approved'},
    { email: 'user6@example.com', name: 'Doc 33', status: 'Declined'},
    { email: 'user7@example.com', name: 'Doc 34', status: 'Approved'},
    { email: 'user8@example.com', name: 'Doc 35', status: 'Declined'},
    { email: 'user9@example.com', name: 'Doc 36', status: 'Suspended'},
    { email: 'user10@example.com', name: 'Doc 37', status: 'Suspended'},
    { email: 'user11@example.com', name: 'Doc 38', status: 'Approved'},
    { email: 'user12@example.com', name: 'Doc 39', status: 'Declined'},
    { email: 'user13@example.com', name: 'Doc 40', status: 'Approved'},
    { email: 'user14@example.com', name: 'Doc 41', status: 'Declined'},
    { email: 'user15@example.com', name: 'Doc 42', status: 'Suspended'},
    { email: 'user16@example.com', name: 'Doc 43', status: 'Suspended'},
    { email: 'user17@example.com', name: 'Doc 44', status: 'Approved'},
    { email: 'user18@example.com', name: 'Doc 45', status: 'Declined'},
    { email: 'user19@example.com', name: 'Doc 46', status: 'Approved'},
    { email: 'user20@example.com', name: 'Doc 47', status: 'Declined'},
    { email: 'user21@example.com', name: 'Doc 48', status: 'Suspended'},
    { email: 'user22@example.com', name: 'Doc 49', status: 'Suspended'},
    { email: 'user23@example.com', name: 'Doc 50', status: 'Approved'},
    { email: 'user24@example.com', name: 'Doc 51', status: 'Declined'},
    { email: 'user25@example.com', name: 'Doc 52', status: 'Approved'},
    { email: 'user26@example.com', name: 'Doc 53', status: 'Approved'},
    { email: 'user27@example.com', name: 'Doc 54', status: 'Declined'},

    // More documents...
  ];

  approvedDocuments = this.allDocuments.filter(doc => doc.status === 'Approved');
  declinedDocuments = this.allDocuments.filter(doc => doc.status === 'Declined');
  suspendedDocuments = this.allDocuments.filter(doc => doc.status === 'Suspended');

  allCount = this.allDocuments.length;
  approvedCount = this.approvedDocuments.length;
  declinedCount = this.declinedDocuments.length;
  suspendedCount = this.suspendedDocuments.length;

  constructor() { }

  ngOnInit() {
  }

  selectedDocumentType: string = 'all'; // Initialize to 'all' or whichever you want to be default

showDocument(type: string): void {
  this.selectedDocumentType = type;
  // Add your logic to display documents based on the selected type
}

  showDocuments(tab: string) {
    this.activeTab = tab;
  }

// Define a variable to store the selected document
selectedDocument: any;

// Method to select a row
selectRow(doc: any) {
    this.selectedDocument = doc;
}

// Method to check if a row is selected
isSelected(doc: any): boolean {
    return this.selectedDocument === doc;
}

}