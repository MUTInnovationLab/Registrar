import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../Shared/data.service';
import { User } from '../Model/user';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { DocumentChangeAction } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.page.html',
  styleUrls: ['./all-users.page.scss'],
})
export class AllUsersPage implements OnInit {
  
  users: User[] = [];

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getAllStaff().subscribe((staffSnapshot: DocumentChangeAction<User>[]) => {
      this.users = staffSnapshot.map(staffDoc => {
        const data = staffDoc.payload.doc.data() as User;
        return {
          id: staffDoc.payload.doc.id,
          email: data.email,
          staffNumber: data.staffNumber,
          role: data.role
        } as User;
      });
    });
  }
  goBack() {
    this.router.navigate(['/home']);
  }
}
