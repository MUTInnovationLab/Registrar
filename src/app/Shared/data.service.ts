// import { Injectable } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { AngularFireStorage } from '@angular/fire/compat/storage';
// import { Observable } from 'rxjs';
// import { finalize, map } from 'rxjs/operators';
// import { User } from '../Model/user';

// interface DocumentItem {
//   id?: string;
//   email: string;
//   documentName: string;
//   status: string;
//   comment: string;
//   uploadDate: string;
//   module: string;
//   url?: string;
//   uploadedAt?: Date;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class DataService {
//   private sharedDocuments: DocumentItem[] = [];
//   private declinedDocuments: DocumentItem[] = [];

//   constructor(
//     private afs: AngularFirestore,
//     private auth: AngularFireAuth,
//     private storage: AngularFireStorage
//   ) {}

//   uploadDocument(file: File, customDate: string, customModule: string, email: string): Observable<any> {
//     const filePath = `uploads/${file.name}`; // Ensure the path is as needed
//     const fileRef = this.storage.ref(filePath);
//     const task = this.storage.upload(filePath, file);
  
//     return task.snapshotChanges().pipe(
//       finalize(() => {
//         fileRef.getDownloadURL().subscribe((url) => {
//           const documentItem: DocumentItem = {
//             email: email, // Ensure email is set
//             documentName: file.name,
//             status: 'approved', // Ensure status is set
//             comment: '', // Ensure comment is set
//             uploadDate: customDate,
//             module: customModule,
//             url: url,
//             uploadedAt: new Date() // Ensure uploadedAt is set correctly
//           };
  
//           console.log('Document Item to Add:', documentItem); // Debugging line
  
//           this.addDocument(documentItem);
//         });
//       })
//     );
//   }
  
//   private addDocument(documentItem: DocumentItem) {
//     console.log('Adding document:', documentItem);
//     this.afs.collection('/uploads').add(documentItem);
//   }

//   addDocuments(collectionName: string, documents: any[]) {
//     const batch = this.afs.firestore.batch();
//     documents.forEach(doc => {
//       const docRef = this.afs.collection(collectionName).doc(this.afs.createId()).ref;
//       batch.set(docRef, doc);
//     });
//     return batch.commit();
//   }

//   addModules(user: User) {
//     user.id = this.afs.createId();
//     return this.afs.collection('/Modules').add(user);
//   }

//   private allDocuments: DocumentItem[] = []; // Shared array to store all documents
//   private declinedDocuments: DocumentItem[] = []; // Array to store declined documents

//   constructor(
//     private afs: AngularFirestore,
//     private storage: AngularFireStorage,
//     private auth: AngularFireAuth
//   ) {}

//   // Method to get all staff
//   getAllStaff(): Observable<DocumentChangeAction<User>[]> {
//     return this.afs.collection<User>('/registeredStaff').snapshotChanges() as Observable<DocumentChangeAction<User>[]>;
//   }

//   // Method to upload a document
//   async uploadDocument(file: File, date: string, module: string): Promise<void> {
//     try {
//       const filePath = `uploads/${file.name}`;
//       const fileRef = this.storage.ref(filePath);
//       const uploadTask = fileRef.put(file);

//       await new Promise<void>((resolve, reject) => {
//         uploadTask.snapshotChanges().pipe(
//           finalize(() => {
//             fileRef.getDownloadURL().subscribe(async url => {
//               // Get the current user's email
//               const user = await this.auth.currentUser;
//               const email = user?.email || 'unknown@example.com'; // Fallback if email is not available

//               // Save document info to Firestore
//               this.afs.collection('uploads').add({
//                 email: email,
//                 documentName: file.name,
//                 status: 'pending',
//                 comment: '',
//                 uploadDate: date,
//                 module: module,
//                 url: url,
//                 uploadedAt: new Date()
//               }).then(() => resolve())
//                 .catch(err => reject(new Error(`Failed to save document info: ${err.message}`)));
//             });
//           })
//         ).subscribe({
//           error: (err) => reject(new Error(`Failed to upload file: ${(err as any).message || err}`))
//         });
//       });
//     } catch (error: any) {
//       throw new Error(`Error uploading document: ${error.message || error}`);
//     }
//   }

//   // Method to get all uploaded documents and update the shared array
//   getAllDocuments(): Observable<DocumentItem[]> {
//     return this.afs.collection<DocumentItem>('uploads').snapshotChanges().pipe(
//       map(actions => {
//         this.allDocuments = actions.map(a => {
//           const data = a.payload.doc.data() as DocumentItem;
//           const id = a.payload.doc.id;
//           return { id, ...data };
//         });
//         return this.allDocuments;
//       })
//     );
//   }

//   // Method to get documents from the shared array
//   getSharedDocuments(): DocumentItem[] {
//     return this.allDocuments;
//   }

//   // Method to set documents to the shared array (if needed)
//   setSharedDocuments(documents: DocumentItem[]): void {
//     this.allDocuments = documents;
//   }

//   // Method to update a single document
//   updateDocument(documentId: string, data: Partial<DocumentItem>): Promise<void> {
//     return this.afs.collection('/uploads').doc(documentId).update(data);
//   }

//   // Method to batch update documents
//   updateDocuments(documents: { id: string; status: string; comment: string; }[]): Promise<void> {
//     const batch = this.afs.firestore.batch();

//     documents.forEach(doc => {
//       const docRef = this.afs.collection('/uploads').doc(doc.id).ref;
//       batch.update(docRef, { status: doc.status, comment: doc.comment });
//     });

//     return batch.commit();
//   }

//   // Method to add documents to a specific collection
//   addDocuments(collectionName: string, documents: any[]) {
//     const batch = this.afs.firestore.batch();

//     documents.forEach(doc => {
//       const docRef = this.afs.collection(collectionName).doc(this.afs.createId()).ref;
//       batch.set(docRef, doc);
//     });

//     return batch.commit();
//   }

//   // Method to add modules
//   addModules(user: User) {
//     user.id = this.afs.createId();
//     return this.afs.collection('/Modules').add(user);
//   }

//   // Method to get all modules
//   getAllModules() {
//     return this.afs.collection('/Modules').snapshotChanges();
//   }

//   // Method to add staff
//   addStaff(user: User) {
//     user.id = this.afs.createId();
//     return this.afs.collection('/registeredStaff').add(user);
//   }

//   getAllStaff() {
//     return this.afs.collection<User>('/registeredStaff').snapshotChanges();
//   }

//   deleteStaff(user: User) {
//     this.afs.doc('/registeredStaff/' + user.id).delete();
//   }

//   // Method to delete staff
//   deleteStaff(user: User) {
//     return this.afs.doc('/registeredStaff/' + user.id).delete();
//   }

//   // Method to update user
//   updateUser(user: User) {
//     this.deleteStaff(user);
//     this.addStaff(user);
//   }

//   getAllUserStaffNumbers(): Observable<{ staffNumber: string, role: any }[]> {
//   // Method to get all user staff numbers
//   getAllUserStaffNumbers(): Observable<{ staffNumber: string; role: any }[]> {
//     return this.afs.collection<User>('/registeredStaff', ref => ref.where('position', '==', 'Lecturer')).snapshotChanges().pipe(
//       map(actions => actions.map(a => {
//         const data = a.payload.doc.data() as User;
//         return {
//           staffNumber: data.staffNumber || '',
//           role: data.role || ''
//         };
//       }))
//     );
//   }

//   getAllAdminStaffNumbers(): Observable<string[]> {
//   // Method to get all admin staff numbers
//   getAllAdminStaffNumbers(): Observable<{ staffNumber: string }[]> {
//     return this.afs.collection<User>('/registeredStaff', ref => ref.where('role', '==', 'Admin')).snapshotChanges().pipe(
//       map(actions => actions.map(a => {
//         const data = a.payload.doc.data() as User;
//         return data.staffNumber || ''; // Return the staff number as a string
//       }))
//     );
//   }

//   getAllDocuments(): Observable<any[]> {
//     return this.afs.collection('/uploads').snapshotChanges().pipe(
//       map(actions => actions.map(a => {
//         const data = a.payload.doc.data() as any; // Replace 'any' with your document type
//   // Method to get document by name
//   getDocumentByName(documentName: string): Observable<DocumentItem[]> {
//     return this.afs.collection<DocumentItem>('uploads', ref => ref.where('documentName', '==', documentName)).snapshotChanges().pipe(
//       map(actions => actions.map(a => {
//         const data = a.payload.doc.data() as DocumentItem;
//         const id = a.payload.doc.id;
//         return { id, ...data };
//       }))
//     );
//   }

//   getProgressStatus(): Observable<any[]> {
//     return this.afs.collection('/progressStatus').snapshotChanges().pipe(
//       map(actions => actions.map(a => {
//         const data = a.payload.doc.data() as any; // Replace 'any' with your progress status type
//         const id = a.payload.doc.id;
//         return { id, ...data };
//       }))
//     );
//   }

import { Injectable } from '@angular/core'; // exist
import { AngularFireAuth } from '@angular/fire/compat/auth'; // exist
import { AngularFirestore } from '@angular/fire/compat/firestore'; // exist
import { AngularFireStorage } from '@angular/fire/compat/storage'; // exist 
import { Observable, throwError, from } from 'rxjs'; // exist

import { finalize } from 'rxjs/operators';
import { catchError, map, switchMap } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';

import { User } from '../Model/user';

import { AuthService } from './auth.service';
import { collection } from 'firebase/firestore';

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
  
  //private collectionName = 'Academia';
  private basePath = 'academia'; // Base path for Firestore collections

  private sharedDocuments: DocumentItem[] = [];
  private declinedDocuments: DocumentItem[] = [];

  constructor(
    private afs: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    
    private db: AngularFirestore
  ) {}

//---------------------------------------------------------------------------------DO NOT TOUCH-----------------------------------------//
   


  // For backend data.service create method called "AddModules, GetModules and UpdateModules) 

  /*
  
  ...CODE HERE...
   
  //AddAcademia



  //GetAcademia

  

  //UpdateAcademia

  

  */
  // Ensure document exists and create it if not
  private ensureDocument(path: string, data: any): Promise<void> {
    return this.afs.doc(path).get().toPromise().then(doc => {
      if (doc && doc.exists) { // Check if doc is not undefined and exists
        return Promise.resolve();
      }
      return this.afs.doc(path).set(data);
    }).catch(error => {
      console.error(`Error ensuring document ${path}:`, error);
      return Promise.reject(error);
    });
  }

  // Methods for Faculties
  getFaculties(): Observable<string[]> {
    return this.afs.collection(`${this.basePath}/faculties`).valueChanges().pipe(
      map((faculties: any[]) => faculties?.map(faculty => faculty.name) ?? []),
      catchError(this.handleError)
    );
  }

  addFaculty(facultyName: string): Promise<void> {
    const path = `${this.basePath}/faculties/${facultyName}`;
    return this.ensureDocument(path, { name: facultyName });
  }

  updateFaculty(oldName: string, newName: string): Promise<void> {
    return lastValueFrom(
      this.getFaculties().pipe(
        switchMap(faculties => {
          const index = faculties.indexOf(oldName);
          if (index === -1) {
            return throwError(() => new Error('Faculty not found'));
          }
          if (faculties.includes(newName)) {
            return throwError(() => new Error('Duplicate faculty name'));
          }
          faculties[index] = newName;
          return from(this.afs.collection(`${this.basePath}`).doc('faculties').update({ faculties }));
        }),
        catchError(this.handleError)
      )
    );
  }

  deleteFaculty(facultyName: string): Promise<void> {
    return lastValueFrom(
      this.getFaculties().pipe(
        switchMap(faculties => {
          const updatedFaculties = faculties.filter(fac => fac !== facultyName);
          return from(this.afs.collection(`${this.basePath}`).doc('faculties').update({ faculties: updatedFaculties }));
        }),
        catchError(this.handleError)
      )
    );
  }

  // Methods for Departments
  getDepartments(facultyName: string): Observable<string[]> {
    return this.afs.collection(`${this.basePath}/faculties/${facultyName}/departments`).valueChanges().pipe(
      map((departments: any[]) => departments?.map(department => department.name) ?? []),
      catchError(this.handleError)
    );
  }

  addDepartment(facultyName: string, departmentName: string): Promise<void> {
    const path = `${this.basePath}/faculties/${facultyName}/departments/${departmentName}`;
    return this.ensureDocument(path, { name: departmentName });
  }

  updateDepartment(facultyName: string, oldName: string, newName: string): Promise<void> {
    return lastValueFrom(
      this.getDepartments(facultyName).pipe(
        switchMap(departments => {
          const index = departments.indexOf(oldName);
          if (index === -1) {
            return throwError(() => new Error('Department not found'));
          }
          if (departments.includes(newName)) {
            return throwError(() => new Error('Duplicate department name'));
          }
          departments[index] = newName;
          return from(this.afs.collection(`${this.basePath}/faculties/${facultyName}`).doc('departments').update({ departments }));
        }),
        catchError(this.handleError)
      )
    );
  }

  deleteDepartment(facultyName: string, departmentName: string): Promise<void> {
    return lastValueFrom(
      this.getDepartments(facultyName).pipe(
        switchMap(departments => {
          const updatedDepartments = departments.filter(dep => dep !== departmentName);
          return from(this.afs.collection(`${this.basePath}/faculties/${facultyName}`).doc('departments').update({ departments: updatedDepartments }));
        }),
        catchError(this.handleError)
      )
    );
  }

  // Methods for Courses
  getCourses(facultyName: string, departmentName: string): Observable<string[]> {
    return this.afs.collection(`${this.basePath}/faculties/${facultyName}/departments/${departmentName}/courses`).valueChanges().pipe(
      map((courses: any[]) => courses?.map(course => course.name) ?? []),
      catchError(this.handleError)
    );
  }

  addCourse(facultyName: string, departmentName: string, courseName: string): Promise<void> {
    const path = `${this.basePath}/faculties/${facultyName}/departments/${departmentName}/courses/${courseName}`;
    return this.ensureDocument(path, { name: courseName });
  }

  updateCourse(facultyName: string, departmentName: string, oldName: string, newName: string): Promise<void> {
    return lastValueFrom(
      this.getCourses(facultyName, departmentName).pipe(
        switchMap(courses => {
          const index = courses.indexOf(oldName);
          if (index === -1) {
            return throwError(() => new Error('Course not found'));
          }
          if (courses.includes(newName)) {
            return throwError(() => new Error('Duplicate course name'));
          }
          courses[index] = newName;
          return from(this.afs.collection(`${this.basePath}/faculties/${facultyName}/departments/${departmentName}`).doc('courses').update({ courses }));
        }),
        catchError(this.handleError)
      )
    );
  }

  deleteCourse(facultyName: string, departmentName: string, courseName: string): Promise<void> {
    return lastValueFrom(
      this.getCourses(facultyName, departmentName).pipe(
        switchMap(courses => {
          const updatedCourses = courses.filter(course => course !== courseName);
          return from(this.afs.collection(`${this.basePath}/faculties/${facultyName}/departments/${departmentName}`).doc('courses').update({ courses: updatedCourses }));
        }),
        catchError(this.handleError)
      )
    );
  }

  // Methods for Modules
  getModules(facultyName: string, departmentName: string, courseName: string): Observable<string[]> {
    return this.afs.collection(`${this.basePath}/faculties/${facultyName}/departments/${departmentName}/courses/${courseName}/modules`).valueChanges().pipe(
      map((modules: any[]) => modules?.map(module => module.name) ?? []),
      catchError(this.handleError)
    );
  }

  addModule(facultyName: string, departmentName: string, courseName: string, moduleName: string): Promise<void> {
    const path = `${this.basePath}/faculties/${facultyName}/departments/${departmentName}/courses/${courseName}/modules/${moduleName}`;
    return this.ensureDocument(path, { name: moduleName });
  }

  updateModule(facultyName: string, departmentName: string, courseName: string, oldName: string, newName: string): Promise<void> {
    return lastValueFrom(
      this.getModules(facultyName, departmentName, courseName).pipe(
        switchMap(modules => {
          const index = modules.indexOf(oldName);
          if (index === -1) {
            return throwError(() => new Error('Module not found'));
          }
          if (modules.includes(newName)) {
            return throwError(() => new Error('Duplicate module name'));
          }
          modules[index] = newName;
          return from(this.afs.collection(`${this.basePath}/faculties/${facultyName}/departments/${departmentName}/courses/${courseName}`).doc('modules').update({ modules }));
        }),
        catchError(this.handleError)
      )
    );
  }

  deleteModule(facultyName: string, departmentName: string, courseName: string, moduleName: string): Promise<void> {
    return lastValueFrom(
      this.getModules(facultyName, departmentName, courseName).pipe(
        switchMap(modules => {
          const updatedModules = modules.filter(module => module !== moduleName);
          return from(this.afs.collection(`${this.basePath}/faculties/${facultyName}/departments/${departmentName}/courses/${courseName}`).doc('modules').update({ modules: updatedModules }));
        }),
        catchError(this.handleError)
      )
    );
  }

  // Error handling method
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong'));
  }

//---------------------------------------------------------------------------------DO NOT TOUCH-----------------------------------------//



  // Upload document and store metadata in Firestore
  uploadDocuments(file: File, customDate: string, customModule: string, email: string): Observable<any> {
    const filePath = `uploads/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    return task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe((url) => {
          const documentItem: DocumentItem = {
            email: email,
            documentName: file.name,
            status: 'approved',
            comment: '',
            uploadDate: customDate,
            module: customModule,
            url: url,
            uploadedAt: new Date()
          };

          this.addDocument(documentItem);
        });
      })
    );
  }

  private addDocument(documentItem: DocumentItem) {
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

  // addModules(user: User) {
  //   user.id = this.afs.createId();
  //   return this.afs.collection('/Modules').add(user);
  // }

 

  private allDocuments: DocumentItem[] = [];

  getAllStaff(): Observable<any[]> {
    return this.afs.collection<User>('/registeredStaff').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as User;
        const id = a.payload.doc.id;
        return { ...data, id }; // Correctly include 'id' without duplication
      }))
    );
  }

  getUserByEmail(email: string): Observable<User | undefined> {
    return this.afs.collection<User>('/registeredStaff', ref => ref.where('email', '==', email))
      .snapshotChanges().pipe(
        map(actions => {
          if (actions.length > 0) {
            const data = actions[0].payload.doc.data() as User;
            const id = actions[0].payload.doc.id;
            return { ...data, id };
          } else {
            return undefined;
          }
        })
      );
  }

  // New method to get a user by ID
  getUserById(userId: string): Observable<User | undefined> {
    return this.afs.collection<User>('/registeredStaff').doc(userId).valueChanges();
  }

  async uploadDocument(file: File, date: string, module: string, email: string, position:string): Promise<void> {
    try {
      const filePath = `uploads/${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = fileRef.put(file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(async url => {
              const user = await this.auth.currentUser;
              const email = user?.email || 'unknown@example.com';

              this.afs.collection('uploads').add({
                email: email,
                documentName: file.name,
                status: 'pending',
                comment: '',
                uploadDate: date,
                module: module,
                url: url,
                position: position,
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
  
  getDocumentsForModules(modules: string[]): Observable<any[]> {
    return this.afs.collection('documents', ref => 
      ref.where('module', 'in', modules)
    ).valueChanges();
  }

  // getAllDocuments(): Observable<DocumentItem[]> {
  //   return this.authService.getCurrentUserEmail().pipe(
  //     switchMap(email => {
  //       if (!email) {
  //         return []; // Return an empty array if no email is available
  //       }
  //       return this.afs.collection<DocumentItem>('uploads', ref => ref.where('email', '==', email)).snapshotChanges().pipe(
  //         map(actions => {
  //           return actions.map(a => {
  //             const data = a.payload.doc.data() as DocumentItem;
  //             const id = a.payload.doc.id;
  //             return { ...data, id }; // Ensure the ID is included in the returned object
  //           });
  //         })
  //       );
  //     })
  //   );
  // }

  getAllDocuments(): Observable<DocumentItem[]> {
    return this.afs.collection<DocumentItem>('uploads').snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as DocumentItem;
          const id = a.payload.doc.id;
          return { ...data, id }; // Ensure the ID is included in the returned object
        });
      })
    );
  }
  


  // Methods to manage shared and declined documents
  setSharedDocuments(documents: DocumentItem[]) {
    this.sharedDocuments = documents;
  }

  getSharedDocuments(): DocumentItem[] {
    return this.sharedDocuments;
  }

  // Method to update a single document
  updateDocument(id: string, updates: Partial<DocumentItem>): Promise<void> {
    return this.afs.doc(`/uploads/${id}`).update(updates);
  }

  // Method to update multiple documents in a batch
  updateDocuments(documents: DocumentItem[]): Promise<void> {
    const batch = this.afs.firestore.batch();
    documents.forEach(doc => {
      const docRef = this.afs.doc(`/uploads/${doc.id}`).ref;
      batch.update(docRef, doc);
    });
    return batch.commit();
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
  getProgressStatus(): Observable<any[]> {
        return this.afs.collection('/progressStatus').snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data() as any; // Replace 'any' with your progress status type
            const id = a.payload.doc.id;
            return { id, ...data };
          }))
        );
      }
   // Method to get all modules
  getAllModules() {
    return this.afs.collection('/Modules').snapshotChanges();
  }
  // Method to set declined documents
  setDeclinedDocuments(documents: DocumentItem[]): void {
    this.declinedDocuments = documents;
  }

  // Method to get declined documents
  getDeclinedDocuments(): DocumentItem[] {
    return this.declinedDocuments;
  }
//New methods

  // Method to delete document by name
  // deleteDocumentByName(documentName: string): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.afs.collection<DocumentItem>('uploads', ref => ref.where('documentName', '==', documentName)).get().subscribe(snapshot => {
  //       if (snapshot.empty) {
  //         resolve(); // Resolve immediately if no documents found
  //         return;
  //       }

  //       const batch = this.afs.firestore.batch();
  //       snapshot.docs.forEach(doc => batch.delete(doc.ref));

  //       batch.commit().then(() => resolve())
  //         .catch(error => reject(error));
  //     });
  //   });
  // }

 


  async addDocumentToRejectedCollection(document: DocumentItem): Promise<void> {
    try {
      await this.db.collection('rejected').add(document);
      console.log('Document added to rejected collection');
    } catch (error: any) {
      throw new Error(`Failed to add document to rejected collection: ${error.message}`);
    }
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



 

  addStaff(user: User) {
    user.id = this.db.createId();
    return this.db.collection('/Users').add(user);
  }

  // getAllStaff() {
  //   return this.db.collection('/Users').snapshotChanges();
  // }

 

  getDocument(id: string) {
    return this.db.collection('uploads').doc(id).valueChanges();
  }

 

 

 


}
