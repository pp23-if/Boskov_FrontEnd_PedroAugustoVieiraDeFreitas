import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  modalAberto = false;
  filmeSelecionado: any = null;
  notaSelecionada: number = 0;
  comentario: string = '';

  modalSucessoAberto: boolean = false;
  modalJaAvaliadoAberto: boolean = false;
  modalErroAberto: boolean = false;
  modalCamposObrigatoriosAberto: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

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
        this.filmesFiltrados = [...this.filmes];
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
    this.filmesFiltrados = termo
      ? this.filmes.filter(f => f.nome.toLowerCase().includes(termo))
      : [...this.filmes];

    this.paginaAtual = 1;
    this.atualizarPaginacao();
  }

  buscarPorGenero() {
    if (!this.generoSelecionado) return;

    const url = `http://localhost:3000/api/genero/filmes?nome=${this.generoSelecionado}`;
    this.http.get<any[]>(url).subscribe({
      next: data => {
        this.filmesFiltrados = data;
        this.termoBusca = '';
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
    this.getFilmes();
  }

  abrirModal(filme: any) {
    this.filmeSelecionado = filme;
    this.modalAberto = true;
    this.notaSelecionada = 0;
    this.comentario = '';
  }

  fecharModal() {
    this.modalAberto = false;
    this.filmeSelecionado = null;
    this.notaSelecionada = 0;
    this.comentario = '';
  }

  publicarAvaliacao() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const token = localStorage.getItem('token');

    if (!this.notaSelecionada || !this.comentario.trim()) {
      this.modalCamposObrigatoriosAberto = true;
      return;
    }

    const id_usuario = parseInt(usuario.id, 10);
    const id_filme = parseInt(this.filmeSelecionado.id, 10);

    if (isNaN(id_usuario) || isNaN(id_filme)) {
      return;
    }

    const body = {
      id_usuario,
      id_filme,
      nota: this.notaSelecionada,
      comentario: this.comentario
    };

    this.http.post('http://localhost:3000/api/avaliacao/cadastro', body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: () => {
        this.modalSucessoAberto = true;
        // Não fecha o modal do filme aqui
      },
      error: err => {
        if (err.status === 400) {
          this.modalJaAvaliadoAberto = true;
        } else {
          this.modalErroAberto = true;
        }
        // Não fecha o modal do filme aqui
      }
    });
  }

  fecharModalFeedback() {
    this.modalSucessoAberto = false;
    this.modalJaAvaliadoAberto = false;
    this.modalErroAberto = false;
    this.modalCamposObrigatoriosAberto = false;
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('logout-event', Date.now().toString());
    window.location.href = '/login';
  }
}
