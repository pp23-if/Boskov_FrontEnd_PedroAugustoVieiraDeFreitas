import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {
  cadastroForm: FormGroup;
  showModal = false;
  modalMessage = '';
  onModalCloseAction?: () => void;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.cadastroForm = this.fb.group({
      nome: ['', Validators.required],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      apelido: ['', Validators.required],
      data_nascimento: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const formData = {
      ...this.cadastroForm.value,
      tipo_usuario: 'cliente',
      data_nascimento: this.formatDate(this.cadastroForm.value.data_nascimento)
    };

    this.http.post('http://localhost:3000/api/usuarios/cadastro', formData).subscribe({
      next: (res) => {
        this.showModalMessage('Cadastro realizado com sucesso.', () => {
          this.cadastroForm.reset();
        });
      },
      error: (err) => {
        if (err.status === 400 && err.error?.error === 'Email já em uso') {
          this.showModalMessage('Email já cadastrado.');
        } else {
          this.showModalMessage('Erro ao realizar o seu cadastro, por favor tente novamente.');
        }
      }
    });
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${month}-${day}-${year}`;
  }

  showModalMessage(message: string, onCloseAction?: () => void): void {
    this.modalMessage = message;
    this.showModal = true;
    this.onModalCloseAction = onCloseAction;
  }

  closeModal(): void {
    this.showModal = false;
    if (this.onModalCloseAction) {
      this.onModalCloseAction();
      this.onModalCloseAction = undefined;
    }
  }
}
