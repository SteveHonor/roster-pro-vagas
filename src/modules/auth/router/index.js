import Signin from '@/modules/auth/views/Signin';
import Signup from '@/modules/auth/views/Signup';
import Recovery from '@/modules/auth/views/Recovery';
import ResetPassword from '@/modules/auth/views/ResetPassword';
import NewPassword from '@/modules/auth/views/NewPassword';
import MagicLinkVerify from '@/modules/auth/views/MagicLinkVerify';
import AcceptInvite from '@/modules/auth/views/AcceptInvite';

export default [
  {
    path: '/signin',
    name: 'signin',
    component: Signin,
    meta: {
      layout: 'auth',
      requiresAuth: false
    }
  },
  {
    path: '/signup',
    name: 'signup',
    component: Signup,
    meta: {
      layout: 'auth',
      requiresAuth: false
    }
  },
  {
    path: '/recuperar-senha',
    component: Recovery,
    meta: {
      layout: 'auth',
      requiresAuth: false
    }
  },
  {
    path: '/nova-senha',
    component: NewPassword,
    meta: {
      layout: 'auth',
      requiresAuth: false
    }
  },
  {
    path: '/trocar-senha',
    component: ResetPassword,
    meta: {
      layout: 'auth',
      requiresAuth: false
    }
  },
  {
    path: '/magic-link/verify',
    component: MagicLinkVerify,
    meta: {
      layout: 'empty',
      requiresAuth: false
    }
  },
  {
    path: '/aceitar-convite',
    component: AcceptInvite,
    meta: {
      layout: 'auth',
      requiresAuth: false
    }
  }
];
