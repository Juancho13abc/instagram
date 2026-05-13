import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonBackButton, IonButtons, FormsModule, CommonModule]
})
export class ProfileEditPage implements OnInit {
  name = '';
  username = '';
  bio = '';
  avatarFile: File | null = null;
  avatarPreview = '';

  constructor(private api: Api, private auth: Auth, private router: Router) {}

  ngOnInit() {
    const user = this.auth.getUser();
    if (user) {
      this.name = user.name || '';
      this.username = user.username || '';
      this.bio = user.bio || user.profile?.bio || '';
      this.avatarPreview = user.profile?.avatar || '';
    }
  }

  onFileChange(ev: any) {
    const f = ev.target.files?.[0];
    if (!f) return;
    this.avatarFile = f;
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview = String(reader.result);
    reader.readAsDataURL(f);
  }

  save() {
    const fd = new FormData();
    if (this.avatarFile) fd.append('avatar', this.avatarFile);
    fd.append('name', this.name);
    fd.append('username', this.username);
    fd.append('bio', this.bio);
    this.api.updateProfile(fd).subscribe({
      next: (res: any) => {
        if (res.user) this.auth.setUser(res.user);
        this.router.navigateByUrl('/tabs/my-profile', { replaceUrl: true });
      },
      error: () => alert('Error al actualizar perfil')
    });
  }
}
