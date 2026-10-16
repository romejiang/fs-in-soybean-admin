<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'CrudDoc'
});

const src = ref('http://fast-crud.docmirror.cn/');
</script>

<template>
  <div class="h-full">
    <iframe class="wh-full" title="fast-crud doc" :src="src"></iframe>
  </div>
</template>

<style scoped></style>
