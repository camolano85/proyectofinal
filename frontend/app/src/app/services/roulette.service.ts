import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateResponse { id: string; }

@Injectable({ providedIn: 'root' })
export class RouletteService {
  private http = inject(HttpClient);
  // Ruta relativa: Nginx la proxifica al backend
  private readonly api = '/api/roulettes';

  list(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  create(): Observable<CreateResponse> {
    return this.http.post<CreateResponse>(this.api, {});
  }

  open(id: string): Observable<any> {
    return this.http.patch(`${this.api}/${id}/open`, {});
  }

  betNumber(id: string, amount: number, number: number): Observable<any> {
    return this.http.post(`${this.api}/${id}/bets`, { amount, number });
  }

  betColor(id: string, amount: number, color: 'rojo' | 'negro'): Observable<any> {
    return this.http.post(`${this.api}/${id}/bets`, { amount, color });
  }

  close(id: string): Observable<any> {
    return this.http.patch(`${this.api}/${id}/close`, {});
  }
}

