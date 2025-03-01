import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneContainerComponent } from './scene-container.component';

describe('SceneContainerComponent', () => {
  let component: SceneContainerComponent;
  let fixture: ComponentFixture<SceneContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SceneContainerComponent]
    });
    fixture = TestBed.createComponent(SceneContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
