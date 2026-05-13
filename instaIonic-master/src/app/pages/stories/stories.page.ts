import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { Api } from '../../services/api';

@Component({
  selector: 'app-stories',
  templateUrl: './stories.page.html',
  styleUrls: ['./stories.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class StoriesPage implements OnInit, OnDestroy {
  userId: number | null = null;
  stories: any[] = [];
  currentIndex = 0;
  progress = 0;
  private timer: any = null;
  private readonly DURATION = 5000;
  private readonly TICK = 50;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api
  ) {
    addIcons({ closeOutline });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.userId = id;
    if (this.userId) this.loadStories(this.userId);
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  loadStories(userId: number) {
    this.api.getUserStories(userId).subscribe({
      next: (res: any) => {
        this.stories = (res || [])
          .filter((p: any) => p.is_story)
          .map((p: any) => ({ ...p, image: this.api.getStorageUrl(p.image) }));
        if (this.stories.length > 0) {
          this.startTimer();
        }
      },
      error: () => { this.stories = []; }
    });
  }

  startTimer() {
    this.clearTimer();
    this.progress = 0;
    this.timer = setInterval(() => {
      this.progress += (this.TICK / this.DURATION) * 100;
      if (this.progress >= 100) {
        this.next();
      }
    }, this.TICK);
  }

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  next() {
    if (this.currentIndex < this.stories.length - 1) {
      this.currentIndex++;
      this.startTimer();
    } else {
      this.close();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.startTimer();
    }
  }

  close() {
    this.clearTimer();
    this.router.navigateByUrl('/tabs/feed');
  }

  tapLeft(event: Event) {
    event.stopPropagation();
    this.prev();
  }

  tapRight(event: Event) {
    event.stopPropagation();
    this.next();
  }
}
