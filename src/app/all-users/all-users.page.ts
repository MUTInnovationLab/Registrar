import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.page.html',
  styleUrls: ['./all-users.page.scss'],
})
export class AllUsersPage implements OnInit {
  
  users = [
    { email: 'user1@example.com', staffNumber: '123', role: 'Admin' },
    { email: 'user2@example.com', staffNumber: '456', role: 'User' },
    // Add more users as needed
  ];

  constructor(private router: Router) { }

  ngOnInit() { }

  goBack() {
    this.router.navigate(['/home']);  // Update this to your actual route
  }

}
