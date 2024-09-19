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
    this.navCtrl.navigateForward("/applicant-resgister");
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
      // Sign in with email and password
      const userCred = await this.auth.signInWithEmailAndPassword(this.email, this.password);
  
      if (userCred.user) {
        // Fetch user data from Firestore
        const snapshot = await this.db.collection('registeredStaff', ref => ref.where('email', '==', this.email.trim())).get().toPromise();
  
        if (snapshot && !snapshot.empty) {
          const doc = snapshot.docs[0];
          const userData = doc.data() as { position?: string, loginCount?: number }; // Casting to a specific type
  
          if (userData) {
            const position = userData.position || '';
            const loginCount = userData.loginCount || 0;
            const newLoginCount = loginCount + 1;
  
            // Update login count
            await this.db.collection('registeredStaff').doc(doc.id).update({ loginCount: newLoginCount });
  
            // Navigate based on position
            if (position === 'Admin') {
              this.navCtrl.navigateForward('/home');
            } else {
              this.navCtrl.navigateForward('/dashboard');
            }
          } else {
            this.navCtrl.navigateForward('/home');
          }
        } else {
          this.navCtrl.navigateForward('/home');
        }
      }
    } catch (error) {
      let errorMessage: string;
  
      if (error instanceof Error) {
        // Handling the error if it is an instance of Error
        errorMessage = error.message;
      } else {
        // Fallback if the error is not an instance of Error
        errorMessage = 'An unexpected error occurred.';
      }
  
      let toastMessage: string;
      if (errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/user-not-found')) {
        toastMessage = 'Invalid email or password';
      } else if (errorMessage.includes('auth/invalid-email')) {
        toastMessage = 'Incorrectly formatted email';
      } else {
        toastMessage = 'Error signing in: ' + errorMessage;
      }
  
      const toast = await this.toastController.create({
        message: toastMessage,
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    } finally {
      loader.dismiss();
    }
  }
  
  
  

  async getUserData(email: string) {
    try {
      const snapshot = await this.db.collection("registeredStaff").ref.where("email", "==", email).get();
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
