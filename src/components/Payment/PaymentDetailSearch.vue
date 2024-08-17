<template>
    <div class="payment-detail-search">
      <el-card>
        <h2>付款详情查询</h2>
        <el-form @submit.prevent="fetchFilteredPayments">
          <el-form-item label="老板">
            <OwnerSelect v-model="filters.owner" />
          </el-form-item>
          <el-form-item label="时间范围" class="custom-date-picker">
            <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期"
              end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchFilteredPayments">筛选</el-button>
          </el-form-item>
        </el-form>
      </el-card>
  
      <el-card>
        <h2>筛选结果</h2>
        <el-table :data="filteredPayments" style="width: 100%">
          <el-table-column prop="owner" label="老板" />
          <el-table-column prop="pay.method" label="付款方式" />
          <el-table-column prop="amount" label="付款金额" />
          <el-table-column prop="balance_amount" label="尾款数额" />
          <el-table-column prop="date" label="付款日期" />
          <el-table-column prop="note" label="备注" />
        </el-table>
        <el-pagination
          @current-change="handlePageChange"
          :current-page="currentPage"
          :page-size="perPage"
          layout="prev, pager, next"
          :total="totalRecords"
        />
      </el-card>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import OwnerSelect from '@/components/select/OwnerSelect.vue';
  import { searchPaymentDetails } from '@/services/paymentService';
  
  export default defineComponent({
    name: 'PaymentDetailSearch',
    components: {
      OwnerSelect,
    },
    setup() {
      const filters = ref({
        owner: '',
        dateRange: [] as Date[],
      });
  
      const filteredPayments = ref<any[]>([]);
      const currentPage = ref(1);
      const perPage = ref(10);
      const totalRecords = ref(0);
  
      const fetchFilteredPayments = async () => {
        const start_date = filters.value.dateRange[0] ? filters.value.dateRange[0].toISOString().split('T')[0] : null;
        const end_date = filters.value.dateRange[1] ? filters.value.dateRange[1].toISOString().split('T')[0] : null;
  
        try {
          const response = await searchPaymentDetails({
            owner: filters.value.owner,
            start_date,
            end_date,
          }, perPage.value, currentPage.value);
  
          filteredPayments.value = response.data.payments;
          totalRecords.value = response.data.total_count; // Adjust according to your API response
        } catch (error) {
          console.error('Failed to fetch filtered payments', error);
        }
      };
  
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        fetchFilteredPayments();
      };
  
      onMounted(() => {
        fetchFilteredPayments(); // Fetch initial data
      });
  
      return {
        filters,
        filteredPayments,
        currentPage,
        perPage,
        totalRecords,
        fetchFilteredPayments,
        handlePageChange,
      };
    },
  });
  </script>
  
  <style scoped>
  @import '@/assets/select.css';
  .custom-date-picker {
    margin-bottom: 20px;
  }
  </style>
  