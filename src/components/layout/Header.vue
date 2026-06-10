<template>
  <div class="flex h-20 w-full items-center border-b border-gray-200">
    <div
      class="mx-auto flex w-full items-center justify-between gap-4 px-4 sm:w-full md:w-11/12 lg:w-10/12"
    >
      <div class="md:hidden md:w-auto">
        <router-link to="/" class="md:ml-10">
          <img :src="brandLogo" alt="logo" class="w-36" @error="onLogoError" />
        </router-link>
      </div>
      <div class="hidden gap-4 truncate md:flex md:w-auto">
        <button class="hover:bg-gray-100" @click="sidebarStore.toggle()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <Breadcrumb />
      </div>
      <div class="hidden items-center justify-end space-x-8 md:flex">
        <Notification />
        <div ref="dropdownMenu" class="relative inline-block">
          <button
            class="inline-flex min-w-64 items-center rounded bg-white px-4 py-2 text-left"
            @click="toggleDropdown"
          >
            <div class="mr-8 flex w-full flex-col">
              <span class="flex w-full truncate text-sm font-semibold text-gray-700">
                {{ authStore.me?.name }}
              </span>
              <span
                v-if="companyStore?.hasCompany"
                class="w-36 truncate text-xs font-light text-gray-600"
                >{{
                  companyStore?.getChosenCompany?.name ||
                  'Selecione uma Instituição'
                }}</span
              >
              <span
                v-else
                class="w-36 truncate text-xs font-light text-gray-600"
                >{{ authStore.me?.email }}</span
              >
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-5 w-5"
            >
              <path
                v-show="!isOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
              <path
                v-show="isOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
          <ul
            class="absolute z-50 w-full rounded-lg pt-1 text-gray-700 shadow-lg"
            :class="{ hidden: !isOpen }"
          >
            <li class="rounded-t border-b border-gray-100 bg-white px-4 py-2">
              <p class="text-sm font-semibold text-gray-700">{{ authStore.me?.name }}</p>
              <p class="text-xs text-gray-500">{{ companyName }}</p>
            </li>
            <li>
              <a
                class="whitespace-no-wrap block bg-white px-4 py-1.5 text-sm hover:bg-gray-700 hover:text-white"
                @click="
                  () => {
                    $router.replace({
                      path: '/settings',
                      query: { tab: 'account' }
                    });

                    isOpen = false;
                  }
                "
              >
                Minha Conta
              </a>
            </li>
            <li>
              <a
                class="whitespace-no-wrap block bg-white px-4 py-1.5 text-sm hover:bg-gray-700 hover:text-white"
                href="#"
                @click="
                  () => {
                    $router.replace({
                      path: '/settings',
                      query: { tab: 'messages' }
                    });

                    isOpen = false;
                  }
                "
              >
                Mensagens
              </a>
            </li>
            <li>
              <a
                class="whitespace-no-wrap block bg-white px-4 py-1.5 text-sm hover:bg-gray-700 hover:text-white"
                href="#"
                @click="
                  () => {
                    $router.replace({
                      path: '/settings'
                    });

                    isOpen = false;
                  }
                "
              >
                Configurações
              </a>
            </li>

            <!-- Submenu Empresas -->
            <li>
              <button
                v-if="companyStore.getCompanies.length > 1"
                class="flex w-full justify-between bg-white px-4 py-2 text-left text-sm hover:bg-gray-700 hover:text-white"
                @click="toggleCompanyDropdown"
              >
                Instituições
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ml-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <ul v-if="isCompanyOpen" class="bg-orange-100">
                <li
                  v-for="(company, index) in companyStore.getCompanies"
                  :key="index"
                  class="hover:bg-gray-200"
                >
                  <a
                    href="#"
                    class="block px-6 py-2 text-sm text-black"
                    @click.prevent="selectCompany(company)"
                  >
                    {{ company.name }}
                  </a>
                </li>
              </ul>
            </li>



            <li class="border-t border-gray-100">
              <a
                :href="escalasUrl"
                class="whitespace-no-wrap flex w-full items-center justify-between bg-white px-4 py-1.5 text-sm hover:bg-gray-700 hover:text-white"
              >
                <span>Ir para Escalas</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </li>

            <li>
              <button
                type="button"
                class="whitespace-no-wrap block w-full rounded-b bg-white px-4 py-2 text-left text-sm hover:bg-gray-700 hover:text-white"
                @click="logout()"
              >
                Sair
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="z-0 flex items-center justify-end space-x-8 md:hidden">
        <Notification />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-gray-900"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          @click="openNav"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>
    </div>

    <!-- Mobile Nav Overlay -->
    <div
      v-if="sidebarStore.mobileOpen"
      class="fixed inset-0 z-[59] bg-black/40 backdrop-blur-sm md:hidden"
      @click="closeNav()"
    />
    <HeaderMobile />
  </div>
</template>

<script>
import Breadcrumb from '@/components/breadcrumb/Breadcrumb';
import Notification from '@/components/notification/Notification';
import HeaderMobile from '@/components/layout/HeaderMobile.vue';

import { createConsumer } from '@rails/actioncable';
import { useCompanyStore } from '@/modules/users/store/company';
import { useAuthStore } from '@/modules/auth/store';
import { useNotificationStore } from '@/components/notification/store';
import { useSidebarStore } from '@/components/layout/store/sidebar';
import logoDefault from '@/assets/roster.png';

export default {
  components: {
    HeaderMobile,
    Breadcrumb,
    Notification
  },
  data: () => ({
    isActive: false,
    isOpen: false,
    isCompanyOpen: false,
    unwatchRoute: ''
  }),
  computed: {
    notificationStore: () => useNotificationStore(),
    authStore: () => useAuthStore(),
    companyStore: () => useCompanyStore(),
    sidebarStore: () => useSidebarStore(),
    isLoggedIn: self => self.authStore.isSignedIn,
    escalasUrl: () => import.meta.env.VITE_ESCALAS_URL || 'https://app.rosterpro.com.br',
    brandLogo() {
      return this.authStore.branding?.logoUrl || logoDefault;
    },
    companyName() {
      return this.companyStore?.getChosenCompany?.name || this.authStore.me?.email || '';
    }
  },
  async mounted() {
    document.addEventListener('click', this.handleClickOutside);

    if (this.authStore.isSignedIn) {
      this.getNotifications();
      await this.createActionCableConsumer();
    }

    this.unwatchRoute = this.$router.afterEach(() => {
      this.closeNav();
    });
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);

    if (this.unwatchRoute) {
      this.unwatchRoute();
    }
  },
  methods: {
    onLogoError(e) {
      e.target.src = logoDefault;
    },
    async createActionCableConsumer() {
      let cableToken;
      try {
        const { token } = await this.axios.post('/cable_tokens');
        cableToken = token;
      } catch {
        return;
      }
      const cableUrl = `${import.meta.env.VITE_WSS}?token=${cableToken}`;
      const cable = createConsumer(cableUrl);

      // 🔔 Canal de notificações normais
      const notificationsSubscription = cable.subscriptions.create(
        { channel: 'NotificationsChannel' },
        {
          received: data => {
            this.notificationStore.addNotification(data);
          }
        }
      );

      // 🚨 Canal de sistema (cancelamento de conta, bloqueio, etc)
      const systemSubscription = cable.subscriptions.create(
        { channel: 'DeleteAccountChannel' },
        {
          received: data => {
            if (
              data.type === 'account_deleting' ||
              data.type === 'account_deleted'
            ) {
              this.authStore.setBlocked(true);
            }
          }
        }
      );

      // Opcional: guardar referências para cleanup
      this.$cable = cable;
      this.$subscriptions = {
        notificationsSubscription,
        systemSubscription
      };

      return { notificationsSubscription, systemSubscription };
    },
    async getNotifications() {
      await this.axios.get('/notifications').then(response => {
        this.notificationStore.setNotifications(response);
      });
    },
    async logout() {
      await this.axios
        .delete('logout')
        .then(() => {
          this.authStore.setStepLogin(1);
          this.authStore.logout();
          this.closeNav();

          this.$router.replace('/signin');
        })
        .catch(() => {
          this.authStore.setStepLogin(1);
          this.$router.replace('/signin');
        });
    },

    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },

    openNav() {
      const nav = document.getElementById('mySidenav');
      if (!nav) return;
      nav.style.width = '280px';
      document.body.style.overflow = 'hidden';
      this.sidebarStore.openMobile();
    },

    closeNav() {
      const nav = document.getElementById('mySidenav');
      if (!nav) return;
      nav.style.width = '0';
      document.body.style.overflow = 'auto';
      this.sidebarStore.closeMobile();
    },

    toggleCompanyDropdown() {
      this.isCompanyOpen = !this.isCompanyOpen;
    },

    selectCompany(company) {
      this.companyStore.setChosenCompany({ company: company.id });

      this.isCompanyOpen = false;
      this.isOpen = false;

      this.$router.replace('/').then(() => {
        this.$router.go();
      });
    },

    handleClickOutside(event) {
      const dropdown = this.$refs.dropdownMenu;
      // Verifica se o clique foi fora do menu inteiro
      if (!dropdown?.contains(event.target)) {
        this.isOpen = false;
        this.isCompanyOpen = false;
      }
    }
  }
};
</script>

<style scoped>
.dropdown:hover .dropdown-menu {
  display: block;
}

.sidenav {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 60;
  top: 0;
  left: 0;
  overflow-x: hidden;
  transition: width 0.25s ease;
}

.sidenav .item {
  padding: 20px 0 0 30px;
  text-decoration: none;
  font-size: 20px;
  display: block;
  transition: 0.1s;
}

#main {
  transition: margin-left 0.1s;
  padding: 20px;
}

@media screen and (max-height: 450px) {
  .sidenav {
    padding-top: 15px;
  }

  .sidenav .item {
    font-size: 18px;
  }
}
</style>
