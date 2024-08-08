import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { User } from '../Model/user';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  uploadDocument(file: File, customDate: string, customModule: string) {
    throw new Error('Method not implemented.');
  }

   constructor(private afs : AngularFirestore,
    private auth: AngularFireAuth,
   
    )
     { }


     addDocuments(collectionName: string, documents: any[]) {
      const batch = this.afs.firestore.batch();
      
      documents.forEach(doc => {
        const docRef = this.afs.collection(collectionName).doc(this.afs.createId()).ref;
        batch.set(docRef, doc);
      });
  
      return batch.commit();
    }
    
    addModules(user : User) {
      user.id = this.afs.createId();
      return this.afs.collection('/Modules').add(user);
    }

  getAllModules() {
    return this.afs.collection('/Modules').snapshotChanges();
  }

  addStaff(user : User) {
    user.id = this.afs.createId();
    return this.afs.collection('/registeredStaff').add(user);
  }

  
  // delete student
  deleteStaff(user : User) {
     this.afs.doc('/registeredStaff/'+user.id).delete();
  }

  // update student
  updateUser(user : User) {
    this.deleteStaff(user);
    this.addStaff(user);
  }
  
  getAllUserStaffNumbers(): Observable<{ staffNumber: string; role: any }[]> {
    return this.afs.collection<User>('/registeredStaff', ref => ref.where('position', '==', 'Lecturer')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as User;
        return {
          staffNumber: data.staffNumber || '', // Ensure fallback if not found
          role: data.role || '' // Ensure fallback if not found
        };
      }))
    );
  }

  // Fetch all admin staff numbers
  getAllAdminStaffNumbers(): Observable<{ staffNumber: string }[]> {
    return this.afs.collection<User>('/registeredStaff', ref => ref.where('role', '==', 'Admin')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as User;
        return {
          staffNumber: data.staffNumber || '' // Ensure fallback if not found
        };
      }))
    );
  }

  // Fetch all documents
  getAllDocuments(): Observable<any[]> {
    return this.afs.collection('/uploads').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any; // Replace 'any' with your document type
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }
}