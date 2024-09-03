import { Component, OnInit } from '@angular/core';
import { DataService } from '../Shared/data.service';

@Component({
  selector: 'app-display-board',
  templateUrl: './display-board.page.html',
  styleUrls: ['./display-board.page.scss'],
})
export class DisplayBoardPage implements OnInit {
  faculties: any[] = [];
  departments: any[] = [];
  courses: any[] = [];
  modules: any[] = [];

  selectedFaculty: string = '';
  selectedDepartment: string = '';
  selectedCourse: string = '';
  selectedModule: string = '';  // Add this line

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.loadFaculties();
  }

  loadFaculties() {
    this.dataService.getFaculties().subscribe((faculties: any[]) => {
      this.faculties = faculties;
    });
  }

  onFacultyChange() {
    this.departments = [];
    this.courses = [];
    this.modules = [];
    this.selectedDepartment = ''; // Reset selection
    this.selectedCourse = ''; // Reset selection
    this.selectedModule = ''; // Reset selection

    this.dataService.getDepartments(this.selectedFaculty).subscribe((departments: any[]) => {
      this.departments = departments;
    });
  }

  onDepartmentChange() {
    this.courses = [];
    this.modules = [];
    this.selectedCourse = ''; // Reset selection
    this.selectedModule = ''; // Reset selection

    this.dataService.getCourses(this.selectedFaculty, this.selectedDepartment).subscribe((courses: any[]) => {
      this.courses = courses;
    });
  }

  onCourseChange() {
    this.modules = [];
    this.selectedModule = ''; // Reset selection

    this.dataService.getModules(this.selectedFaculty, this.selectedDepartment, this.selectedCourse).subscribe((modules: any[]) => {
      this.modules = modules;
    });
  }
}
