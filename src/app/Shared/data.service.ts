import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { User } from '../Model/user';

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

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private sharedDocuments: DocumentItem[] = [];
  private declinedDocuments: DocumentItem[] = [];

  constructor(
    private afs: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {}

  // Upload document and store metadata in Firestore
  uploadDocuments(file: File, customDate: string, customModule: string, email: string): Observable<any> {
    const filePath = `uploads/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    return task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe((url) => {
          const documentItem: DocumentItem = {
            email: email,
            documentName: file.name,
            status: 'approved',
            comment: '',
            uploadDate: customDate,
            module: customModule,
            url: url,
            uploadedAt: new Date()
          };

          this.addDocument(documentItem);
        });
      })
    );
  }

  private addDocument(documentItem: DocumentItem) {
    this.afs.collection('/uploads').add(documentItem);
  }

  addDocuments(collectionName: string, documents: any[]) {
    const batch = this.afs.firestore.batch();
    documents.forEach(doc => {
      const docRef = this.afs.collection(collectionName).doc(this.afs.createId()).ref;
      batch.set(docRef, doc);
    });
    return batch.commit();
  }

  addModules(user: User) {
    user.id = this.afs.createId();
    return this.afs.collection('/Modules').add(user);
  }

  private allDocuments: DocumentItem[] = [];

  getAllStaff(): Observable<any[]> {
    return this.afs.collection<User>('/registeredStaff').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as User;
        const id = a.payload.doc.id;
        return { ...data, id };
      }))
    );
  }

  async uploadDocument(file: File, date: string, module: string): Promise<void> {
    try {
      const filePath = `uploads/${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = fileRef.put(file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(async url => {
              const user = await this.auth.currentUser;
              const email = user?.email || 'unknown@example.com';

              this.afs.collection('uploads').add({
                email: email,
                documentName: file.name,
                status: 'pending',
                comment: '',
                uploadDate: date,
                module: module,
                url: url,
                uploadedAt: new Date()
              }).then(() => resolve())
                .catch(err => reject(new Error(`Failed to save document info: ${err.message}`)));
            });
          })
        ).subscribe({
          error: (err) => reject(new Error(`Failed to upload file: ${(err as any).message || err}`))
        });
      });
    } catch (error: any) {
      throw new Error(`Error uploading document: ${error.message || error}`);
    }
  }
    getProgressStatus(): Observable<any[]> {
    return this.afs.collection('/progressStatus').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any; // Replace 'any' with your progress status type
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  getAllDocuments(): Observable<DocumentItem[]> {
    return this.afs.collection<DocumentItem>('uploads').snapshotChanges().pipe(
      map(actions => {
        this.allDocuments = actions.map(a => {
          const data = a.payload.doc.data() as DocumentItem;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
        return this.allDocuments;
      })
    );
  }
  
  // Method to get all modules
  getAllModules() {
    return this.afs.collection('/Modules').snapshotChanges();
  }
  

  // Methods to manage shared and declined documents
  setSharedDocuments(documents: DocumentItem[]) {
    this.sharedDocuments = documents;
  }

  getSharedDocuments(): DocumentItem[] {
    return this.sharedDocuments;
  }


  // Method to update a single document
  updateDocument(id: string, updates: Partial<DocumentItem>): Promise<void> {
    return this.afs.doc(`/uploads/${id}`).update(updates);
  }

  // Method to update multiple documents in a batch
  updateDocuments(documents: DocumentItem[]): Promise<void> {
    const batch = this.afs.firestore.batch();
    documents.forEach(doc => {
      const docRef = this.afs.doc(`/uploads/${doc.id}`).ref;
      batch.update(docRef, doc);
    });
    return batch.commit();
  }

  // Method to delete document by name
  deleteDocumentByName(documentName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.afs.collection<DocumentItem>('uploads', ref => ref.where('documentName', '==', documentName)).get().subscribe(snapshot => {
        if (snapshot.empty) {
          resolve(); // Resolve immediately if no documents found
          return;
        }

        const batch = this.afs.firestore.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));

        batch.commit().then(() => resolve())
          .catch(error => reject(error));
      });
    });
  }

  // Method to set declined documents
  setDeclinedDocuments(documents: DocumentItem[]): void {
    this.declinedDocuments = documents;
  }

  // Method to get declined documents
  getDeclinedDocuments(): DocumentItem[] {
    return this.declinedDocuments;
  }
}
