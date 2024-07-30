<template>
  <el-form-item :label="label">
    <el-select v-model="localValue" placeholder="请选择" @visible-change="fetchOwners">
      <el-option v-for="owner in owners" :key="owner" :label="owner" :value="owner"></el-option>
      <div class="pagination-container">
        <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="perPage"
          layout="prev, pager, next" :total="totalOwners" />
      </div>
    </el-select>
  </el-form-item>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getOwners } from '@/services/transportService';

export default defineComponent({
  name: 'OwnerSelect',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const owners = ref<string[]>([]);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalOwners = ref(0);
    const localValue = ref(props.modelValue);

    const fetchOwners = async () => {
      try {
        const response = await getOwners(perPage.value, currentPage.value);
        owners.value = response.data.owner_list;
        totalOwners.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch owners', error);
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchOwners();
    };

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue;
    });

    return {
      owners,
      currentPage,
      perPage,
      totalOwners,
      fetchOwners,
      handlePageChange,
      localValue
    };
  }
});
</script>

<style scoped>
.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
