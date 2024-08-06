import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth
  ) {}

  async uploadFile(file: File, date: string, module: string): Promise<void> {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const filePath = `uploads/${date}/${module}/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // console.log(`Starting upload: ${file.name} to path: ${filePath}`);

    return new Promise((resolve, reject) => {
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            // console.log('File URL:', url);
            this.saveFileData(file.name, url, date, module, user.uid)
              .then(() => {
                // console.log('File uploaded and metadata saved successfully');
                resolve();
              })
              .catch(error => {
                // console.error('Error saving file metadata:', error);
                reject(error);
              });
          });
        })
      ).subscribe();
    });
  }

  private saveFileData(fileName: string, url: string, date: string, module: string, userId: string): Promise<void> {
    const fileData = {
      name: fileName,
      url: url,
      date: date,
      module: module,
      createdAt: new Date(),
      userId: userId,
      version: 1 // Initial version
    };
    // console.log('Saving file data:', fileData);
    return this.firestore.collection('uploads').add(fileData)
      .then(() => {
        // console.log('File metadata saved successfully');
      })
      .catch(error => {
        // console.error('Error saving file metadata:', error);
        throw error;
      });
  }

  private logDocumentActivity(fileName: string, action: string, userId: string): Promise<void> {
    const activityLog = {
      fileName: fileName,
      action: action,
      userId: userId,
      timestamp: new Date()
    };
    return this.firestore.collection('documentActivities').add(activityLog)
      .then(() => {
        // console.log('Document activity logged successfully');
      })
      .catch(error => {
        // console.error('Error logging document activity:', error);
        throw error;
      });
  }
}
