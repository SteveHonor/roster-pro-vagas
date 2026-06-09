<template>
  <div class="flex gap-3 justify-center">
    <input
      v-for="(_, index) in 4"
      :key="index"
      :ref="el => { if (el) inputs[index] = el }"
      type="tel"
      inputmode="numeric"
      maxlength="1"
      pattern="[0-9]*"
      :value="displayValue(index)"
      class="h-14 w-12 rounded-xl border-2 border-slate-200 bg-slate-50 text-center text-2xl font-bold text-slate-900 transition focus:border-blue-500 focus:bg-white focus:outline-none"
      :class="{ 'border-red-400 bg-red-50': error }"
      autocomplete="one-time-code"
      @input="onInput(index, $event)"
      @keydown="onKeydown(index, $event)"
      @paste="onPaste($event)"
      @focus="onFocus(index, $event)"
    />
  </div>
</template>

<script>
export default {
  name: 'PinInput',
  props: {
    modelValue: { type: String, default: '' },
    error:      { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'complete'],
  data() {
    return {
      digits:        ['', '', '', ''],
      inputs:        [],
      focusedIndex:  null,
      maskedIndices: new Set()
    };
  },
  watch: {
    modelValue(val) {
      if (val === '') this.digits = ['', '', '', ''];
    }
  },
  methods: {
    displayValue(index) {
      if (this.focusedIndex === index) return this.digits[index];
      if (this.maskedIndices.has(index) && this.digits[index]) return '●';
      return this.digits[index];
    },

    onFocus(index, event) {
      this.focusedIndex = index;
      this.$nextTick(() => event.target.select());
    },

    onInput(index, event) {
      const raw = event.target.value.replace(/●/g, '').replace(/\D/g, '').slice(-1);
      this.digits[index] = raw;

      const value = this.digits.join('');
      this.$emit('update:modelValue', value);

      // Mascara o input anterior quando o usuário digita neste
      if (index > 0) {
        this.maskedIndices = new Set([...this.maskedIndices, index - 1]);
      }

      if (raw && index < 3) {
        this.$nextTick(() => this.inputs[index + 1]?.focus());
      }

      if (value.length === 4) this.$emit('complete', value);
    },

    onKeydown(index, event) {
      if (event.key === 'Backspace') {
        if (this.digits[index]) {
          this.digits[index] = '';
          this.$emit('update:modelValue', this.digits.join(''));
        } else if (index > 0) {
          this.inputs[index - 1]?.focus();
        }
      }
      if (event.key === 'ArrowLeft' && index > 0)  this.inputs[index - 1]?.focus();
      if (event.key === 'ArrowRight' && index < 3) this.inputs[index + 1]?.focus();
    },

    onPaste(event) {
      event.preventDefault();
      const text   = (event.clipboardData || window.clipboardData).getData('text');
      const digits = text.replace(/\D/g, '').slice(0, 4).split('');
      digits.forEach((d, i) => { this.digits[i] = d; });
      this.$emit('update:modelValue', this.digits.join(''));
      const nextEmpty = this.digits.findIndex(d => !d);
      const focusIdx  = nextEmpty === -1 ? 3 : nextEmpty;
      this.$nextTick(() => this.inputs[focusIdx]?.focus());
      if (this.digits.join('').length === 4) this.$emit('complete', this.digits.join(''));
    },

    focus() {
      this.$nextTick(() => this.inputs[0]?.focus());
    },

    reset() {
      this.digits        = ['', '', '', ''];
      this.focusedIndex  = null;
      this.maskedIndices = new Set();
      this.$emit('update:modelValue', '');
      this.$nextTick(() => this.inputs[0]?.focus());
    }
  }
};
</script>
