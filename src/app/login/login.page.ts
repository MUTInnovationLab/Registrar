import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Regular expression for email validation

  constructor(
    private db: AngularFirestore,
    private loadingController: LoadingController,
    private navCtrl: NavController,
    private auth: AngularFireAuth,
    private toastController: ToastController
  ) {}

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
      await this.showToast('Please enter your email.');
      return;
    }

    // Validate email format
    if (!this.emailRegex.test(this.email)) {
      await this.showToast('Please provide a valid email address.');
      return;
    }

    // Validate password
    if (!this.password) {
      await this.showToast('Please enter your password.');
      return;
    }

    // If all validations pass, continue with sign-in logic
    this.log();
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
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
        
        // Check if querySnapshot is defined and not empty
        if (querySnapshot && !querySnapshot.empty) {
          // Update login count for the user
          querySnapshot.forEach(async (doc) => {
            const id = doc.id;
            const userData = doc.data() as { loginCount?: number }; // Type assertion for userData
            const loginCount = userData.loginCount || 0;
            const newLoginCount = loginCount + 1;

            await this.db.collection("registeredStaff").doc(id).update({ loginCount: newLoginCount });
          });

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

      // Handle specific error messages
      if (errorMessage.includes("wrong-password") || errorMessage.includes("user-not-found")) {
        await this.showToast('Invalid email or password');
      } else if (errorMessage.includes("invalid-email")) {
        await this.showToast('Incorrectly formatted email');
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
          await this.showToast('Invalid email or password');
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
