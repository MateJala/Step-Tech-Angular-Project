import { Routes } from '@angular/router';
import { Main } from './main/main';
import { Shop } from './pages/main/shop/shop';
import { Product } from './pages/main/product/product';
import { Auth } from './auth/auth';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { ForgotPassword } from './pages/auth/forgot-password/forgot-password';
import { Home } from './pages/main/home/home';
import { Verification } from './pages/auth/verification/verification';

export const routes: Routes = [
    {path: '', component: Main, children: [
        {path: '', component: Home},
        {path: 'shop', component: Shop},
        {path: 'shop/product/:id', component: Product},
    ]},
    {path: 'auth', component: Auth,
        children: [
            {path: '', redirectTo : 'login', pathMatch: 'full'},
            {path: 'login', component: Login},
            {path: 'register', component: Register},
            {path: 'forgot-password', component: ForgotPassword},
            {path: 'verification/:email', component: Verification}
        ]
    },
    {path: '**', redirectTo: '', pathMatch: 'full'}
];
