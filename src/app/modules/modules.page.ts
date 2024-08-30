import { DataService } from '../Shared/data.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.page.html',
  styleUrls: ['./modules.page.scss'],
})
export class ModulesPage implements OnInit {

  faculties: string[] = [];
  departments: string[] = [];
  courses: string[] = [];
  modules: string[] = [];

  selectedFaculty: string = '';
  selectedDepartment: string = '';
  selectedCourse: string = '';
  selectedModule: string = '';

  constructor(
    private dataService: DataService, 
    private router: Router,  
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadFaculties();
  }

  // Load faculties from the service
  loadFaculties() {
    this.dataService.getFaculties().subscribe({
      next: (faculties: string[]) => this.faculties = faculties,
      error: (err) => console.error('Error loading faculties', err)
    });
  }

  // Load departments based on selected faculty
  loadDepartments() {
    if (!this.selectedFaculty) return;
    this.dataService.getDepartments(this.selectedFaculty).subscribe({
      next: (departments: string[]) => this.departments = departments,
      error: (err) => console.error('Error loading departments', err)
    });
  }

  // Load courses based on selected department
  loadCourses() {
    if (!this.selectedFaculty || !this.selectedDepartment) return;
    this.dataService.getCourses(this.selectedFaculty, this.selectedDepartment).subscribe({
      next: (courses: string[]) => this.courses = courses,
      error: (err) => console.error('Error loading courses', err)
    });
  }

  // Load modules based on selected course
  loadModules() {
    if (!this.selectedFaculty || !this.selectedDepartment || !this.selectedCourse) return;
    this.dataService.getModules(this.selectedFaculty, this.selectedDepartment, this.selectedCourse).subscribe({
      next: (modules: string[]) => this.modules = modules,
      error: (err) => console.error('Error loading modules', err)
    });
  }

  // Prompt user to add a new faculty
  addFaculty() {
    const facultyName = window.prompt('Enter new faculty name');
    if (facultyName) {
      this.dataService.addFaculty(facultyName).then(() => {
        this.loadFaculties(); // Refresh the faculties list after adding
      }).catch(err => console.error('Error adding faculty', err));
    }
  }

  // Prompt user to add a new department
  addDepartment() {
    if (!this.selectedFaculty) {
      alert('Please select a faculty first.');
      return;
    }
    const departmentName = window.prompt('Enter new department name');
    if (departmentName) {
      this.dataService.addDepartment(this.selectedFaculty, departmentName).then(() => {
        this.loadDepartments();
      }).catch(err => console.error('Error adding department', err));
    }
  }

  // Prompt user to add a new course
  addCourse() {
    if (!this.selectedFaculty || !this.selectedDepartment) {
      alert('Please select a faculty and department first.');
      return;
    }
    const courseName = window.prompt('Enter new course name');
    if (courseName) {
      this.dataService.addCourse(this.selectedFaculty, this.selectedDepartment, courseName).then(() => {
        this.loadCourses();
      }).catch(err => console.error('Error adding course', err));
    }
  }

  // Prompt user to add a new module
  addModule() {
    if (!this.selectedFaculty || !this.selectedDepartment || !this.selectedCourse) {
      alert('Please select a faculty, department, and course first.');
      return;
    }
    const moduleName = window.prompt('Enter new module name');
    if (moduleName) {
      this.dataService.addModule(this.selectedFaculty, this.selectedDepartment, this.selectedCourse, moduleName).then(() => {
        this.loadModules();
      }).catch(err => console.error('Error adding module', err));
    }
  }

  // Prompt user to delete an existing faculty
  deleteFaculty() {
    if (!this.selectedFaculty) {
      alert('Please select a faculty to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the faculty: ${this.selectedFaculty}?`)) {
      this.dataService.deleteFaculty(this.selectedFaculty).then(() => {
        this.loadFaculties();
      }).catch(err => console.error('Error deleting faculty', err));
    }
  }

  // Prompt user to delete an existing department
  deleteDepartment() {
    if (!this.selectedFaculty || !this.selectedDepartment) {
      alert('Please select a faculty and department to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the department: ${this.selectedDepartment}?`)) {
      this.dataService.deleteDepartment(this.selectedFaculty, this.selectedDepartment).then(() => {
        this.loadDepartments();
      }).catch(err => console.error('Error deleting department', err));
    }
  }

  // Prompt user to delete an existing course
  deleteCourse() {
    if (!this.selectedFaculty || !this.selectedDepartment || !this.selectedCourse) {
      alert('Please select a faculty, department, and course to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the course: ${this.selectedCourse}?`)) {
      this.dataService.deleteCourse(this.selectedFaculty, this.selectedDepartment, this.selectedCourse).then(() => {
        this.loadCourses();
      }).catch(err => console.error('Error deleting course', err));
    }
  }

  // Prompt user to delete an existing module
  deleteModule() {
    if (!this.selectedFaculty || !this.selectedDepartment || !this.selectedCourse || !this.selectedModule) {
      alert('Please select a faculty, department, course, and module to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the module: ${this.selectedModule}?`)) {
      this.dataService.deleteModule(this.selectedFaculty, this.selectedDepartment, this.selectedCourse, this.selectedModule).then(() => {
        this.loadModules();
      }).catch(err => console.error('Error deleting module', err));
    }
  }

  // Prompt user to update an existing faculty
  updateFaculty() {
    const oldName = window.prompt('Enter old faculty name');
    const newName = window.prompt('Enter new faculty name');
    if (oldName && newName) {
      this.dataService.updateFaculty(oldName, newName).then(() => {
        this.loadFaculties();
      }).catch(err => console.error('Error updating faculty', err));
    }
  }

  // Prompt user to update an existing department
  updateDepartment() {
    const oldName = window.prompt('Enter old department name');
    const newName = window.prompt('Enter new department name');
    if (this.selectedFaculty && oldName && newName) {
      this.dataService.updateDepartment(this.selectedFaculty, oldName, newName).then(() => {
        this.loadDepartments();
      }).catch(err => console.error('Error updating department', err));
    } else {
      alert('Please select a faculty and provide both old and new department names.');
    }
  }

  // Prompt user to update an existing course
  updateCourse() {
    const oldName = window.prompt('Enter old course name');
    const newName = window.prompt('Enter new course name');
    if (this.selectedFaculty && this.selectedDepartment && oldName && newName) {
      this.dataService.updateCourse(this.selectedFaculty, this.selectedDepartment, oldName, newName).then(() => {
        this.loadCourses();
      }).catch(err => console.error('Error updating course', err));
    } else {
      alert('Please select a faculty, department, and provide both old and new course names.');
    }
  }

  // Prompt user to update an existing module
  updateModule() {
    const oldName = window.prompt('Enter old module name');
    const newName = window.prompt('Enter new module name');
    if (this.selectedFaculty && this.selectedDepartment && this.selectedCourse && oldName && newName) {
      this.dataService.updateModule(this.selectedFaculty, this.selectedDepartment, this.selectedCourse, oldName, newName).then(() => {
        this.loadModules();
      }).catch(err => console.error('Error updating module', err));
    } else {
      alert('Please select a faculty, department, course, and provide both old and new module names.');
    }
  }

  // Generalized prompt method for actions
  promptAction(type: string, action: string) {
    if (action === 'Add') {
      switch (type) {
        case 'faculty':
          this.addFaculty();
          break;
        case 'department':
          this.addDepartment();
          break;
        case 'course':
          this.addCourse();
          break;
        case 'module':
          this.addModule();
          break;
      }
    } else if (action === 'Delete') {
      switch (type) {
        case 'faculty':
          this.deleteFaculty();
          break;
        case 'department':
          this.deleteDepartment();
          break;
        case 'course':
          this.deleteCourse();
          break;
        case 'module':
          this.deleteModule();
          break;
      }
    } else if (action === 'Update') {
      switch (type) {
        case 'faculty':
          this.updateFaculty();
          break;
        case 'department':
          this.updateDepartment();
          break;
        case 'course':
          this.updateCourse();
          break;
        case 'module':
          this.updateModule();
          break;
      }
    }
  }

    // Navigation back to home
    goBack() {
      this.router.navigate(['/home']);
    }
    
}
