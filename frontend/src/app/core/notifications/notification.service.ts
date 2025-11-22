import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  private _list = signal<AppNotification[]>([]);
  list = this._list.asReadonly();

  push(text: string, type: 'success' | 'error' | 'info' = 'info') {
    const notification: AppNotification = {
      id: ++this.counter,
      text,
      type,
      createdAt: new Date()
    };

    this._list.update(list => [...list, notification]);

    setTimeout(() => this.remove(notification.id), 5000);
  }

  remove(id: number) {
    this._list.update(list => list.filter(n => n.id !== id));
  }

  clear() {
    this._list.set([]);
  }
}
