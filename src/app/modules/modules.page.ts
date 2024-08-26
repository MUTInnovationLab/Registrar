import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../Shared/data.service';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.page.html',
  styleUrls: ['./modules.page.scss'],
})
export class ModulesPage implements OnInit {

  faculties: string[] = [];
  departments: string[] = [];

  selectedFaculty: string = '';
  selectedDepartment: string = '';

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
    this.faculties = this.dataService.getFaculties();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  onFacultyChange() {
    this.departments = this.dataService.getDepartmentsByFaculty(this.selectedFaculty);
  }

}
