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
  async uploadDocument(file: File, date: string, module: string): Promise<void> {
    try {
      const filePath = `uploads/${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = fileRef.put(file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(async url => {
              // Get the current user's email
              const user = await this.auth.currentUser;
              const email = user?.email || 'unknown@example.com'; // Fallback if email is not available

              // Save document info to Firestore
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

  // Method to add documents to a specific collection
  addDocuments(collectionName: string, documents: any[]) {
    const batch = this.afs.firestore.batch();

    documents.forEach(doc => {
      const docRef = this.afs.collection(collectionName).doc(this.afs.createId()).ref;
      batch.set(docRef, doc);
    });

    return batch.commit();
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

  // Method to get all admin staff numbers
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

  // Method to get document by name
  getDocumentByName(documentName: string): Observable<DocumentItem[]> {
    return this.afs.collection<DocumentItem>('uploads', ref => ref.where('documentName', '==', documentName)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as DocumentItem;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
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

}
