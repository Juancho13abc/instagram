import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'feed',
        loadComponent: () => import('../pages/feed/feed.page').then(m => m.FeedPage)
      },
      {
        path: 'search',
        loadComponent: () => import('../pages/friends/friends.page').then(m => m.FriendsPage)
      },
      {
        path: 'new-post',
        loadComponent: () => import('../pages/new-post/new-post.page').then(m => m.NewPostPage)
      },
      {
        path: 'chats',
        loadComponent: () => import('../pages/conversations/conversations.page').then(m => m.ConversationsPage)
      },
      {
        path: 'my-profile',
        loadComponent: () => import('../pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full'
      }
    ]
  }
];
