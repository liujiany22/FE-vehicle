<template>
  <el-select 
    v-model="localValue" 
    :placeholder="placeholderText" 
    @visible-change="fetchOwners" 
    @input="handleInput"
    class="custom-select"
    filterable
    clearable>
    <!-- 默认的取消选项 -->
    <el-option 
      v-if="allowClear" 
      :key="null" 
      :label="placeholderText" 
      :value="null">
    </el-option>

    <el-option 
      v-for="owner in filteredOwners" 
      :key="owner" 
      :label="owner" 
      :value="owner">
    </el-option>

    <div class="pagination-container">
      <el-pagination 
        @current-change="handlePageChange" 
        :current-page="currentPage" 
        :page-size="perPage"
        layout="prev, pager, next" 
        :total="totalOwners" />
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
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalOwners = ref(0);
    const localValue = ref<string | null>(props.modelValue || null);
    const searchQuery = ref(''); // 存储搜索查询
    const placeholderText = ref('请选择老板');
    const allowClear = ref(true);  // 允许清除选项

    const fetchOwners = async () => {
      try {
        const response = await getOwners(perPage.value, currentPage.value);
        owners.value = response.data.owner_list; // 更新为从 response.data.owner_list 获取老板列表
        totalOwners.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch owners', error);
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchOwners();
    };

    const handleInput = (query: string) => {
      searchQuery.value = query;
      filterOwners();
    };

    const filterOwners = () => {
      return owners.value.filter(owner => 
        owner.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    };

    const filteredOwners = ref(filterOwners());

    watch([searchQuery, owners], () => {
      filteredOwners.value = filterOwners();
    });

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
      fetchOwners,
      handlePageChange,
      localValue,
      placeholderText,
      allowClear,
      handleInput,
      filteredOwners
    };
  }
});
</script>

<style scoped>
@import '@/assets/select.css'; /* 引入共享样式 */

.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
