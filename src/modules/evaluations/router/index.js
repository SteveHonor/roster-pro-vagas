import Evaluations from '@/modules/evaluations/views/Index';

export default [
  {
    path: '/evaluations',
    meta: {
      breadcrumb: 'Avaliações'
    },
    children: [
      {
        path: '',
        name: 'evaluations',
        component: Evaluations,
        meta: {
          layout: 'default',
          requiresAuth: true
        }
      }
    ]
  }
];
