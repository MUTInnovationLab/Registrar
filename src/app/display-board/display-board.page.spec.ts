import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayBoardPage } from './display-board.page';

describe('DisplayBoardPage', () => {
  let component: DisplayBoardPage;
  let fixture: ComponentFixture<DisplayBoardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayBoardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
