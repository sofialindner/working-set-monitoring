import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket!: WebSocket;

  message = signal<any | null>(null);

  connect() {
    this.socket = new WebSocket('ws://localhost:8080/ws');

    this.socket.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      this.message.set(data);
    };

    this.socket.onclose = () => {
      setTimeout(() => this.connect(), 1000);
    };
  }

  send(action: any) {
    this.socket?.send(JSON.stringify(action));
  }
}
