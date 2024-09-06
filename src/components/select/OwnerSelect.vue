<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchOwners" class="custom-select"
    filterable clearable>
    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <el-option v-for="owner in currentOwners" :key="owner" :label="owner" :value="owner">
    </el-option>

    <div class="pagination-container">
      <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalOwners" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getOwners } from '@/services/detailService';

export default defineComponent({
  name: 'OwnerSelect',
  props: {
    modelValue: {
      type: String,
      required: true
    },
  },
  setup(props, { emit }) {
    const owners = ref<string[]>([]);
    const currentOwners = ref<string[]>([]);

    const currentPage = ref(1);
    const perPage = ref(10);
    const totalOwners = ref(0);

    const localValue = ref<string | null>(props.modelValue || null);

    const placeholderText = ref('请选择老板');
    const allowClear = ref(true);  // 允许清除选项

    const fetchOwners = async () => {
      try {
        const response = await getOwners(10000000, 1);
        owners.value = response.data.owner_list; // 更新为从 response.data.owner_list 获取老板列表
        totalOwners.value = owners.value.length;

        handlePageChange(1);
      } catch (error) {
        console.error('Failed to fetch owners', error);
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      currentOwners.value = owners.value.slice((currentPage.value - 1) * perPage.value, currentPage.value * perPage.value);
    };

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? '' : newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue || null;
    });

    return {
      owners,
      currentPage,
      perPage,
      totalOwners,
      currentOwners,
      fetchOwners,
      handlePageChange,
      localValue,
      placeholderText,
      allowClear,
    };
  }
});
</script>

<style scoped>
@import '@/assets/select.css';
/* 引入共享样式 */

.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
