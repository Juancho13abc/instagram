import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, FormsModule, CommonModule]
})
export class LoginPage implements OnInit {

    email = ''; password = ''; name = ''; username = ''; isRegister = false; error = ''; showPass = false;

    constructor(private auth: Auth, private router: Router) {}

    ngOnInit(): void {}

    submit() {
      this.error = '';
      
      if (this.isRegister) {
        this.auth.register({
          name: this.name,
          email: this.email,
          password: this.password,
          username: this.username
        }).subscribe({
          next: res => { 
            this.auth.setToken(res.token);
            if (res.user) this.auth.setUser(res.user);
            this.router.navigateByUrl('/tabs/feed', { replaceUrl: true });
          },
          error: (err: any) => {
            if (err.status === 0) {
              this.error = 'No se puede conectar al servidor. Verifica que el backend esté corriendo.';
            } else if (err.status === 422) {
              this.error = 'El usuario ya existe o los datos son inválidos.';
            } else {
              this.error = 'Error en el registro. Intenta de nuevo.';
            }
          }
        });
      } else {
        this.auth.login(this.email, this.password).subscribe({
          next: res => {
            this.auth.setToken(res.token);
            if (res.user) this.auth.setUser(res.user);
            this.router.navigateByUrl('/tabs/feed', { replaceUrl: true }); 
          },
          error: (err: any) => {
            if (err.status === 0) {
              this.error = 'No se puede conectar al servidor. Verifica que el backend esté corriendo en la red local.';
            } else if (err.status === 401) {
              this.error = 'Email o contraseña inválidos.';
            } else {
              this.error = 'Error en el login. Intenta de nuevo.';
            }
          }
        });
      }
    }

}
