<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchGoods"
    :filter-method="remoteMethod" class="custom-select" filterable clearable>

    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <!-- 商品选项 -->
    <el-option v-for="item in currentGoods" :key="item.id" :label="item.name" :value="item.id">
    </el-option>

    <!-- 分页控制 -->
    <div class="pagination-container" v-if="totalGoods > perPage">
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
    const currentGoods = ref<{ id: number, name: string }[]>([]);
    const goodsCurrentPage = ref(1);
    const perPage = ref(10);
    const totalGoods = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const placeholderText = ref('请选择运输品类');
    const allowClear = ref(true);  // 允许清除选项

    // 获取所有品类数据
    const fetchGoods = async () => {
      try {
        const response = await getCategories(10000000, 1); // 获取所有品类数据
        goods.value = response.data.goods;
        totalGoods.value = goods.value.length;
        handleGoodsPageChange(1); // 初始化分页
      } catch (error) {
        console.error('Failed to fetch goods', error);
      }
    };

    // 分页处理
    const handleGoodsPageChange = (page: number) => {
      goodsCurrentPage.value = page;
      currentGoods.value = goods.value.slice((goodsCurrentPage.value - 1) * perPage.value, goodsCurrentPage.value * perPage.value);
    };

    // 远程搜索方法
    const remoteMethod = async (query: string) => {
      try {
        const response = await getCategories(10000000, 1, query); // 根据查询条件筛选
        goods.value = response.data.goods;
        totalGoods.value = goods.value.length;
        handleGoodsPageChange(1); // 重置分页
      } catch (error) {
        console.error('Failed to fetch filtered goods', error);
      }
    };

    // 监听 localValue 变化
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue === null ? 0 : newValue);
    });

    // 监听 props 传入的值变化
    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue === 0 ? null : newValue;
    });

    return {
      goods,
      currentGoods,
      goodsCurrentPage,
      perPage,
      totalGoods,
      fetchGoods,
      handleGoodsPageChange,
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

.el-select .custom-select .el-select-dropdown__list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
