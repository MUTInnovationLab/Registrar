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
  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth
  ) {}

  // Method to get all staff
  getAllStaff(): Observable<DocumentChangeAction<User>[]> {
    return this.afs.collection<User>('/registeredStaff').snapshotChanges() as Observable<DocumentChangeAction<User>[]>;
  }

  // Method to upload a document
  async uploadDocument(file: File, submissionDate: string, module: string): Promise<void> {
    const user = await this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const filePath = `uploads/${submissionDate}/${module}/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    return new Promise<void>((resolve, reject) => {
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            this.afs.collection('uploads').add({
              email: user.email,
              documentName: file.name,
              status: 'pending',
              comment: '',
              uploadDate: submissionDate,
              module: module,
              url,
              uploadedAt: new Date()
            }).then(() => resolve()).catch(error => reject(error));
          }, error => reject(error));
        })
      ).subscribe();
    });
  }

  // Method to get all uploaded documents
  getAllDocuments(): Observable<DocumentItem[]> {
    return this.afs.collection<DocumentItem>('/uploads').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as DocumentItem;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Method to update a single document
  updateDocument(documentId: string, data: Partial<DocumentItem>): Promise<void> {
    return this.afs.collection('/uploads').doc(documentId).update(data);
  }

  // Method to batch update documents
  updateDocuments(documents: { id: string; status: string; comment: string; }[]): Promise<void> {
    const batch = this.afs.firestore.batch();
    
    documents.forEach(doc => {
      const docRef = this.afs.collection('/uploads').doc(doc.id).ref;
      batch.update(docRef, { status: doc.status, comment: doc.comment });
    });
    
    return batch.commit();
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

  deleteStaff(user: User) {
    return this.afs.doc('/registeredStaff/' + user.id).delete();
  }

  updateUser(user: User) {
    this.deleteStaff(user);
    this.addStaff(user);
  }

  getAllUserStaffNumbers(): Observable<{ staffNumber: string; role: any }[]> {
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

  getAllAdminStaffNumbers(): Observable<{ staffNumber: string }[]> {
    return this.afs.collection<User>('/registeredStaff', ref => ref.where('role', '==', 'Admin')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as User;
        return {
          staffNumber: data.staffNumber || ''
        };
      }))
    );
  }
}
