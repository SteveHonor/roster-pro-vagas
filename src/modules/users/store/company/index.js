import { defineStore } from 'pinia';

const companyData = {
  id: '',
  name: '',
  document: '',
  phone: '',
  zipCode: '',
  number: '',
  street: '',
  neighborhood: '',
  complement: '',
  city: '',
  country: '',
  state: ''
};

export const useCompanyStore = defineStore('company', {
  state: () => ({
    company: companyData,
    companies: [],
    chosenCompany: companyData
  }),

  getters: {
    getCompanies(state) {
      return state.companies;
    },
    getCompany(state) {
      return state.company;
    },
    getChosenCompany(state) {
      return state.chosenCompany;
    },
    hasCompany(state) {
      return (
        state.chosenCompany?.name &&
        state.chosenCompany?.document &&
        state.chosenCompany?.id
      );
    }
  },

  actions: {
    setCompanies(companies) {
      this.companies = companies;
    },

    setCompany(updatedFields) {
      this.company = { ...this.company, ...updatedFields };
    },

    setChosenCompany(chose) {
      if (this.companies.length) {
        this.chosenCompany = this.companies.find(
          choseCompany => choseCompany.id === chose.company
        ) ?? companyData;
      } else {
        this.chosenCompany = chose;
      }
    },

    resetCompany() {
      this.company = {
        id: '',
        name: '',
        document: '',
        phone: '',
        zipCode: '',
        number: '',
        street: '',
        neighborhood: '',
        complement: '',
        city: '',
        country: '',
        state: ''
      };
    }
  },
  persist: true
});
