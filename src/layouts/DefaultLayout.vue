<template>
  <div class="flex min-h-screen flex-col bg-white">
    <div class="flex flex-grow">
      <!-- Sidebar Desktop -->
      <div
        class="hidden transition-all duration-300 md:block"
        :class="sidebarStore.collapsed ? 'w-20' : 'w-3/12 px-4'"
      >
        <div class="grid justify-items-end">
          <div
            class="fixed flex h-full flex-col justify-between"
            :class="
              sidebarStore.collapsed ? 'w-20 items-center pt-6' : 'w-52 pt-6'
            "
          >
            <div class="w-full">
              <router-link
                to="/"
                class="flex pl-2"
                :class="{ 'justify-center': sidebarStore.collapsed }"
              >
                <div
                  v-if="!logoLoaded"
                  class="animate-pulse rounded bg-slate-200 transition-all duration-300"
                  :class="sidebarStore.collapsed ? 'h-8 w-8' : 'h-10 w-32'"
                />
                <img
                  :src="brandLogo"
                  alt="logo"
                  class="object-contain transition-all duration-300"
                  :class="[
                    sidebarStore.collapsed ? 'h-8 w-8 rounded object-cover' : 'max-h-12 w-auto max-w-[9rem]',
                    logoLoaded ? 'opacity-100' : 'invisible absolute'
                  ]"
                  @load="logoLoaded = true"
                  @error="onLogoError"
                />
              </router-link>

              <Sidebar />
            </div>

            <Footer v-if="!sidebarStore.collapsed" />
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div
        class="relative bg-gray-100 transition-all duration-300"
        :class="
          sidebarStore.collapsed
            ? 'w-full md:w-[calc(100%-5rem)]'
            : 'w-full md:w-9/12'
        "
      >
        <Header />

        <div class="mx-auto p-4 pb-20 pt-8 sm:w-full md:w-11/12 lg:w-10/12">
          <NewFeaturesBanner v-if="$can.canAccess('admin')" />
          <PendingActionsBanner v-else />
          <slot />
          <PlanBanner v-if="$can.canAccess('admin') && !isCreationRoute" class="my-6" />
        </div>
      </div>
    </div>

    <ChecklistWidget v-if="$can.canAccess('admin')" />
  </div>
</template>

<script>
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PlanBanner from '@/components/plan/PlanBanner';
import PendingActionsBanner from '@/components/banners/PendingActionsBanner';
import NewFeaturesBanner from '@/components/banners/NewFeaturesBanner';
import ChecklistWidget from '@/components/onboarding/ChecklistWidget';
import { syncUser } from '@/services';
import { useSidebarStore } from '@/components/layout/store/sidebar';
import { useAuthStore } from '@/modules/auth/store';
import logoDefault from '@/assets/roster.png';

export default {
  components: {
    Header,
    Footer,
    Sidebar,
    PlanBanner,
    PendingActionsBanner,
    NewFeaturesBanner,
    ChecklistWidget
  },
  data() {
    return { logoLoaded: false };
  },
  computed: {
    sidebarStore: () => useSidebarStore(),
    authStore:    () => useAuthStore(),
    brandLogo() {
      return this.authStore.branding?.logoUrl || logoDefault;
    },
    isCreationRoute() {
      const path = this.$route?.path || '';
      return path.includes('/new') || /\/calendar\/[^/]+\/edit/.test(path);
    }
  },
  watch: {
    'authStore.branding.logoUrl'() {
      this.logoLoaded = false;
      this.logoFailed = false;
    }
  },
  mounted() {
    syncUser.sync(this.axios);
  },
  methods: {
    onLogoError(e) {
      this.logoFailed = true;
      this.logoLoaded = true;
      e.target.src = logoDefault;
    }
  }
};
</script>
