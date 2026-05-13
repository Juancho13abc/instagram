import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import { Api } from '../../services/api';
import { StateService } from '../../services/state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonSpinner, IonIcon, FormsModule, CommonModule]
})
export class FriendsPage implements OnInit {

  friends: any[] = [];
  pending: any[] = [];
  searchResults: any[] = [];
  searchTerm = '';
  searching = false;

  constructor(private api: Api, private router: Router, private state: StateService) {
    addIcons({ searchOutline });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    if (this.state.friends.length > 0) this.friends = this.state.friends;
    this.api.getFriends().subscribe({
      next: res => {
        this.friends = (res || []).map((friend: any) => ({
          ...friend,
          profile: friend.profile ? {
            ...friend.profile,
            avatar: this.api.getStorageUrl(friend.profile.avatar || '')
          } : friend.profile
        }));
        this.state.friends = this.friends;
      }
    });
    this.api.getPendingFriendRequests().subscribe({
      next: res => {
        this.pending = res || [];
        this.state.setReqs(this.pending.length);
      }
    });
  }

  search(event: any) {
    const username = event.detail.value || '';
    this.searchTerm = username;

    if (!username || username.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searching = true;
    this.api.searchUsers(username).subscribe({
      next: res => {
        this.searchResults = (res || []).map((user: any) => ({
          ...user,
          profile: user.profile ? {
            ...user.profile,
            avatar: this.api.getStorageUrl(user.profile.avatar || '')
          } : user.profile
        }));
        this.searching = false;
      },
      error: () => { this.searching = false; }
    });
  }

  addFriend(user: any) {
    this.api.sendFriendRequestByUserId(user.id).subscribe({
      next: () => {
        this.searchTerm = '';
        this.searchResults = [];
        this.load();
      }
    });
  }

  accept(req: any) {
    this.api.acceptFriendship(req.id).subscribe({
      next: () => {
        this.pending = this.pending.filter(r => r.id !== req.id);
        this.state.setReqs(Math.max(0, this.state.reqs$.value - 1));
        this.load();
      }
    });
  }

  decline(req: any) {
    this.api.declineFriendRequest(req.id).subscribe({
      next: () => {
        this.pending = this.pending.filter(r => r.id !== req.id);
        this.state.setReqs(Math.max(0, this.state.reqs$.value - 1));
      },
      error: () => {
        this.pending = this.pending.filter(r => r.id !== req.id);
        this.state.setReqs(Math.max(0, this.state.reqs$.value - 1));
      }
    });
  }

  goToProfile(user: any) {
    if (!user) return;
    const id = user.id || user.user?.id;
    if (!id) return;
    this.router.navigateByUrl(`/profile/${id}`);
  }
}
