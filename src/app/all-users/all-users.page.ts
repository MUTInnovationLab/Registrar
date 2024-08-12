import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../Shared/data.service';
import { User } from '../Model/user';
import { DocumentChangeAction } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.page.html',
  styleUrls: ['./all-users.page.scss'],
})
export class AllUsersPage implements OnInit {
  
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.dataService.getAllStaff().subscribe((staffSnapshot: DocumentChangeAction<User>[]) => {
      // Map the incoming data to the User model
      this.users = staffSnapshot.map(staffDoc => {
        const data = staffDoc.payload.doc.data() as User;
        return {
          id: staffDoc.payload.doc.id,
          email: data.email,
          staffNumber: data.staffNumber,
          role: data.role
        } as User;
      });
      // Initialize filteredUsers with all users
      this.filteredUsers = [...this.users]; // Create a shallow copy
    });
  }

  filterUsers() {
  const term = this.searchTerm.toLowerCase();
  console.log('Search Term:', term); // Log the search term
  this.filteredUsers = this.users.filter(user => 
    user.email.toLowerCase().includes(term) ||
    user.staffNumber.toLowerCase().includes(term) ||
    user.role.toLowerCase().includes(term)
  );
  console.log('Filtered Users:', this.filteredUsers); // Log the filtered users
}

  
  goBack() {
    this.router.navigate(['/home']); // Update this to your actual route
  }
}
