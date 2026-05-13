import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StateService {
  msgs$  = new BehaviorSubject<number>(0);
  reqs$  = new BehaviorSubject<number>(0);
  notifs$ = new BehaviorSubject<number>(0);

  // In-memory cache — instant perceived loading
  posts: any[] = [];
  conversations: any[] = [];
  friends: any[] = [];

  // Active conversation passed from list → chat page
  activeConv: any = null;

  setMsgs(n: number)   { this.msgs$.next(Math.max(0, n)); }
  setReqs(n: number)   { this.reqs$.next(Math.max(0, n)); }
  setNotifs(n: number) { this.notifs$.next(Math.max(0, n)); }
}
