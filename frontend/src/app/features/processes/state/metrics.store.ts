import { Injectable, signal, effect } from '@angular/core';
import { WebSocketService } from '../../../core/websocket';

@Injectable({ providedIn: 'root' })
export class MetricsStore {
  totals = signal<any | null>(null);

  constructor(ws: WebSocketService) {
    effect(() => {
      const msg = ws.message();
      if (msg?.totals) this.totals.set(msg.totals);
    });
  }
}
