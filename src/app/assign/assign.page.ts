import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getAuth, deleteUser,updateEmail } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

@Component({
  selector: 'app-assign',
  templateUrl: './assign.page.html',
  styleUrls: ['./assign.page.scss'],
})
export class AssignPage implements OnInit {

  nameError :any;
  positionError :any;
  modulesError: any;
  staffError : any;
  emailError: any;
  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  name:any;
  email:any;
  position:any;
  modules:any;
  staffNumber:any;

  userDocument:any;

  navController: NavController;

  
  role = {
    allUsers : 'off',
    approval : 'off',
    assign  : 'off',
    dashboard : 'off',
    rejection : 'off',
    upload : 'off',
    viewDocs : 'off'
    

    
  };

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private db: AngularFirestore,
    private loadingController: LoadingController,
    private auth: AngularFireAuth,
    private navCtrl: NavController
  ) {
    this.navController = navCtrl;
  }

  
  goToView(): void {
    this.navController.navigateBack('/staffprofile');
  }


  ngOnInit() {
    
  }

  // Getter functions to access form control values easily in the template
 

  getAdduserValue(event: any) {
    const toggleValue = event.target.checked ? 'on' : 'off';
    this.role.assign = toggleValue;
  }

  getAllusersValue(event: any) {
    const toggleValue = event.target.checked ? 'on' : 'off';
    this.role.allUsers = toggleValue;
  }

  getApprovalValue(event: any) {
    const toggleValue = event.target.checked ? 'on' : 'off';
    this.role.approval = toggleValue;
  }

  getDashboardValue(event: any) {
    const toggleValue = event.target.checked ? 'on' : 'off';
    this.role.dashboard = toggleValue;
  }

  getRejectionValue(event: any) {
    const toggleValue = event.target.checked ? 'on' : 'off';
    this.role.rejection = toggleValue;
    console.log(this.role);
  }
  getUploadValue(event: any) {
    const toggleValue = event.target.checked ? 'on' : 'off';
    this.role.upload = toggleValue;
    console.log(this.role);
  }
  getAllUsersValue(event: any) {
    const toggleValue = event.target.checked ? 'on' : 'off';
    this.role.allUsers = toggleValue;
    console.log(this.role);
  }
  getViewDocsValue(event: any) {
    const toggleValue = event.target.checked ? 'on' : 'off';
    this.role.viewDocs = toggleValue;
    console.log(this.role);
  }



  goToStaffProfile(): void {
    this.navController.navigateBack('/staffprofile');
  }
  
  
  updateUser() {
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
        modules: this.modules,
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

  
  deleteUser() {
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
  






//Previlages

ionViewDidEnter() {
  this.getUser();
}

async getUser(): Promise<void> {
  const user = await this.auth.currentUser;

  if (user) {
    try {
      const querySnapshot = await this.db
        .collection('registeredStaff')
        .ref.where('email', '==', user.email)
        .get();

      if (!querySnapshot.empty) {
        this.userDocument = querySnapshot.docs[0].data();
        console.log(this.userDocument);
      }
    } catch (error) {
      console.error('Error getting user document:', error);
    }
  }
}





async goToAllUsers(): Promise<void> {
  try {
    await this.getUser();

    if (this.userDocument && this.userDocument.role && this.userDocument.role.allUsers === 'on') {
      // Navigate to the desired page
      this.navController.navigateForward('/all-users');
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

    if (this.userDocument && this.userDocument.role && this.userDocument.role.validation === 'on') {
      // Navigate to the desired page
      this.navController.navigateForward('/approval');
    } else {
      const toast = await this.toastController.create({
        message: 'Unauthorized user.',
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
  } catch (error) {
    console.error('Error navigating to approvalPage:', error);
  }
}

async goToAssign(): Promise<void> {
  try {
    await this.getUser();

    if (this.userDocument && this.userDocument.role && this.userDocument.role.history === 'on') {
      // Navigate to the desired page
      this.navController.navigateForward('/assign');
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

async  goToDashboard(): Promise<void> {
  try {
    await this.getUser();

    if (this.userDocument && this.userDocument.role && this.userDocument.role.allUsers === 'on') {
      // Navigate to the desired page
      this.navController.navigateForward('/dashboard');
    } else {
      const toast = await this.toastController.create({
        message: 'Unauthorized user.',
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
  } catch (error) {
    console.error('Error navigating to All Dashboard Page:', error);
  }
}

async goToRejection(): Promise<void> {

  try {
    await this.getUser();

    if (this.userDocument && this.userDocument.role && this.userDocument.role.marks === 'on') {
      // Navigate to the desired page
      this.navController.navigateForward('/rejection');
    } else {
      const toast = await this.toastController.create({
        message: 'Unauthorized user.',
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
  } catch (error) {
    console.error('Error navigating to Graded rejection Page:', error);
  }
}

async goToUpload(): Promise<void> {

  try {
    await this.getUser();

    if (this.userDocument && this.userDocument.role && this.userDocument.role.upcomingInterviews === 'on') {
      // Navigate to the desired page
      this.navController.navigateForward('/upload');
    } else {
      const toast = await this.toastController.create({
        message: 'Unauthorized user.',
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
  } catch (error) {
    console.error('Error navigating to Scheduled interviews Page:', error);
  }
}

async goToViewDocs(): Promise<void> {

  try {
    await this.getUser();

    if (this.userDocument && this.userDocument.role && this.userDocument.role.scheduleInterview === 'on') {
      // Navigate to the desired page
      this.navController.navigateForward('/view-docs');
    } else {
      const toast = await this.toastController.create({
        message: 'Unauthorized user.',
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
  } catch (error) {
    console.error('Error navigating to Schedule interview Page:', error);
  }
}



goToMenuPage(): void {
  this.navController.navigateForward('/home').then(() => {
    window.location.reload();
  });
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
            this.navController.navigateForward("/login");
            this.presentToast()
      
      
          }).catch((error) => {
          
          });



        }
      }
    ]
  });
  await alert.present();
}




async Validation() {
  // Check if the specific role is selected
  if (
    this.role.upload === 'off' &&
    this.role.viewDocs === 'off' &&
    this.role.rejection === 'off' &&
    this.role.assign === 'off' &&
    this.role.allUsers === 'off' &&
    this.role.dashboard === 'off' &&
    this.role.allUsers === 'off' &&
    this.role.approval === 'off' 
  ) {
    alert('Please select at least one role.');
    return;
  }

  // Proceed with other validation checks
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

  if (!this.modules) {
    this.modulesError = 'Please enter moduls.';
    alert('Please enter position.');
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
      this.modules = '';
      this.staffNumber = '';

      // Sign out the newly created user
      await this.auth.signOut();

      // Optionally, re-authenticate the original user if needed
      // await this.auth.signInWithEmailAndPassword(originalUserEmail, originalUserPassword);
    } else {
      alert('User not found');
    }
  } catch (error: any ) {
    const errorMessage = error.message;
    alert(errorMessage);
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

goToHomePage(): void {
  this.navController.navigateBack('/home');
}


}
  


