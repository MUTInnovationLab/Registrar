import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignPage } from './assign.page';

describe('AssignPage', () => {
  let component: AssignPage;
  let fixture: ComponentFixture<AssignPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
