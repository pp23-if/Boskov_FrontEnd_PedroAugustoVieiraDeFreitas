import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ClienteComponent } from './cliente/cliente.component';
import { AvaliacoesComponent } from './avaliacoes/avaliacoes.component';
import { AdminComponent } from './admin/admin.component'; // Adicione este import, ajuste o caminho se necessário
import { CadastroComponent } from './cadastro/cadastro.component'; // Adicione este import, ajuste o caminho se necessário
import { DadosComponent } from './dados/dados.component';

import { authGuard } from './services/auth.guard'; // ajuste o caminho se necessário

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  
  {
    path: 'cliente',
    component: ClienteComponent,
    canActivate: [authGuard]
  },
  {
    path: 'cliente/minhas-avaliacoes',
    component: AvaliacoesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'cliente/meus-dados',
    component: DadosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'cliente/outras-avaliacoes',
    component: ClienteComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  
})
export class AppRoutingModule {}
