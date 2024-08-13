import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../Model/user';
import { DocumentItem } from 'src/app/Model/document-item';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private allDocuments: DocumentItem[] = []; 
  private declinedDocuments: DocumentItem[] = [];

  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth
  ) {}

  uploadDocument(file: File, customDate: string, customModule: string): Promise<void> {
    const filePath = `documents/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, file);

    return new Promise<void>((resolve, reject) => {
      uploadTask.snapshotChanges().pipe(
        finalize(async () => {
          try {
            const downloadURL = await fileRef.getDownloadURL().toPromise();
            const documentItem: DocumentItem = {
              id: this.db.createId(),
              email: '', 
              documentName: file.name,
              status: 'pending',
              comment: '',
              uploadDate: customDate,
              module: customModule,
              url: downloadURL,
            };

            await this.db.collection('documents').add(documentItem);
            resolve();
          } catch (error) {
            reject(error);
          }
        })
      ).subscribe();
    });
  }

  async updateDocuments(documents: DocumentItem[]): Promise<void> {
    const batch = this.db.firestore.batch();

    documents.forEach(doc => {
      const docRef = this.db.collection('uploads').doc(doc.id).ref;
      batch.update(docRef, {
        status: doc.status,
        comment: doc.comment
      });
    });

    try {
      await batch.commit();
      console.log('Documents updated successfully');
    } catch (error: unknown) {
      if (error instanceof Error){
        throw new Error(`Failed to update documents: ${error.message}`);
      } else{
        throw new Error('Failed to update documents: An unknown error occurred');
      }
    }
  }

  async addDocumentToRejectedCollection(document: DocumentItem): Promise<void> {
    try {
      await this.db.collection('rejected').add(document);
      console.log('Document added to rejected collection');
    } catch (error: any) {
      throw new Error(`Failed to add document to rejected collection: ${error.message}`);
    }
  }

  getAllDocuments(): Observable<DocumentItem[]> {
    return this.db.collection<DocumentItem>('uploads').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as DocumentItem;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  getRejectedDocuments(): Observable<DocumentItem[]> {
    return this.db.collection<DocumentItem>('rejected').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as DocumentItem;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  addModules(user: User) {
    user.id = this.db.createId();
    return this.db.collection('/Modules').add(user);
  }

  getAllModules() {
    return this.db.collection('/Modules').snapshotChanges();
  }

  addStaff(user: User) {
    user.id = this.db.createId();
    return this.db.collection('/Users').add(user);
  }

  // getAllStaff() {
  //   return this.db.collection('/Users').snapshotChanges();
  // }

  getAllStaff(): Observable<DocumentChangeAction<User>[]> {
    return this.db.collection<User>('/Users').snapshotChanges();
  }

  getDocument(id: string) {
    return this.db.collection('uploads').doc(id).valueChanges();
  }

  updateDocument(id: string, data: any) {
    return this.db.collection('uploads').doc(id).update(data);
  }

  setDeclinedDocuments(documents: DocumentItem[]): void {
    this.declinedDocuments = documents;
  }

  getDeclinedDocuments(): DocumentItem[] {
    return this.declinedDocuments;
  }
}
