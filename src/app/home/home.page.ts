import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController, AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  profileVisible: boolean = false;

  navController: NavController;
  userDocument: any;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private navCtrl: NavController,
    private auth: AngularFireAuth,
    private db: AngularFirestore
  ) {
    this.getUser();
    this.navController = navCtrl;
  }

  ngOnInit() {}

  toggleProfile() {
    this.profileVisible = !this.profileVisible;
  }


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
        }
      } catch (error) {
        console.error('Error getting user document:', error);
      }
    }
  }


  async navigateBasedOnRole(page: string): Promise<void> {
    try {
      await this.getUser();

      let authorized = false;
      let message = '';

      if (this.userDocument && this.userDocument.role) {
        switch (page) {
          case 'all-users':
            authorized = this.userDocument.role.allUsers === 'on';
            message = 'Unauthorized user for all users.';
            break;
          case 'upload':
            authorized = this.userDocument.role.upload === 'on';
            message = 'Unauthorized user for upload page.';
            break;
          case 'dashboard':
            authorized = this.userDocument.role.dashboard === 'on';
            message = 'Access denied dashboard page.';
            break;
          case 'view-docs':
            authorized = this.userDocument.role.viewDocs === 'on';
            message = 'Unauthorized user for view docs page.';
            break;
          case 'approval':
            authorized = this.userDocument.role.approval === 'on';
            message = 'Unauthorized user for approval page.';
            break;
          case 'assign':
            authorized = this.userDocument.role.assign === 'on';
            message = 'Unauthorized user for assigned page.';
            break;
          case 'rejection':
            authorized = this.userDocument.role.rejection === 'on';
            message = 'Unauthorized user for rejection page.';
            break;
          default:
            authorized = false;
            message = 'Invalid page.';
            break;
        }
      }

      if (authorized) {
        this.navController.navigateForward('/' + page);
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized Access:You do not have the necessary permissions to access this page. Please contact the administrator for assistance.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating based on role:', error);
    }
  }

  goToUpload(): Promise<void> {
    return this.navigateBasedOnRole('upload');
  }

  goToViewDocs(): Promise<void> {
    return this.navigateBasedOnRole('view-docs');
  }
  goToRejection(): Promise<void> {
    return this.navigateBasedOnRole('rejection');
  }
  goToAssign(): Promise<void> {
    return this.navigateBasedOnRole('assign');
  }
  goToAllUsers(): Promise<void> {
    return this.navigateBasedOnRole('all-users');
  }
  goToDashboard(): Promise<void> {
    return this.navigateBasedOnRole('dashboard');
  }

  goToApproval(): Promise<void> {
      return this.navigateBasedOnRole('approval');
    }
  

}
