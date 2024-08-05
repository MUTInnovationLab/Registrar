import { Component } from '@angular/core';

@Component({
  selector: 'app-upload', // or 'app-upload'
  templateUrl: './upload.page.html', // or './upload.page.html'
  styleUrls: ['./upload.page.scss']  // or './upload.page.scss'
})
export class UploadPage { // or UploadPage

  users = [ /* Your user data array */];

  handleFileInput(event: any) {
    // Logic to handle the file input here
    console.log(event.target.files); // Example: Log the selected file
  }

  submit() {
    // Logic for submitting the form here
  }

}
