import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredicateFilter } from './predicate-filter';

describe('PredicateFilter', () => {
  let component: PredicateFilter;
  let fixture: ComponentFixture<PredicateFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredicateFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(PredicateFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
