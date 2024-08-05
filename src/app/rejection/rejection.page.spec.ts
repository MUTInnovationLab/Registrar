import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RejectionPage } from './rejection.page';

describe('RejectionPage', () => {
  let component: RejectionPage;
  let fixture: ComponentFixture<RejectionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
