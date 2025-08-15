import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material (los que usa el template)
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { RouletteService } from './services/roulette.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatToolbarModule, MatCardModule,
    MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Ruleta de Apuestas';

  // estado
  rid: string | null = null;
  lastResponse: any = null;
  roulettes: any[] = [];

  // formulario simple para apuestas
  numberAmount: number | null = null;
  numberValue: number | null = null;

  colorAmount: number | null = null;
  colorSelected: 'rojo' | 'negro' | '' = '';

  constructor(private svc: RouletteService) {}

  /** Crea una ruleta y guarda el RID */
  create(): void {
    this.svc.create().subscribe({
      next: (res: any) => {
        this.rid = res?.id ?? null;
        this.lastResponse = res;
      },
      error: (err) => (this.lastResponse = { error: true, err }),
    });
  }

  /** Abre la ruleta actual */
  open(): void {
    if (!this.rid) return;
    this.svc.open(this.rid).subscribe({
      next: (res) => (this.lastResponse = res),
      error: (err) => (this.lastResponse = { error: true, err }),
    });
  }

  /** Apuesta por número (0–36) */
  betNumber(): void {
    if (!this.rid || this.numberAmount == null || this.numberValue == null) return;
    this.svc
      .betNumber(this.rid, this.numberAmount, this.numberValue)
      .subscribe({
        next: (res) => (this.lastResponse = res),
        error: (err) => (this.lastResponse = { error: true, err }),
      });
  }

  /** Apuesta por color (rojo/negro) */
  betColor(): void {
    if (!this.rid || !this.colorSelected || this.colorAmount == null) return;
    this.svc
      .betColor(this.rid, this.colorAmount, this.colorSelected)
      .subscribe({
        next: (res) => (this.lastResponse = res),
        error: (err) => (this.lastResponse = { error: true, err }),
      });
  }

  /** Cierra la ruleta: devuelve resultados y recarga listado */
  close(): void {
    if (!this.rid) return;
    this.svc.close(this.rid).subscribe({
      next: (res) => {
        this.lastResponse = res;
        this.loadRoulettes();
      },
      error: (err) => (this.lastResponse = { error: true, err }),
    });
  }

  /** Lista ruletas para la tabla/tarjeta inferior */
  loadRoulettes(): void {
    this.svc.list().subscribe({
      next: (rows) => (this.roulettes = rows ?? []),
      error: () => (this.roulettes = []),
    });
  }
}



