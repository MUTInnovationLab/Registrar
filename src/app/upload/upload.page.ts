import { Component, OnInit } from '@angular/core';
import { DataService } from '../Shared/data.service';
import { AuthService } from '../Shared/auth.service';
import { ToastController } from '@ionic/angular';
import { switchMap, map } from 'rxjs/operators';
import emailjs from 'emailjs-com';
import { User } from '../Model/user';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage implements OnInit {
  selectedFiles: FileList | null = null;
  customDate: string = '';
  customModule: string = '';
  selectedFileNames: string[] = [];
  showError = false;
  errorMessage: string = '';
  email: string = '';
  position: string = '';
  uploadedBy: string = '';
  nextRoleEmail: string = '';

  selectedModule: string | null = null;
  documents$: Observable<any[]> | undefined;
  user$: Observable<User | undefined> | undefined;
  allUsers$: Observable<User[]> | undefined;
  userModules: string[] = [];
  currentUserPosition: string | undefined;
  
  modules: string[] = []; 

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
    private dataService: DataService,
    private authService: AuthService,
    private toastController: ToastController,
    private route: ActivatedRoute  
  
  ) {}

  ngOnInit() {
    // Fetch the user's email and position when the component initializes
    this.authService.getCurrentUserEmail().pipe(
      switchMap(email => {
        if (email) {
          this.email = email;
          return this.dataService.getAllStaff(); // Fetch all staff data
        } else {
          throw new Error('User not logged in');
        }
      }),
      map(staff => {
        const currentUser = staff.find((user: User) => user.email === this.email); // Find the current user
        if (currentUser) {
          this.position = currentUser.position; // Extract position
          this.currentUserPosition = currentUser.position; // Store current user position
          this.userModules = currentUser.modules || []; // Store user modules

          // Find the next role and its email
          const nextRoleData = this.rolesData.find(role => role.role !== this.position);
          if (nextRoleData) {
            const nextRoleUser = staff.find((u: User) => u.position === nextRoleData.role);
            this.nextRoleEmail = nextRoleUser ? nextRoleUser.email : '';
          }

          alert('Position is ' + this.position);
        } else {
          console.error('User not found in staff data');
        }
      })
    ).subscribe(
      () => {},
      error => console.error('Error fetching user data', error)
    );

   
    
    
    this.route.queryParams.subscribe(params => {
      const modulesParam = params['modules'];
      
      if (Array.isArray(modulesParam)) {
        // If modulesParam is an array, just assign it directly
        this.modules = modulesParam;
      } else if (typeof modulesParam === 'string') {
        // If it's a string, split it into an array
        this.modules = modulesParam.split(',');
      } else {
        // Handle the case where modulesParam is undefined or not a string
        this.modules = [];
      }
  
      alert('Modules: ' + this.modules.join(', '));
    });
  
  }

  onFileSelected(event: any): void {
    this.selectedFiles = event.target.files;
    this.selectedFileNames = this.selectedFiles ? Array.from(this.selectedFiles).map(file => file.name) : [];
  }

  onDragOver(event: any): void {
    event.preventDefault();
  }

  onDragLeave(event: any): void {
    event.preventDefault();
  }

  onDrop(event: any): void {
    event.preventDefault();
    this.selectedFiles = event.dataTransfer.files;
    this.selectedFileNames = this.selectedFiles ? Array.from(this.selectedFiles).map(file => file.name) : [];
  }

  
  async submit(): Promise<void> {
    if (!this.selectedFiles || !this.customDate || !this.customModule || !this.position) {
        this.showError = true;
        this.errorMessage = 'Please fill all fields, select files to upload, and ensure user data is loaded.';
        return;
    }

    this.showError = false;

    for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];
        try {
            const url = await this.dataService.uploadDocument(file, this.customDate, this.customModule, this.email, this.position);
            await this.uploaded(file.name, url);
        } catch (error) {
            this.showError = true;
            this.errorMessage = `Error uploading file "${file.name}": ${(error as any).message || error}`;
            return;
        }
    }

    this.showToast('Files uploaded successfully');
    this.selectedFiles = null;
    this.selectedFileNames = [];
    this.customDate = '';
    this.customModule = '';
}

  
  
  async uploaded(documentName: string, url: string) {
    // const emailParams = {
    //   email: this.email,
    //   documentName: documentName,
    //   status: 'pending',
    //   comment: '',
    //   uploadDate: this.customDate,
    //   module: this.customModule,
    //   url: url,
    //   position: this.position,
    //   uploadedAt: new Date().toISOString(), // Store as ISO string for consistency
    //   email_to: this.nextRoleEmail,
    //   from_email: 'thandekan736@gmail.com',
    //   subject: 'New Document Uploaded',
    //   message: `At ${this.customDate} new document ${documentName} has been uploaded by ${this.position} 
    //   for this module ${this.customModule}. You can view it here: ${url}`
    // };
  
    // try {
    //   await emailjs.send('interviewEmailsAD', 'template_7x4kjte', emailParams, 'TrFF8ofl4gbJlOhzB');
    //   console.log('Email successfully sent');
    //   this.showToast('Email successfully sent to ' + this.nextRoleEmail);
    // } catch (error: any) {
    //   console.error('Error:', error);
    //   this.showToast('Error sending email: ' + error.message);
    // }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
  

}
