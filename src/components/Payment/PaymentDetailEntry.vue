<template>
    <div class="payment-detail-entry">
      <el-card>
        <h2>付款详情录入</h2>
        <el-form @submit.prevent="addParameter">
          <el-form-item label="老板">
            <OwnerSelect v-model="form.owner" />
          </el-form-item>
          <el-form-item label="付款方式">
            <PaymentSelect v-model="form.pay_id" />
          </el-form-item>
          <el-form-item label="付款金额">
            <el-input v-model="form.amount" type="number" placeholder="请输入付款金额" class="custom-input" />
          </el-form-item>
          <el-form-item label="尾款数额">
            <el-input v-model="form.balance_amount" type="number" placeholder="请输入尾款数额" class="custom-input" />
          </el-form-item>
          <el-form-item label="付款日期">
            <el-date-picker v-model="form.date" type="date" placeholder="选择付款日期" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.note" placeholder="请输入备注" class="custom-input" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addParameter">提交</el-button>
          </el-form-item>
        </el-form>
      </el-card>
  
      <el-card>
        <h2>已录入的付款详情</h2>
        <el-table :data="paymentDetails" style="width: 100%">
          <el-table-column prop="owner" label="老板">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <OwnerSelect v-model="editingPayment.owner" />
              </div>
              <div v-else>
                {{ scope.row.owner }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="pay.method" label="付款方式">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <PaymentSelect v-model="editingPayment.pay_id" />
              </div>
              <div v-else>
                {{ scope.row.pay.method }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="付款金额">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <el-input v-model="editingPayment.amount" type="number" placeholder="请输入金额" />
              </div>
              <div v-else>
                {{ scope.row.amount }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="balance_amount" label="尾款数额">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <el-input v-model="editingPayment.balance_amount" type="number" placeholder="请输入余额金额" />
              </div>
              <div v-else>
                {{ scope.row.balance_amount }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="付款日期">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <el-date-picker v-model="editingPayment.date" type="date" placeholder="选择付款日期" />
              </div>
              <div v-else>
                {{ formatDate(scope.row.date) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="note" label="备注">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <el-input v-model="editingPayment.note" placeholder="请输入备注" />
              </div>
              <div v-else>
                {{ scope.row.note }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <el-button type="primary" @click="saveParameter(scope.row.id)">保存</el-button>
                <el-button @click="cancelEdit">取消</el-button>
              </div>
              <div v-else>
                <el-button @click="editParameter(scope.row)">修改</el-button>
                <el-button type="danger" @click="removeParameter(scope.row.id)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="perPage"
          layout="prev, pager, next" :total="totalPaymentDetails" />
      </el-card>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { addPaymentDetail, delPaymentDetail, getPaymentDetails, updatePaymentDetail } from '@/services/paymentService';
  import OwnerSelect from '@/components/select/OwnerSelect.vue';
  import PaymentSelect from '@/components/select/PaymentSelect.vue';
  import { formatDate } from '@/utils/time';
  
  export default defineComponent({
    name: 'PaymentDetailEntry',
    components: {
      OwnerSelect,
      PaymentSelect,
    },
    setup() {
      const form = ref({
        owner: '',
        pay_id: 0,
        amount: 0,
        balance_amount: 0,
        date: '',
        note: '',
      });
  
      const paymentDetails = ref<any[]>([]);
      const editingPayment = ref({
        owner: '',
        pay_id: 0,
        amount: 0,
        balance_amount: 0,
        date: '',
        note: '',
      });
      const editingId = ref<number | null>(null);
      const currentPage = ref(1);
      const perPage = ref(10);
      const totalPaymentDetails = ref(0);
  
      const fetchPaymentDetails = async () => {
        try {
          const response = await getPaymentDetails(perPage.value, currentPage.value);
          paymentDetails.value = response.data.payments;
          totalPaymentDetails.value = response.data.total_pages * perPage.value;
        } catch (error) {
          console.error('Failed to fetch payment details', error);
        }
      };
  
      const addParameter = async () => {
        try {
          await addPaymentDetail(form.value);
          alert('付款详情录入成功');
          resetForm();
          fetchPaymentDetails(); // 刷新列表
        } catch (error) {
          console.error('Failed to add payment detail', error);
        }
      };
  
      const removeParameter = async (id: number) => {
        try {
          await delPaymentDetail(id);
          alert('付款详情删除成功');
          fetchPaymentDetails(); // 刷新列表
        } catch (error) {
          console.error('Failed to delete payment detail', error);
        }
      };
  
      const editParameter = (payment: any) => {
        editingId.value = payment.id;
        editingPayment.value = { ...payment };
      };
  
      const saveParameter = async (id: number) => {
        try {
          await updatePaymentDetail({ payment_id: id, ...editingPayment.value });
          alert('付款详情更新成功');
          cancelEdit();
          fetchPaymentDetails(); // 刷新列表
        } catch (error) {
          console.error('Failed to update payment detail', error);
        }
      };
  
      const cancelEdit = () => {
        editingId.value = null;
        editingPayment.value = { owner: '', pay_id: 0, amount: 0, balance_amount: 0, date: '', note: '' };
      };
  
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        fetchPaymentDetails();
      };
  
      const resetForm = () => {
        form.value = {
          owner: '',
          pay_id: 0,
          amount: 0,
          balance_amount: 0,
          date: '',
          note: '',
        };
      };
  
      onMounted(fetchPaymentDetails);
  
      return {
        form,
        paymentDetails,
        editingPayment,
        editingId,
        currentPage,
        perPage,
        totalPaymentDetails,
        addParameter,
        removeParameter,
        editParameter,
        saveParameter,
        cancelEdit,
        handlePageChange,
        formatDate,
      };
    },
  });
  </script>
  
  <style scoped>
  @import '@/assets/select.css';
  
  .payment-detail {
    padding: 20px;
  }
  
  .el-card {
    margin-bottom: 20px;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
  </style>
  