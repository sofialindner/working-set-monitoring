import { Injectable, signal, effect } from '@angular/core';
import { WebSocketService } from '../../../core/websocket';

interface ConsoleLog {
  type: 'info' | 'error' | 'success';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class HeuristicsStore {
  consoleLogs = signal<ConsoleLog[]>([]);

  constructor(ws: WebSocketService) {
    effect(() => {
      const msg = ws.message();
      if (msg?.logs) this.consoleLogs.set(msg.logs);
    });
  }
}