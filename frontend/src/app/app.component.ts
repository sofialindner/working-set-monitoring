import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebSocketService } from './core/websocket';
import { NotificationListComponent } from "@core/notifications";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';

  constructor(private ws: WebSocketService) {
    this.ws.connect();
  }
}
