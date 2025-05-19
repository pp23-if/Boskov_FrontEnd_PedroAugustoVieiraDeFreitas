import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {
  apelidoUsuario: string = '';
  filmes: any[] = [];
  filmesFiltrados: any[] = [];
  filmesPorGenero: any[] = [];
  filmesPaginados: any[] = [];

  generos: any[] = [];
  generoSelecionado: string = '';
  termoBusca: string = '';

  paginaAtual: number = 1;
  filmesPorPagina: number = 12;
  totalPaginas: number = 1;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.apelidoUsuario = usuario.apelido || 'Cliente';

    this.getFilmes();
    this.getGeneros();
  }

  getFilmes() {
    this.http.get<any[]>('http://localhost:3000/api/filme/busca_filmes').subscribe({
      next: data => {
        this.filmes = data;
        this.filmesFiltrados = [...this.filmes]; // inicia com todos
        this.atualizarPaginacao();
      },
      error: err => console.error('Erro ao buscar filmes:', err)
    });
  }

  getGeneros() {
    this.http.get<any[]>('http://localhost:3000/api/genero').subscribe({
      next: data => {
        this.generos = data;
      },
      error: err => console.error('Erro ao buscar gêneros:', err)
    });
  }

  filtrarPorNome() {
    const termo = this.termoBusca.trim().toLowerCase();

    if (termo) {
      this.filmesFiltrados = this.filmes.filter(f =>
        f.nome.toLowerCase().includes(termo)
      );
    } else {
      this.filmesFiltrados = [...this.filmes];
    }

    this.paginaAtual = 1;
    this.atualizarPaginacao();
  }

  buscarPorGenero() {
    if (!this.generoSelecionado) return;

    const url = `http://localhost:3000/api/genero/filmes?nome=${this.generoSelecionado}`;
    this.http.get<any[]>(url).subscribe({
      next: data => {
        this.filmesFiltrados = data;
        this.termoBusca = ''; // limpa o campo de nome pois a busca agora é por gênero
        this.paginaAtual = 1;
        this.atualizarPaginacao();
      },
      error: err => console.error('Erro ao buscar por gênero:', err)
    });
  }

  atualizarPaginacao() {
    this.totalPaginas = Math.ceil(this.filmesFiltrados.length / this.filmesPorPagina);
    const inicio = (this.paginaAtual - 1) * this.filmesPorPagina;
    const fim = inicio + this.filmesPorPagina;
    this.filmesPaginados = this.filmesFiltrados.slice(inicio, fim);
  }

  irParaPagina(pagina: number) {
    this.paginaAtual = pagina;
    this.atualizarPaginacao();
  }

  paginaAnterior() {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.atualizarPaginacao();
    }
  }

  proximaPagina() {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.atualizarPaginacao();
    }
  }

  get totalPaginasArray(): number[] {
    return Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = '/imagens/imagem-indisponivel.jpg';
  }

  limparFiltros() {
  this.termoBusca = '';
  this.generoSelecionado = '';
  this.getFilmes(); // Recarrega todos os filmes
}


  logout() {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('logout-event', Date.now().toString());
    window.location.href = '/login';
  }
}
