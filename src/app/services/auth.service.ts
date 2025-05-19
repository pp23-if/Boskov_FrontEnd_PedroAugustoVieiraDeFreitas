import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/login';

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, senha: string) {
    return this.http.post<any>(this.apiUrl, { email, senha });
  }

  setSession(usuario: any) {
    const token = usuario.token?.[0]?.token;

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }

    if (usuario.tipo_usuario === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/cliente']);
    }
  }


  logout() {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('logout-event', Date.now().toString());
}


  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getTipoUsuario(): string | null {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user).tipo_usuario : null;
  }
}