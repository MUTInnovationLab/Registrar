import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../Shared/data.service';
import { User } from '../Model/user';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.page.html',
  styleUrls: ['./all-users.page.scss'],
})
export class AllUsersPage implements OnInit {

  users: User[] = [];            // All users list
  filteredUsers: User[] = [];     // Filtered users list for display
  searchTerm: string = '';        // Search input binding
  selectedUser: User | null = null; // Initialize as null
  profileVisible: boolean = false; // Profile visibility flag


  selectedRow: number = -1;       // Holds the index of the selected row (-1 means none selected)
  selectUser(user: User) {
    this.selectedUser = user; // Track the selected user object
  }

  constructor(private router: Router, private dataService: DataService, private navCtrl: NavController) { }

  ngOnInit() {
    this.loadUsers(); // Load users on component initialization
  }

  // Load users from dataService
  loadUsers() {
    this.dataService.getAllStaff().subscribe(
      (users: User[]) => {
        this.users = users;              // Assign users to users array
        this.filteredUsers = [...this.users]; // Copy all users to filtered array
      },
      error => {
        console.error('Error loading users:', error); // Log error to console
      }
    );
  }

  // Function to select a row by index
  selectRow(index: number) {
    this.selectedRow = index;    // Store the selected row index
  }

  // Filter the user list based on searchTerm
  filterUsers() {
    const term = this.searchTerm.trim().toLowerCase();  // Trim and convert search term to lowercase

    if (term) {
      this.filteredUsers = this.users.filter(user => {
        const email = user.email ? user.email.toLowerCase() : '';
        const staffNumber = user.staffNumber ? user.staffNumber.toLowerCase() : '';
        const position = user.position ? user.position.toLowerCase() : '';

        // Check if any field includes the search term
        return email.includes(term) || staffNumber.includes(term) || position.includes(term);
      });
    } else {
      // If no search term, show all users
      this.filteredUsers = [...this.users];
    }

    console.log('Filtered Users:', this.filteredUsers); // Debugging to verify the filtered users
  }

  // Navigate back to the home page
  goBack(): void {
    this.navCtrl.back();
  }
  toggleProfile() {
    this.profileVisible = !this.profileVisible;
  }
}
