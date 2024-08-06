import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, switchMap, take } from 'rxjs/operators';
import { DataService } from './Shared/data.service';
import { AuthService } from './Shared/auth.service';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  uploadFile(file: File, date: string, module: string): Observable<void> {
    return this.authService.isAuthenticated().pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          throw new Error('User not authenticated');
        }

        const filePath = `uploads/${date}/${module}/${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);

        return new Observable<void>(observer => {
          task.snapshotChanges().pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe(url => {
                this.saveFileData(file.name, url, date, module)
                  .then(() => {
                    observer.next();
                    observer.complete();
                  })
                  .catch(error => observer.error(error));
              });
            })
          ).subscribe();
        });
      })
    );
  }

  private saveFileData(fileName: string, url: string, date: string, module: string): Promise<void> {
    const fileData = {
      name: fileName,
      url: url,
      date: date,
      module: module,
      createdAt: new Date(),
      version: 1
    };
    return this.dataService.addDocuments('uploads', [fileData])
      .then(() => this.logDocumentActivity(fileName, 'upload'))
      .catch(error => {
        throw error;
      });
  }

  private logDocumentActivity(fileName: string, action: string): Promise<void> {
    const activityLog = {
      fileName: fileName,
      action: action,
      timestamp: new Date()
    };
    return this.dataService.addDocuments('documentActivities', [activityLog])
      .catch(error => {
        throw error;
      });
  }
}