<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchLoads"
    :filter-method="remoteMethod" class="custom-select" filterable clearable>

    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <!-- 装载方式选项 -->
    <el-option v-for="item in currentLoads" :key="item.method" :label="item.method" :value="item.method">
    </el-option>

    <!-- 分页控制 -->
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
    const currentLoads = ref<{ id: number, method: string }[]>([]);
    const loadsCurrentPage = ref(1);
    const perPage = ref(10);
    const totalLoads = ref(0);
    const localValue = ref<string | null>(props.modelValue === '' ? null : props.modelValue);
    const placeholderText = ref('请选择装载方式');
    const allowClear = ref(true);  // 允许清除选项

    // 获取装载方式数据
    const fetchLoads = async () => {
      try {
        const response = await getLoads(10000000, 1); // 获取所有装载方式数据
        loads.value = response.data.load;
        totalLoads.value = loads.value.length;
        handleLoadsPageChange(1); // 初始化分页
      } catch (error) {
        console.error('Failed to fetch load methods', error);
      }
    };

    // 分页处理
    const handleLoadsPageChange = (page: number) => {
      loadsCurrentPage.value = page;
      currentLoads.value = loads.value.slice((loadsCurrentPage.value - 1) * perPage.value, loadsCurrentPage.value * perPage.value);
    };

    // 远程搜索方法
    const remoteMethod = async (query: string) => {
      try {
        const response = await getLoads(10000000, 1, query); // 根据查询条件筛选
        loads.value = response.data.load;
        totalLoads.value = loads.value.length;
        handleLoadsPageChange(1); // 重置分页
      } catch (error) {
        console.error('Failed to fetch filtered load methods', error);
      }
    };

    // 监听 localValue 变化
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? '' : newValue);
    });

    // 监听 props 传入的值变化
    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === '' ? null : newValue;
    });

    return {
      loads,
      currentLoads,
      loadsCurrentPage,
      perPage,
      totalLoads,
      fetchLoads,
      handleLoadsPageChange,
      localValue,
      placeholderText,
      allowClear,
      remoteMethod,
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
