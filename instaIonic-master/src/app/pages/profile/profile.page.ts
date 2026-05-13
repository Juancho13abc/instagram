import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonIcon, IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline, bookmarkOutline, settingsOutline, filmOutline,
  personAddOutline, personRemoveOutline, cameraOutline,
  trashOutline, createOutline, closeOutline, logOutOutline,
  ellipsisHorizontal, timeOutline
} from 'ionicons/icons';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonIcon, IonInput, FormsModule, CommonModule]
})
export class ProfilePage implements OnInit {
  user: any = null;
  posts: any[] = [];
  following = false;
  loadingFollow = false;
  currentUserId: number | null = null;

  // Friend management states
  friendshipStatus: 'none' | 'pending' | 'friends' = 'none'; // 'none', 'pending', 'friends'
  loadingFriend = false;

  showSettingsSheet = false;

  // Post options
  menuPost: any = null;
  editingPost: any = null;
  editCaption = '';
  editLocation = '';

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private auth: Auth,
    private router: Router
  ) {
    addIcons({
      gridOutline, bookmarkOutline, settingsOutline, filmOutline,
      personAddOutline, personRemoveOutline, cameraOutline,
      trashOutline, createOutline, closeOutline, logOutOutline,
      ellipsisHorizontal, timeOutline
    });
  }

  ngOnInit() {
    const paramId = this.route.snapshot.paramMap.get('id');
    const me = this.auth.getUser();
    this.currentUserId = me?.id || null;
    const id = paramId ? Number(paramId) : (me?.id || 0);
    if (id) this.load(id);
  }

  load(id: number) {
    this.api.getUser(id).subscribe(res => {
      this.user = res ? {
        ...res,
        profile: res.profile ? {
          ...res.profile,
          avatar: this.api.getStorageUrl(res.profile.avatar || '')
        } : res.profile
      } : res;
    });
    this.api.getUserPosts(id).subscribe(res => {
      this.posts = (res || []).map((post: any) => ({
        ...post,
        image: this.api.getStorageUrl(post.image)
      }));
    });
    this.api.isFollowing(id).subscribe({
      next: (res: any) => { this.following = !!res?.following; },
      error: _ => { this.following = false; }
    });
    // Get friendship status (pending, friends, or none)
    this.api.getFriendshipStatus(id).subscribe({
      next: (res: any) => { 
        this.friendshipStatus = res?.status || 'none'; 
      },
      error: _ => { 
        this.friendshipStatus = 'none'; 
      }
    });
  }

  imgUrl(path: string) {
    return this.api.getStorageUrl(path);
  }

  isOwnProfile() {
    return !!(this.currentUserId && this.user && this.user.id === this.currentUserId);
  }

  toggleFollow(): void {
    if (!this.user?.id || this.loadingFollow) return;
    this.loadingFollow = true;
    
    // Optimistic update
    const wasFollowing = this.following;
    this.following = !this.following;
    
    const op = wasFollowing ? this.api.unfollowUser(this.user.id) : this.api.followUser(this.user.id);
    op.subscribe({
      next: () => { 
        this.loadingFollow = false;
      },
      error: () => { 
        // Revert optimistic update on error
        this.following = wasFollowing;
        this.loadingFollow = false;
      }
    });
  }

  goToEdit() { this.closeSettings(); this.router.navigateByUrl('/profile/edit'); }
  goToChat() { if (this.user?.id) this.router.navigateByUrl(`/chat/${this.user.id}`); }
  viewStories() { if (this.user?.id) this.router.navigateByUrl(`/stories/${this.user.id}`); }

  openSettings() { this.showSettingsSheet = true; }
  closeSettings() { this.showSettingsSheet = false; }

  logout() {
    this.closeSettings();
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  addFriend() {
    if (!this.user?.id || this.loadingFriend) return;
    this.loadingFriend = true;
    // Optimistic update
    this.friendshipStatus = 'pending';
    this.api.sendFriendRequestByUserId(this.user.id).subscribe({
      next: () => { 
        this.loadingFriend = false;
      },
      error: () => { 
        this.loadingFriend = false;
        this.friendshipStatus = 'none';
      }
    });
  }

  removeFriend() {
    if (!this.user?.id || this.loadingFriend) return;
    this.loadingFriend = true;
    // Optimistic update
    this.friendshipStatus = 'none';
    this.api.removeFriend(this.user.id).subscribe({
      next: () => { 
        this.loadingFriend = false;
      },
      error: () => { 
        this.loadingFriend = false;
        this.friendshipStatus = 'friends';
      }
    });
  }

  // ── Post options (only own profile) ──────────────
  openPostMenu(p: any, event: Event) {
    event.stopPropagation();
    this.menuPost = p;
  }

  closePostMenu() {
    this.menuPost = null;
  }

  startEdit(p: any) {
    this.editingPost = { ...p };
    this.editCaption = p.caption || '';
    this.editLocation = p.location || '';
    this.closePostMenu();
  }

  cancelEdit() {
    this.editingPost = null;
  }

  saveEdit() {
    if (!this.editingPost) return;
    this.api.updatePost(this.editingPost.id, {
      caption: this.editCaption,
      location: this.editLocation
    }).subscribe({
      next: () => {
        const idx = this.posts.findIndex(x => x.id === this.editingPost.id);
        if (idx >= 0) {
          this.posts[idx] = { ...this.posts[idx], caption: this.editCaption, location: this.editLocation };
        }
        this.editingPost = null;
      },
      error: () => { this.editingPost = null; }
    });
  }

  deletePost(p: any) {
    this.closePostMenu();
    if (!confirm('¿Eliminar esta publicación?')) return;
    this.api.deletePost(p.id).subscribe({
      next: () => { this.posts = this.posts.filter(x => x.id !== p.id); },
      error: () => {}
    });
  }
}
