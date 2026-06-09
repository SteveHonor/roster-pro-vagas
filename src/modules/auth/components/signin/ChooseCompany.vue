<template>
  <section class="flex w-full flex-wrap">
    <!-- Coluna do banner -->
    <div
      class="banner bg-login order-2 mt-5 w-full rounded bg-cover bg-center md:order-1 md:rounded-e-none lg:mt-0 lg:w-8/12"
    >
      <div
        class="flex h-full flex-wrap rounded bg-gray-900 bg-opacity-70 md:rounded-e-none md:bg-opacity-70"
      >
        <div
          class="flex w-full flex-col items-start justify-end space-y-2 p-10"
        >
          <h2 class="text-left text-lg font-semibold text-white md:text-lg">
            Gerencie múltiplas instituições!
          </h2>
          <span class="text-center text-sm text-gray-200">
            Gestão de Escalas, Equipes e Serviços em um só lugar
          </span>
        </div>
      </div>
    </div>

    <!-- Coluna do formulário -->
    <div
      class="order-1 flex w-full items-center justify-center rounded-e-md bg-white p-10 lg:order-2 lg:w-4/12"
    >
      <div class="flex w-full flex-wrap justify-center">
        <router-link to="/" class="z-50 mb-10 md:p-0">
          <img
            src="@/assets/roster.png"
            alt="Roster Pro"
            class="w-32 md:w-36"
          />
        </router-link>

        <div class="my-2 w-full text-center text-sm">
          Qual instituição deseja gerenciar?
        </div>

        <div class="my-3 w-full text-center text-sm uppercase text-red-500">
          {{ error }}
        </div>

        <form class="w-full" @submit.prevent="signin">
          <div class="w-full">
            <span class="text-sm font-bold text-gray-800"
              >Selecione uma instituição:</span
            >
            <div class="relative">
              <select
                v-model="company"
                class="focus:ring focus:ring-gray-500 block w-full appearance-none rounded border border-gray-200 bg-gray-50 p-2 focus:outline-none"
                required
                aria-invalid="true"
                :aria-describedby="v$.company.$error ? 'profile-error' : null"
                @change="isFocused = true"
                @blur="isFocused = false"
              >
                <option disabled value="null" selected>Selecione...</option>
                <option
                  v-for="(company, index) in companyStore.getCompanies"
                  :key="index"
                  :value="company"
                >
                  {{ company.name }}
                </option>
              </select>
              <span
                v-if="v$.company.$error"
                id="profile-error"
                class="ml-2 text-sm text-red-600"
                role="alert"
              >
                É necessário selecionar uma instituição.
              </span>
            </div>
          </div>

          <div class="mt-10">
            <button
              type="submit"
              class="flex w-full flex-wrap justify-center rounded bg-gray-900 px-10 py-3 font-semibold text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
              @click="moveToDashboard()"
            >
              ACESSAR INSTITUIÇÃO
            </button>
          </div>
        </form>

        <button
          class="mt-5 flex w-full justify-center text-xs md:px-8 md:py-3"
          @click="backToLogin()"
        >
          Acessar com outra conta
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import useVuelidate from '@vuelidate/core/index.js';
import { required } from '@vuelidate/validators/index.js';
import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';

export default {
  name: 'Login',
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      company: null
    };
  },
  computed: {
    authStore: () => useAuthStore(),
    companyStore: () => useCompanyStore()
  },
  mounted() {
    this.getCompanies();
  },
  methods: {
    async getCompanies() {
      await this.axios.get('companies').then(response => {
        this.companyStore.setCompanies(response);
      });
    },
    backToLogin() {
      this.authStore.logout();
      this.authStore.setStepLogin(1);
    },
    async moveToDashboard() {
      const result = await this.v$.$validate();

      if (result) {
        this.companyStore.setChosenCompany({ company: this.company.id });

        this.$router.replace('/');
      }
    }
  },
  validations() {
    return {
      company: { required }
    };
  }
};
</script>

<style lang="scss" scoped>
.bg-login {
  background-image: url('@/assets/bg-company.jpg');
}
</style>
