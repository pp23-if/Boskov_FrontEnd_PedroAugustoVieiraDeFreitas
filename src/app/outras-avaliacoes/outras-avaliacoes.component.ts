import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-outras-avaliacoes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './outras-avaliacoes.component.html',
  styleUrls: ['./outras-avaliacoes.component.css']
})
export class OutrasAvaliacoesComponent implements OnInit {
  usuarios: any[] = [];
  apelidoUsuario: string = '';
  showModal: boolean = false;
  avaliacoesSelecionadas: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.apelidoUsuario = usuarioLogado.apelido;

    this.http.get<any[]>('http://localhost:3000/api/usuarios/busca_clientes').subscribe({
      next: usuarios => {
        this.usuarios = usuarios.filter(u => u.id !== usuarioLogado.id);
      },
      error: err => {
        console.error('Erro ao buscar usuários:', err);
      }
    });
  }

  abrirModal(usuario: any) {
    this.http.get<any[]>(`http://localhost:3000/api/avaliacao/${usuario.id}`).subscribe({
      next: avaliacoes => {
        this.avaliacoesSelecionadas = avaliacoes;
        this.showModal = true;
      },
      error: err => {
        console.error('Erro ao buscar avaliações:', err);
      }
    });
  }

  fecharModal() {
    this.showModal = false;
    this.avaliacoesSelecionadas = [];
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('logout-event', Date.now().toString());
    window.location.href = '/login';
  }
}
