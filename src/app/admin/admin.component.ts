import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  usuarios: any[] = [];
  apelidoUsuario = '';

  // Modais
  showCadastroModal = false;
  showMensagemModal = false;

  mensagemStatusModal = '';
  showStatusModal = false;


  mensagemModal = '';

  cadastroForm: FormGroup;

  // Edição de senha
  senhaForm: FormGroup;
  showEditarSenhaModal = false;
  showFeedbackSenhaModal = false;
  mensagemSenhaModal = '';
  usuarioEditandoId: number | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    // Formulário de cadastro
    this.cadastroForm = this.fb.group({
      nome: ['', Validators.required],
      apelido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      data_nascimento: ['', Validators.required]
    });

    // Formulário de senha
    this.senhaForm = this.fb.group({
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.apelidoUsuario = usuario.apelido || 'Usuário';
    this.getUsuarios();
  }

  getUsuarios() {
    this.http.get<any[]>('http://localhost:3000/api/usuarios/busca_usuarios')
      .subscribe({
        next: data => this.usuarios = data,
        error: err => console.error('Erro ao buscar usuários:', err)
      });
  }

  editarUsuario(usuario: any) {
    // Aqui você pode implementar outro modal para edição completa, se quiser no futuro
    console.log('Editar:', usuario);
  }

  desativarUsuario(usuario: any) {
    this.http.patch(`http://localhost:3000/api/usuarios/${usuario.id}/delecao`, {})
      .subscribe({
        next: () => {
          this.mensagemStatusModal = 'Usuário desativado com sucesso.';
          this.showStatusModal = true;
          this.getUsuarios(); // Atualiza lista
        },
        error: () => {
          this.mensagemStatusModal = 'Erro ao desativar o usuário.';
          this.showStatusModal = true;
        }
      });
  }

  reativarUsuario(usuario: any) {
    this.http.patch(`http://localhost:3000/api/usuarios/${usuario.id}/desfazerDelecao`, {})
      .subscribe({
        next: () => {
          this.mensagemStatusModal = 'Usuário reativado com sucesso.';
          this.showStatusModal = true;
          this.getUsuarios(); // Atualiza lista
        },
        error: () => {
          this.mensagemStatusModal = 'Erro ao reativar o usuário.';
          this.showStatusModal = true;
        }
      });
  }

  fecharStatusModal() {
    this.showStatusModal = false;
  }


  statusLabel(status: boolean): string {
    return status ? 'Ativo' : 'Inativo';
  }

  // Cadastro
  adicionarUsuario() {
    this.showCadastroModal = true;
  }

  fecharModal() {
    this.showCadastroModal = false;
    this.cadastroForm.reset();
  }

  salvarUsuario(): void {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const formData = {
      ...this.cadastroForm.value,
      tipo_usuario: 'admin',
      data_nascimento: this.formatDate(this.cadastroForm.value.data_nascimento)
    };

    this.http.post('http://localhost:3000/api/usuarios/cadastro', formData).subscribe({
      next: () => {
        this.mensagemModal = 'Usuário cadastrado com sucesso.';
        this.showMensagemModal = true;
        this.showCadastroModal = false;
        this.cadastroForm.reset();
        this.getUsuarios();
      },
      error: (err) => {
        if (err.status === 400 && err.error?.error === 'Email já em uso') {
          this.mensagemModal = 'Erro: este email já está cadastrado.';
        } else {
          this.mensagemModal = 'Erro inesperado ao cadastrar. Tente novamente.';
        }
        this.showMensagemModal = true;
      }
    });
  }

  fecharMensagemModal() {
    this.showMensagemModal = false;
  }

  // ----------- EDIÇÃO DE SENHA ---------------- //

  abrirEditarSenhaModal(usuario: any) {
    this.usuarioEditandoId = usuario.id;
    this.senhaForm.reset();
    this.showEditarSenhaModal = true;
  }

  fecharEditarSenhaModal() {
    this.showEditarSenhaModal = false;
    this.usuarioEditandoId = null;
  }

  salvarNovaSenha() {
    if (this.senhaForm.invalid || !this.usuarioEditandoId) {
      this.senhaForm.markAllAsTouched();
      return;
    }

    const novaSenha = this.senhaForm.value.senha;

    this.http.put(`http://localhost:3000/api/usuarios/${this.usuarioEditandoId}`, {
      senha: novaSenha
    }).subscribe({
      next: () => {
        this.mensagemSenhaModal = 'Senha atualizada com sucesso.';
        this.showFeedbackSenhaModal = true;
        this.showEditarSenhaModal = false;
        this.getUsuarios();
      },
      error: () => {
        this.mensagemSenhaModal = 'Erro ao atualizar senha.';
        this.showFeedbackSenhaModal = true;
        this.showEditarSenhaModal = false;
      }
    });
  }

  fecharFeedbackSenhaModal() {
    this.showFeedbackSenhaModal = false;
  }

  // ------------------------------------------- //

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${month}-${day}-${year}`;
  }

  logout() {
  this.authService.logout();
  window.location.href = '/login'; // Redireciona para a página de login
}

}
