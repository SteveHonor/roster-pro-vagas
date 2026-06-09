<template>
  <div>
    <Tab :tabs="handleTabs()">
      <template #header>
        <PlanLimitBanner v-if="userLimitNear" resource="users" />
      </template>
      <template #tabs="{ isActive }">
        <div
          v-if="
            isActive('company') &&
            !['fake', 'personal'].includes(companyStore?.getChosenCompany?.kind) &&
            $can.canAccess('admin')
          "
        >
          <CompanyList />
        </div>

        <div v-if="isActive('team')">
          <TeamList />
        </div>

        <div v-if="isActive('user')">
          <UserList />
        </div>
      </template>
    </Tab>

    <TeamUsers />
    <TeamForm />
    <UserForm />
    <CompanyForm />
  </div>
</template>

<script>
import Tab from '@/components/tab/Tab';
import PlanLimitBanner from '@/components/plan/PlanLimitBanner';

import UserForm from '@/modules/users/views/user/Form';
import UserList from '@/modules/users/views/user/List';

import CompanyForm from '@/modules/users/views/company/Form';
import CompanyList from '@/modules/users/views/company/List';

import TeamUsers from '@/modules/users/views/team/Users';
import TeamForm from '@/modules/users/views/team/Form';
import TeamList from '@/modules/users/views/team/List';

import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '../store/company';
import { usePlanStore } from '@/components/plan/store';

export default {
  components: {
    UserForm,
    UserList,
    CompanyForm,
    CompanyList,
    TeamForm,
    TeamList,
    TeamUsers,
    Tab,
    PlanLimitBanner
  },
  computed: {
    authStore: () => useAuthStore(),
    companyStore: () => useCompanyStore(),
    planStore: () => usePlanStore(),
    userLimitNear() {
      const l = this.planStore.limits?.users;
      if (!l || !l.max) return false;
      return this.$can.canAccess('admin') && (l.used / l.max) >= 0.8;
    }
  },
  methods: {
    handlerTitle(context) {
      let title;

      switch (context) {
        case 'team':
          title = '';
          break;

        case 'company':
          title = 'Criar instituição';
          break;
      }

      return title;
    },
    handleTabs() {
      const tabs = {
        company: {
          name: 'Instituições',
          key: 'company',
          icon: 'company'
        },
        team: {
          name: 'Equipes',
          key: 'team',
          icon: 'users'
        },
        user: {
          name: 'Colaboradores',
          key: 'user',
          icon: 'user'
        }
      };

      return this.$can.canAccess('admin') && this.companyStore?.hasCompany
        ? [tabs.company, tabs.team, tabs.user]
        : [tabs.team, tabs.user];
    },
    addContext(context) {
      this.drawerStore.setDrawer({
        title: this.handlerTitle(context),
        context: context,
        open: true
      });
    }
  }
};
</script>
