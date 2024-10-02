// src/app/model/document-item.ts

export interface DocumentItem {
    id?: string;            // Optional document ID
    email: string;          // Email of the user who uploaded the document
    documentName: string;   // Name of the document
    status: string;         // Status of the document (e.g., "approved", "declined")
    comment: string;        // Comment or reason for status
    uploadDate: string;     // Date when the document was uploaded
    module: string;         // Module or category of the document
    url?: string;           // URL to access the document
    uploadedAt?: Date;      // Timestamp of when the document was uploaded
    showDetails?: boolean; // Optional property for showing details
    dateDeclined?: Date; // Optional property for the date declined
    declinedBy?: string; // Optional property for the user who declined
    reason?: string; // Optional property for the reason
    position?: string; // Optional property for the position
    uploadedBy?: string;
  }
  