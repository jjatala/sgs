import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';

import { mockComponent } from '../../utils/test.util';
import { CommonOptionsComponent } from './common-options.component';

describe('CommonOptionsComponent', () => {
  let component: CommonOptionsComponent;
  let fixture: ComponentFixture<CommonOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClarityModule],
      declarations: [
        CommonOptionsComponent,
        mockComponent('app-graph-options'),
        mockComponent('app-filter-options'),
        mockComponent('app-analyser-options'),
        mockComponent('app-ui-options'),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CommonOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
