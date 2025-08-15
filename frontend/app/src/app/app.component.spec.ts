import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { RouletteService } from './services/roulette.service';

import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material usados por la plantilla
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

describe('AppComponent', () => {
  let svc: jasmine.SpyObj<RouletteService>;

  beforeEach(async () => {
    // Espía del servicio
    svc = jasmine.createSpyObj<RouletteService>('RouletteService', [
      'create',
      'open',
      'betNumber',
      'betColor',
      'close',
      'list',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,              // Standalone
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        // Módulos de Angular Material usados en el template
        MatToolbarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
      ],
      providers: [{ provide: RouletteService, useValue: svc }],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(AppComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, comp };
  }

  it('debe crearse', () => {
    const { comp } = createComponent();
    expect(comp).toBeTruthy();
  });

  it('crear ruleta llama al servicio y actualiza rid', () => {
    svc.create.and.returnValue(of({ id: 'RID' }));
    const { comp } = createComponent();

    comp.create();

    expect(svc.create).toHaveBeenCalled();
    expect(comp.rid).toBe('RID');
  });

  it('listar ruletas llena el arreglo', () => {
    const data = [{ id: 'A', status: 'closed', totalBets: 0 }];
    svc.list.and.returnValue(of(data));
    const { comp } = createComponent();

    comp.loadRoulettes();

    expect(svc.list).toHaveBeenCalled();
    expect(comp.roulettes.length).toBe(1);
    expect(comp.roulettes[0].id).toBe('A');
  });
});


