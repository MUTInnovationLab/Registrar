import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiUrl = 'https://api.mailgun.net/v3/sandbox9220c253f98f4a4fb4a4b19a73b9aa4b.mailgun.org/messages';
  private apiKey = '5af93de8d76752b7e10ffb410ab018ea-7a3af442-eff9d7e5';  // Consider using environment variables

  constructor(private http: HttpClient) {}

  sendEmail(from: string, to: string, subject: string, text: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('api:' + this.apiKey),
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('from', from);
    body.set('to', to);
    body.set('subject', subject);
    body.set('text', text);

    return this.http.post(this.apiUrl, body.toString(), { headers });
  }
}
