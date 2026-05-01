import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceAdminComponent } from './finance.component';

describe('FinanceAdminComponent', () => {
  let component: FinanceAdminComponent;
  let fixture: ComponentFixture<FinanceAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
