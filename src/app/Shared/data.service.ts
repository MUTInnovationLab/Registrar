import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
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

  // Method to get all staff
  getAllStaff(): Observable<DocumentChangeAction<User>[]> {
    return this.db.collection<User>('/registeredStaff').snapshotChanges() as Observable<DocumentChangeAction<User>[]>;
  }

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
              email: '', // Replace with the current user's email if available
              documentName: file.name,
              status: 'pending',
              comment: '', // Comment can be added later during approval
              uploadDate: customDate,
              module: customModule,
              url: downloadURL,
            };

            // Save document metadata to Firestore
            await this.db.collection('documents').add(documentItem);
            resolve();
          } catch (error) {
            reject(error);
          }
        })
      ).subscribe();
    });
  }

  // Method to update multiple documents
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

  // Method to get all uploaded documents
  getAllDocuments(): Observable<DocumentItem[]> {
    return this.db.collection<DocumentItem>('uploads').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as DocumentItem;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Method to get documents from the rejected collection
  getRejectedDocuments(): Observable<DocumentItem[]> {
    return this.db.collection<DocumentItem>('rejected').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as DocumentItem;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Method to get documents from the shared array
  getSharedDocuments(): DocumentItem[] {
    return this.allDocuments;
  }

  // Method to set documents to the shared array (if needed)
  setSharedDocuments(documents: DocumentItem[]): void {
    this.allDocuments = documents;
  }

  // Method to update a single document
  updateDocument(documentId: string, data: Partial<DocumentItem>): Promise<void> {
    return this.db.collection('/uploads').doc(documentId).update(data);
  }

  // Method to add a document to the rejected collection
  async addDocumentToRejectedCollection(document: DocumentItem): Promise<void> {
    try {
      await this.db.collection('rejected').add(document);
      console.log('Document added to rejected collection');
    } catch (error: any) {
      throw new Error(`Failed to add document to rejected collection: ${error.message}`);
    }
  }

  // Method to add modules
  addModules(user: User) {
    user.id = this.db.createId();
    return this.db.collection('/Modules').add(user);
  }

  // Method to get all modules
  getAllModules() {
    return this.db.collection('/Modules').snapshotChanges();
  }

  // Method to add staff
  addStaff(user: User) {
    user.id = this.db.createId();
    return this.db.collection('/registeredStaff').add(user);
  }

  // Method to delete staff
  deleteStaff(user: User) {
    return this.db.doc('/registeredStaff/' + user.id).delete();
  }

  // Method to update user
  updateUser(user: User) {
    this.deleteStaff(user);
    this.addStaff(user);
  }

  // Method to get all user staff numbers
  getAllUserStaffNumbers(): Observable<{ staffNumber: string; role: any }[]> {
    return this.db.collection<User>('/registeredStaff', ref => ref.orderBy('staffNumber')).snapshotChanges().pipe(
      map(staff => {
        return staff.map(a => {
          const data = a.payload.doc.data() as User;
          return {
            staffNumber: data.staffNumber,
            role: data.role
          };
        });
      })
    );
  }

  // Method to get declined documents
  getDeclinedDocuments(): DocumentItem[] {
    return this.declinedDocuments;
  }

  // Method to set declined documents
  setDeclinedDocuments(documents: DocumentItem[]): void {
    this.declinedDocuments = documents;
  }
}
