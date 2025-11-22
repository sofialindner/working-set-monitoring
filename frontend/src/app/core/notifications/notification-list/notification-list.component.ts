import { Component, signal } from '@angular/core';
import { AppNotification, NotificationService } from '../notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent {
  constructor(public notifications: NotificationService) {}
}
