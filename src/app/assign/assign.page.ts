import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getAuth, deleteUser, updateEmail } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { DataService } from '../Shared/data.service';

@Component({
  selector: 'app-assign',
  templateUrl: './assign.page.html',
  styleUrls: ['./assign.page.scss'],
})
export class AssignPage implements OnInit {
  faculties: any[] = [];
  departments: any[] = [];
  courses: any[] = [];
  modules: any[] = [];  // Ensure this is defined as an array

  selectedFaculty: string = '';
  selectedDepartment: string = '';
  selectedCourse: string = '';
  selectedModule: string = '';

  nameError: string | null = null;
  positionError: string | null = null;
  modulesError: string | null = null;
  staffError: string | null = null;
  emailError: string | null = null;
  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  name: string = '';
  email: string = '';
  position: string = '';
  staffNumber: string = '';

  userDocument: any;
  isAdmin: boolean = false;

  role = {
    allUsers: 'off',
    approval: 'off',
    assign: 'off',
    dashboard: 'off',
    rejection: 'off',
    upload: 'off',
    viewDocs: 'off',
    modules: 'off'
  };

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private db: AngularFirestore,
    private loadingController: LoadingController,
    private auth: AngularFireAuth,
    private navCtrl: NavController,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadFaculties();
    this.getUser();
  }

  // Define methods for toggles
  getAdduserValue(event: any) {
    this.role.allUsers = event.detail.checked ? 'on' : 'off';
  }

  getAllUsersValue(event: any) {
    this.role.allUsers = event.detail.checked ? 'on' : 'off';
  }

  getApprovalValue(event: any) {
    this.role.approval = event.detail.checked ? 'on' : 'off';
  }

  getDashboardValue(event: any) {
    this.role.dashboard = event.detail.checked ? 'on' : 'off';
  }

  getRejectionValue(event: any) {
    this.role.rejection = event.detail.checked ? 'on' : 'off';
  }

  getUploadValue(event: any) {
    this.role.upload = event.detail.checked ? 'on' : 'off';
  }

  getViewDocsValue(event: any) {
    this.role.viewDocs = event.detail.checked ? 'on' : 'off';
  }

  getModulesValue(event: any) {
    this.role.modules = event.detail.checked ? 'on' : 'off';
  }

  loadFaculties() {
    this.dataService.getFaculties().subscribe((faculties: any[]) => {
      this.faculties = faculties;
    });
  }

  onFacultyChange() {
    this.departments = [];
    this.courses = [];
    this.modules = [];  // Reset modules
    this.selectedDepartment = '';
    this.selectedCourse = '';
    this.selectedModule = '';

    this.dataService.getDepartments(this.selectedFaculty).subscribe((departments: any[]) => {
      this.departments = departments;
    });
  }

  onDepartmentChange() {
    this.courses = [];
    this.modules = [];  // Reset modules
    this.selectedCourse = '';
    this.selectedModule = '';

    this.dataService.getCourses(this.selectedFaculty, this.selectedDepartment).subscribe((courses: any[]) => {
      this.courses = courses;
    });
  }

  onCourseChange() {
    this.modules = [];  // Reset modules
    this.selectedModule = '';

    this.dataService.getModules(this.selectedFaculty, this.selectedDepartment, this.selectedCourse).subscribe((modules: any[]) => {
      this.modules = modules;
    });
  }

  async getUser(): Promise<void> {
    const user = await this.auth.currentUser;

    if (user) {
      try {
        // Check if the user is an admin
        const adminSnapshot = await this.db.collection('admin', ref => 
          ref.where('email', '==', user.email)
        ).get().toPromise();

        if (adminSnapshot && !adminSnapshot.empty) {
          this.isAdmin = true;
          return; // Exit early if the user is an admin
        }

        // Check if the user is a staff member
        const staffSnapshot = await this.db.collection('registeredStaff', ref => 
          ref.where('email', '==', user.email)
        ).get().toPromise();

        if (staffSnapshot && !staffSnapshot.empty) {
          this.userDocument = staffSnapshot.docs[0]?.data() || {}; // Use optional chaining and fallback to an empty object
        } else {
          // Handle case where the user is neither admin nor staff
          this.userDocument = null;
        }
      } catch (error) {
        console.error('Error getting user document:', error);
      }
    }
  }

  async Validation() {
    // Check if at least one role is selected
    if (
      this.role.allUsers === 'off' &&
      this.role.approval === 'off' &&
      this.role.assign === 'off' &&
      this.role.dashboard === 'off' &&
      this.role.rejection === 'off' &&
      this.role.upload === 'off' &&
      this.role.viewDocs === 'off' &&
      this.role.modules === 'off'
    ) {
      alert('Please select at least one role.');
      return;
    }

    // Validate fields
    this.emailError = null;
    this.staffError = null;
    this.positionError = null;
    this.modulesError = null;
    this.nameError = null;

    if (!this.name) {
      this.nameError = 'Please enter name.';
      alert('Please enter name');
      return;
    }

    if (!this.email) {
      this.emailError = 'Please enter email.';
      alert('Please enter email');
      return;
    }

    if (!this.emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email Address.';
      alert('Please enter a valid email Address.');
      return;
    }

    if (!this.position) {
      this.positionError = 'Please enter position.';
      alert('Please enter position.');
      return;
    }

    if (!this.modules.length) {
      this.modulesError = 'Please select at least one module.';
      alert('Please select at least one module.');
      return;
    }

    if (!this.staffNumber) {
      this.staffError = 'Please enter staff number.';
      alert('Please enter staff number.');
      return;
    }

    const loader = await this.loadingController.create({
      message: 'Assigning',
      cssClass: 'custom-loader-class'
    });
    await loader.present();

    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(this.email, this.staffNumber);
      if (userCredential.user) {
        await this.db.collection('registeredStaff').add({
          Name: this.name,
          email: this.email,
          staffNumber: this.staffNumber,
          position: this.position,
          modules: this.modules,
          role: this.role
        });
        alert("Staff registered successfully");

        // Clear the field values
        this.name = '';
        this.email = '';
        this.position = '';
        this.staffNumber = '';

        // Sign out the newly created user
        await this.auth.signOut();
      } else {
        alert('User not found');
      }
    } catch (error: any) {
      const errorMessage = error.message;
      alert(errorMessage);
    } finally {
      loader.dismiss();
    }
  }

  async updateUser() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const documentRef = this.db.doc(`registeredStaff/${user.uid}`).ref;

      // Update the Firestore document
      updateDoc(documentRef, {
        Name: this.name,
        email: this.email,
        staffNumber: this.staffNumber,
        position: this.position,
        modules: this.modules,  // Ensure this is an array
        role: this.role
      })
        .then(() => {
          // Optionally, update the user's email in Firebase Authentication
          updateEmail(user, this.email)
            .then(() => {
              alert('User updated successfully');
            })
            .catch((error) => {
              alert(`Failed to update email: ${error.message}`);
            });
        })
        .catch((error) => {
          alert(`Failed to update user data: ${error.message}`);
        });
    } else {
      alert('No user is signed in');
    }
  }

  async deleteUser() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const documentRef = this.db.doc(`registeredStaff/${user.uid}`).ref;

      // Delete the Firestore document
      deleteDoc(documentRef)
        .then(() => {
          // Optionally, delete the user from Firebase Authentication
          deleteUser(user)
            .then(() => {
              alert('User deleted successfully');
            })
            .catch((error) => {
              alert(`Failed to delete user from authentication: ${error.message}`);
            });
        })
        .catch((error) => {
          alert(`Failed to delete user data: ${error.message}`);
        });
    } else {
      alert('No user is signed in');
    }
  }

  async goToView(): Promise<void> {
    this.navCtrl.navigateBack('/staffprofile');
  }

  async goToAllUsers(): Promise<void> {
    try {
      await this.getUser();

      if (this.isAdmin || (this.userDocument && this.userDocument.role && this.userDocument.role.allUsers === 'on')) {
        this.navCtrl.navigateForward('/all-users');
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating to All Users Page:', error);
    }
  }

  async goToApproval(): Promise<void> {
    try {
      await this.getUser();

      if (this.isAdmin || (this.userDocument && this.userDocument.role && this.userDocument.role.approval === 'on')) {
        this.navCtrl.navigateForward('/approval');
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating to Approval Page:', error);
    }
  }

  async goToAssign(): Promise<void> {
    try {
      await this.getUser();

      if (this.isAdmin || (this.userDocument && this.userDocument.role && this.userDocument.role.assign === 'on')) {
        this.navCtrl.navigateForward('/assign');
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating to Assign Page:', error);
    }
  }

  async goToDashboard(): Promise<void> {
    try {
      await this.getUser();

      if (this.isAdmin || (this.userDocument && this.userDocument.role && this.userDocument.role.dashboard === 'on')) {
        this.navCtrl.navigateForward('/dashboard');
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating to Dashboard Page:', error);
    }
  }
}
