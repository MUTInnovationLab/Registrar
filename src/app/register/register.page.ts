import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController, ToastController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from '../Shared/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  name: string = '';
  nameError!: string;
  email: string = '';
  emailError!: string;
  emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  password: string = '';
  confirmPassword: string = '';
  position: string = '';
  positionError!: string;
  staffNumber: string = '';
  staffError!: string;
  role: string = '';

  form: FormGroup;

  passwordsMatch(formGroup: FormGroup): { [key: string]: boolean } | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
    private db: AngularFirestore,
    private loadingController: LoadingController,
    private auth: AngularFireAuth,
    private auths: AuthService,
    private navCtrl: NavController
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {}

  validateEmailFormat() {
    if (!this.emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address.';
    } else {
      this.emailError = '';
    }
  }
  
  onSubmit() {
    this.Validation(); // Call for validation logic when the form is submitted
  }

  async Validation() {
    

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

    if (!this.role) {
      this.positionError = 'Please enter role.';
      alert('Please enter role.');
      return;
    }

    if (!this.staffNumber) {
      this.staffError = 'Please enter staff number.';
      alert('Please enter staff number.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const loader = await this.loadingController.create({
      message: 'Assigning',
      cssClass: 'custom-loader-class',
    });
    await loader.present();

    try {
      const userCredential = await this.auths.registerUser(this.email, this.password);
      if (userCredential.user) {
        await this.db.collection('registeredStaff').add({
          // Name: this.name,
          email: this.email,
          staffNumber: this.staffNumber,
          role: this.role,
        });
        alert('Staff registered successfully');

        // Clear the field values
        // this.name = '';
        this.email = '';
        this.position = '';
        this.staffNumber = '';
        this.password = '';
        this.confirmPassword = '';

        // Sign out the newly created user
        await this.auth.signOut();

        // Optionally, re-authenticate the original user if needed
        // await this.auth.signInWithEmailAndPassword(originalUserEmail, originalUserPassword);
      } else {
        alert('User not found');
      }
    } catch (error: any) {
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
}
