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
  ) { }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    // Fetch data from DataService
    this.dataService.getAllDocuments().subscribe(data => {
      console.log('Documents fetched:', data);
      this.items = data;
      this.filteredItems = data; // Initialize filteredItems with all documents
    });
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
    this.showToast('Status updated');
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

  saveChanges() {
    // Filter out documents with undefined ids
    const updatedDocuments = this.items
      .filter(item => item.id) // Ensure id is defined
      .map(item => ({
        id: item.id!,
        status: item.status,
        comment: item.comment
      }));
  
    this.dataService.updateDocuments(updatedDocuments).then(() => {
      this.showToast('Changes saved successfully');
    }).catch(error => {
      console.error('Error saving changes: ', error);
      this.showToast('Error saving changes');
    });
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
