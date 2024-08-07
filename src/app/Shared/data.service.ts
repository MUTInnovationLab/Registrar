/*import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { finalize } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../Model/user';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth
  ) {}

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
              fileName: file.name,
              url,
              submissionDate,
              module,
              uploadedBy: user.uid,
              uploadedAt: new Date()
            }).then(() => resolve()).catch(error => reject(error));
          }, error => reject(error));
        })
      ).subscribe();
    });
  }

  addDocuments(uploads: string, documents: any[]) {
    const batch = this.afs.firestore.batch();

    documents.forEach(doc => {
      const docRef = this.afs.collection(uploads).doc(this.afs.createId()).ref;
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
    return this.afs.collection('/registeredStaff').snapshotChanges();
  }

  deleteStaff(user: User) {
    return this.afs.doc('/registeredStaff/' + user.id).delete();
  }

  updateUser(user: User) {
    this.deleteStaff(user);
    this.addStaff(user);
  }
}
*/
import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { finalize } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../Model/user';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth
  ) {}

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
              fileName: file.name,
              url,
              submissionDate,
              module,
              uploadedBy: user.email, // Use the user's email
              uploadedAt: new Date()
            }).then(() => resolve()).catch(error => reject(error));
          }, error => reject(error));
        })
      ).subscribe();
    });
  }

  addDocuments(uploads: string, documents: any[]) {
    const batch = this.afs.firestore.batch();

    documents.forEach(doc => {
      const docRef = this.afs.collection(uploads).doc(this.afs.createId()).ref;
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
    return this.afs.collection('/registeredStaff').snapshotChanges();
  }

  deleteStaff(user: User) {
    return this.afs.doc('/registeredStaff/' + user.id).delete();
  }

  updateUser(user: User) {
    this.deleteStaff(user);
    this.addStaff(user);
  }
}
