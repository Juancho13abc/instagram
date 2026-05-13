import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonIcon, IonButton, IonList, IonItem,
  IonAvatar, IonLabel, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  checkmarkOutline, closeOutline, heartOutline, 
  notificationsOutline, paperPlaneOutline, arrowForwardOutline
} from 'ionicons/icons';
import { Api } from '../../services/api';
import { StateService } from '../../services/state';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonIcon, IonButton, IonList, IonItem,
    IonAvatar, IonLabel, IonSpinner,
    FormsModule, CommonModule
  ]
})
export class NotificationsPage implements OnInit {
  notifications: any[] = [];
  loading = true;
  acting: { [key: string]: boolean } = {};

  constructor(
    private api: Api,
    private router: Router,
    private state: StateService
  ) {
    addIcons({
      checkmarkOutline, closeOutline, heartOutline,
      notificationsOutline, paperPlaneOutline, arrowForwardOutline
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    // Load pending friend requests first (always works)
    this.api.getPendingFriendRequests().subscribe({
      next: (pending: any) => {
        const reqNotifs = (pending || []).map((r: any) => ({
          id: 'req_' + r.id,
          type: 'friend_request',
          friendship_id: r.id,
          sender: r.user || r.sender || {},
          created_at: r.created_at || ''
        }));
        // Try server notifications
        this.api.getNotifications().subscribe({
          next: (data: any) => {
            const serverNotifs = (data?.data || data || [])
              .filter((n: any) => n.type !== 'friend_request');
            this.notifications = [...reqNotifs, ...serverNotifs];
            this.loading = false;
            this.state.setNotifs(this.notifications.length);
          },
          error: () => {
            this.notifications = reqNotifs;
            this.loading = false;
            this.state.setNotifs(reqNotifs.length);
          }
        });
      },
      error: () => { this.notifications = []; this.loading = false; }
    });
  }

  imgUrl(path: string) { return this.api.getStorageUrl(path || ''); }

  getNotificationMessage(notif: any): string {
    const name = notif.sender?.name || notif.actor?.name || 'Alguien';
    switch (notif.type) {
      case 'friend_request': return `${name} te envió una solicitud de amistad`;
      case 'message':        return `${name}: ${notif.content || 'nuevo mensaje'}`;
      case 'like':           return `${name} le gustó tu publicación`;
      case 'comment':        return `${name} comentó tu publicación`;
      default:               return notif.message || 'Nueva notificación';
    }
  }

  acceptFriendRequest(notif: any) {
    const fid = notif.friendship_id;
    if (!fid || this.acting[notif.id]) return;
    this.acting[notif.id] = true;
    this.api.acceptFriendship(fid).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
        this.state.setReqs(Math.max(0, this.state.reqs$.value - 1));
        this.acting[notif.id] = false;
      },
      error: () => { this.acting[notif.id] = false; }
    });
  }

  rejectFriendRequest(notif: any) {
    const fid = notif.friendship_id;
    if (!fid || this.acting[notif.id]) return;
    this.acting[notif.id] = true;
    this.api.declineFriendRequest(fid).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
        this.state.setReqs(Math.max(0, this.state.reqs$.value - 1));
        this.acting[notif.id] = false;
      },
      error: () => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
        this.acting[notif.id] = false;
      }
    });
  }

  goToMessage(notif: any) {
    if (notif.sender?.id) this.router.navigateByUrl(`/chat/${notif.sender.id}`);
  }

  goToProfile(notif: any) {
    const id = notif.sender?.id || notif.actor?.id;
    if (id) this.router.navigateByUrl(`/profile/${id}`);
  }

  timeAgo(d: string): string {
    if (!d) return '';
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60)     return 'ahora';
    if (s < 3600)   return `${Math.floor(s / 60)}m`;
    if (s < 86400)  return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  }
}
