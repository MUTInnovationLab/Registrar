import { Component } from '@angular/core';
import { DataService } from '../Shared/data.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage {
  selectedFiles: FileList | null = null;
  customDate: string = '';
  customModule: string = '';
  selectedFileNames: string[] = [];
  showError = false;
  errorMessage: string = '';

  constructor(private dataService: DataService, private toastController: ToastController) {}

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
    if (!this.selectedFiles || !this.customDate || !this.customModule) {
      this.showError = true;
      this.errorMessage = 'Please fill all fields and select files to upload.';
      return;
    }
  
    this.showError = false;
  
    // Prepare and upload files
    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles[i];
      try {
        await this.dataService.uploadDocument(file, this.customDate, this.customModule);
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
