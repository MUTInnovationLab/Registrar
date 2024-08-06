import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { User } from '../Model/user';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  uploadDocument(file: File) {
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

    //add modules
    addModules(user : User) {
      user.id = this.afs.createId();
      return this.afs.collection('/Modules').add(user);
    }

    //get all modules
  getAllModules() {
    return this.afs.collection('/Modules').snapshotChanges();
  }


  //add staff
  addStaff(user : User) {
    user.id = this.afs.createId();
    return this.afs.collection('/registeredStaff').add(user);
  }

  getAllStaff() {
    return this.afs.collection('/registeredStaff').snapshotChanges();
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
}