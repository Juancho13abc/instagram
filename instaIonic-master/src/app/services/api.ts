import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from './auth';
import { environment } from '../../environments/environment';

function resolveBase(): string {
  // APK/Capacitor producción: usa la IP fija del environment
  if (environment.apiBaseUrl) return environment.apiBaseUrl;
  // Navegador: usa el hostname actual (funciona en PC y celulares en la misma red)
  const host = window.location.hostname;
  return `http://${host}:8000/`;
}

@Injectable({
  providedIn: 'root',
})
export class Api {

  private base = resolveBase();
  private apiUrl = this.base + 'api/';
  private storageUrl = this.base + 'storage/';

  constructor(private http: HttpClient, private auth: Auth) {}

  private authHeaders() {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  getFeed() {
    return this.http.get<any>(this.apiUrl + 'posts', this.authHeaders());
  }

  getFriends() {
    return this.http.get<any>(this.apiUrl + 'friends', this.authHeaders());
  }

  likePost(id: number) {
    return this.http.post(this.apiUrl + `posts/${id}/like`, {}, this.authHeaders());
  }

  createPost(file: File, caption: string, options?: { isStory?: boolean; location?: string }) {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('caption', caption);
    if (options?.isStory) fd.append('is_story', '1');
    if (options?.location) fd.append('location', options.location);
    return this.http.post(this.apiUrl + 'posts', fd, this.authHeaders());
  }

  getStorageUrl(path: string) {
    if (!path) return 'https://placehold.co/800x600?text=No+Image';
    if (path.includes('placehold.co')) {
      return path;
    }
    if (path.startsWith('http') && !path.includes('/storage/')) {
      return path;
    }
    if (path.includes('/storage/')) {
      return path.replace(/^https?:\/\/[^/]+\/storage\//, this.storageUrl);
    }
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return this.storageUrl + cleanPath;
  }

  commentPost(postId: number, content: string) {
    return this.http.post(
      this.apiUrl + `posts/${postId}/comments`,
      { content },
      this.authHeaders()
    );
  }

  getComments(postId: number) {
    return this.http.get<any[]>(
      this.apiUrl + `posts/${postId}/comments`,
      this.authHeaders()
    );
  }

  sendFriendRequest(userId: number) {
    return this.http.post(this.apiUrl + `users/${userId}/friend`, {}, this.authHeaders());
  }

  getPendingFriendRequests() {
    return this.http.get<any>(this.apiUrl + `friendships/pending`, this.authHeaders());
  }

  acceptFriendship(friendshipId: number) {
    return this.http.post(this.apiUrl + `friendships/${friendshipId}/accept`, {}, this.authHeaders());
  }

  searchUsers(username: string) {
    return this.http.get<any[]>(this.apiUrl + `users/search?username=${username}`, this.authHeaders());
  }

  sendFriendRequestByUserId(userId: number) {
    return this.http.post(this.apiUrl + `users/${userId}/friend`, {}, this.authHeaders());
  }

  getUser(userId: number) {
    return this.http.get<any>(this.apiUrl + `users/${userId}`, this.authHeaders());
  }

  getUserPosts(userId: number) {
    return this.http.get<any[]>(this.apiUrl + `users/${userId}/posts`, this.authHeaders());
  }

  followUser(userId: number) {
    return this.http.post(this.apiUrl + `users/${userId}/follow`, {}, this.authHeaders());
  }

  unfollowUser(userId: number) {
    return this.http.delete(this.apiUrl + `users/${userId}/follow`, this.authHeaders());
  }

  isFollowing(userId: number) {
    return this.http.get<any>(this.apiUrl + `users/${userId}/is_following`, this.authHeaders());
  }

  updateProfile(formData: FormData) {
    return this.http.post(this.apiUrl + `user`, formData, this.authHeaders());
  }

  // Chat/conversations (frontend wiring)
  getConversations() {
    return this.http.get<any[]>(this.apiUrl + `conversations`, this.authHeaders());
  }

  getMessages(conversationId: number) {
    return this.http.get<any[]>(this.apiUrl + `conversations/${conversationId}/messages`, this.authHeaders());
  }

  sendMessage(toUserId: number, content: string) {
    return this.http.post(this.apiUrl + `messages`, { to_user_id: toUserId, content }, this.authHeaders());
  }

  deletePost(postId: number) {
    return this.http.delete(this.apiUrl + `posts/${postId}`, this.authHeaders());
  }

  updatePost(postId: number, data: { caption?: string; location?: string }) {
    return this.http.put(this.apiUrl + `posts/${postId}`, data, this.authHeaders());
  }

  deleteComment(postId: number, commentId: number) {
    return this.http.delete(this.apiUrl + `posts/${postId}/comments/${commentId}`, this.authHeaders());
  }

  deleteMessage(messageId: number) {
    return this.http.delete(this.apiUrl + `messages/${messageId}`, this.authHeaders());
  }

  // Stories: reuse posts with is_story flag; helper to get only stories for a user
  getUserStories(userId: number) {
    return this.getUserPosts(userId);
  }

  // Friend management
  removeFriend(userId: number) {
    return this.http.delete(this.apiUrl + `users/${userId}/friend`, this.authHeaders());
  }

  // Get unread counts (messages + friend requests)
  getUnreadMessageCount() {
    return this.http.get<any>(this.apiUrl + 'notifications/unread', this.authHeaders());
  }

  // Get notifications (friend requests, new messages, etc.)
  getNotifications(page: number = 1) {
    return this.http.get<any>(this.apiUrl + `notifications?page=${page}`, this.authHeaders());
  }

  markNotificationsRead() {
    return this.http.post(this.apiUrl + 'notifications/read', {}, this.authHeaders());
  }

  declineFriendRequest(friendshipId: number) {
    return this.http.delete(this.apiUrl + `friendships/${friendshipId}`, this.authHeaders());
  }

  // Get friendship status (pending, friends, none)
  getFriendshipStatus(userId: number) {
    return this.http.get<any>(this.apiUrl + `users/${userId}/friendship-status`, this.authHeaders());
  }

}
