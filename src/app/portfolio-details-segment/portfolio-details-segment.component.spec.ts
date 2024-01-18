import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioDetailsSegmentComponent } from './portfolio-details-segment.component';

describe('PortfolioDetailsSegmentComponent', () => {
  let component: PortfolioDetailsSegmentComponent;
  let fixture: ComponentFixture<PortfolioDetailsSegmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortfolioDetailsSegmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioDetailsSegmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
