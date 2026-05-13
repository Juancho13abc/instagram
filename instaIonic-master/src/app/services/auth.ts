import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private tokenKey = 'token';
  private host = window.location.hostname;
  private apiUrl = `http://${this.host}:8000/api/`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{user:any, token:string}>(this.apiUrl + 'login', { email, password });
  }

  register(data: {name:string; email:string; password:string; username:string}) {
    return this.http.post<{user:any, token:string}>(this.apiUrl +  'register', data);
  }

  setToken(token: string) { localStorage.setItem(this.tokenKey, token); }
  
  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  
  setUser(user: any) { localStorage.setItem('user', JSON.stringify(user)); }

  getUser(): any {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }

  logout() { localStorage.removeItem(this.tokenKey); this.clearUser(); }

  clearUser() { localStorage.removeItem('user'); }

  logoutRemote() {
    const token = this.getToken();
    if (!token) { this.logout(); return; }
    return this.http.post(
      this.apiUrl + 'logout',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

}
