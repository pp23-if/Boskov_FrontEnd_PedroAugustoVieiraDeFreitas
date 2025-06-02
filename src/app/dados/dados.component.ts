import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-dados',
  standalone: true,
  templateUrl: './dados.component.html',
  styleUrls: ['./dados.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxMaskDirective
  ],
  providers: [provideNgxMask()]
})
export class DadosComponent implements OnInit {
  usuario: any = {
    nome: '',
    email: '',
    senha: '',
    apelido: '',
    data_nascimento: ''
  };

  modalSucessoAberto: boolean = false;
  modalErroAberto: boolean = false;
  feedbackMensagem: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.carregarDadosUsuario();
  }

  carregarDadosUsuario(): void {
    const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.usuario = {
      id: usuarioLocal.id,
      nome: usuarioLocal.nome,
      email: usuarioLocal.email,
      senha: '',
      apelido: usuarioLocal.apelido,
      data_nascimento: this.converterDataParaPtBr(usuarioLocal.data_nascimento)
    };
  }

  atualizarDados(): void {

    if (!this.usuario.nome || !this.usuario.email || !this.usuario.apelido || !this.usuario.data_nascimento) {
      this.feedbackMensagem = 'Todos os campos são obrigatórios.';
      this.modalErroAberto = true;
      return;
    }

    const dataFormatada = this.converterDataParaEua(this.usuario.data_nascimento);
    const id = this.usuario.id;
    const body = {
      nome: this.usuario.nome,
      email: this.usuario.email,
      senha: this.usuario.senha,
      apelido: this.usuario.apelido,
      data_nascimento: dataFormatada
    };

    const token = localStorage.getItem('token');

    this.http.put(`http://localhost:3000/api/usuarios/${id}`, body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (response: any) => {
        this.modalSucessoAberto = true;
        this.usuario.senha = '';

        // Atualiza localStorage com os dados retornados pela API
        localStorage.setItem('usuario', JSON.stringify(response.usuario));

        // Recarrega os dados com base nos dados atualizados
        this.carregarDadosUsuario();
      },
      error: (err) => {
        if (err.status === 409) {
          this.feedbackMensagem = 'Este e-mail já está em uso por outro usuário.';
        } else {
          this.feedbackMensagem = 'Erro ao atualizar dados. Tente novamente.';
        }
        this.modalErroAberto = true;
      }
    });
  }

  converterDataParaEua(data: string): string {
    const partes = data.split('/');
    if (partes.length !== 3) return data;
    return `${partes[2]}-${partes[1]}-${partes[0]}`; // yyyy-MM-dd
  }

  converterDataParaPtBr(data: string): string {
    if (!data) return '';

    const apenasData = data.split('T')[0]; // '2004-10-12'
    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`;
  }


  fecharModalSucesso(): void {
    this.modalSucessoAberto = false;
  }

  fecharModalErro(): void {
    this.modalErroAberto = false;
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('logout-event', Date.now().toString());
    window.location.href = '/login';
  }
}
