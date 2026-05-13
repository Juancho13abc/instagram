import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes)
  },
  {
    path: 'feed',
    redirectTo: 'tabs/feed',
    pathMatch: 'full'
  },
  {
    path: 'friends',
    redirectTo: 'tabs/search',
    pathMatch: 'full'
  },
  {
    path: 'new-post',
    redirectTo: 'tabs/new-post',
    pathMatch: 'full'
  },
  {
    path: 'chats',
    redirectTo: 'tabs/chats',
    pathMatch: 'full'
  },
  {
    path: 'my-profile',
    redirectTo: 'tabs/my-profile',
    pathMatch: 'full'
  },
  // Edit profile (must be before profile/:id)
  {
    path: 'profile/edit',
    loadComponent: () => import('./pages/profile-edit/profile-edit.page').then(m => m.ProfileEditPage)
  },
  // View another user's profile
  {
    path: 'profile/:id',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  // Chat with a specific user
  {
    path: 'chat/:id',
    loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage)
  },
  // Full-screen stories viewer
  {
    path: 'stories/:id',
    loadComponent: () => import('./pages/stories/stories.page').then(m => m.StoriesPage)
  },
  // Notifications page
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.page').then(m => m.NotificationsPage)
  }
];
