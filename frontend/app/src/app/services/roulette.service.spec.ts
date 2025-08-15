import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouletteService } from './roulette.service';

describe('RouletteService', () => {
  let service: RouletteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RouletteService],
    });
    service = TestBed.inject(RouletteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list()', () => {
    service.list().subscribe((res) => expect(Array.isArray(res)).toBeTrue());
    const req = httpMock.expectOne('/api/roulettes');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create()', () => {
    service.create().subscribe((res) => expect(res).toEqual({ id: 'X' }));
    const req = httpMock.expectOne('/api/roulettes');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'X' });
  });

  it('open()', () => {
    service.open('RID').subscribe((res) =>
      expect(res).toEqual({ id: 'RID', status: 'open' }),
    );
    const req = httpMock.expectOne('/api/roulettes/RID/open');
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 'RID', status: 'open' });
  });

  it('betNumber()', () => {
    service.betNumber('RID', 100, 7).subscribe((res) => expect(res).toEqual({ ok: true }));
    const req = httpMock.expectOne('/api/roulettes/RID/bets');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ amount: 100, number: 7 });
    req.flush({ ok: true });
  });

  it('betColor()', () => {
    service.betColor('RID', 80, 'rojo').subscribe((res) => expect(res).toEqual({ ok: true }));
    const req = httpMock.expectOne('/api/roulettes/RID/bets');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ amount: 80, color: 'rojo' });
    req.flush({ ok: true });
  });

  it('close()', () => {
    service.close('RID').subscribe((res) =>
      expect(res).toEqual({ id: 'RID', winningNumber: 12 }),
    );
    const req = httpMock.expectOne('/api/roulettes/RID/close');
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 'RID', winningNumber: 12 });
  });
});
