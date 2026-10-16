<script setup lang="ts">
import { onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import createCrudOptions from './crud';

defineOptions({
  name: 'CrudHeaderGroup'
});

const { crudRef, crudBinding, crudExpose } = useFs({ createCrudOptions });

// 页面打开后获取列表数据
onMounted(() => {
  crudExpose.doRefresh();
});
</script>

<template>
  <div class="h-full fs-page-header-group">
    <FsCrud ref="crudRef" v-bind="crudBinding" />
  </div>
</template>

<style scoped></style>
