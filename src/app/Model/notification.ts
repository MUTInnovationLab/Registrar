// notification.model.ts

export interface AppNotification {
    id?: string;
    courseName: string;
    courseType: 'semester' | 'annual'; //
    lecturer: string; // Adjust according to your needs, e.g., it could be an array of strings if multiple recipients
    date: Date;
    status: 'pending' | 'approved' | 'rejected'; // e.g., 'reminder', 'alert', etc.
    reminderSent: boolean; // e.g., 'sent', 'pending', etc.
    staffNumber: string;
    expanded?: boolean; // Optional field for UI purposes 
    // Add other relevant fields here
  }
  
  export interface NotificationLog {
    courseName: string;
    date: Date; // e.g., 'created', 'sent', 'viewed'
    status: string;
    reminderSent: boolean;
    // Add other relevant fields here
  }
  
  // Adjust import path if necessary in other files
  