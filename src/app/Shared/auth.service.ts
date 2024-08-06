import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor( private sanitizer: DomSanitizer,
  
    private toast: ToastController,
    private fauth: AngularFireAuth, 
    private load: LoadingController) { }
    
  
  
    
  
    async registerUser(email:string, password:string){
  
      return await this.fauth.createUserWithEmailAndPassword(email,password)
    }
  
    async loginUser(email:string,passsword:string ){
      return await this.fauth. signInWithEmailAndPassword
    }
  
    async signOut()
    {
  
      return await this.fauth.signOut()
    }
    
  
  //------------------------------------------------------------------------------
    showToast(message : string ,colors: string){
      this.toast.create ({
      message: message ,
     duration: 4000,
     position: 'top',
     color : colors
     }). then ( toastData => toastData.present ());
    
    }
    //---------------------------------------------------------------------------------
    validateEmail(email: string){
      if (!email.includes("@")) {
        this.showToast("Email must contain the '@' symbol.",'danger');
        return false;
      }
    
      const emailParts = email.split("@");
      if (emailParts.length !== 2) {
        this.showToast("Invalid email format.",'danger');
        return false;
      }
    
      const localPart = emailParts[0];
      const domainPart = emailParts[1];
    
      if (localPart.length === 0) {
        
        this.showToast("Email is missing the local part before '@'.",'danger');
        return false;
      }
    
      if (domainPart.length === 0) {
        
        this.showToast("Email is missing the domain part after '@'.",'danger');
        return false;
      }
    
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const gmail = /^[^\s@]+@gmail\.com$/i;
    
      if (!emailPattern.test(email)) {
       
        this.showToast("Email format is invalid.",'danger');
        return false;
      }
    
      if (!gmail.test(email)) {
      
        this.showToast("Only Gmail addresses are allowed.",'danger');
        return false;
      }
    
      return true; // Email is valid
    }
    
  
    validateName(name: string): boolean {
      const namePattern = /^[A-Za-z]+$/;
      return namePattern.test(name);
    }
  
    
  
  //------------------------------------------------------------------------
  
  checkExistingUser(email: string): Promise<boolean> {
    
    return new Promise<boolean>((resolve, reject) => {
  
      this.fauth.fetchSignInMethodsForEmail(email)
        .then((signInMethods: string[]) => {
          
          const userExists = signInMethods.length > 0;
          resolve(userExists);
        })
        .catch((error: any) => {
          
          reject(error);
        });
    });
  }
  
  
  
  //-----------------------------------------------------------------------------------
  
  
  
  
  //------------------------------------------------------------------------------------
  async sendVerificationEmail() {
    return new Promise<boolean>((resolve, reject) => {
      const user = this.fauth.currentUser;
  
      if (user) {
        user.then((u) => {
          if (u) {
            u.sendEmailVerification()
              .then(async () => {
                this.showToast("Verification email sent",'success');
  
                await this.fauth.onAuthStateChanged((user) => {
                  
                  if (user) {
                    
                    if (user.emailVerified) {
                      resolve(true); // Resolve with true if the email is verified
                    } else {
                      reject(false); // Reject with false if the email is not verified
                    }
                  } else {
                    this.showToast('Current user is null','danger');
                  }
                });
              })
              .catch((error) => {
                this.showToast('Error sending verification email:'+error ,'danger');
                reject(error);
              });
          } else {
            this.showToast('Current user is null','danger');
            reject('Current user is null');
          }
        });
      } else {
        this.showToast("No user is currently signed in",'danger');
        reject('No user is currently signed in');
      }
    });
  }
  //------------------------------------------------------------------------------------------
  
  
  
  
  //------------------------------------------------------------------------------------------
  resetPassword(email: string) {
    this.fauth.sendPasswordResetEmail(email)
      .then(() => {
        this.showToast('Password reset email sent','success');
        // Display a success message to the user or redirect them to a success page
      })
      .catch((error) => {
        this.showToast('Error sending password reset email:','danger');
        // Display an error message to the user or handle the error accordingly
      });
  }
  
  
  //-----------------------------------------------------------------------------------
  isPasswordValid(password: string): boolean {
    // Define the criteria for a valid password
    const minLength = 8; // Minimum password length
    const hasUppercase = /[A-Z]/.test(password); // At least one uppercase letter
    const hasLowercase = /[a-z]/.test(password); // At least one lowercase letter
    const hasNumber = /[0-9]/.test(password); // At least one number
    const hasSpecialChar = /[!@#$%^&*()\-_=+{}[\]|;:'",.<>/?]/.test(password); // At least one special character
  
    if(password.length < minLength)
    {
      this.showToast("Password should have minimum length of 8 characters",'danger');
      return false;
    }
    if(!hasUppercase)
    {
      this.showToast("Password should have At least one uppercase letter",'danger');
      return false;
      
    }
    if(!hasLowercase)
    {
      this.showToast("Password should have At least one lowercase letter",'danger');
      return false;
    }
    if(!hasNumber)
    {
      this.showToast("Password should have At least one number",'danger');
      return false;
    }
    if(!hasSpecialChar)
    {
      this.showToast("Password should have At least one special character",'danger');
      return false;
    }
    
    return true;
  }
  
  
  
  
  
  
    }