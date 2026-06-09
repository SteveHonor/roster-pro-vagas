<template>
  <component :is="icon" />
</template>

<script>
import * as components from './svg';

export default {
  components,
  props: {
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    icon: self => self.name
  }
};
</script>
