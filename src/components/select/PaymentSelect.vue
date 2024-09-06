<template>
  <el-select v-model="localValue" :placeholder="placeholderText" @visible-change="fetchPayments"
    :filter-method="remoteMethod" class="custom-select" filterable clearable>

    <!-- 默认的取消选项 -->
    <el-option v-if="allowClear" :key="null" :label="placeholderText" :value="null">
    </el-option>

    <!-- 付款方式选项 -->
    <el-option v-for="item in currentPayments" :key="item.id" :label="item.method" :value="item.id">
    </el-option>

    <!-- 分页控制 -->
    <div class="pagination-container">
      <el-pagination @current-change="handlePaymentsPageChange" :current-page="paymentsCurrentPage" :page-size="perPage"
        layout="prev, pager, next" :total="totalPayments" />
    </div>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { getPaymentMethods } from '@/services/transportService';

export default defineComponent({
  name: 'PaymentSelect',
  props: {
    modelValue: {
      type: Number,
      required: true
    }
  },
  setup(props, { emit }) {
    const payments = ref<{ id: number, method: string }[]>([]);
    const currentPayments = ref<{ id: number, method: string }[]>([]);
    const paymentsCurrentPage = ref(1);
    const perPage = ref(10);
    const totalPayments = ref(0);
    const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
    const placeholderText = ref('请选择付款方式');
    const allowClear = ref(true);  // 允许清除选项

    // 获取付款方式数据
    const fetchPayments = async () => {
      try {
        const response = await getPaymentMethods(10000000, 1); // 获取所有付款方式数据
        payments.value = response.data.pay;
        totalPayments.value = payments.value.length;
        handlePaymentsPageChange(1); // 初始化分页
      } catch (error) {
        console.error('Failed to fetch payment methods', error);
      }
    };

    // 分页处理
    const handlePaymentsPageChange = (page: number) => {
      paymentsCurrentPage.value = page;
      currentPayments.value = payments.value.slice((paymentsCurrentPage.value - 1) * perPage.value, paymentsCurrentPage.value * perPage.value);
    };

    // 远程搜索方法
    const remoteMethod = async (query: string) => {
      try {
        const response = await getPaymentMethods(10000000, 1, query); // 根据查询条件筛选付款方式
        payments.value = response.data.pay;
        totalPayments.value = payments.value.length;
        handlePaymentsPageChange(1); // 重置分页
      } catch (error) {
        console.error('Failed to fetch filtered payment methods', error);
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
      payments,
      currentPayments,
      paymentsCurrentPage,
      perPage,
      totalPayments,
      fetchPayments,
      handlePaymentsPageChange,
      localValue,
      placeholderText,
      allowClear,
      remoteMethod
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
