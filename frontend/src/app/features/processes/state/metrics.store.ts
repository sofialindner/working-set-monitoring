import { Injectable, signal, effect } from '@angular/core';
import { WebSocketService } from '../../../core/websocket';

@Injectable({ providedIn: 'root' })
export class MetricsStore {
  totalProcesses = signal<number | null>(null);
  totalThreads = signal<number | null>(null);
  totalWorkingSetSize = signal<number | null>(null);
  totalCleaned = signal<number | null>(null);

  constructor(ws: WebSocketService) {
    effect(() => {
      const msg = ws.message();
      if (msg?.total) this.totalProcesses.set(msg.total);
      if (msg?.thread_total) this.totalProcesses.set(msg.totalThreads);
      if (msg?.working_set_kb_total) this.totalProcesses.set(msg.totalWorkingSetSize);
      if (msg?.total_cleaned) this.totalProcesses.set(msg.totalCleaned);
    });
  }
}
