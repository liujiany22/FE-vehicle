<template>
    <div class="advance-search">
      <el-card>
        <h2>预支查询</h2>
        <el-form @submit.prevent="fetchFilteredAdvances">
          <el-form-item label="运输车队">
            <FleetSelect v-model="filters.vehicle_id" />
          </el-form-item>
          <el-form-item label="时间范围" class="custom-date-picker">
            <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期"
              end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchFilteredAdvances">筛选</el-button>
          </el-form-item>
        </el-form>
      </el-card>
  
      <el-card v-if="advances.length">
        <el-table :data="advances" style="width: 100%">
          <el-table-column prop="vehicle" label="运输车队">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <FleetSelect v-model="editingAdvance.vehicle_id" />
              </div>
              <div v-else>
                {{ scope.row.vehicle ? `${scope.row.vehicle.license} (${scope.row.vehicle?.driver || '无司机'})` : '无' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <el-input v-model="editingAdvance.amount" type="number" placeholder="请输入金额" />
              </div>
              <div v-else>
                {{ scope.row.amount || "无" }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="pay.method" label="付款方式">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <PaymentSelect v-model="editingAdvance.pay_id" />
              </div>
              <div v-else>
                {{ scope.row.pay ? scope.row.pay.method : '无' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="advance_time" label="预支时间">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <el-date-picker v-model="editingAdvance.advance_time" type="datetime" placeholder="选择预支时间" />
              </div>
              <div v-else>
                {{ formatDate(scope.row.advance_time) || "无" }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="note" label="备注">
            <template v-slot="scope">
              <div v-if="editingId === scope.row.id">
                <el-input v-model="editingAdvance.note" placeholder="请输入备注" />
              </div>
              <div v-else>
                {{ scope.row.note || "无" }}
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
          layout="prev, pager, next" :total="totalAdvances" />
      </el-card>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import FleetSelect from '@/components/select/FleetSelect.vue';
  import PaymentSelect from '@/components/select/PaymentSelect.vue';
  import { searchAdvances, updateAdvance, delAdvance } from '@/services/financeService';
  import { formatDate } from '@/utils/time';
import { isNullishCoalesce } from 'typescript';
import { ElLoading } from 'element-plus';
  
  export default defineComponent({
    name: 'AdvanceSearch',
    components: {
      FleetSelect,
      PaymentSelect,
    },
    setup() {
      const advances = ref([]);
      const filters = ref({
        vehicle_id: 0,
        dateRange: [],
      });
      const currentPage = ref(1);
      const perPage = ref(10);
      const totalAdvances = ref(0);
      const editingAdvance = ref({
        vehicle_id: 0,
        amount: 0,
        pay_id: 0,
        advance_time: '',
        note: '',
      });
      const editingId = ref<number | null>(null);
  
      const fetchFilteredAdvances = async () => {
        const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在加载，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)',
      });
        try {
          const check_date = filters.value.dateRange;
          const params = {
            vehicle_id: filters.value.vehicle_id,
            start_date: check_date ? (filters.value.dateRange[0] ? new Date(filters.value.dateRange[0]).toISOString() : null) : null,
            end_date: check_date ? (filters.value.dateRange[1] ? new Date(filters.value.dateRange[1]).toISOString() : null) : null,
          };
          const response = await searchAdvances(params, perPage.value, currentPage.value);
          advances.value = response.data.advances.map((item: any) => ({
            id: item.id,
            vehicle: item.vehicle || { license: '', driver: '' },
            amount: item.amount || 0,
            pay: item.pay || { method: '无' },
            advance_time: item.advance_time || null,
            note: item.note || '',
          }));
          totalAdvances.value = response.data.total_pages * perPage.value;
          loadingInstance.close();
        } catch (error) {
          console.error('Failed to fetch advances', error);
          loadingInstance.close();
        }
      };
  
      const editParameter = (advance: any) => {
        editingId.value = advance.id;
        editingAdvance.value = { 
          vehicle_id: advance.vehicle.id, 
          amount: advance.amount, 
          pay_id: advance.pay ? advance.pay.id : 0, 
          advance_time: advance.advance_time, 
          note: advance.note 
        };
      };
  
      const saveParameter = async (advanceId: number) => {
        try {
          await updateAdvance({ advance_id: advanceId, ...editingAdvance.value });
          alert('预支更新成功');
          cancelEdit();
          fetchFilteredAdvances();
        } catch (error) {
          console.error('Failed to update advance', error);
        }
      };
  
      const cancelEdit = () => {
        editingId.value = null;
        editingAdvance.value = { vehicle_id: 0, amount: 0, pay_id: 0, advance_time: '', note: '' };
      };
  
      const removeParameter = async (advanceId: number) => {
        try {
          await delAdvance(advanceId);
          alert('预支删除成功');
          fetchFilteredAdvances();
        } catch (error) {
          console.error('Failed to delete advance', error);
        }
      };
  
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        fetchFilteredAdvances();
      };
  
      onMounted(fetchFilteredAdvances);
  
      return {
        filters,
        advances,
        currentPage,
        perPage,
        totalAdvances,
        editingAdvance,
        editingId,
        fetchFilteredAdvances,
        editParameter,
        saveParameter,
        cancelEdit,
        removeParameter,
        handlePageChange,
        formatDate,
      };
    },
  });
  </script>
  
  <style scoped>
  @import '@/assets/select.css';
  
  .advance-search {
    padding: 20px;
  }
  
  .el-card {
    margin-bottom: 20px;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
  </style>
  