import { Component, OnInit } from '@angular/core';
import { DataService } from '../Shared/data.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {
  facultyName: string = "";
  departmentName: string = "";
  courseName: string = "";
  moduleName: string = "";

  faculties: any[] = [];
  departments: any[] = [];
  courses: any[] = [];
  modules: any[] = [];

  selectedFaculty: string = '';
  selectedDepartment: string = '';
  selectedCourse: string = '';
  selectedModule: string = '';

  constructor(private dataService: DataService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadFaculties()
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

  populateFields() {
    this.facultyName = this.selectedFaculty;
    this.departmentName = this.selectedDepartment;
    this.courseName = this.selectedCourse;
    this.moduleName = this.selectedModule;
  }

  async submitForm() {
    const department = {
      departmentName: this.departmentName,
    };
  
    const course = {
      courseName: this.courseName,
    };
  
    const module = {
      moduleName: this.moduleName,
    };
  
    try {
      await this.dataService.addAcademia(this.facultyName, department, course, module);
      this.presentToast('Data added successfully', 'success');
    } catch (err) {
      console.error('Error adding/updating data:', err);
      this.presentToast('Error adding/updating data', 'danger');
    }
  }
  
  async updateModule() {
    try {
      await this.dataService.updateAcademia(this.facultyName, this.departmentName, this.courseName, this.moduleName);
      this.presentToast('Data updated successfully', 'success');
    } catch (err) {
      console.error('Error updating data:', err);
      this.presentToast('Error updating data', 'danger');
    }
  }
  
  async deleteModule() {
    try {
      await this.dataService.deleteModule(this.facultyName, this.departmentName, this.courseName, this.moduleName);
      this.presentToast('Data deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting data:', err);
      this.presentToast('Error deleting data', 'danger');
    }
  }

  clearInputs() {
    this.facultyName = '';
    this.departmentName = '';
    this.courseName = '';
    this.moduleName = '';
  
    this.selectedFaculty = '';
    this.selectedDepartment = '';
    this.selectedCourse = '';
    this.selectedModule = '';
  
    this.departments = [];
    this.courses = [];
    this.modules = [];
  }
  

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    toast.present();
  }
  
  
}
