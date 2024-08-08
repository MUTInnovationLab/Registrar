import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../Shared/data.service';
import { ToastController } from '@ionic/angular';

interface DocumentItem {
  id?: string;
  email: string;
  documentName: string;
  status: string;
  comment: string;
  uploadDate: string;
  module: string;
  url?: string;
  uploadedAt?: Date;
}

@Component({
  selector: 'app-approval',
  templateUrl: './approval.page.html',
  styleUrls: ['./approval.page.scss'],
})
export class ApprovalPage implements OnInit {
  searchQuery: string = '';
  items: DocumentItem[] = [];
  filteredItems: DocumentItem[] = [];

  constructor(
    private router: Router, 
    private dataService: DataService, 
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    this.items = this.dataService.getSharedDocuments(); // Get documents from the shared array
    this.filteredItems = [...this.items]; // Initialize filteredItems with all documents

    // Subscribe to changes in Firestore to keep the array updated
    this.dataService.getAllDocuments().subscribe(
      data => {
        console.log('Documents fetched:', data);
        this.items = data;
        this.filteredItems = data; // Update filteredItems with new documents
      },
      error => {
        console.error('Error fetching documents:', error);
        this.showToast('Error fetching documents');
      }
    );
  }

  filterItems(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredItems = this.items.filter(item => 
      item.email.toLowerCase().includes(query) ||
      item.documentName.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.comment.toLowerCase().includes(query)
    );
  }

  async onStatusChange(item: DocumentItem) {
    try {
      if (item.id) {
        await this.dataService.updateDocument(item.id, { status: item.status, comment: item.comment });
        this.showToast('Status updated successfully');
      } else {
        this.showToast('Document ID is missing');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      this.showToast('Error updating status');
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  resetForm() {
    this.items = this.items.map(item => ({
      ...item,
      status: '',
      comment: ''
    }));
    this.filteredItems = [...this.items];
    this.showToast('Form reset successfully');
  }

  async saveChanges() {
    try {
      // Ensure id is defined before including the document for update
      const updatedDocuments = this.items
        .filter(item => item.id) // Include only documents with ids
        .map(item => ({
          id: item.id!,
          email: item.email,
          documentName: item.documentName,
          status: item.status,
          comment: item.comment
        }));

      await this.dataService.updateDocuments(updatedDocuments);
      this.showToast('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes: ', error);
      this.showToast('Error saving changes');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
}
