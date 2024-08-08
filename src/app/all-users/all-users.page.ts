import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../Shared/data.service';
import { User } from '../Model/user';



@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.page.html',
  styleUrls: ['./all-users.page.scss'],
})
export class AllUsersPage implements OnInit {
  
  users: User[] = [];

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getAllStaff().subscribe(staff => {
      this.users = staff.map(e => {
        const data = e.payload.doc.data() as User;
        return {
          id: e.payload.doc.id,
          email: data.email,
          staffNumber: data.staffNumber,
          role: data.role
        } as User;
      });
    });
  }

  goBack() {
    this.router.navigate(['/home']);  // Update this to your actual route
  }
}
