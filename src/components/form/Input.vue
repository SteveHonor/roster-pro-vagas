<template>
  <div :class="wrapperClass">
    <label v-if="label" class="mb-1 block text-sm font-medium text-slate-700">{{ label }}</label>
    <div class="relative">
      <span
        v-if="icon || currency"
        class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400"
      >
        <BaseIcon :name="currency ? 'BankNotes' : icon" class="!size-4" />
      </span>
      <input
        :type="currency ? 'text' : effectiveType"
        :inputmode="currency ? 'decimal' : undefined"
        :value="currency ? currencyDisplay : (value || modelValue)"
        :disabled="disabled"
        :placeholder="placeholder"
        :class="{ 'pl-10': icon || currency, 'pr-10': type === 'password' }"
        v-bind="mask ? { 'v-mask': mask } : {}"
        class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-0 disabled:bg-slate-50 disabled:text-slate-400"
        @input="currency ? handleCurrencyInput($event) : $emit('update:modelValue', $event.target.value)"
        @blur="currency ? handleCurrencyBlur($event) : handleBlur($event)"
        @focus="currency ? handleCurrencyFocus($event) : undefined"
      />
      <button
        v-if="type === 'password'"
        type="button"
        tabindex="-1"
        class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
        @click="showPassword = !showPassword"
      >
        <BaseIcon :name="showPassword ? 'EyeSlash' : 'Eye'" class="!size-4" />
      </button>
    </div>
    <p v-if="hint" class="mt-1 text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon.vue';

export default {
  name: 'FormInput',
  components: { BaseIcon },
  props: {
    modelValue: [String, Number],
    label: String,
    placeholder: String,
    icon: String,
    hint: String,
    value: String,
    type: { type: String, default: 'text' },
    wrapperClass: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    mask: String,
    onBlur: Function,
    currency: { type: Boolean, default: false }
  },
  data() {
    return {
      currencyDisplay: this.centsToStr(this.modelValue),
      showPassword: false
    };
  },
  computed: {
    effectiveType() {
      if (this.type === 'password') return this.showPassword ? 'text' : 'password';
      return this.type;
    }
  },
  watch: {
    modelValue(val) {
      this.currencyDisplay = this.centsToStr(val);
    }
  },
  methods: {
    centsToStr(cents) {
      if (!cents && cents !== 0) return '';
      return (cents / 100).toFixed(2).replace('.', ',');
    },
    strToCents(str) {
      if (!str) return null;
      const val = parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.'));
      return isNaN(val) ? null : Math.round(val * 100);
    },
    handleCurrencyInput(e) {
      let raw = e.target.value.replace(/[^\d,]/g, '');
      const parts = raw.split(',');
      if (parts.length > 2) raw = parts[0] + ',' + parts.slice(1).join('');
      if (parts[1]?.length > 2) raw = parts[0] + ',' + parts[1].slice(0, 2);
      this.currencyDisplay = raw;
      this.$emit('update:modelValue', this.strToCents(raw));
    },
    handleCurrencyBlur(e) {
      const cents = this.strToCents(this.currencyDisplay);
      this.currencyDisplay = this.centsToStr(cents);
      this.$emit('update:modelValue', cents);
      this.handleBlur(e);
    },
    handleCurrencyFocus() {
      if (this.currencyDisplay) {
        this.currencyDisplay = this.currencyDisplay.replace(/,?0+$/, '') || '';
      }
    },
    handleBlur(event) {
      if (this.onBlur && typeof this.onBlur === 'function') {
        this.onBlur(event);
      }
    }
  }
};
</script>
