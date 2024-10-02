import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import Swiper from 'swiper';
import { DataService } from '../Shared/data.service';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { AuthService } from '../Shared/auth.service';
import { User } from '../Model/user';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
  currentUserEmail: string = '';
  profileVisible: boolean = false;


  rolesData = [
    { role: 'Lecturer', documentName: '', url: '', status: '' },
    { role: 'HOD', documentName: '', url: '', status: '' },
    { role: 'Deputy Registrar', documentName: '', url: '', status: '' },
    { role: 'Examination Officer', documentName: '', url: '', status: '' },
    { role: 'Finance', documentName: '', url: '', status: '' },
    { role: 'Human Resource', documentName: '', url: '', status: '' },
    { role: 'External Moderator', documentName: '', url: '', status: '' },
  ];

  // Define the privileges object
  privileges: { [key: string]: string[] } = {
    'External Moderator': ['Human Resource','External Moderator'],
    'Human Resource': ['Finance','Human Resource'],
    'Finance': ['Examination Officer','Finance'],
    'Examination Officer': ['Deputy Registrar','Examination Officer'],
    'Deputy Registrar': ['HOD','Deputy Registrar'],
    'HOD': ['Lecturer','HOD'],
    'Lecturer': ['Lecturer','HOD','Deputy Registrar','Examination Officer','Finance','Human Resource','External Moderator']
  };

  constructor(
    private navController: NavController,
    private authService: AuthService,
    private dataService: DataService,
    private alertController: AlertController,
    private afAuth: AngularFireAuth,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().pipe(
      mergeMap(user => {
        if (user) {
           this.currentUserEmail = user.email;
          if (this.currentUserEmail) {
            this.user$ = this.dataService.getUserByEmail(this.currentUserEmail);
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
  async goToEmailPage() {
    const user = await this.afAuth.currentUser;
    if (user) {
      this.router.navigate(['/emails']);
    } else {
      this.router.navigate(['/login']);
    }
  }
  
  myDocs() {
    if (this.currentUserEmail) {
      this.router.navigate(['/view-docs'], { queryParams: { email: this.currentUserEmail } });
    } else {
      console.error('No user email available');
    }
  }

  rejection() {
    if (this.currentUserEmail) {
      this.router.navigate(['/rejection'], { queryParams: { email: this.currentUserEmail } });
    } else {
      console.error('No user email available');
    }
  }
  

  ngAfterViewInit() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  goBack() {
    this.router.navigate(['/login']);
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

    // Implement logic if needed
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
    if (this.currentUserEmail) {
      this.router.navigate(['/upload'], { queryParams: { modules: this.userModules } });
    } else {
      console.error('No user email available');
    }

    
  }

  View() {
    this.navController.navigateForward('/approval');
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

  downloadDocument(url: string, documentRole: string) {
    if (this.canDownload(documentRole)) {
      window.open(url, '_blank');
    }
  }

  previewDocument(url: string, documentRole: string) {
    if (this.canView(documentRole)) {
      window.open(url, '_blank');
    }
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

   filterDocumentsForModule(documents: any[]): any[] {
    return documents.filter(doc => doc.module === this.selectedModule);
  }

  // Check if the current user has the privilege to download documents
   canDownload(documentRole: string): boolean {
    const accessibleRoles = this.privileges[this.currentUserPosition || ''] || [];
    return accessibleRoles.includes(documentRole);
  }

  // Check if the current user has the privilege to view documents
   canView(documentRole: string): boolean {
    return this.canDownload(documentRole); // Assuming view privileges are the same as download
  }
}
