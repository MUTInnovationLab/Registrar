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
import { AppNotification, NotificationLog } from '../Model/notification';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
  notifications: AppNotification[] = [];
  notificationLogs: NotificationLog[] = [];
  showManageNotifications = false;
  activeSection: string = 'create';

  //new filtering properties
  filteredNotifications: any[] = [];
  filter = {
    courseType: '',
    status: '',
    dateRange: { start: null, end: null }
  };
  newNotification: AppNotification = {
    id: '',
    courseName: '',
    courseType: '',
    date: new Date(),
    lecturer: '',
    reminderSent: false,
    staffNumber: '',
    status: 'pending',
    expanded: false,
  };

  selectedNotification: AppNotification | null = null;
  reminderSchedule: string = '';
  customDays: number = 0;

  constructor(private dataService: DataService, private toastController: ToastController) {}

  ngOnInit() {
    this.loadNotifications();
    this.loadNotificationLogs();
  }

  toggleManageNotifications() {
    this.showManageNotifications = !this.showManageNotifications;
  }

  toggleSection(section: string) {
    this.activeSection = section;
  }

  // Load notifications with filters applied
  loadNotifications() {
    this.dataService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
      this.applyFilters(); // Apply filters on load
    });
  }

  applyFilters() {
    const { courseType, status, dateRange } = this.filter;
  
    this.filteredNotifications = this.notifications.filter(notification => {
      const matchesCourseType = courseType ? notification.courseType === courseType : true;
      const matchesStatus = status ? notification.status === status : true;
  
      const notificationDate = new Date(notification.date).getTime();
      const startDate = dateRange.start ? new Date(dateRange.start).getTime() : null;
      const endDate = dateRange.end ? new Date(dateRange.end).getTime() : null;
  
      console.log('Notification Date:', notificationDate);
     
      const matchesDateRange = startDate && endDate
        ? notificationDate >= startDate && notificationDate <= endDate
        : true;
  
      return matchesCourseType && matchesStatus && matchesDateRange;
    });
  }
  

  loadNotificationLogs() {
    this.dataService.getNotificationLogs().subscribe((logs: NotificationLog[]) => {
      this.notificationLogs = logs;
    });
  }

  saveNewNotification() {
    this.dataService.addNotification(this.newNotification).then(() => {
      this.loadNotifications();
      this.showToast('Successfully added new notification');
      this.resetNewNotificationForm();
    }).catch(error => {
      this.showToast('Error adding new notification: ' + error.message);
    });
  }

  resetNewNotificationForm() {
    this.newNotification = {
      id: '',
      courseName: '',
      courseType: '',
      date: new Date(),
      lecturer: '',
      reminderSent: false,
      staffNumber: '',
      status: 'pending',
      expanded: false,
    };
  }

  loadNotificationDetails() {
    if (this.selectedNotification) {
      this.newNotification = { ...this.selectedNotification };
    }
  }

  updateNotification() {
    if (this.selectedNotification && this.selectedNotification.id) {
      this.dataService.updateNotification(this.selectedNotification.id, this.selectedNotification).then(() => {
        this.loadNotifications();
      }).catch(error => {
        this.showToast('Error updating notification: ' + error.message);
      });
    }
  }

  // Schedule reminders based on user selection
  scheduleReminder() {
    if (!this.selectedNotification) return;

    let reminderDate: Date = new Date(this.selectedNotification.date);

    switch (this.reminderSchedule) {
      case '2days':
        reminderDate.setDate(reminderDate.getDate() + 2);
        break;
      case '1week':
        reminderDate.setDate(reminderDate.getDate() + 7);
        break;
      case 'custom':
        reminderDate.setDate(reminderDate.getDate() + this.customDays);
        break;
    }

    const reminderData = {
      notificationId: this.selectedNotification.id,
      reminderDate: reminderDate,
      createdAt: new Date(),
      status: 'scheduled',
      type: 'automatic',
      message: this.selectedNotification.courseName, // Example field, adjust as needed
    };

    this.dataService.scheduleReminder(reminderData).then(() => {
      this.loadNotifications();
      this.showToast('Reminder scheduled successfully');
    }).catch(error => {
      this.showToast('Error scheduling reminder: ' + error.message);
    });
  }

  // Send a manual reminder immediately
  sendReminder(notification: AppNotification) {
    const reminderData = {
      notificationId: notification.id,
      reminderDate: new Date(),
      createdAt: new Date(),
      status: 'sent',
      type: 'manual',
      message: notification.courseName, // Example field, adjust as needed
    };

    //store reminder in reminders collection
    this.dataService.sendReminder(reminderData).then(() => {
      //update the reminderSent field in the corresponding notification
      notification.reminderSent = true; //mark the reminder as sent
      this.dataService.updateNotification(notification.id!, notification).then(() => {

      // Reload the notifications list to reflect the update
      this.loadNotifications(); // Refresh the notifications list
      this.showToast('Reminder sent successfully and status updated.');
    });
  });
}

  approveNotification(notification: AppNotification) {
    notification.status = 'approved';
    this.dataService.updateNotification(notification.id!, notification).then(() => {
      this.loadNotifications();
      this.showToast('Notification approved');
    }).catch(error => {
      this.showToast('Error approving notification: ' + error.message);
    });
  }

  rejectNotification(notification: AppNotification) {
    notification.status = 'rejected';
    this.dataService.updateNotification(notification.id!, notification).then(() => {
      this.loadNotifications();
      this.showToast('Notification rejected');
    }).catch(error => {
      this.showToast('Error rejecting notification: ' + error.message);
    });
  }

  toggleNotificationDetails(notification: AppNotification) {
    notification.expanded = !notification.expanded;
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}

/*add toast messages
add to approval process
Sender ID 1046956113974
server Key
*/