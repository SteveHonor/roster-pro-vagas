<template>
  <HFaceBookLogin
    v-slot="fbLogin"
    :app-id="appId"
    scope="email,public_profile"
    fields="id,name,email,first_name,last_name,birthday"
    @on-success="onSuccess"
    @on-failure="onFailure"
  >
    <button
      class="flex w-full items-center justify-between gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
      @click="fbLogin.initFBLogin"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 512 512"
        fill="currentColor"
      >
        <path
          d="M256 0C114.836 0 0 114.836 0 256c0 127.836 93.633 233.637 216 252.792V330h-65v-74h65v-56.246C216 127.34 259.676 96 319.92 96c29.625 0 60.08 5 60.08 5v66h-33.867c-33.37 0-44.133 20.69-44.133 41.926V256h75l-12 74h-63v178.792C418.367 489.637 512 383.836 512 256 512 114.836 397.164 0 256 0z"
        />
      </svg>

      <span class="flex-grow"> Entrar com Facebook </span>
    </button>
  </HFaceBookLogin>
</template>

<script>
import { HFaceBookLogin } from '@healerlab/vue3-facebook-login';
import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';
import { useUserStore } from '@/modules/users/store/user';

export default {
  name: 'FacebookLoginButton',
  components: {
    HFaceBookLogin
  },
  data() {
    return {
      appId: import.meta.env.VITE_FACEBOOK_APP_ID
    };
  },
  computed: {
    authStore: () => useAuthStore(),
    companyStore: () => useCompanyStore(),
    userStore: () => useUserStore()
  },
  methods: {
    async onSuccess(response) {
      await this.axios
        .post('auth/facebook/callback', response)
        .then(response => {
          if (response.token) {
            this.signinSuccessful(response);
          } else {
            this.authStore.setProvider({ ...response, name: 'facebook' });

            this.authStore.stepRegister = 2;

            this.$router.push('/signup');
          }
        });
    },
    onFailure() {},
    signinSuccessful(response) {
      this.authStore.login(response);

      if (response?.companies?.length > 1) {
        this.authStore.setStepLogin(2);
      } else {
        this.companyStore.setChosenCompany(response?.companies[0]);
        this.userStore.setUserCompany(response?.companies[0]?.id);

        this.$router.push('/');
      }
    }
  }
};
</script>
