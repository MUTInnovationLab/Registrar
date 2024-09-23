import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  profileVisible: boolean = false;
  navController: NavController;
  userDocument: any;
  isAdmin: boolean = false;
  dashboardItems = [
    { title: 'All Users', icon: 'people-circle', route: '/all-users' },
    { title: 'Approval', icon: 'checkmark-done-circle', route: '/approval' },
    { title: 'Assign', icon: 'person-add', route: '/assign' },
    { title: 'Home', icon: 'home', route: '/home' },
    { title: 'Rejection', icon: 'close-circle', route: '/rejection' },
    { title: 'Upload', icon: 'cloud-upload', route: '/upload' },
    { title: 'View Documents', icon: 'document', route: '/view-docs' },
    { title: 'View Modules', icon: 'list-outline', route: '/modules' },
  ];

  constructor(
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
  navigate(route: string){
    this.navCtrl.navigateForward(route);
  }

  ionViewDidEnter() {
    this.getUser();
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
  
  
  

  async navigateBasedOnRole(page: string): Promise<void> {
    try {
      await this.getUser();

      if (this.isAdmin) {
        this.navController.navigateForward('/' + page);
        return;
      }

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
            message = 'Unauthorized user for assign page.';
            break;
          case 'rejection':
            authorized = this.userDocument.role.rejection === 'on';
            message = 'Unauthorized user for rejection page.';
            break;
          case 'modules':
            authorized = this.userDocument.role.modules === 'on';
            message = 'Unauthorized user for modules page.';
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
          message: message || 'Unauthorized Access',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating based on role:', error);
    }
  }

  // Example page navigation methods
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
  goToModules(): Promise<void> {
    return this.navigateBasedOnRole('modules');
  }  

}
