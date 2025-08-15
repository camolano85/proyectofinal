import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouletteService } from './services/roulette.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // <- ¡PÚBLICOS! (para que el test pueda leerlos)
  public rid = '';
  public roulettes: Array<{ id: string; status: string; totalBets: number }> = [];

  // (resto de estados de tu UI, si los tienes)
  public numberAmount = 0;
  public numberValue = 0;
  public colorAmount = 0;
  public colorValue: 'rojo' | 'negro' = 'rojo';

  constructor(private svc: RouletteService) {}

  public create() {
    this.svc.create().subscribe(({ id }) => {
      this.rid = id;
    });
  }

  public loadRoulettes() {
    this.svc.list().subscribe((rows) => (this.roulettes = rows));
  }

  public open() {
    if (!this.rid) return;
    this.svc.open(this.rid).subscribe();
  }

  public betNumber() {
    if (!this.rid) return;
    this.svc.betNumber(this.rid, this.numberAmount, this.numberValue).subscribe();
  }

  public betColor() {
    if (!this.rid) return;
    this.svc.betColor(this.rid, this.colorAmount, this.colorValue).subscribe();
  }

  public close() {
    if (!this.rid) return;
    this.svc.close(this.rid).subscribe();
  }
}


