import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutrasAvaliacoesComponent } from './outras-avaliacoes.component';

describe('OutrasAvaliacoesComponent', () => {
  let component: OutrasAvaliacoesComponent;
  let fixture: ComponentFixture<OutrasAvaliacoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutrasAvaliacoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutrasAvaliacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
