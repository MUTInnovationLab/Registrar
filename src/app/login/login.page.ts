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
        // Attempt to sign in with email and password
        const userCred = await this.auth.signInWithEmailAndPassword(this.email, this.password);
        
        if (userCred) {
            // Get the user's document based on email
            const querySnapshot = await this.db.collection('registeredStaff', ref => ref.where('email', '==', this.email)).get().toPromise();
            
            // Check if querySnapshot is defined
            if (querySnapshot && !querySnapshot.empty) {
                // Update login count for the user
                querySnapshot.forEach(async (doc) => {
                    const id = doc.id;
                    const userData = doc.data() as { loginCount?: number }; // Type assertion for userData
                    const loginCount = userData.loginCount || 0;
                    const newLoginCount = loginCount + 1;

                    await this.db.collection("registeredStaff").doc(id).update({ loginCount: newLoginCount });
                });

                // Check if user exists
                loader.dismiss();
                this.navCtrl.navigateForward("/dashboard");
            } else {
                loader.dismiss();
                this.navCtrl.navigateForward("/home");
            }
        }
    } catch (error: unknown) {  // Explicitly typing the error
        loader.dismiss();
        let errorMessage: string;

        // Check if the error is an instance of Error
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unknown error occurred.";
        }

        if (errorMessage === "Firebase: The password is invalid or the user does not have a password. (auth/wrong-password)." ||
            errorMessage === "Firebase: There is no user record corresponding to this identifier. The user may have been deleted. (auth/user-not-found).") {
            
            const toast = await this.toastController.create({
                message: 'Invalid email or password',
                duration: 2000,
                color: 'danger'
            });
            await toast.present();
        } else if (errorMessage === "Firebase: The email address is badly formatted. (auth/invalid-email).") {
            const toast = await this.toastController.create({
                message: 'Incorrectly formatted email',
                duration: 2000,
                color: 'danger'
            });
            await toast.present();
        } else {
            // Check if the user is a staff member using staffNumber
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
