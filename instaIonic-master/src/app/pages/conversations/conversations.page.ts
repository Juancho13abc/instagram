import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { paperPlaneOutline, chatbubbleOutline } from 'ionicons/icons';
import { forkJoin, of, catchError } from 'rxjs';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { StateService } from '../../services/state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.page.html',
  styleUrls: ['./conversations.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, CommonModule]
})
export class ConversationsPage implements OnInit {
  conversations: any[] = [];
  friends: any[] = [];
  currentUserId: number | null = null;

  constructor(private api: Api, private auth: Auth, private router: Router, private state: StateService) {
    addIcons({ paperPlaneOutline, chatbubbleOutline });
  }

  ngOnInit() {
    const me = this.auth.getUser();
    this.currentUserId = me?.id || null;
    // Show caches immediately
    if (this.state.conversations.length > 0) this.conversations = this.state.conversations;
    if (this.state.friends.length > 0) this.friends = this.state.friends;
    // Load both together, then enrich conversations with friend data
    forkJoin({
      convs: this.api.getConversations().pipe(catchError(() => of([]))),
      friends: this.api.getFriends().pipe(catchError(() => of([])))
    }).subscribe(({ convs, friends }) => {
      this.friends = (friends as any[]).map((f: any) => ({
        ...f,
        profile: f.profile ? {
          ...f.profile,
          avatar: this.api.getStorageUrl(f.profile.avatar || '')
        } : f.profile
      }));
      this.state.friends = this.friends;

      // Build lookup map: userId → friend
      const friendMap: { [id: number]: any } = {};
      this.friends.forEach(f => { if (f.id) friendMap[f.id] = f; });

      this.conversations = (convs as any[]).map((conv: any) => {
        // Resolve the other user from multiple possible fields
        const other = conv.other_user
          || (conv.participants || []).find((p: any) => p.id !== this.currentUserId)
          || null;
        const otherId = other?.id || conv.user_id || conv.recipient_id;

        // Enrich with friend data if profile is missing
        if (otherId && friendMap[otherId] && !other?.profile?.username) {
          const friend = friendMap[otherId];
          return { ...conv, other_user: { ...other, ...friend } };
        }
        if (other && !conv.other_user) {
          return { ...conv, other_user: other };
        }
        return conv;
      });

      this.state.conversations = this.conversations;
      const unread = this.conversations.reduce((s, c) => s + (c.unread_count || 0), 0);
      this.state.setMsgs(unread);
    });
  }

  openChatWithFriend(friend: any) {
    this.state.activeConv = null;
    this.router.navigateByUrl(`/chat/${friend.id}`);
  }

  openChat(conv: any) {
    this.state.activeConv = conv;
    const other = (conv.participants || []).find((p: any) => p.id !== this.currentUserId);
    const userId = other?.id
      || conv.other_user?.id
      || conv.user_id
      || conv.recipient_id
      || conv.partner_id
      || conv.to_user_id;
    if (userId) {
      this.router.navigateByUrl(`/chat/${userId}`);
    } else {
      // No user ID in conv object — navigate using conv.id; chat page resolves from state
      this.router.navigateByUrl(`/chat/${conv.id}`);
    }
  }

  imgUrl(path: string) {
    return this.api.getStorageUrl(path);
  }
}
