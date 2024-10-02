import { Component, OnInit } from '@angular/core';
import { EmailService } from '../email.service';
import { AuthService } from 'src/app/Shared/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-emails',
  templateUrl: './emails.page.html',
  styleUrls: ['./emails.page.scss'],
})
export class EmailsPage implements OnInit {
  email = {
    to: '',
    subject: '',
    text: ''
  };

  message: string | null = null;
  userEmail: string = '';
  recipients$!: Observable<any[]>;

  constructor(
    private emailService: EmailService,
    private authService: AuthService,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.userEmail = user?.email || '';
    });

    this.recipients$ = this.firestore.collection('registeredStaff').valueChanges();
  }

  sendEmail() {
    if (!this.email.to || !this.email.subject || !this.email.text) {
      this.message = 'All fields are required.';
      return;
    }

    this.emailService.sendEmail(this.userEmail, this.email.to, this.email.subject, this.email.text).subscribe({
      next: () => {
        this.message = 'Email sent successfully!';
        this.clearForm();
      },
      error: (error) => {
        this.message = 'Failed to send email.';
        console.error('Error sending email:', error);
      }
    });
  }

  clearForm() {
    this.email = {
      to: '',
      subject: '',
      text: ''
    };
  }
}
