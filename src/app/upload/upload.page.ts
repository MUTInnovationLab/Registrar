import { Component } from '@angular/core';
import { UploadService } from '../upload.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage {
  selectedFiles: FileList | null = null; // Initialize with null
  customDate: string = '';
  customModule: string = '';
  selectedFileNames: string[] = [];
  showError = false;
  errorMessage: string = '';

  constructor(private uploadService: UploadService) {}

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

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles[i];
      try {
        await this.uploadService.uploadFile(file, this.customDate, this.customModule);
      } catch (error) {
        this.showError = true;
        this.errorMessage = `Error uploading file: ${file.name}`;
        return;
      }
    }

    // Clear selections after upload
    this.selectedFiles = null;
    this.selectedFileNames = [];
    this.customDate = '';
    this.customModule = '';
  }
}
