<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchEndSites"
    class="custom-select" filterable clearable>
    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <el-option v-for="item in filteredEndSites" :key="item.id" :label="item.name" :value="item.id">
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
import { ElMessage } from 'element-plus';


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
    const endSiteCurrentPage = ref(1);
    const perPage = ref(10);
    const totalEndSites = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const searchQuery = ref(''); // 存储搜索查询
    const placeholderText = ref('请选择运输终点');
    const allowClear = ref(true);  // 允许清除选项

    const fetchEndSites = async () => {
      try {
        const response = await getEndSites(perPage.value, endSiteCurrentPage.value);
        end_sites.value = response.data.end_sites;
        totalEndSites.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch end sites', error);
      }
    };

    const handleEndSitePageChange = (page: number) => {
      endSiteCurrentPage.value = page;
      fetchEndSites();
    };

    const handleInput = (query: string) => {
      searchQuery.value = query;
      filterEndSites();
    };

    const filterEndSites = () => {
      return end_sites.value.filter(site =>
        site.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    };

    const filteredEndSites = ref(filterEndSites());

    watch([searchQuery, end_sites], () => {
      filteredEndSites.value = filterEndSites();
    });

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    return {
      end_sites,
      endSiteCurrentPage,
      perPage,
      totalEndSites,
      fetchEndSites,
      handleEndSitePageChange,
      localValue,
      placeholderText,
      allowClear,
      handleInput,
      filteredEndSites
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
