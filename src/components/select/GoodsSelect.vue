<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchGoods" @input="handleInput"
    class="custom-select" filterable clearable>
    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <el-option v-for="item in filteredGoods" :key="item.id" :label="item.name" :value="item.id">
    </el-option>

    <div class="pagination-container">
      <el-pagination @current-change="handleGoodsPageChange" :current-page="goodsCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalGoods" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getCategories } from '@/services/transportService';

export default defineComponent({
  name: 'GoodsSelect',
  props: {
    modelValue: {
      type: Number,
      required: true
    }
  },
  setup(props, { emit }) {
    const goods = ref<{ id: number, name: string }[]>([]);
    const goodsCurrentPage = ref(1);
    const perPage = ref(10);
    const totalGoods = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const searchQuery = ref(''); // 存储搜索查询
    const placeholderText = ref('请选择运输品类');
    const allowClear = ref(true);  // 允许清除选项

    const fetchGoods = async () => {
      try {
        const response = await getCategories(perPage.value, goodsCurrentPage.value);
        goods.value = response.data.goods;
        totalGoods.value = response.data.total_pages * perPage.value;
      } catch (error) {
        console.error('Failed to fetch goods', error);
      }
    };

    const handleGoodsPageChange = (page: number) => {
      goodsCurrentPage.value = page;
      fetchGoods();
    };

    const handleInput = (query: string) => {
      searchQuery.value = query;
      filterGoods();
    };

    const filterGoods = () => {
      return goods.value.filter(good =>
        good.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    };

    const filteredGoods = ref(filterGoods());

    watch([searchQuery, goods], () => {
      filteredGoods.value = filterGoods();
    });

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    return {
      goods,
      goodsCurrentPage,
      perPage,
      totalGoods,
      fetchGoods,
      handleGoodsPageChange,
      localValue,
      placeholderText,
      allowClear,
      handleInput,
      filteredGoods
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
