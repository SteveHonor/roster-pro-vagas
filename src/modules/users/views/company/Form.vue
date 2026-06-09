<template>
  <Drawer
    context="company"
    :on-save="$can.canAccess('admin') ? submitForm : false"
    :on-exit="reset"
    :on-close="reset"
  >
    <div class="w-full">
      <label class="required text-sm font-light text-gray-800" for="name">
        Nome da Instituição*
      </label>
      <input
        id="name"
        v-model="companyStore.getCompany.name"
        type="text"
        class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
        :class="{
          'border-red-500': v$.companyStore.company.name.$error,
          'border-gray-200': !v$.companyStore.company.name.$error
        }"
        required
        placeholder="Nome da Instituição"
        aria-invalid="true"
        :aria-describedby="
          v$.companyStore.company.name.$error ? 'name-error' : null
        "
      />
      <span
        v-if="v$.companyStore.company.name.$error"
        id="name-error"
        class="ml-2 text-sm text-red-600"
        role="alert"
      >
        Nome da Instituição é obrigatório.
      </span>
    </div>

    <div class="mt-4 flex flex-col gap-4 sm:flex-row">
      <!-- Campo Documento (CPF ou CNPJ) -->
      <div class="w-full sm:w-6/12">
        <label class="required text-sm font-light text-gray-800" for="document">
          Documento (CPF ou CNPJ)*
        </label>
        <input
          id="document"
          v-model="companyStore.company.document"
          v-mask="'##.###.###/####-##'"
          type="text"
          class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
          :class="{
            'border-red-500': v$.companyStore.company.document.$error,
            'border-gray-200': !v$.companyStore.company.document.$error
          }"
          required
          placeholder="EX: 00.000.000/0001-00"
          aria-invalid="true"
          :aria-describedby="
            v$.companyStore.company.document.$error ? 'document-error' : null
          "
        />
        <span
          v-if="v$.companyStore.company.document.$error"
          id="document-error"
          class="ml-2 text-sm text-red-600"
          role="alert"
        >
          Documento é obrigatório.
        </span>
        <LgpdFieldHint
          v-else
          hint="CPF ou CNPJ necessário para identificação jurídica e emissão de documentos fiscais."
          :icon="true"
        />
      </div>

      <!-- Campo Telefone -->
      <div class="w-full sm:w-6/12">
        <label class="required text-sm font-light text-gray-800" for="phone">
          Telefone*
        </label>
        <input
          id="phone"
          v-model="companyStore.company.phone"
          v-mask="['(##) ####-####', '(##) #####-####']"
          type="text"
          class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
          :class="{
            'border-red-500': v$.companyStore.company.phone.$error,
            'border-gray-200': !v$.companyStore.company.phone.$error
          }"
          required
          placeholder="Telefone"
          aria-invalid="true"
          :aria-describedby="
            v$.companyStore.company.phone.$error ? 'phone-error' : null
          "
        />
        <span
          v-if="v$.companyStore.company.phone.$error"
          id="phone-error"
          class="ml-2 text-sm text-red-600"
          role="alert"
        >
          Telefone é obrigatório.
        </span>
        <LgpdFieldHint
          v-else
          hint="Telefone de contato da instituição para comunicações operacionais."
          :icon="true"
        />
      </div>
    </div>

    <div class="mt-4 flex flex-col gap-4 sm:flex-row">
      <!-- Campo CEP -->
      <div class="w-full sm:w-6/12">
        <label class="required text-sm font-light text-gray-800" for="zipCode">
          CEP*
        </label>
        <input
          id="zipCode"
          v-model="companyStore.company.zipCode"
          type="text"
          class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
          :class="{
            'border-red-500': v$.companyStore.company.zipCode.$error,
            'border-gray-200': !v$.companyStore.company.zipCode.$error
          }"
          required
          placeholder="CEP"
          aria-invalid="true"
          :aria-describedby="
            v$.companyStore.company.zipCode.$error ? 'zipCode-error' : null
          "
          @blur="fetchAddress"
        />
        <span
          v-if="v$.companyStore.company.zipCode.$error"
          id="zipCode-error"
          class="ml-2 text-sm text-red-600"
          role="alert"
        >
          CEP é obrigatório.
        </span>
      </div>

      <!-- Campo Número -->
      <div class="w-full sm:w-6/12">
        <label class="required text-sm font-light text-gray-800" for="number">
          Número*
        </label>
        <input
          id="number"
          v-model="companyStore.company.number"
          type="text"
          class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
          :class="{
            'border-red-500': v$.companyStore.company.number.$error,
            'border-gray-200': !v$.companyStore.company.number.$error
          }"
          required
          placeholder="Número"
          aria-invalid="true"
          :aria-describedby="
            v$.companyStore.company.number.$error ? 'number-error' : null
          "
        />
        <span
          v-if="v$.companyStore.company.number.$error"
          id="number-error"
          class="ml-2 text-sm text-red-600"
          role="alert"
        >
          Número é obrigatório.
        </span>
      </div>
    </div>

    <div class="mt-4 flex flex-col gap-4 sm:flex-row">
      <!-- Campo Rua -->
      <div class="w-full sm:w-6/12">
        <label class="required text-sm font-light text-gray-800" for="street">
          Rua
        </label>
        <input
          id="street"
          v-model="companyStore.company.street"
          type="text"
          class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
          required
          placeholder="Rua"
          aria-invalid="true"
        />
      </div>

      <!-- Campo Bairro -->
      <div class="w-full sm:w-6/12">
        <label
          class="required text-sm font-light text-gray-800"
          for="neighborhood"
        >
          Bairro
        </label>
        <input
          id="neighborhood"
          v-model="companyStore.company.neighborhood"
          type="text"
          class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
          required
          placeholder="Bairro"
          aria-invalid="true"
        />
      </div>
    </div>

    <div class="mt-4 flex flex-col gap-4 sm:flex-row">
      <!-- Campo Complemento -->
      <div class="w-full sm:w-6/12">
        <label class="text-sm font-light text-gray-800" for="complement">
          Complemento
        </label>
        <input
          id="complement"
          v-model="companyStore.company.complement"
          type="text"
          class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
          placeholder="Complemento"
          aria-invalid="true"
        />
      </div>

      <!-- Campo Cidade -->
      <div class="w-full sm:w-6/12">
        <label class="required text-sm font-light text-gray-800" for="city">
          Cidade
        </label>
        <input
          id="city"
          v-model="companyStore.company.city"
          type="text"
          class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
          required
          placeholder="Cidade"
          aria-invalid="true"
        />
      </div>
    </div>

    <div class="mt-4 flex flex-col gap-4 sm:flex-row">
      <!-- Campo País -->
      <div class="w-full sm:w-6/12">
        <label class="required text-sm font-light text-gray-800" for="country">
          País
        </label>
        <input
          id="country"
          v-model="companyStore.company.country"
          type="text"
          class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
          required
          placeholder="País"
          aria-invalid="true"
        />
      </div>

      <!-- Campo Estado -->
      <div class="w-full sm:w-6/12">
        <label class="required text-sm font-light text-gray-800" for="state">
          Estado
        </label>
        <input
          id="state"
          v-model="companyStore.company.state"
          type="text"
          class="focus:ring-2 focus:ring-gray-500 w-full rounded border-gray-200 bg-gray-50 transition duration-200"
          required
          placeholder="Estado"
          aria-invalid="true"
        />
      </div>
    </div>

    <LgpdFieldHint
      class="mt-2"
      hint="Endereço utilizado para fins cadastrais e emissão de documentos."
      :icon="true"
    />
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer.vue';
import LgpdFieldHint from '@/components/form/LgpdFieldHint.vue';
import useVuelidate from '@vuelidate/core/index.js';

import { required } from '@vuelidate/validators/index.js';
import { useCompanyStore } from '@/modules/users/store/company';

export default {
  components: {
    Drawer,
    LgpdFieldHint
  },
  setup() {
    return { v$: useVuelidate() };
  },
  validations() {
    return {
      companyStore: {
        company: {
          name: { required },
          document: { required },
          phone: { required },
          zipCode: { required },
          number: { required }
        }
      }
    };
  },
  computed: {
    companyStore: () => useCompanyStore()
  },
  methods: {
    async fetchAddress() {
      const zipCode = this.companyStore.company.zipCode.replace(/\D/g, '');
      if (zipCode.length === 8) {
        try {
          const response = await this.axios.get(`cep/${zipCode}`);

          if (response && !response.erro) {
            this.companyStore.company.street = response.logradouro || '';
            this.companyStore.company.neighborhood = response.bairro || '';
            this.companyStore.company.city = response.localidade || '';
            this.companyStore.company.state = response.uf || '';
            this.companyStore.company.country = 'Brasil';
          } else {
            console.log('CEP não encontrado');
          }
        } catch (error) {
          console.error('Erro ao buscar o endereço:', error);
        }
      }
    },
    submitForm() {
      return this.companyStore.getCompany.id ? this.update() : this.create();
    },
    reset() {
      this.companyStore.resetCompany();
    },
    async create() {
      const result = await this.v$.$validate();

      if (result) {
        await this.axios
          .post('companies', this.companyStore.getCompany)
          .then(response => {
            this.drawerStore.close();

            this.companyStore.resetCompany();
            this.companyStore.setCompanies(response);

            this.v$.$reset();
          })
          .catch(e => {
            console.log(e.message);
          });
      }
    },
    async update() {
      const result = await this.v$.$validate();

      if (result) {
        await this.axios
          .put(
            `companies/${this.companyStore.getCompany.id}`,
            this.companyStore.getCompany
          )
          .then(response => {
            this.drawerStore.onSave('company');
            this.drawerStore.close();

            this.companyStore.resetCompany();
            this.companyStore.setCompanies(response);

            this.companyStore.setChosenCompany({
              company: this.companyStore.getChosenCompany.id
            });

            this.v$.$reset();
          })
          .catch(e => {
            console.log(e.message);
          });
      }
    }
  }
};
</script>
