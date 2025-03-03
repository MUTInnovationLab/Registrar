import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
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
    private db: AngularFirestore,
    private router: Router,
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
  
  async logout() {
    try {
      await this.auth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
      const toast = await this.toastController.create({
        message: 'Error logging out. Please try again.',
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
  }

  // Example page navigation methods
  goToUpload(){
    this.router.navigate(['/upload']);
  }

  goToViewDocs(){
    this.router.navigate(['/view-docs']);
  }
  goToRejection(){
    this.router.navigate(['/rejection']);
  }
  goToAssign(){
    this.router.navigate(['/assign']);('assign');
  }
  goToAllUsers(){
    this.router.navigate(['/all-users']);
  }
  goToDashboard(){
    this.router.navigate(['/dashboard']);
  }
  goToApproval(){
    this.router.navigate(['/approval']);
  }
  goToModules(){
    this.router.navigate(['/board']);
  }  

}
