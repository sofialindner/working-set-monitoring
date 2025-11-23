import { Injectable, signal, effect } from '@angular/core';
import { WebSocketService } from '../../../core/websocket';

interface ConsoleLog {
  type: 'info' | 'error' | 'success';
  timestamp: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class HeuristicsStore {
  workingSetLimit = signal<number | null>(null);
  consoleLogs = signal<ConsoleLog[]>([]);

  constructor(ws: WebSocketService) {
    effect(() => {
      const msg = ws.message();
      if (!msg?.logs) return;

      const MAX_LOGS = 200;
      this.consoleLogs.update((current) => {
        const merged = current.concat(msg.logs);

        if (merged.length > MAX_LOGS) {
          return merged.slice(merged.length - MAX_LOGS);
        }

        return merged;
      });
    });
  }
}
