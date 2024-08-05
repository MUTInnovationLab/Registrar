import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocViewPage } from './doc-view.page';

describe('DocViewPage', () => {
  let component: DocViewPage;
  let fixture: ComponentFixture<DocViewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
