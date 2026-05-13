import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSkeletonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-post-skeleton',
  template: `
    <div class="post-card skeleton">
      <!-- Post header skeleton -->
      <div class="post-header">
        <div class="post-avatar">
          <ion-skeleton-text animated class="skeleton-avatar"></ion-skeleton-text>
        </div>
        <div class="post-user-info">
          <ion-skeleton-text animated class="skeleton-text" style="width: 100px;"></ion-skeleton-text>
          <ion-skeleton-text animated class="skeleton-text" style="width: 80px; margin-top: 4px;"></ion-skeleton-text>
        </div>
      </div>

      <!-- Post image skeleton -->
      <ion-skeleton-text animated class="skeleton-image"></ion-skeleton-text>

      <!-- Actions skeleton -->
      <div class="post-actions">
        <div class="actions-left">
          <div class="action-skeleton"></div>
          <div class="action-skeleton"></div>
          <div class="action-skeleton"></div>
        </div>
      </div>

      <!-- Text content skeleton -->
      <div style="padding: 12px 16px;">
        <ion-skeleton-text animated class="skeleton-text" style="width: 100%;"></ion-skeleton-text>
        <ion-skeleton-text animated class="skeleton-text" style="width: 80%; margin-top: 8px;"></ion-skeleton-text>
      </div>
    </div>
  `,
  styles: [`
    :host {
      .post-card.skeleton {
        background: #000;
        border-bottom: 0.5px solid #262626;
        padding: 12px 0;

        .post-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px 12px;

          .post-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;

            ion-skeleton-text {
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }

          .post-user-info {
            flex: 1;

            ion-skeleton-text {
              height: 10px;
              display: block;

              &:first-child {
                margin-bottom: 6px;
              }
            }
          }
        }

        .skeleton-image {
          width: 100%;
          height: 300px;
          display: block;
          margin-bottom: 12px;
        }

        .post-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          margin-bottom: 12px;

          .action-skeleton {
            width: 24px;
            height: 24px;
            background: #1a1a1a;
            border-radius: 4px;
          }
        }
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, IonSkeletonText]
})
export class PostSkeletonComponent {}
