import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailsPage } from './emails.page';

describe('EmailsPage', () => {
  let component: EmailsPage;
  let fixture: ComponentFixture<EmailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
