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
  filteredUsers: User[] = [];
  searchTerm: string = '';

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.dataService.getAllStaff().subscribe(
      (users: User[]) => {
        this.users = users; // No need to map here
        this.filteredUsers = [...this.users]; // Initialize with all users
      },
      error => {
        console.error('Error loading users:', error); // Handle potential errors
      }
    );
  }

  filterUsers() {
    console.log('Search Term:', this.searchTerm); // Check the search term
    const term = this.searchTerm.trim().toLowerCase();
    
    if (term) {
      this.filteredUsers = this.users.filter(user => {
        const email = user.email ? user.email.toLowerCase() : '';
        const staffNumber = user.staffNumber ? user.staffNumber.toLowerCase() : '';
        const position = user.position ? user.position.toLowerCase() : '';
        
        return email.includes(term) ||
               staffNumber.includes(term) ||
               position.includes(term);
      });
    } else {
      this.filteredUsers = [...this.users];
    }
    
    console.log('Filtered Users:', this.filteredUsers); // Check the filtered results
  }
  
  
  goBack() {
    this.router.navigate(['/home']); // Update this to your actual route
  }
}
