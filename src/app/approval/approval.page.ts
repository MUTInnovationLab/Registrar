import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface DocumentItem {
  email: string;
  documentName: string;
  status: string;
  comment: string;
}

@Component({
  selector: 'app-approval',
  templateUrl: './approval.page.html',
  styleUrls: ['./approval.page.scss'],
})
export class ApprovalPage implements OnInit {
  searchQuery: string = '';
  items: DocumentItem[] = [
    { email: 'user1@example.com', documentName: 'Document 1', status: '', comment: '' },
    { email: 'user2@example.com', documentName: 'Document 2', status: '', comment: '' },
    { email: 'user3@example.com', documentName: 'Document 3', status: '', comment: '' },
    { email: 'user4@example.com', documentName: 'Document 4', status: '', comment: '' },
    { email: 'user5@example.com', documentName: 'Document 5', status: '', comment: '' },
    { email: 'user6@example.com', documentName: 'Document 6', status: '', comment: '' },
    { email: 'user7@example.com', documentName: 'Document 7', status: '', comment: '' },
    { email: 'user8@example.com', documentName: 'Document 8', status: '', comment: '' },
    { email: 'user9@example.com', documentName: 'Document 9', status: '', comment: '' },
    { email: 'user10@example.com', documentName: 'Document 10', status: '', comment: '' },
  ];
  filteredItems: DocumentItem[] = this.items;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Initialize any required data or services here
  }

  filterItems(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredItems = this.items.filter(item => 
      item.email.toLowerCase().includes(query) ||
      item.documentName.toLowerCase().includes(query)
    );
  }

  onStatusChange(item: DocumentItem) {
    console.log('Status changed:', item);
  }

  goBack() {
    this.router.navigate(['/previous-page']);  // Update this to your actual route
  }

  resetForm() {
    this.items = this.items.map(item => ({
      ...item,
      status: '',
      comment: ''
    }));
    this.filteredItems = [...this.items];
  }

  saveChanges() {
    // Handle save operation here
    console.log('Changes saved:', this.items);
  }
}
