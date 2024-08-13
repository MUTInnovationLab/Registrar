import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  private allDocuments: DocumentItem[] = []; 
  private declinedDocuments: DocumentItem[] = [];

  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth
  ) {}

  // Method to get all staff
  getAllStaff(): Observable<DocumentChangeAction<User>[]> {
    return this.afs.collection<User>('/registeredStaff').snapshotChanges() as Observable<DocumentChangeAction<User>[]>;
  }

  // Method to update multiple documents
  async updateDocuments(documents: DocumentItem[]): Promise<void> {
    const batch = this.afs.firestore.batch();

    documents.forEach(doc => {
      const docRef = this.afs.collection('uploads').doc(doc.id).ref;
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
    return this.afs.collection<DocumentItem>('uploads').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as DocumentItem;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Method to get documents from the rejected collection
  getRejectedDocuments(): Observable<DocumentItem[]> {
    return this.afs.collection<DocumentItem>('rejected').snapshotChanges().pipe(
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
    return this.afs.collection('/uploads').doc(documentId).update(data);
  }

  // Method to add a document to the rejected collection
  async addDocumentToRejectedCollection(document: DocumentItem): Promise<void> {
    try {
      await this.afs.collection('rejected').add(document);
      console.log('Document added to rejected collection');
    } catch (error: any) {
      throw new Error(`Failed to add document to rejected collection: ${error.message}`);
    }
  }

  // Method to add modules
  addModules(user: User) {
    user.id = this.afs.createId();
    return this.afs.collection('/Modules').add(user);
  }

  // Method to get all modules
  getAllModules() {
    return this.afs.collection('/Modules').snapshotChanges();
  }

  // Method to add staff
  addStaff(user: User) {
    user.id = this.afs.createId();
    return this.afs.collection('/registeredStaff').add(user);
  }

  // Method to delete staff
  deleteStaff(user: User) {
    return this.afs.doc('/registeredStaff/' + user.id).delete();
  }

  // Method to update user
  updateUser(user: User) {
    this.deleteStaff(user);
    this.addStaff(user);
  }

  // Method to get all user staff numbers
  getAllUserStaffNumbers(): Observable<{ staffNumber: string; role: any }[]> {
    return this.afs.collection<User>('/registeredStaff', ref => ref.orderBy('staffNumber')).snapshotChanges().pipe(
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
