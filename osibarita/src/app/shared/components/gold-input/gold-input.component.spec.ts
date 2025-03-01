import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoldInputComponent } from './gold-input.component';

describe('GoldInputComponent', () => {
  let component: GoldInputComponent;
  let fixture: ComponentFixture<GoldInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoldInputComponent]
    });
    fixture = TestBed.createComponent(GoldInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
