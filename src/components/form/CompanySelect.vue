<template>
  <div :class="wrapperClass">
    <label v-if="label" class="text-sm font-light text-gray-800"
      >Instituição</label
    >
    <select
      :value="modelValue"
      class="focus:ring focus:ring-gray-500 block w-full appearance-none rounded border border-gray-200 bg-gray-100 p-2 focus:outline-none"
      :class="{
        'border-red-500': validation,
        'border-gray-200': !validation
      }"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option disabled value="">Escolha a Instituição</option>
      <option
        v-for="company in companies"
        :key="company.id"
        :value="company.id"
      >
        {{ company.name }}
      </option>
    </select>
    <span
      v-if="validation"
      id="name-error"
      class="ml-2 text-sm text-red-600"
      role="alert"
    >
      Instituição é obrigatório.
    </span>
  </div>
</template>

<script>
import { useCompanyStore } from '@/modules/users/store/company';

export default {
  props: {
    modelValue: [String, Number],
    validation: Boolean,
    label: Boolean,
    wrapperClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      companies: []
    };
  },
  computed: {
    companyStore: () => useCompanyStore()
  },
  mounted() {
    this.fetchCompanies();
  },
  methods: {
    async fetchCompanies() {
      try {
        await this.axios.get('/companies').then(response => {
          this.companies = response;
        });
      } catch (error) {
        console.error('Erro ao carregar instituições', error);
      }
    }
  }
};
</script>
