import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonInput, IonIcon, IonBadge
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  heartOutline, heart, chatbubbleOutline, paperPlaneOutline,
  bookmarkOutline, ellipsisHorizontal, trashOutline, createOutline,
  closeOutline, notificationsOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { StateService } from '../../services/state';
import { PostSkeletonComponent } from '../../components/post-skeleton/post-skeleton.component';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonInput, IonIcon, IonBadge,
    FormsModule, CommonModule, PostSkeletonComponent]
})
export class FeedPage implements OnInit, OnDestroy {

  posts: any[] = [];
  loadingPosts = false;
  skeletonLoaders = Array(3).fill(0);
  selectedPost: any = null;
  newComment = '';
  comments: any[] = [];
  showComments = false;
  friends: any[] = [];
  storyCounts: { [key: number]: number } = {};
  currentUser: any = null;
  unreadNotifs = 0;

  menuPost: any = null;
  editingPost: any = null;
  editCaption = '';
  editLocation = '';

  private notifSub?: Subscription;

  constructor(
    private api: Api,
    private router: Router,
    private auth: Auth,
    private state: StateService
  ) {
    addIcons({
      heartOutline, heart, chatbubbleOutline, paperPlaneOutline,
      bookmarkOutline, ellipsisHorizontal, trashOutline, createOutline,
      closeOutline, notificationsOutline
    });
  }

  ngOnInit() {
    this.currentUser = this.auth.getUser();
    this.notifSub = this.state.notifs$.subscribe(n => this.unreadNotifs = n);
    // Show cached posts instantly, then refresh in background
    if (this.state.posts.length > 0) {
      this.posts = this.state.posts;
      this.computeStoryCounts();
    }
    this.load();
  }

  ngOnDestroy() {
    this.notifSub?.unsubscribe();
  }

  load() {
    this.loadingPosts = this.posts.length === 0;
    this.api.getFeed().subscribe(res => {
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : (res?.data ?? []);
      this.posts = rows.map((post: any) => ({
        ...post,
        image: this.api.getStorageUrl(post.image),
        liked: false,
        user: post.user ? {
          ...post.user,
          profile: post.user.profile ? {
            ...post.user.profile,
            avatar: this.api.getStorageUrl(post.user.profile.avatar || '')
          } : post.user.profile
        } : post.user
      }));
      this.state.posts = this.posts; // cache for instant re-load
      this.loadingPosts = false;
      this.computeStoryCounts();
    });
    if (this.state.friends.length > 0) this.friends = this.state.friends;
    this.api.getFriends().subscribe(res => {
      this.friends = (res || []).map((friend: any) => ({
        ...friend,
        profile: friend.profile ? {
          ...friend.profile,
          avatar: this.api.getStorageUrl(friend.profile.avatar || '')
        } : friend.profile
      }));
      this.state.friends = this.friends;
    });
  }

  computeStoryCounts() {
    const counts: { [key: number]: number } = {};
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    (this.posts || []).forEach(p => {
      const uid = p.user?.id;
      if (!uid) return;
      if (p.is_story) {
        const d = p.created_at ? new Date(p.created_at) : null;
        if (!d || (now.getTime() - d.getTime()) <= dayMs) {
          counts[uid] = (counts[uid] || 0) + 1;
        }
      }
    });
    this.storyCounts = counts;
  }

  get friendsWithStories() {
    return this.friends.filter(f => (this.storyCounts[f.id] || 0) > 0);
  }

  like(p: any) {
    // Optimistic update - update UI immediately
    const wasLiked = p.liked;
    const previousLikes = [...(p.likes || [])];
    
    p.liked = !p.liked;
    if (p.liked) {
      p.likes = [...(p.likes || []), { id: Date.now() }];
    } else {
      p.likes = (p.likes || []).slice(0, -1);
    }

    // Then sync with API
    this.api.likePost(p.id).subscribe({
      next: () => {
        // API call succeeded, keep the changes
      },
      error: () => {
        // API call failed, revert the optimistic update
        p.liked = wasLiked;
        p.likes = previousLikes;
      }
    });
  }

  // ── Post options menu ──────────────────────────
  openPostMenu(p: any, event: Event) {
    event.stopPropagation();
    this.menuPost = p;
  }

  closePostMenu() {
    this.menuPost = null;
  }

  isOwnPost(p: any): boolean {
    return p.user?.id === this.currentUser?.id;
  }

  startEdit(p: any) {
    this.editingPost = p;
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
        this.editingPost.caption = this.editCaption;
        this.editingPost.location = this.editLocation;
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

  // ── Comments ──────────────────────────────────
  imgUrl(path: string) {
    return this.api.getStorageUrl(path);
  }

  onImgError(event: any) {
    try { event.target.src = 'https://placehold.co/800x600?text=No+Image'; } catch (e) {}
  }

  openComments(p: any) {
    this.selectedPost = p;
    this.showComments = true;
    this.api.getComments(p.id).subscribe({
      next: res => this.comments = res || [],
      error: _ => this.comments = []
    });
  }

  closeComments() {
    this.showComments = false;
    this.selectedPost = null;
    this.comments = [];
    this.newComment = '';
  }

  sendComment() {
    if (!this.selectedPost || !this.newComment.trim()) return;
    this.api.commentPost(this.selectedPost.id, this.newComment).subscribe({
      next: res => {
        this.comments.push(res);
        this.newComment = '';
      }
    });
  }

  canDeleteComment(c: any): boolean {
    return c.user?.id === this.currentUser?.id ||
           this.selectedPost?.user?.id === this.currentUser?.id;
  }

  deleteComment(c: any) {
    if (!this.selectedPost) return;
    this.api.deleteComment(this.selectedPost.id, c.id).subscribe({
      next: () => { this.comments = this.comments.filter(x => x.id !== c.id); },
      error: () => {}
    });
  }

  // ── Navigation ────────────────────────────────
  goToProfile(user: any) {
    if (!user) return;
    const id = user.id || user.user?.id;
    if (!id) return;
    this.closeComments();
    this.closePostMenu();
    this.router.navigateByUrl(`/profile/${id}`);
  }

  goToStories(friend: any) {
    if (!friend?.id) return;
    this.router.navigateByUrl(`/stories/${friend.id}`);
  }

  goNotifications() {
    this.router.navigateByUrl('/notifications');
  }

  goConversations() {
    this.router.navigateByUrl('/tabs/chats');
  }

  goNewStory() {
    this.router.navigateByUrl('/tabs/new-post');
  }

  myAvatarUrl() {
    const avatar = this.currentUser?.profile?.avatar || '';
    return this.api.getStorageUrl(avatar);
  }
}
