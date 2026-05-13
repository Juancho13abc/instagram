import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonBackButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { sendOutline, trashOutline } from 'ionicons/icons';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { StateService } from '../../services/state';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonBackButton, IonButtons, IonIcon, FormsModule, CommonModule]
})
export class ChatPage implements OnInit {
  @ViewChild('messageList') messageList!: ElementRef;

  otherUserId: number | null = null;
  otherUser: any = null;
  messages: any[] = [];
  newMsg = '';
  currentUserId: number | null = null;
  private convId: number | null = null;

  // which message shows the delete button
  activeMessageId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private auth: Auth,
    private state: StateService
  ) {
    addIcons({ sendOutline, trashOutline });
  }

  ngOnInit() {
    const paramId = Number(this.route.snapshot.paramMap.get('id'));
    const me = this.auth.getUser();
    this.currentUserId = me?.id || null;

    // Use the conversation stored by conversations.page when navigating here
    const activeConv = this.state.activeConv;
    if (activeConv) {
      this.convId = activeConv.id || null;
      const other = (activeConv.participants || [])
        .find((p: any) => p.id !== this.currentUserId);
      this.otherUserId = other?.id
        || activeConv.other_user?.id
        || activeConv.user_id
        || activeConv.recipient_id
        || (paramId !== activeConv.id ? paramId : null);
      // Load other user info from API if we have userId, otherwise from conv
      if (this.otherUserId) {
        this.loadOtherUser();
      } else if (activeConv.other_user) {
        this.otherUser = activeConv.other_user;
      }
      this.loadMessagesByConvId(this.convId!);
    } else {
      // Opened directly (e.g. from friend list)
      if (paramId) this.otherUserId = paramId;
      if (this.otherUserId) {
        this.loadOtherUser();
        this.loadMessages();
      }
    }
  }

  loadOtherUser() {
    if (!this.otherUserId) return;
    this.api.getUser(this.otherUserId).subscribe({
      next: (res: any) => {
        this.otherUser = res ? {
          ...res,
          profile: res.profile ? {
            ...res.profile,
            avatar: this.api.getStorageUrl(res.profile.avatar || '')
          } : res.profile
        } : res;
      }
    });
  }

  loadMessagesByConvId(convId: number) {
    this.api.getMessages(convId).subscribe({
      next: (m: any) => { this.messages = m || []; this.scrollToBottom(); },
      error: () => { this.messages = []; }
    });
  }

  loadMessages() {
    if (!this.otherUserId) return;
    // Use cached convId if available
    if (this.convId) {
      this.loadMessagesByConvId(this.convId);
      return;
    }
    this.api.getConversations().subscribe({
      next: (res: any) => {
        const conv = (res || []).find((c: any) =>
          c.participants?.some((p: any) => p.id === this.otherUserId) ||
          c.other_user?.id === this.otherUserId
        );
        if (conv) {
          this.convId = conv.id;
          this.api.getMessages(conv.id).subscribe({
            next: (m: any) => { this.messages = m || []; this.scrollToBottom(); }
          });
        } else {
          this.messages = [];
        }
      },
      error: () => { this.messages = []; }
    });
  }

  send() {
    if (!this.otherUserId || !this.newMsg.trim()) return;
    const content = this.newMsg.trim();
    this.newMsg = '';
    this.api.sendMessage(this.otherUserId, content).subscribe({
      next: (res: any) => {
        this.messages.push(res);
        this.scrollToBottom();
      },
      error: () => {}
    });
  }

  isOwnMessage(msg: any): boolean {
    return msg.from_user_id === this.currentUserId ||
           msg.from?.id === this.currentUserId ||
           msg.user_id === this.currentUserId;
  }

  toggleMessageMenu(msg: any) {
    if (!this.isOwnMessage(msg)) return;
    this.activeMessageId = this.activeMessageId === msg.id ? null : msg.id;
  }

  deleteMessage(msg: any) {
    this.activeMessageId = null;
    this.api.deleteMessage(msg.id).subscribe({
      next: () => { this.messages = this.messages.filter(m => m.id !== msg.id); },
      error: () => {}
    });
  }

  imgUrl(path: string) {
    return this.api.getStorageUrl(path);
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageList?.nativeElement) {
        this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
