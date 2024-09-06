<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchLoads" class="custom-select"
    filterable clearable>
    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <el-option v-for="item in filteredLoads" :key="item.method" :label="item.method" :value="item.method">
    </el-option>

    <div class="pagination-container">
      <el-pagination @current-change="handleLoadsPageChange" :current-page="loadsCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalLoads" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getLoads } from '@/services/transportService';

export default defineComponent({
  name: 'LoadSelect',
  props: {
    modelValue: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const loads = ref<{ id: number, method: string }[]>([]);
    const loadsCurrentPage = ref(1);
    const perPage = ref(10);
    const totalLoads = ref(0);
    const localValue = ref<string | null>(props.modelValue === '' ? null : props.modelValue);
    const searchQuery = ref(''); // 存储搜索查询
    const placeholderText = ref('请选择装载方式');
    const allowClear = ref(true);  // 允许清除选项

    const fetchLoads = async () => {
      try {
        const response = await getLoads(perPage.value, loadsCurrentPage.value);
        loads.value = response.data.load;
        totalLoads.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch load methods', error);
      }
    };

    const handleLoadsPageChange = (page: number) => {
      loadsCurrentPage.value = page;
      fetchLoads();
    };

    const handleInput = (query: string) => {
      searchQuery.value = query;
      filterLoads();
    };

    const filterLoads = () => {
      return loads.value.filter(load =>
        load.method.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    };

    const filteredLoads = ref(filterLoads());

    watch([searchQuery, loads], () => {
      filteredLoads.value = filterLoads();
    });

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === '' ? null : newValue;
    });

    return {
      loads,
      loadsCurrentPage,
      perPage,
      totalLoads,
      fetchLoads,
      handleLoadsPageChange,
      localValue,
      placeholderText,
      allowClear,
      handleInput,
      filteredLoads
    };
  },
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
