import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // regular expression for email validation

  constructor(
    private db: AngularFirestore,
    private loadingController: LoadingController,
    private navCtrl: NavController,
    private auth: AngularFireAuth,
    private toastController: ToastController
  ) { }

  ngOnInit() {}

  goToHomePage(): void {
    this.navCtrl.navigateBack('/home');
  }

  reset() {
    this.navCtrl.navigateForward("/reset");
  }

  signUp() {
    this.navCtrl.navigateForward("/create");
  }

  goToSignUp() {
    this.navCtrl.navigateForward("/applicant-register");
  }

  async validate() {
    // Validate input
    if (!this.email) {
      const toast = await this.toastController.create({
        message: 'Please enter your email.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    // Validate email format
    if (!this.emailRegex.test(this.email)) {
      const toast = await this.toastController.create({
        message: 'Please provide a valid email address.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    // Validate password
    if (!this.password) {
      const toast = await this.toastController.create({
        message: 'Please enter your password.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    // If all validations pass, continue with sign-in logic
    this.log();
  }

  async log() {
    const loader = await this.loadingController.create({
        message: 'Signing in',
        cssClass: 'custom-loader-class'
    });
    await loader.present();

    try {
        // Check if the user is an admin
        const adminSnapshot = await this.db.collection('admin', ref => 
            ref.where('email', '==', this.email)
               .where('password', '==', this.password) // Assume admins use email and password for login
        ).get().toPromise();

        if (adminSnapshot && !adminSnapshot.empty) {
            loader.dismiss();
            this.navCtrl.navigateForward("/home");
        } else {
            // If not an admin, check if the user is a staff member
            const staffQuery = this.db.collection('registeredStaff', ref => 
                ref.where('email', '==', this.email)
                   .where('staffNumber', '==', this.password) // Staff login uses staffNumber
            );
            const staffSnapshot = await staffQuery.get().toPromise();

            loader.dismiss();

            if (staffSnapshot && !staffSnapshot.empty) {
                this.navCtrl.navigateForward("/dashboard");
            } else {
                const toast = await this.toastController.create({
                    message: 'Invalid email or password',
                    duration: 2000,
                    color: 'danger'
                });
                await toast.present();
            }
        }
    } catch (error) {
        loader.dismiss();
        const errorMessage = (error as Error).message;
        const toast = await this.toastController.create({
            message: 'Error signing in: ' + errorMessage,
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    }
}


  async getUserData(email: string) {
    try {
      const snapshot = await this.db.collection("registeredStudents").ref.where("email", "==", email).get();
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        return userData;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }
}
