<template>
  <div :class="wrapperClass">
    <label v-if="label" class="mb-1 block text-sm font-medium text-gray-800">{{
      label
    }}</label>
    <div class="relative">
      <textarea
        :value="modelValue"
        :disabled="disabled"
        :rows="rows"
        :placeholder="placeholder"
        class="focus:ring-gray-500 w-full rounded border border-gray-200 bg-gray-100 p-2 focus:border-gray-500"
        :class="{ 'pl-10': icon }"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormTextarea',
  props: {
    modelValue: String,
    label: String,
    placeholder: String,
    icon: String,
    rows: {
      type: [String, Number],
      default: null
    },
    type: {
      type: String,
      default: 'text'
    },
    wrapperClass: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
};
</script>
