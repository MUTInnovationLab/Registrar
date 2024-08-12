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

  uploadDocument(file: File, customDate: string, customModule: string, email: string): Observable<any> {
    const filePath = `uploads/${file.name}`; // Ensure the path is as needed
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
  
    return task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe((url) => {
          const documentItem: DocumentItem = {
            email: email, // Ensure email is set
            documentName: file.name,
            status: 'approved', // Ensure status is set
            comment: '', // Ensure comment is set
            uploadDate: customDate,
            module: customModule,
            url: url,
            uploadedAt: new Date() // Ensure uploadedAt is set correctly
          };
  
          console.log('Document Item to Add:', documentItem); // Debugging line
  
          this.addDocument(documentItem);
        });
      })
    );
  }
  
  private addDocument(documentItem: DocumentItem) {
    console.log('Adding document:', documentItem);
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

  getAllModules() {
    return this.afs.collection('/Modules').snapshotChanges();
  }

  addStaff(user: User) {
    user.id = this.afs.createId();
    return this.afs.collection('/registeredStaff').add(user);
  }

  getAllStaff() {
    return this.afs.collection<User>('/registeredStaff').snapshotChanges();
  }

  deleteStaff(user: User) {
    this.afs.doc('/registeredStaff/' + user.id).delete();
  }

  updateUser(user: User) {
    this.deleteStaff(user);
    this.addStaff(user);
  }

  getAllUserStaffNumbers(): Observable<{ staffNumber: string, role: any }[]> {
    return this.afs.collection<User>('/registeredStaff', ref => ref.where('position', '==', 'Lecturer')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as User;
        return {
          staffNumber: data.staffNumber || '',
          role: data.role || ''
        };
      }))
    );
  }

  getAllAdminStaffNumbers(): Observable<string[]> {
    return this.afs.collection<User>('/registeredStaff', ref => ref.where('role', '==', 'Admin')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as User;
        return data.staffNumber || ''; // Return the staff number as a string
      }))
    );
  }

  getAllDocuments(): Observable<any[]> {
    return this.afs.collection('/uploads').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any; // Replace 'any' with your document type
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
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

  // New methods to manage shared and declined documents
  setSharedDocuments(documents: DocumentItem[]) {
    this.sharedDocuments = documents;
  }

  getSharedDocuments(): DocumentItem[] {
    return this.sharedDocuments;
  }

  setDeclinedDocuments(documents: DocumentItem[]) {
    this.declinedDocuments = documents;
  }

  getDeclinedDocuments(): DocumentItem[] {
    return this.declinedDocuments;
  }

  updateDocument(id: string, updates: Partial<DocumentItem>): Promise<void> {
    return this.afs.doc(`/uploads/${id}`).update(updates);
  }

  updateDocuments(documents: DocumentItem[]): Promise<void> {
    const batch = this.afs.firestore.batch();
    documents.forEach(doc => {
      const docRef = this.afs.doc(`/uploads/${doc.id}`).ref;
      batch.update(docRef, doc);
    });
    return batch.commit();
  }
}
