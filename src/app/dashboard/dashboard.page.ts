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
    { role: 'External Moderator', documentName: '', url: '', status: '' },
    { role: 'Finance', documentName: '', url: '', status: '' },
    { role: 'Examination Officer', documentName: '', url: '', status: '' },
    { role: 'Human Resource', documentName: '', url: '', status: '' },
    { role: 'Deputy Registrar', documentName: '', url: '', status: '' },
    { role: 'HOD', documentName: '', url: '', status: '' }
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
    const sharedModules = this.identifySharedModules(allUsers);

    // Filter documents based on user modules and shared modules
    const relevantDocuments = documents.filter(doc => 
      this.userModules.includes(doc.module) ||
      sharedModules.includes(doc.module)
    );

    this.assignDocumentsToRoles(relevantDocuments);
    this.documents$ = new Observable(observer => {
      observer.next(relevantDocuments);
      observer.complete();
    });
  }

  private identifySharedModules(allUsers: User[]): string[] {
    const sharedModules: string[] = [];
    allUsers.forEach(user => {
      if (user.position !== this.currentUserPosition) { // Exclude current user's position
        if (user.modules) {
          const commonModules = user.modules.filter(module => this.userModules.includes(module));
          commonModules.forEach(module => {
            if (!sharedModules.includes(module)) {
              sharedModules.push(module);
            }
          });
        }
      }
    });
    return sharedModules;
  }

  private async showSharedModulesAndPositions(allUsers: User[]) {
    if (!this.documents$) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No documents available to display shared modules.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const sharedModules = this.identifySharedModules(allUsers);
    const documents = await this.documents$.toPromise();

    if (!documents) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No documents found for shared modules.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Create a map to store positions by module
    const modulePositionMap: { [module: string]: string[] } = {};

    allUsers.forEach(user => {
      if (user.position !== this.currentUserPosition) { // Exclude current user's position
        if (user.modules) {
          user.modules.forEach(module => {
            if (this.userModules.includes(module)) {
              if (!modulePositionMap[module]) {
                modulePositionMap[module] = [];
              }
              if (!modulePositionMap[module].includes(user.position)) {
                modulePositionMap[module].push(user.position);
              }
            }
          });
        }
      }
    });

    const alertMessage = sharedModules.map(module => {
      const positions = modulePositionMap[module];
      const moduleDocuments = documents.filter(doc => doc.module === module);
      const documentInfo = moduleDocuments.length > 0
        ? moduleDocuments.map(doc => `Document: ${doc.documentName}, URL: ${doc.url}`).join('\n')
        : 'No document available';
      const positionInfo = positions.length > 0
        ? positions.map(pos => `Position: ${pos}`).join('\n')
        : 'No positions available';
      return `Module: ${module}\n${positionInfo}\n${documentInfo}`;
    }).join('\n\n');

    const alert = await this.alertController.create({
      header: 'Shared Modules and Documents',
      message: alertMessage || 'No documents found for shared modules.',
      buttons: ['OK']
    });

    await alert.present();
  }

  // private assignDocumentsToRoles(documents: any[]) {
  //   // Initialize rolesData with empty documents
  //   this.rolesData = this.rolesData.map(role => ({
  //     ...role,
  //     documentName: '',
  //     url: '',
  //     status: ''
  //   }));

  //   // Map documents to roles
  //   documents.forEach(doc => {
  //     const roleIndex = this.rolesData.findIndex(role => role.role === doc.position);
  //     if (roleIndex !== -1) {
  //       this.rolesData[roleIndex] = {
  //         ...this.rolesData[roleIndex],
  //         documentName: doc.documentName,
  //         url: doc.url,
  //         status: doc.status
  //       };
  //     }
  //   });
  // }

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

  private assignDocumentsToRoles(documents: any[]) {
    // Initialize rolesData with empty documents
    this.rolesData = this.rolesData.map(role => ({
      ...role,
      documentName: '',
      url: '',
      status: ''
    }));
  
    // Create a map to hold documents for each role
    const roleDocumentsMap: { [role: string]: any[] } = {};
  
    documents.forEach(doc => {
      const role = doc.position;
      if (!roleDocumentsMap[role]) {
        roleDocumentsMap[role] = [];
      }
      roleDocumentsMap[role].push(doc);
    });
  
    // Update rolesData with documents
    this.rolesData = this.rolesData.map(role => {
      const docs = roleDocumentsMap[role.role] || [];
      if (docs.length > 0) {
        // Assuming each role can have only one document (if more, adjust logic)
        const doc = docs[0];
        return {
          ...role,
          documentName: doc.documentName,
          url: doc.url,
          status: doc.status
        };
      }
      return role;
    });
  }
  

  private filterDocumentsForModule(documents: any[]): any[] {
    return documents.filter(doc => doc.module === this.selectedModule);
  }
}
