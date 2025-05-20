import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-avaliacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './avaliacoes.component.html',
  styleUrls: ['./avaliacoes.component.css']
})
export class AvaliacoesComponent implements OnInit {
  avaliacoes: any[] = [];
  apelidoUsuario: string = '';
  carregando: boolean = true;

  // Modal
  showModal: boolean = false;
  avaliacaoSelecionada: any = null;
  comentarioEditado: string = '';
  notaEditada: number = 0;

  // Feedback
  showFeedbackModal: boolean = false;
  feedbackMensagem: string = '';
  feedbackErro: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.apelidoUsuario = usuario.apelido || 'Cliente';

    const id_usuario = usuario.id;

    if (id_usuario) {
      this.http.get<any[]>(`http://localhost:3000/api/avaliacao/${id_usuario}`).subscribe({
        next: data => {
          this.avaliacoes = data;
          this.carregando = false;
        },
        error: err => {
          console.error('Erro ao buscar avaliações:', err);
          this.carregando = false;
        }
      });
    }
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('logout-event', Date.now().toString());
    window.location.href = '/login';
  }

  fecharFeedback() {
    this.showFeedbackModal = false;
  }

  abrirModal(avaliacao: any) {
    this.avaliacaoSelecionada = avaliacao;
    this.comentarioEditado = avaliacao.comentario;
    this.notaEditada = avaliacao.nota;
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
    this.avaliacaoSelecionada = null;
  }

  atualizarAvaliacao() {
    const comentarioTrimado = this.comentarioEditado.trim();
    if (!comentarioTrimado) {
      this.exibirFeedback(true, 'O comentário não pode estar vazio.');
      return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const id_usuario = usuario.id;
    const id_filme = this.avaliacaoSelecionada.filme.id;

    const body = {
      nota: this.notaEditada,
      comentario: comentarioTrimado
    };

    this.http.put(
      `http://localhost:3000/api/avaliacao/atualizacao/${id_usuario}/${id_filme}`,
      body
    ).subscribe({
      next: () => {
        // Após atualizar, buscar avaliações atualizadas
        this.http.get<any[]>(`http://localhost:3000/api/avaliacao/${id_usuario}`).subscribe({
          next: data => {
            this.avaliacoes = data;
            this.showModal = false;
            this.exibirFeedback(false, 'Avaliação atualizada com sucesso.');
          },
          error: () => {
            this.showModal = false;
            this.exibirFeedback(true, 'Avaliação atualizada, mas houve erro ao recarregar a lista.');
          }
        });
      },
      error: () => {
        this.showModal = false;
        this.exibirFeedback(true, 'Erro ao atualizar avaliação.');
      }
    });

  }

  exibirFeedback(erro: boolean, mensagem: string) {
    this.feedbackErro = erro;
    this.feedbackMensagem = mensagem;
    this.showFeedbackModal = true;
    setTimeout(() => {
      this.showFeedbackModal = false;
    }, 4000);
  }
}
