<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'CrudSource'
});

const src = ref('https://github.com/fast-crud/fast-crud');
</script>

<template>
  <div class="h-full">
    <iframe class="wh-full" title="fast-crud source" :src="src"></iframe>
  </div>
</template>

<style scoped></style>
