import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrevoPage } from './brevo.page';

describe('BrevoPage', () => {
  let component: BrevoPage;
  let fixture: ComponentFixture<BrevoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
