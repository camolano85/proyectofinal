import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { RouletteService } from './services/roulette.service';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { provideHttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let comp: AppComponent;
  let svc: jasmine.SpyObj<RouletteService>;

  beforeEach(async () => {
    svc = jasmine.createSpyObj<RouletteService>('RouletteService', [
      'create', 'open', 'betNumber', 'betColor', 'close', 'list'
    ]);

    await TestBed.configureTestingModule({
    
      imports: [
        AppComponent,
        FormsModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
      ],
      providers: [
        { provide: RouletteService, useValue: svc },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
  });

  it('debe crearse', () => {
    expect(comp).toBeTruthy();
  });

  it('crear ruleta llama al servicio y actualiza rid', () => {
    svc.create.and.returnValue(of({ id: 'RID' } as any));
    comp.create();
    expect(svc.create).toHaveBeenCalled();
    expect(comp.rid).toBe('RID');
  });

  it('listar ruletas llena el arreglo', () => {
    svc.list.and.returnValue(of([{ id: 'A', status: 'closed', totalBets: 0 }]));
    comp.loadRoulettes(); 
    expect(svc.list).toHaveBeenCalled();
    expect(comp.roulettes.length).toBe(1);
  });
});


