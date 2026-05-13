import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonImg, IonButtons, IonBackButton, IonIcon, IonCol, IonGrid, IonRow, IonSegment, IonSegmentButton, IonLabel, IonText } from '@ionic/angular/standalone';
import { Api } from '../../services/api';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { addIcons } from 'ionicons';
import { camera, fileTray, cloudUpload } from 'ionicons/icons';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
  standalone: true,
  imports: [IonRow, 
    IonGrid, IonCol, IonIcon, IonBackButton, IonImg, IonHeader, 
    IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, FormsModule, IonButtons, CommonModule,
    IonSegment, IonSegmentButton, IonLabel, IonText
  ]
})
export class NewPostPage implements OnInit {

  caption = '';
  location = '';
  isStory = false;
  file?: File;
  preview?: string;

  constructor(private api: Api, private router: Router) {
    addIcons({camera,fileTray,cloudUpload,});
  }
  
  ngOnInit() {}

  onFileChange(ev: any) {
    const f = ev.target.files[0];
    if (!f) return;
    this.file = f;
    this.preview = URL.createObjectURL(f);
  }

  upload() {
    if (!this.file) return;
    this.api.createPost(this.file, this.caption, {
      isStory: this.isStory,
      location: this.location.trim() || undefined
    }).subscribe(() => {
      this.router.navigateByUrl('/tabs/feed');
    });
  }

  async takePhoto() {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    this.preview = photo.dataUrl || undefined;
    // convertir a File
    if (photo.dataUrl) {
      this.file = this.dataUrlToFile(photo.dataUrl, 'photo.jpg');
    }
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

}
