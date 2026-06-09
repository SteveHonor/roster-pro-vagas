import Requests from '@/modules/requests/views/Index';
import Calendar from '@/modules/requests/views/Calendar.vue';

export default [
  {
    path: '/requests',
    meta: {
      breadcrumb: 'Solicitações'
    },
    children: [
      {
        path: '',
        name: 'requests',
        component: Requests,
        meta: {
          layout: 'default',
          requiresAuth: true
        }
      },
      {
        path: 'calendar',
        component: Calendar,
        meta: {
          layout: 'default',
          requiresAuth: true
        }
      }
    ]
  }
];
