import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPostPage } from './new-post.page';

describe('NewPostPage', () => {
  let component: NewPostPage;
  let fixture: ComponentFixture<NewPostPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
