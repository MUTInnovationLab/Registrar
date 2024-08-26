import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../Shared/data.service';
import { ToastController, AlertController, LoadingController, NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../Shared/auth.service';

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
  userModules: string[] = [];
  currentUserEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
    private db: AngularFirestore,
    private loadingController: LoadingController,
    private auth: AngularFireAuth,
    private navCtrl: NavController,
    private router: Router, 
    private dataService: DataService, 
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }
  
  loadItems() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.email) {
        this.currentUserEmail = user.email;
        
        this.dataService.getUserByEmail(this.currentUserEmail).subscribe(userData => {
          if (userData && userData.modules) {
            this.userModules = userData.modules;
            
            // Fetch documents that belong to the user's modules
            this.dataService.getDocumentsByModules(this.userModules).subscribe(
              data => {
                // Exclude documents associated with the current user's email
                this.items = data.filter(item => item.email !== this.currentUserEmail);
                this.filteredItems = [...this.items];
              },
              error => {
                console.error('Error fetching documents:', error);
                this.showToast('Error fetching documents');
              }
            );
          } else {
            this.showToast('User modules not found');
          }
        });
      } else {
        this.showToast('User is not authenticated');
      }
    }, error => {
      console.error('Error fetching current user:', error);
      this.showToast('Error fetching current user');
    });
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
        
        if (item.status.toLowerCase() === 'declined') {
          await this.dataService.addDocumentToRejectedCollection(item);
          this.showToast('Document moved to rejected collection');
        }
        
        this.loadItems();
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
    this.searchQuery = '';
    this.filteredItems = [...this.items];
  }

  async saveChanges() {
    try {
      const updatedDocuments = this.items
        .filter(item => item.id)
        .map(item => ({
          id: item.id!,
          email: item.email,
          documentName: item.documentName,
          status: item.status,
          comment: item.comment,
          uploadDate: item.uploadDate || '',
          module: item.module || ''
        }));
  
      await this.dataService.updateDocuments(updatedDocuments);
  
      const declinedDocuments = this.items.filter(item => item.status === 'declined');
      this.dataService.setDeclinedDocuments(declinedDocuments);
  
      this.showToast('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes: ', error);
      this.showToast('Error saving changes');
    }
  }

  async updateDocumentStatus(docId: string, status: string, reason: string) {
    try {
      const user = await this.auth.currentUser;
      if (user) {
        const declinationTime = new Date().toISOString();
        const email = user.email;
  
        await this.db.collection('rejected').doc(docId).set({
          status: status,
          declinationTime: declinationTime,
          declinedBy: email,
          reason: reason
        });
  
        this.showToast('Document status updated successfully');
      } else {
        this.showToast('User is not authenticated');
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      this.showToast('Error updating document status');
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
