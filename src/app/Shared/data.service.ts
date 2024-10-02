import { Injectable } from '@angular/core'; 
import { AngularFireAuth } from '@angular/fire/compat/auth'; 
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage'; 
import { Observable, throwError, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { User } from '../Model/user';
import { AuthService } from './auth.service';
import { collection } from 'firebase/firestore';
import { AppNotification, NotificationLog } from '../Model/notification';
import * as firebase from 'firebase/app';
import 'firebase/firestore';




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
  private academiaCollection = this.firestore.collection('Academia');

  private sharedDocuments: DocumentItem[] = [];
  private declinedDocuments: DocumentItem[] = [];

  constructor(
    private afs: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private db: AngularFirestore
  ) {}
// Add a new faculty, department, course, and module
 async addAcademia(facultyName: string, department: any, course: any, module: any): Promise<void> {
  const facultyRef = this.academiaCollection.doc(facultyName);
  
  const docSnapshot = await facultyRef.get().toPromise();
  let data: any = docSnapshot?.exists ? docSnapshot.data() : { facultyName, departments: [] };
  
  const departmentIndex = data.departments.findIndex((d: any) => d.departmentName === department.departmentName);
  
  if (departmentIndex !== -1) {
    const courseIndex = data.departments[departmentIndex].courses.findIndex((c: any) => c.courseName === course.courseName);
    if (courseIndex !== -1) {
      data.departments[departmentIndex].courses[courseIndex].modules.push({ moduleName: module.moduleName });
    } else {
      data.departments[departmentIndex].courses.push({ courseName: course.courseName, modules: [{ moduleName: module.moduleName }] });
    }
  } else {
    data.departments.push({
      departmentName: department.departmentName,
      courses: [{
        courseName: course.courseName,
        modules: [{ moduleName: module.moduleName }]
      }]
    });
  }

  return facultyRef.set(data, { merge: true });
}

getDocumentsByRoles(positions: string[]): Observable<DocumentItem[]> {
  return this.db.collection<DocumentItem>('uploads', ref => 
    ref.where('position', 'in', positions)
  ).snapshotChanges().pipe(
    map(actions => actions.map(a => {
      const data = a.payload.doc.data() as DocumentItem;
      const id = a.payload.doc.id;
      return { id, ...data };
    }))
  );
}


getFaculties(): Observable<any[]> {
  return this.firestore.collection('Academia').snapshotChanges().pipe(
    map(actions => actions.map(a => {
      const data = a.payload.doc.data() as any;
      const id = a.payload.doc.id;
      return { id, ...data };
    }))
  );
}

getDepartments(facultyName: string): Observable<any[]> {
  return this.firestore.collection('Academia').doc(facultyName).valueChanges().pipe(
    map((faculty: any) => faculty?.departments || [])
  );
}

getCourses(facultyName: string, departmentName: string): Observable<any[]> {
  return this.firestore.collection('Academia').doc(facultyName).valueChanges().pipe(
    map((faculty: any) => {
      const department = faculty?.departments.find((d: any) => d.departmentName === departmentName);
      return department?.courses || [];
    })
  );
}

getModules(facultyName: string, departmentName: string, courseName: string): Observable<any[]> {
  return this.firestore.collection('Academia').doc(facultyName).valueChanges().pipe(
    map((faculty: any) => {
      const department = faculty?.departments.find((d: any) => d.departmentName === departmentName);
      const course = department?.courses.find((c: any) => c.courseName === courseName);
      return course?.modules || [];
    })
  );
}

// Update existing course or module
async updateAcademia(facultyName: string, departmentName: string, courseName: string, moduleName: string): Promise<void> {
  const facultyRef = this.academiaCollection.doc(facultyName);

  const docSnapshot = await facultyRef.get().toPromise();
  let data: any = docSnapshot?.exists ? docSnapshot.data() : null;

  if (data) {
    const department = data.departments.find((d: any) => d.departmentName === departmentName);
    if (department) {
      const course = department.courses.find((c: any) => c.courseName === courseName);
      if (course) {
        const module = course.modules.find((m: any) => m.moduleName === moduleName);
        if (module) {
          module.moduleName = moduleName; // Update module details as needed
        } else {
          course.modules.push({ moduleName });
        }
      } else {
        department.courses.push({ courseName, modules: [{ moduleName }] });
      }
    } else {
      data.departments.push({
        departmentName,
        courses: [{
          courseName,
          modules: [{ moduleName }]
        }]
      });
    }

    return facultyRef.set(data, { merge: true });
  }

  return Promise.reject('Faculty not found');
}

// Delete a module from a course in a department
async deleteModule(facultyName: string, departmentName: string, courseName: string, moduleName: string): Promise<void> {
  const facultyRef = this.academiaCollection.doc(facultyName);

  const docSnapshot = await facultyRef.get().toPromise();
  let data: any = docSnapshot?.exists ? docSnapshot.data() : null;

  if (data) {
    const department = data.departments.find((d: any) => d.departmentName === departmentName);
    if (department) {
      const course = department.courses.find((c: any) => c.courseName === courseName);
      if (course) {
        course.modules = course.modules.filter((m: any) => m.moduleName !== moduleName);

        return facultyRef.set(data, { merge: true });
      }
    }
  }

  return Promise.reject('Module not found');
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

  getDocumentsExcludingEmail(excludedEmail: string): Observable<DocumentItem[]> {
    return this.afs.collection<DocumentItem>('uploads', ref =>
      ref.where('email', '!=', excludedEmail)
    ).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as DocumentItem;
          const id = a.payload.doc.id;
          return { ...data, id }; // Ensure the ID is included in the returned object
        });
      })
    );
  }

  getDocumentsByModules(modules: string[]): Observable<DocumentItem[]> {
    return this.afs.collection<DocumentItem>('uploads', ref =>
      ref.where('module', 'in', modules)
    ).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as DocumentItem;
          const id = a.payload.doc.id;
          return { ...data, id }; // Ensure the ID is included in the returned object
        });
      })
    );
  }

  // New method to get a user by ID
  getUserById(userId: string): Observable<User | undefined> {
    return this.afs.collection<User>('/registeredStaff').doc(userId).valueChanges();
  }

  async uploadDocument(file: File, date: string, module: string, email: string, position: string): Promise<string> {
    try {
        const filePath = `uploads/${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = fileRef.put(file);

        const url = await new Promise<string>((resolve, reject) => {
            uploadTask.snapshotChanges().pipe(
                finalize(() => {
                    fileRef.getDownloadURL().subscribe(async (url) => {
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
                        }).then(() => resolve(url)) // Resolve with the URL
                          .catch(err => reject(new Error(`Failed to save document info: ${err.message}`)));
                    });
                })
            ).subscribe({
                error: (err) => reject(new Error(`Failed to upload file: ${(err as any).message || err}`))
            });
        });
        return url; // Return the URL
    } catch (error: any) {
        throw new Error(`Error uploading document: ${error.message || error}`);
    }
}

  
  getDocumentsForModules(modules: string[]): Observable<any[]> {
    return this.afs.collection('documents', ref => 
      ref.where('module', 'in', modules)
    ).valueChanges();
  }



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

  getDocument(id: string) {
    return this.db.collection('uploads').doc(id).valueChanges();
  }
  
  // Method to get notifications with filters
  getNotifications(courseType?: string, status?: string, dateRange?: { start: Date | null, end: Date | null }): Observable<AppNotification[]> {
    let query: AngularFirestoreCollection<AppNotification> = this.firestore.collection('notifications');

    // Apply filters to the query
    if (courseType) {
      query = this.firestore.collection('notifications', ref => ref.where('courseType', '==', courseType));
    }

    if (status) {
      query = this.firestore.collection('notifications', ref => ref.where('status', '==', status));
    }

    if (dateRange?.start && dateRange?.end) {
      query = this.firestore.collection('notifications', ref => 
        ref.where('date', '>=', dateRange.start).where('date', '<=', dateRange.end)
      );
    }

    return query.valueChanges();
  }

  // Method to get all notification logs
  getNotificationLogs(): Observable<AppNotification[]> {
    return this.afs.collection('/notificationLogs').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any; // Replace 'any' with your NotificationLog type
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

    // Method to add a new notification
    addNotification(notification: AppNotification): Promise<string> {
      // Create a new document reference with an auto-generated ID
      const notificationRef = this.afs.collection('notifications').doc(); 
      notification.id = notificationRef.ref.id; // Set the document ID
      // Set the document data
      return notificationRef.set(notification).then(() => {
        // Return the document ID
        return notificationRef.ref.id;
         
      });
    }
    
  
    // Method to update an existing notification
updateNotification(id: string, updates: Partial<any>): Promise<void> { // Replace 'any' with your Notification type
      return this.afs.collection('/notifications').doc(id).update(updates);
    }
  
    // Method to schedule a reminder
    scheduleReminder(reminderData: any): Promise<void> {
      return this.firestore.collection('reminders').doc(reminderData.notificationId).set(reminderData);
    }
  
    // Method to send a reminder
    sendReminder(reminderData: any): Promise<void> {
      return this.firestore.collection('reminders').doc(reminderData.notificationId).set(reminderData);
    }
} 