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
<<<<<<< HEAD
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

=======
  private allDocuments: DocumentItem[] = []; // Shared array to store all documents
  private declinedDocuments: DocumentItem[] = []; // Array to store declined documents

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

  // Method to get all uploaded documents and update the shared array
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
>>>>>>> 3962ae2a42a4faf65ebd23ebd1d5c1326360f16e
  getAllModules() {
    return this.afs.collection('/Modules').snapshotChanges();
  }

<<<<<<< HEAD
=======
  // Method to add staff
>>>>>>> 3962ae2a42a4faf65ebd23ebd1d5c1326360f16e
  addStaff(user: User) {
    user.id = this.afs.createId();
    return this.afs.collection('/registeredStaff').add(user);
  }

<<<<<<< HEAD
  getAllStaff() {
    return this.afs.collection<User>('/registeredStaff').snapshotChanges();
  }

  deleteStaff(user: User) {
    this.afs.doc('/registeredStaff/' + user.id).delete();
  }

=======
  // Method to delete staff
  deleteStaff(user: User) {
    return this.afs.doc('/registeredStaff/' + user.id).delete();
  }

  // Method to update user
>>>>>>> 3962ae2a42a4faf65ebd23ebd1d5c1326360f16e
  updateUser(user: User) {
    this.deleteStaff(user);
    this.addStaff(user);
  }

<<<<<<< HEAD
  getAllUserStaffNumbers(): Observable<{ staffNumber: string, role: any }[]> {
=======
  // Method to get all user staff numbers
  getAllUserStaffNumbers(): Observable<{ staffNumber: string; role: any }[]> {
>>>>>>> 3962ae2a42a4faf65ebd23ebd1d5c1326360f16e
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

<<<<<<< HEAD
  getAllAdminStaffNumbers(): Observable<string[]> {
=======
  // Method to get all admin staff numbers
  getAllAdminStaffNumbers(): Observable<{ staffNumber: string }[]> {
>>>>>>> 3962ae2a42a4faf65ebd23ebd1d5c1326360f16e
    return this.afs.collection<User>('/registeredStaff', ref => ref.where('role', '==', 'Admin')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as User;
        return data.staffNumber || ''; // Return the staff number as a string
      }))
    );
  }

<<<<<<< HEAD
  getAllDocuments(): Observable<any[]> {
    return this.afs.collection('/uploads').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any; // Replace 'any' with your document type
=======
  // Method to get document by name
  getDocumentByName(documentName: string): Observable<DocumentItem[]> {
    return this.afs.collection<DocumentItem>('uploads', ref => ref.where('documentName', '==', documentName)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as DocumentItem;
>>>>>>> 3962ae2a42a4faf65ebd23ebd1d5c1326360f16e
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

<<<<<<< HEAD
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
=======
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
>>>>>>> 3962ae2a42a4faf65ebd23ebd1d5c1326360f16e
}
