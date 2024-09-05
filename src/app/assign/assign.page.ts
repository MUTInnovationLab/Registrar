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
  selectedModules: string[] = []; // Change to an array for multiple selection

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



  loadFaculties() {
    this.dataService.getFaculties().subscribe((faculties: any[]) => {
      this.faculties = faculties;
    });
  }

  onFacultyChange() {
    this.departments = [];
    this.courses = [];
    this.modules = [];
    this.selectedDepartment = '';
    this.selectedCourse = '';
    this.selectedModules = [];

    this.dataService.getDepartments(this.selectedFaculty).subscribe((departments: any[]) => {
      this.departments = departments;
    });
  }

  onDepartmentChange() {
    this.courses = [];
    this.modules = [];
    this.selectedCourse = '';
    this.selectedModules = [];

    this.dataService.getCourses(this.selectedFaculty, this.selectedDepartment).subscribe((courses: any[]) => {
      this.courses = courses;
    });
  }

  onCourseChange() {
    this.modules = [];
    this.selectedModules = [];

    this.dataService.getModules(this.selectedFaculty, this.selectedDepartment, this.selectedCourse).subscribe((modules: any[]) => {
      this.modules = modules;
    });
  }

  getAdduserValue(event: any) {
    this.role.assign = event.target.checked ? 'on' : 'off';
  }

  getAllUsersValue(event: any) {
    this.role.allUsers = event.target.checked ? 'on' : 'off';
  }

  getApprovalValue(event: any) {
    this.role.approval = event.target.checked ? 'on' : 'off';
  }

  getDashboardValue(event: any) {
    this.role.dashboard = event.target.checked ? 'on' : 'off';
  }

  getRejectionValue(event: any) {
    this.role.rejection = event.target.checked ? 'on' : 'off';
  }

  getUploadValue(event: any) {
    this.role.upload = event.target.checked ? 'on' : 'off';
  }

  getViewDocsValue(event: any) {
    this.role.viewDocs = event.target.checked ? 'on' : 'off';
  }

  getModulesValue(event: any) {
    this.role.modules = event.target.checked ? 'on' : 'off';
  }

  async updateUser() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const documentRef = this.db.doc(`registeredStaff/${user.uid}`).ref;

      try {
        await updateDoc(documentRef, {
          Name: this.name,
          email: this.email,
          staffNumber: this.staffNumber,
          position: this.position,
          modules: this.selectedModules, // Update this line
          role: this.role
        });

        if (this.email) {
          await updateEmail(user, this.email);
        }

        alert('User updated successfully');
      } catch (error) {
        alert(`Failed to update user data: ${error}`);
      }
    } else {
      alert('No user is signed in');
    }
  }

  async deleteUser() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const documentRef = this.db.doc(`registeredStaff/${user.uid}`).ref;

      try {
        await deleteDoc(documentRef);
        await deleteUser(user);
        alert('User deleted successfully');
      } catch (error) {
        alert(`Failed to delete user: ${error}`);
      }
    } else {
      alert('No user is signed in');
    }
  }

  async getUser() {
    const user = await this.auth.currentUser;

    if (user) {
      try {
        const querySnapshot = await this.db.collection('registeredStaff').ref.where('email', '==', user.email).get();
        if (!querySnapshot.empty) {
          this.userDocument = querySnapshot.docs[0].data();
          console.log(this.userDocument);
        }
      } catch (error) {
        console.error('Error getting user document:', error);
      }
    }
  }

  async goToPage(page: string, roleCheck: string) {
    try {
      await this.getUser();

      if (this.userDocument && this.userDocument.role && this.userDocument.role[roleCheck] === 'on') {
        this.navCtrl.navigateForward(`/${page}`);
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error(`Error navigating to ${page} Page:`, error);
    }
  }

  goToHomePage() {
    this.navCtrl.navigateBack('/home');
  }

  async presentConfirmationAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Are you sure you want to SIGN OUT?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'my-custom-alert',
          handler: () => {
            console.log('Confirmation canceled');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            this.auth.signOut().then(() => {
              this.navCtrl.navigateForward("/login");
              this.presentToast();
            }).catch((error) => {
              console.error('Error signing out:', error);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async Validation() {
    if (Object.values(this.role).every(value => value === 'off')) {
      alert('Please select at least one role.');
      return;
    }

    this.emailError = this.staffError = this.positionError = this.modulesError = this.nameError = null;

    if (!this.name) {
      this.nameError = 'Please enter name.';
      alert(this.nameError);
      return;
    }

    if (!this.email) {
      this.emailError = 'Please enter email.';
      alert(this.emailError);
      return;
    }

    if (!this.emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address.';
      alert(this.emailError);
      return;
    }

    if (!this.position) {
      this.positionError = 'Please enter position.';
      alert(this.positionError);
      return;
    }

    if (this.selectedModules.length === 0) {
      this.modulesError = 'Please select at least one module.';
      alert(this.modulesError);
      return;
    }

    if (!this.staffNumber) {
      this.staffError = 'Please enter staff number.';
      alert(this.staffError);
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
          modules: this.selectedModules, // Update this line
          role: this.role
        });
        alert("Staff registered successfully");

        this.name = this.email = this.position = this.staffNumber = '';
        this.selectedModules = [];

        await this.auth.signOut();
      } else {
        alert('User not found');
      }
    } catch (error) {
      alert(error);
    } finally {
      loader.dismiss();
    }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'SIGNED OUT!',
      duration: 1500,
      position: 'top',
    });
    await toast.present();
  }
}
