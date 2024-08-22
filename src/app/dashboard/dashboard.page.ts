import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import Swiper from 'swiper';
import { DataService } from '../Shared/data.service';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { AuthService } from '../Shared/auth.service';
import { User } from '../Model/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterViewInit {
  @ViewChild('swiper', { static: false }) swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  showMenu = false;

  selectedModule: string | null = null;

  documents$: Observable<any[]> | undefined;
  user$: Observable<User | undefined> | undefined;
  allUsers$: Observable<User[]> | undefined;
  userModules: string[] = [];
  currentUserPosition: string | undefined;

  rolesData = [
    { role: 'Lecturer', documentName: '', url: '', status: '' },
    { role: 'HOD', documentName: '', url: '', status: '' },
    { role: 'Deputy Registrar', documentName: '', url: '', status: '' },
    { role: 'Examination Officer', documentName: '', url: '', status: '' },
    { role: 'Finance', documentName: '', url: '', status: '' },
    { role: 'Human Resource', documentName: '', url: '', status: '' },
    { role: 'External Moderator', documentName: '', url: '', status: '' },
    
  ];

  constructor(
    private navController: NavController,
    private authService: AuthService,
    private dataService: DataService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().pipe(
      mergeMap(user => {
        if (user) {
          const currentUserEmail = user.email;
          if (currentUserEmail) {
            this.user$ = this.dataService.getUserByEmail(currentUserEmail);
            return this.user$;
          }
        }
        return [];
      }),
      mergeMap(userData => {
        if (userData) {
          this.userModules = userData.modules || [];
          this.currentUserPosition = userData.position;
          return this.dataService.getAllDocuments().pipe(
            mergeMap(documents => {
              this.allUsers$ = this.dataService.getAllStaff();
              return this.allUsers$.pipe(
                map(allUsers => ({ documents, allUsers }))
              );
            })
          );
        }
        return [];
      })
    ).subscribe(({ documents, allUsers }) => {
      this.filterAndAssignDocuments(documents, allUsers);
      this.showSharedModulesAndPositions(allUsers);
    });
  }

  ngAfterViewInit() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  private filterAndAssignDocuments(documents: any[], allUsers: User[]) {
    const sharedModulesAndPositions = this.identifySharedModulesAndPositions(allUsers);

    // Filter documents based on user modules and shared modules
    const relevantDocuments = documents.filter(doc => 
      this.userModules.includes(doc.module) ||
      sharedModulesAndPositions.some(item => item.module === doc.module)
    );

    this.assignDocumentsToRoles(relevantDocuments);
    this.documents$ = new Observable(observer => {
      observer.next(relevantDocuments);
      observer.complete();
    });
  }

  private identifySharedModulesAndPositions(allUsers: User[]): { module: string, position: string }[] {
    const sharedModulesAndPositions: { module: string, position: string }[] = [];
    allUsers.forEach(user => {
      if (user.position !== this.currentUserPosition) { // Exclude current user's position
        if (user.modules) {
          const commonModules = user.modules.filter(module => this.userModules.includes(module));
          commonModules.forEach(module => {
            sharedModulesAndPositions.push({ module, position: user.position });
          });
        }
      }
    });
    return sharedModulesAndPositions;
  }

  private async showSharedModulesAndPositions(allUsers: User[]) {
    const sharedModulesAndPositions = this.identifySharedModulesAndPositions(allUsers);
    const uniqueSharedModulesAndPositions = Array.from(new Set(
      sharedModulesAndPositions.map(item => `${item.module}|${item.position}`)
    )).map(item => {
      const [module, position] = item.split('|');
      return { module, position };
    });

    const alertMessage = uniqueSharedModulesAndPositions
      .map(item => `Module: ${item.module}, Position: ${item.position}`)
      .join('\n');

    const alert = await this.alertController.create({
      header: 'Shared Modules and Positions',
      message: alertMessage || 'No shared modules found.',
      buttons: ['OK']
    });

    await alert.present();
  }

  private assignDocumentsToRoles(documents: any[]) {
    // Initialize rolesData with empty documents
    this.rolesData = this.rolesData.map(role => ({
      ...role,
      documentName: '',
      url: '',
      status: ''
    }));

    // Map documents to roles
    documents.forEach(doc => {
      const roleIndex = this.rolesData.findIndex(role => role.role === doc.position);
      if (roleIndex !== -1) {
        this.rolesData[roleIndex] = {
          ...this.rolesData[roleIndex],
          documentName: doc.documentName,
          url: doc.url,
          status: doc.status
        };
      }
    });
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  Upload() {
    this.navController.navigateForward('/upload');
  }

  View() {
    this.navController.navigateForward('/view-docs');
  }

  goNext() {
    this.swiper?.slideNext();
  }

  goPrev() {
    this.swiper?.slidePrev();
  }

  swiperSlideChanged(e: any) {
    console.log('Changed', e);
  }

  downloadDocument(url: string) {
    window.open(url, '_blank');
  }

  previewDocument(url: string) {
    window.open(url, '_blank');
  }

  onModuleClick(module: string) {
    this.selectedModule = module;
    this.updateRolesDataForSelectedModule();
  }

  private updateRolesDataForSelectedModule() {
    if (this.selectedModule && this.documents$) {
      this.documents$.pipe(
        map(documents => this.filterDocumentsForModule(documents))
      ).subscribe(filteredDocuments => {
        this.assignDocumentsToRoles(filteredDocuments);
      });
    }
  }

  private filterDocumentsForModule(documents: any[]): any[] {
    return documents.filter(doc => doc.module === this.selectedModule);
  }
}
