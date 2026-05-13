import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonRouterOutlet, IonBadge } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, addOutline, paperPlaneOutline, personCircleOutline } from 'ionicons/icons';
import { Api } from '../services/api';
import { Auth } from '../services/auth';
import { StateService } from '../services/state';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonRouterOutlet, IonBadge, CommonModule]
})
export class TabsPage implements OnInit, OnDestroy {
  msgs = 0;
  reqs = 0;
  private subs: Subscription[] = [];
  private poll?: any;

  constructor(
    private api: Api,
    private auth: Auth,
    public state: StateService
  ) {
    addIcons({ homeOutline, searchOutline, addOutline, paperPlaneOutline, personCircleOutline });
  }

  ngOnInit() {
    this.subs.push(
      this.state.msgs$.subscribe(n => this.msgs = n),
      this.state.reqs$.subscribe(n => this.reqs = n)
    );
    this.refresh();
    this.poll = setInterval(() => this.refresh(), 30000);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    if (this.poll) clearInterval(this.poll);
  }

  refresh() {
    if (!this.auth.getToken()) return;
    this.api.getConversations().subscribe({
      next: (res: any) => {
        const n = (res || []).reduce((s: number, c: any) => s + (c.unread_count || 0), 0);
        this.state.setMsgs(n);
        this.state.conversations = res || [];
      },
      error: () => {}
    });
    this.api.getPendingFriendRequests().subscribe({
      next: (res: any) => {
        this.state.setReqs((res || []).length);
      },
      error: () => {}
    });
  }

  tabChanged() { this.refresh(); }
}
