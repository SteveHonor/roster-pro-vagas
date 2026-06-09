import Calendar from '@/modules/calendar/views/Index';
import NewCalendar from '@/modules/calendar/views/New';
import Payments from '@/modules/calendar/views/Payments';
import Scale from '@/modules/calendar/views/Scale';
import ScaleReport from '@/modules/calendar/views/ScaleReport';

export default [
  {
    path: '/calendar',
    children: [
      {
        path: '',
        name: 'calendar',
        component: Calendar,
        meta: {
          layout: 'default',
          requiresAuth: true,
          breadcrumb: 'Calendário'
        }
      },
      {
        path: 'new',
        component: NewCalendar,
        meta: {
          layout: 'default',
          requiresAuth: true,
          breadcrumb: 'CRIAR EVENTO'
        }
      },
      {
        path: ':id/edit',
        component: NewCalendar,
        meta: {
          layout: 'default',
          requiresAuth: true,
          breadcrumb: 'Editar Evento'
        }
      },
      {
        path: ':eventDayId/payments',
        name: 'calendar-payments',
        component: Payments,
        meta: {
          layout: 'default',
          requiresAuth: true,
          requiresOperator: true,
          breadcrumb: 'Pagamentos'
        }
      },
      {
        path: ':id/scale',
        children: [
          {
            path: '',
            name: 'calendar-scale',
            component: Scale,
            meta: {
              layout: 'default',
              requiresAuth: true,
              breadcrumb: 'Escalas'
            }
          },
          {
            path: 'report',
            name: 'calendar-scale-report',
            component: ScaleReport,
            meta: {
              layout: 'default',
              requiresAuth: true,
              breadcrumb: 'Escalas'
            }
          }
        ]
      }
    ]
  }
];
