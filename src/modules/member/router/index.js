import MemberHome from '@/modules/member/views/Home';
import MemberScales from '@/modules/member/views/Scales';
import MemberBroadcasts from '@/modules/member/views/Broadcasts';
import MemberProfile from '@/modules/member/views/Profile';
import MemberAccountSettings from '@/modules/member/views/AccountSettings';
import MemberNotificationSettings from '@/modules/member/views/NotificationSettings';
import MemberAgenda from '@/modules/member/views/Agenda';
import MemberRequests from '@/modules/member/views/Requests';
import CalendarMobile from '@/modules/requests/views/CalendarMobile';

export default [
  {
    path: '/member',
    children: [
      {
        path: '',
        name: 'member-home',
        component: MemberHome,
        meta: { layout: 'mobile', requiresAuth: true }
      },
      {
        path: 'scales',
        name: 'member-scales',
        component: MemberScales,
        meta: { layout: 'mobile', requiresAuth: true }
      },
      {
        path: 'broadcasts',
        name: 'member-broadcasts',
        component: MemberBroadcasts,
        meta: { layout: 'mobile', requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'member-profile',
        component: MemberProfile,
        meta: { layout: 'mobile', requiresAuth: true }
      },
      {
        path: 'account',
        name: 'member-account',
        component: MemberAccountSettings,
        meta: { layout: 'mobile', requiresAuth: true }
      },
      {
        path: 'notifications',
        name: 'member-notifications',
        component: MemberNotificationSettings,
        meta: { layout: 'mobile', requiresAuth: true }
      },
      {
        path: 'requests',
        name: 'member-requests',
        component: MemberRequests,
        meta: { layout: 'mobile', requiresAuth: true }
      },
      {
        path: 'agenda',
        name: 'member-agenda',
        component: MemberAgenda,
        meta: { layout: 'mobile', requiresAuth: true }
      },
      {
        path: 'requests/calendar',
        name: 'member-requests-calendar',
        component: CalendarMobile,
        meta: { layout: 'mobile', requiresAuth: true }
      }
    ]
  }
];
