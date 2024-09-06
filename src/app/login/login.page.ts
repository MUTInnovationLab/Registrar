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

    this.auth.signInWithEmailAndPassword(this.email, this.password)
      .then((userCred) => {
        if (userCred) {
          this.db.collection('registeredStaff', ref => ref.where('email', '==', this.email))
            .get()
            .toPromise()
            .then((querySnapshot: any) => {
              querySnapshot.forEach((doc: { id: any; data: () => any; }) => {
                const id = doc.id;
                const userData = doc.data();
                const loginCount = userData.loginCount || 0;
                const newLoginCount = loginCount + 1;

                this.db.collection("registeredStaff").doc(id).update({ loginCount: newLoginCount });
              });
            });

          this.db.collection("registeredStaff")
            .ref.where("email", "==", this.email.trim())
            .get()
            .then((querySnapshot) => {
              loader.dismiss();
              if (!querySnapshot.empty) {
                this.navCtrl.navigateForward("/dashboard");
              } else {
                this.navCtrl.navigateForward("/home");
              }
            })
            .catch((error) => {
              loader.dismiss();
              const errorMessage = error.message;
              console.error("Error checking registered students:", errorMessage);
            });
        }
      })
      .catch(async (error) => {
        loader.dismiss();
        const errorMessage = error.message;
        if (errorMessage === "Firebase: The password is invalid or the user does not have a password. (auth/wrong-password)." 
        || errorMessage === "Firebase: There is no user record corresponding to this identifier. The user may have been deleted. (auth/user-not-found).") {
          const toast = this.toastController.create({
            message: 'Invalid email or password',
            duration: 2000,
            color: 'danger'
          });
          (await toast).present();
        } else if (errorMessage === "Firebase: The email address is badly formatted. (auth/invalid-email).") {
          const toast = this.toastController.create({
            message: 'Incorrectly formatted email',
            duration: 2000,
            color: 'danger'
          });
          (await toast).present();
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
