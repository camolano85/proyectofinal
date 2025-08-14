import { Component, inject } from '@angular/core';
import { CommonModule, JsonPipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule }  from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }   from '@angular/material/input';
import { MatSelectModule }  from '@angular/material/select';
import { MatCardModule }    from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { RouletteService } from './services/roulette.service';
import { firstValueFrom } from 'rxjs';

type CreateResponse = { id: string };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // Angular
    CommonModule, NgIf, NgFor, JsonPipe, ReactiveFormsModule,
    // Material
    MatToolbarModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCardModule, MatDividerModule,
    MatProgressBarModule, MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Ruleta de Apuestas';

  private fb   = inject(FormBuilder);
  private api  = inject(RouletteService);
  private snack = inject(MatSnackBar);

  // Estado UI
  loading = false;
  isOpen  = false;
  rid: string | null = null;
  data: any[] = [];
  lastResponse: any = null;
  showJson = false;

  // Formularios
  numberBetForm = this.fb.nonNullable.group({
    amount: [100, [Validators.required, Validators.min(1), Validators.max(10000)]],
    number: [0,   [Validators.required, Validators.min(0), Validators.max(36)]],
  });

  colorBetForm = this.fb.nonNullable.group({
    amount: [100, [Validators.required, Validators.min(1), Validators.max(10000)]],
    color:  ['rojo', Validators.required],
  });

  // Helpers visuales para el resultado
  get lastResult(): any | null {
    const r: any = this.lastResponse;
    return r && typeof r.winningNumber !== 'undefined' ? r : null;
  }
  get winnerNumber(): number | null {
    return this.lastResult?.winningNumber ?? null;
  }
  get winnerColor(): 'rojo' | 'negro' | null {
    return this.lastResult?.winningColor ?? null;
  }

  // --- Acciones ---
  private setLoading(v: boolean) { this.loading = v; }
  private toast(msg: string) { this.snack.open(msg, 'Cerrar', { duration: 2500 }); }
  private handleHttpError(e: any) {
    const code = e?.status;
    const map: Record<number, string> = {
      400: 'Solicitud inválida. Revisa el formulario.',
      404: 'Recurso no encontrado.',
      409: 'La ruleta no está abierta o la apuesta no es válida.',
      500: 'Error en el servidor. Intenta de nuevo.'
    };
    this.toast(map[code] ?? 'Error inesperado');
    throw e;
  }

  async list() {
    this.setLoading(true);
    try {
      this.data = await firstValueFrom(this.api.list()) as any[];
    } finally { this.setLoading(false); }
  }

  async create() {
    this.setLoading(true);
    try {
      const r = await firstValueFrom(this.api.create()) as CreateResponse;
      this.rid = r?.id ?? null;
      this.isOpen = false;
      this.lastResponse = null;
      this.toast('Ruleta creada');
    } finally { this.setLoading(false); }
  }

  async open() {
    if (!this.rid) return this.toast('Crea una ruleta primero');
    this.setLoading(true);
    try {
      const r: any = await firstValueFrom(this.api.open(this.rid));
      this.isOpen = r?.status === 'open';
      this.toast('Ruleta abierta');
    } catch (e) { this.handleHttpError(e); }
    finally { this.setLoading(false); }
  }

  async betNumber() {
    if (!this.rid) return this.toast('Crea una ruleta primero');
    this.setLoading(true);
    try {
      const { amount, number } = this.numberBetForm.value as any;
      this.lastResponse = await firstValueFrom(this.api.betNumber(this.rid, amount, number));
      this.toast('Apuesta al número registrada');
    } catch (e) { this.handleHttpError(e); }
    finally { this.setLoading(false); }
  }

  async betColor() {
    if (!this.rid) return this.toast('Crea una ruleta primero');
    this.setLoading(true);
    try {
      const { amount, color } = this.colorBetForm.value as any;
      this.lastResponse = await firstValueFrom(this.api.betColor(this.rid, amount, color));
      this.toast('Apuesta al color registrada');
    } catch (e) { this.handleHttpError(e); }
    finally { this.setLoading(false); }
  }

  async close() {
    if (!this.rid) return this.toast('Crea una ruleta primero');
    this.setLoading(true);
    try {
      this.lastResponse = await firstValueFrom(this.api.close(this.rid));
      this.isOpen = false;
      this.showJson = false;
      this.toast('Ruleta cerrada');
    } catch (e) { this.handleHttpError(e); }
    finally { this.setLoading(false); }
  }
}

