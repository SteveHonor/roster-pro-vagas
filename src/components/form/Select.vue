<template>
  <div :class="wrapperClass">
    <label v-if="label" class="mb-1 block text-sm font-medium text-gray-800">
      {{ label }}
    </label>
    <div class="relative">
      <select
        :value="modelValue"
        :disabled="disabled"
        class="block w-full appearance-none truncate rounded-md border border-slate-200 bg-white px-3 py-2 pr-10 text-sm focus:border-slate-500 focus:outline-none focus:ring-0"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="" disabled :selected="!modelValue">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: [String, Number, Boolean],
    label: String,
    options: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Selecione uma opção'
    },
    wrapperClass: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    revertColor: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
