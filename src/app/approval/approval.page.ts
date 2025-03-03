import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../Shared/data.service';
import { ToastController, AlertController, LoadingController, NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../Shared/auth.service';
import emailjs from 'emailjs-com';

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
  profileVisible: boolean = false;


   rolesData = [
    { role: 'Lecturer', documentName: '', url: '', status: '' },
    { role: 'HOD', documentName: '', url: '', status: '' },
    { role: 'Deputy Registrar', documentName: '', url: '', status: '' },
    { role: 'Examination Officer', documentName: '', url: '', status: '' },
    { role: 'Finance', documentName: '', url: '', status: '' },
    { role: 'Human Resource', documentName: '', url: '', status: '' },
    { role: 'External Moderator', documentName: '', url: '', status: '' },
  ];

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
  
            // Determine roles to fetch based on the current user's position
            let rolesToFetch: string[] = [];
            switch (userData.position) {
              case 'HOD':
                rolesToFetch = ['Lecturer']; // HOD views Lecturer documents
                break;
              case 'Deputy Registrar':
                rolesToFetch = ['HOD']; // Deputy Registrar views HOD documents
                break;
              case 'Examination Officer':
                rolesToFetch = ['Deputy Registrar']; // Examination Officer views Deputy Registrar documents
                break;
              case 'Finance':
                rolesToFetch = ['Examination Officer']; // Finance views Examination Officer documents
                break;
              case 'Human Resource':
                rolesToFetch = ['Finance']; // Human Resource views Finance documents
                break;
              case 'External Moderator':
                rolesToFetch = ['Human Resource']; // External Moderator views Human Resource documents
                break;
              default:
                rolesToFetch = []; // Default to an empty array if the position doesn't match
                break;
            }
  
            // Fetch documents based on the roles derived from the current user's position (HOD documents)
            this.dataService.getDocumentsByRoles(rolesToFetch).subscribe(
              positionData => {
                // Exclude documents associated with the current user's email
                const positionFilteredItems = positionData.filter(item => item.email !== this.currentUserEmail);
  
                // Further filter to include only items that share modules with the current user
                this.items = positionFilteredItems.filter(item =>
                  this.userModules.includes(item.module)
                );
  
                // Update filteredItems for display
                this.filteredItems = [...this.items];
              },
              error => {
                console.error('Error fetching documents by position:', error);
                this.showToast('Error fetching documents by position');
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
        
        // Send email notification after status change
        await this.uploaded(item); // Pass the entire item to the uploaded method
  
        this.loadItems();
      } else {
        this.showToast('Document ID is missing');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      this.showToast('Error updating status');
    }
  }
  
  async uploaded(item: DocumentItem) {
    // const emailParams = {
    //   email_to: item.email, // Use item.email directly
    //   from_email: 'thandekan736@gmail.com',
    //   subject: 'New Document Approval',
    //   message: `External invigilator document <span style="color: red;">${item.documentName}</span> has been <i>${item.status}</i> for the module <b>${item.module}</b>. You can view it here: <a href="${item.url}">${item.url}</a> and take necessary action.`
    //   };
  
    // try {
    //   await emailjs.send('interviewEmailsAD', 'template_7x4kjte', emailParams, 'TrFF8ofl4gbJlOhzB');
    //   console.log('Email successfully sent');
    //   this.showToast('Email successfully sent to ' + item.email);
    // } catch (error: any) {
    //   console.error('Error:', error);
    //   this.showToast('Error sending email: ' + error.message);
    // }
  }
  

  goBack(): void {
    this.navCtrl.back();
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
  toggleProfile() {
    this.profileVisible = !this.profileVisible;
  }
}
