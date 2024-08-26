// import { Component, OnInit } from '@angular/core';


// interface Notification {
//   id: number;
//   courseType: string;
//   courseName: string;
//   lecturer: string;
//   date: string;
//   status: string;
//   reminderSent: string;
//   expanded: boolean;
// }

// @Component({
//   selector: 'app-notification',
//   templateUrl: './notification.page.html',
//   styleUrls: ['./notification.page.scss'],
// })
// export class NotificationPage implements OnInit {
//   notifications: Notification[] = [
//     { id: 1, courseType: 'Semester', courseName: 'Introduction to Angular', lecturer: 'John Doe', date: '2024-08-01', status: 'Pending', reminderSent: 'No', expanded: false },
//     { id: 2, courseType: 'Annual', courseName: 'Advanced Firebase', lecturer: 'Jane Smith', date: '2024-09-01', status: 'Approved', reminderSent: 'Yes', expanded: false },
//     // Add more notifications here...
//   ];
  
//   newNotification: Notification = {
//     id: 0, courseType: '', courseName: '', lecturer: '', date: '', status: 'Pending', reminderSent: 'No', expanded: false
//   };

//   selectedNotification: Notification | null = null;
//   reminderSchedule: string = '';
//   customDays: number = 0;
//   notificationLogs: any[] = [];
//   showManageNotifications = false;
//   activeSection = 'create';

//   constructor() {}

//   ngOnInit() {}

//   toggleNotificationDetails(notification: Notification) {
//     notification.expanded = !notification.expanded;
//   }

//   toggleManageNotifications() {
//     this.showManageNotifications = !this.showManageNotifications;
//   }

//   toggleSection(section: string) {
//     this.activeSection = section;
//   }

//   saveNewNotification() {
//     this.newNotification.id = this.notifications.length + 1;
//     this.notifications.push({ ...this.newNotification, expanded: false });
//     this.newNotification = {
//       id: 0, courseType: '', courseName: '', lecturer: '', date: '', status: 'Pending', reminderSent: 'No', expanded: false
//     };
//   }

//   loadNotificationDetails() {
//     if (this.selectedNotification) {
//       // Populate fields with the selected notification details
//       this.newNotification = { ...this.selectedNotification };
//     }
//   }

//   updateNotification() {
//     if (this.selectedNotification) {
//       const index = this.notifications.findIndex(n => n.id === this.selectedNotification?.id);
//       if (index > -1) {
//         this.notifications[index] = { ...this.selectedNotification, expanded: false };
//       }
//     }
//   }

//   scheduleReminder() {
//     // Implement logic for scheduling reminders
//   }

//   approveNotification(notification: Notification) {
//     notification.status = 'Approved';
//   }

//   rejectNotification(notification: Notification) {
//     notification.status = 'Rejected';
//   }

//   sendReminder(notification: Notification) {
//     notification.reminderSent = 'Yes';
//   }

//   // goBack() {
//   //   this.router.navigate(['/home']);
//   // }
// }
import { Component, OnInit } from '@angular/core';
import { DataService } from '../Shared/data.service';

interface Notification {
  id?: string;
  courseType: string;
  courseName: string;
  lecturer: string;
  date: string;
  status: string;
  reminderSent: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
  notifications: Notification[] = [];
  
  newNotification: Notification = {
    courseType: '', 
    courseName: '', 
    lecturer: '', 
    date: '', 
    status: 'Pending', 
    reminderSent: 'No'
  };

  selectedNotification: Notification | null = null;
  reminderSchedule: string = '';
  customDays: number = 0;
  notificationLogs: any[] = [];
  showManageNotifications = false;
  activeSection = 'create';

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.dataService.getNotifications().subscribe(data => {
      this.notifications = data;
    });
  }

  toggleNotificationDetails(notification: Notification) {
    notification.expanded = !notification.expanded;
  }

  toggleManageNotifications() {
    this.showManageNotifications = !this.showManageNotifications;
  }

  toggleSection(section: string) {
    this.activeSection = section;
  }

  saveNewNotification() {
    this.dataService.addNotification({ ...this.newNotification }).then(() => {
      this.newNotification = {
        courseType: '', 
        courseName: '', 
        lecturer: '', 
        date: '', 
        status: 'Pending', 
        reminderSent: 'No'
      };
      this.loadNotifications(); // Reload notifications after adding a new one
    });
  }

  loadNotificationDetails() {
    if (this.selectedNotification) {
      this.newNotification = { ...this.selectedNotification };
    }
  }

  updateNotification() {
    if (this.selectedNotification && this.selectedNotification.id) {
      this.dataService.updateNotification(this.selectedNotification.id, { ...this.selectedNotification });
    }
  }

  scheduleReminder() {
    // Implement logic for scheduling reminders based on `reminderSchedule` and `customDays`.
  }

  approveNotification(notification: Notification) {
    notification.status = 'Approved';
    if (notification.id) {
      this.dataService.updateNotification(notification.id, notification);
    }
  }

  rejectNotification(notification: Notification) {
    notification.status = 'Rejected';
    if (notification.id) {
      this.dataService.updateNotification(notification.id, notification);
    }
  }

  sendReminder(notification: Notification) {
    notification.reminderSent = 'Yes';
    if (notification.id) {
      this.dataService.updateNotification(notification.id, notification);
    }
  }
}

