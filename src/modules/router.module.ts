import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuardServices} from '../services/auth-guard.services';

import {PageNotFoundComponent} from '../components/errors/page-not-found/page-not-found.component';

import {IndexComponent} from '../components/index/index.component';
import {SignInComponent} from '../components/sign-in/sign-in.component';
import {SignUpComponent} from '../components/sign-up/sign-up.component';
import {EmailConfirmComponent} from '../components/confirmation/email-confirm.component';
import {CodeConfirmComponent} from '../components/confirmation/code-confirm.component';

const Routes: Routes = [
  {path: '', redirectTo: 'cabinet', pathMatch: 'full'},
  {path: 'sign-in', component: SignInComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: 'email-confirmation/:hash', component: EmailConfirmComponent},
  {path: 'code-confirmation/:hash', component: CodeConfirmComponent},
  {path: 'cabinet', canActivate: [AuthGuardServices], children: [
    {path: '', component: IndexComponent}
  ]},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(Routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AuthGuardServices
  ]
})
export class MainRouterModule {  }
