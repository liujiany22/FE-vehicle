<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchEndSites" :filter-method="remoteMethod" class="custom-select"
    filterable clearable>
    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <el-option v-for="item in currentEndSites" :key="item.id" :label="item.name" :value="item.id">
    </el-option>

    <div class="pagination-container">
      <el-pagination @current-change="handleEndSitePageChange" :current-page="endSiteCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalEndSites" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getEndSites } from '@/services/transportService';

export default defineComponent({
  name: 'EndSiteSelect',
  props: {
    modelValue: {
      type: Number,
      required: true
    }
  },
  setup(props, { emit }) {
    const end_sites = ref<{ id: number, name: string }[]>([]);
    const currentEndSites = ref<{ id: number, name: string }[]>([]);
    const endSiteCurrentPage = ref(1);
    const perPage = ref(10);
    const totalEndSites = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const placeholderText = ref('请选择运输终点');
    const allowClear = ref(true);  // 允许清除选项

    // 获取终点站数据
    const fetchEndSites = async () => {
      try {
        const response = await getEndSites(10000000, 1); // 获取所有终点站数据
        end_sites.value = response.data.end_sites;
        totalEndSites.value = end_sites.value.length;
        handleEndSitePageChange(1); // 初始化分页
      } catch (error) {
        console.error('Failed to fetch end sites', error);
      }
    };

    // 处理分页切换
    const handleEndSitePageChange = (page: number) => {
      endSiteCurrentPage.value = page;
      currentEndSites.value = end_sites.value.slice((endSiteCurrentPage.value - 1) * perPage.value, endSiteCurrentPage.value * perPage.value);
    };

    // 远程搜索方法
    const remoteMethod = async (query: string) => {
      try {
        const response = await getEndSites(10000000, 1, undefined, query); // 根据查询条件筛选
        end_sites.value = response.data.end_sites;
        totalEndSites.value = end_sites.value.length;
        handleEndSitePageChange(1); // 重置分页
      } catch (error) {
        console.error('Failed to fetch filtered end sites', error);
      }
    };

    // 监听本地值变化
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    // 监听 props 传入的值变化
    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    return {
      end_sites,
      currentEndSites,
      endSiteCurrentPage,
      perPage,
      totalEndSites,
      fetchEndSites,
      handleEndSitePageChange,
      remoteMethod,
      localValue,
      placeholderText,
      allowClear,
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
