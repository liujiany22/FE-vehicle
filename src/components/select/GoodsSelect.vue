<template>
    <el-select v-model="localValue" placeholder="请选择运输品类" @visible-change="fetchGoods" class="custom-select">
      <el-option v-for="item in goods" :key="item.id" :label="item.name" :value="item.id"></el-option>
      <div class="pagination-container">
        <el-pagination @current-change="handleGoodsPageChange" :current-page="goodsCurrentPage" :page-size="perPage" layout="prev, pager, next" :total="totalGoods" />
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
    const localValue = ref(props.modelValue);

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

    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue;
    });

    return {
      goods,
      goodsCurrentPage,
      perPage,
      totalGoods,
      fetchGoods,
      handleGoodsPageChange,
      localValue
    };
  },
});
</script>

<style scoped>
@import '@/assets/select.css'; /* 引入共享样式 */

.pagination-container {
  padding: 10px;
  text-align: center;
}
</style>
