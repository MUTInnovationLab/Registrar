import { Component, OnInit } from '@angular/core';
import { DataService } from '../Shared/data.service';
import { AuthService } from '../Shared/auth.service'; // Import your AuthService
import { ToastController } from '@ionic/angular';
import { switchMap, map } from 'rxjs/operators';

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

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private toastController: ToastController
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
      map(staff => staff.find(user => user.email === this.email)) // Find the current user
    ).subscribe(
      user => {
        if (user) {
          this.position = user.position; // Extract position
          
          alert('Position is'+ this.position);
        } else {
          console.error('User not found in staff data');
        }
      },
      error => console.error('Error fetching user data', error)
    );
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

    // Prepare and upload files
    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles[i];
      try {
        await this.dataService.uploadDocument(file, this.customDate, this.customModule, this.email, this.position);
      } catch (error) {
        this.showError = true;
        // Cast the error to 'any' to access its properties
        this.errorMessage = `Error uploading file "${file.name}": ${(error as any).message || error}`;
        return;
      }
    }

    // Show success toast message
    this.showToast('Files uploaded successfully');

    // Clear selections after upload
    this.selectedFiles = null;
    this.selectedFileNames = [];
    this.customDate = '';
    this.customModule = '';
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
