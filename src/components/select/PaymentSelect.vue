<template>
    <el-select 
      v-model="localValue" 
      :placeholder="placeholderText" 
      @visible-change="fetchPayments" 
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
        v-for="item in filteredPayments" 
        :key="item.id" 
        :label="item.method" 
        :value="item.id">
      </el-option>
  
      <div class="pagination-container">
        <el-pagination 
          @current-change="handlePaymentsPageChange" 
          :current-page="paymentsCurrentPage" 
          :page-size="perPage" 
          layout="prev, pager, next" 
          :total="totalPayments" />
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
      const paymentsCurrentPage = ref(1);
      const perPage = ref(10);
      const totalPayments = ref(0);
      const localValue = ref<number | null>(props.modelValue === 0 ? null : props.modelValue);
      const searchQuery = ref(''); // 存储搜索查询
      const placeholderText = ref('请选择付款方式');
      const allowClear = ref(true);  // 允许清除选项
  
      const fetchPayments = async () => {
        try {
          const response = await getPaymentMethods(perPage.value, paymentsCurrentPage.value);
          payments.value = response.data.pay;
          totalPayments.value = response.data.total_pages * perPage.value;
        } catch (error) {
          console.error('Failed to fetch payment methods', error);
        }
      };
  
      const handlePaymentsPageChange = (page: number) => {
        paymentsCurrentPage.value = page;
        fetchPayments();
      };
  
      const handleInput = (query: string) => {
        searchQuery.value = query;
        filterPayments();
      };
  
      const filterPayments = () => {
        return payments.value.filter(payment => 
          payment.method.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      };
  
      const filteredPayments = ref(filterPayments());
  
      watch([searchQuery, payments], () => {
        filteredPayments.value = filterPayments();
      });
  
      watch(localValue, (newValue) => {
        emit('update:modelValue', newValue === null ? 0 : newValue);
      });
  
      watch(() => props.modelValue, (newValue) => {
        localValue.value = newValue === 0 ? null : newValue;
      });
  
      return {
        payments,
        paymentsCurrentPage,
        perPage,
        totalPayments,
        fetchPayments,
        handlePaymentsPageChange,
        localValue,
        placeholderText,
        allowClear,
        handleInput,
        filteredPayments
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
  