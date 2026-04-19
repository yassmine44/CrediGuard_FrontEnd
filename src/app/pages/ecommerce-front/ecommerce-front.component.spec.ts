import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcommerceFrontComponent } from './ecommerce-front.component';

describe('EcommerceFrontComponent', () => {
  let component: EcommerceFrontComponent;
  let fixture: ComponentFixture<EcommerceFrontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcommerceFrontComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcommerceFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
