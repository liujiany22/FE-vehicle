<template>
  <div class="advance-entry">
    <el-card>
      <h2>预支录入</h2>
      <el-form @submit.prevent="addParameter">
        <!-- 运输车队输入限制 -->
        <el-form-item label="运输车队" :error="errors.vehicle_id">
          <FleetSelect v-model="form.vehicle_id" />
        </el-form-item>

        <!-- 运输金额 -->
        <el-form-item label="运输金额">
          <el-input v-model="form.amount" type="number" placeholder="请输入金额"  class="custom-input"/>
        </el-form-item>

        <!-- 付款方式输入限制 -->
        <el-form-item label="付款方式" :error="errors.pay_id">
          <PaymentSelect v-model="form.pay_id" />
        </el-form-item>

        <!-- 预支时间输入限制 -->
        <el-form-item label="预支时间" :error="errors.advance_time">
          <el-date-picker v-model="form.advance_time" type="datetime" placeholder="选择预支时间" />
        </el-form-item>

        <!-- 细节备注 -->
        <el-form-item label="细节备注">
          <el-input v-model="form.note" placeholder="请输入备注"  class="custom-input"/>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="addParameter" plain>提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <h2>已录入的预支</h2>
      <el-table :data="advances" style="width: 100%" border>
        <el-table-column prop="vehicle" label="运输车队" show-overflow-tooltip>
          <template v-slot="scope">
            <div v-if="editingId === scope.row.id">
              <FleetSelect v-model="editingAdvance.vehicle_id" />
            </div>
            <div v-else>
              {{ scope.row.vehicle ? `${scope.row.vehicle.license} (${scope.row.vehicle?.driver || '无司机'})` : '无' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" show-overflow-tooltip>
          <template v-slot="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingAdvance.amount" type="number" placeholder="请输入金额" />
            </div>
            <div v-else>
              {{ scope.row.amount || "无" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="pay.method" label="付款方式" show-overflow-tooltip>
          <template v-slot="scope">
            <div v-if="editingId === scope.row.id">
              <PaymentSelect v-model="editingAdvance.pay_id" />
            </div>
            <div v-else>
              {{ scope.row.pay ? scope.row.pay.method : '无' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="advance_time" label="预支时间" show-overflow-tooltip>
          <template v-slot="scope">
            <div v-if="editingId === scope.row.id">
              <el-date-picker v-model="editingAdvance.advance_time" type="datetime" placeholder="选择预支时间" />
            </div>
            <div v-else>
              {{ formatDate(scope.row.advance_time) || "无" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" show-overflow-tooltip>
          <template v-slot="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingAdvance.note" placeholder="请输入备注" />
            </div>
            <div v-else>
              {{ scope.row.note || "无" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" show-overflow-tooltip>
          <template v-slot="scope">
            <div v-if="editingId === scope.row.id">
              <el-button type="primary" @click="saveParameter(scope.row.id)" size="small" plain>保存</el-button>
              <el-button @click="cancelEdit" size="small" plain>取消</el-button>
            </div>
            <div v-else>
              <el-button @click="editParameter(scope.row)" size="small" plain>修改</el-button>
              <el-button type="danger" @click="removeParameter(scope.row.id)" size="small" plain>删除</el-button>
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
import { addAdvance, delAdvance, getAdvances, updateAdvance } from '../../services/financeService';
import { formatDate } from '../../utils/time';
import FleetSelect from '@/components/select/FleetSelect.vue';
import PaymentSelect from '@/components/select/PaymentSelect.vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'Advance',
  components: {
    FleetSelect,
    PaymentSelect,
  },
  setup() {
    const form = ref({
      vehicle_id: 0,
      amount: 0,
      pay_id: 0,
      advance_time: '',
      note: '', // Added note field
    });

    const errors = ref<{
      vehicle_id: string | null,
      pay_id: string | null,
      advance_time: string | null,
    }>({
      vehicle_id: null,
      pay_id: null,
      advance_time: null,
    });

    const validateInputs = () => {
      errors.value.vehicle_id = form.value.vehicle_id ? null : '运输车队不能为空';
      errors.value.pay_id = form.value.pay_id ? null : '付款方式不能为空';
      errors.value.advance_time = form.value.advance_time ? null : '预支时间不能为空';

      return !errors.value.vehicle_id && !errors.value.pay_id && !errors.value.advance_time;
    };

    const advances = ref<{ id: number, vehicle: { id: number, license: string, driver: string }, amount: number, pay: { id: number, method: string }, advance_time: string, note: string }[]>([]);
    const editingAdvance = ref({ vehicle_id: 0, amount: 0, pay_id: 0, advance_time: '', note: '' });
    const editingId = ref<number | null>(null);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalAdvances = ref(0);

    const fetchParameters = async () => {
      try {
        const response = await getAdvances(perPage.value, currentPage.value);
        advances.value = response.data.advances;
        totalAdvances.value = response.data.total_pages * perPage.value;
      } catch (error) {
        ElMessage.error('预支获取失败，请稍后再试');
        console.error('Failed to fetch advances', error);
      }
    };

    const addParameter = async () => {
      try {
        if (!validateInputs()) {
          return;
        }

        await addAdvance(form.value);
        ElMessage.success('预支录入成功');
        resetForm();
        fetchParameters(); // 刷新列表
      } catch (error) {
        ElMessage.error('预支录入失败，请稍后再试');
        console.error('Failed to add advance', error);
      }
    };

    const removeParameter = async (advanceId: number) => {
      try {
        await delAdvance(advanceId);
        ElMessage.success('预支删除成功');
        fetchParameters(); // 刷新列表
      } catch (error) {
        ElMessage.error('预支删除失败，请稍后再试');
        console.error('Failed to delete advance', error);
      }
    };

    const editParameter = (advance: { id: number, vehicle: { id: number, license: string }, amount: number, pay: { id: number, method: string }, advance_time: string, note: string }) => {
      editingId.value = advance.id;
      editingAdvance.value = { vehicle_id: advance.vehicle.id, amount: advance.amount, pay_id: advance.pay.id, advance_time: advance.advance_time, note: advance.note };
    };

    const saveParameter = async (advanceId: number) => {
      try {
        await updateAdvance({ advance_id: advanceId, ...editingAdvance.value });
        ElMessage.success('预支更新成功');
        cancelEdit();
        fetchParameters(); // 刷新列表
      } catch (error) {
        ElMessage.error('预支更新失败，请稍后再试');
        console.error('Failed to update advance', error);
      }
    };

    const cancelEdit = () => {
      editingId.value = null;
      editingAdvance.value = { vehicle_id: 0, amount: 0, pay_id: 0, advance_time: '', note: '' };
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchParameters();
    };

    const resetForm = () => {
      form.value = {
        vehicle_id: 0,
        amount: 0,
        pay_id: 0,
        advance_time: '',
        note: '', // Reset note field
      };
    };

    onMounted(fetchParameters);

    return {
      form,
      errors,
      validateInputs,
      advances,
      editingAdvance,
      editingId,
      currentPage,
      perPage,
      totalAdvances,
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
@import '@/assets/select.css'; /* 引入共享样式 */

.advance-entry {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
