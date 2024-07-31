<template>
  <div class="advance-entry">
    <el-card>
      <h2>预付款录入</h2>
      <el-form @submit.prevent="addParameter">
        <el-form-item label="运输车队">
          <FleetSelect v-model="form.vehicle_id" />
        </el-form-item>
        <el-form-item label="运输金额">
          <el-input v-model="form.amount" type="number" placeholder="请输入金额"  class="custom-input"/>
        </el-form-item>
        <el-form-item label="预付款时间">
          <el-date-picker v-model="form.advance_time" type="datetime" placeholder="选择预付款时间" />
        </el-form-item>
        <el-form-item label="细节备注">
          <el-input v-model="form.note" placeholder="请输入备注"  class="custom-input"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addParameter">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <h2>已录入的预付款</h2>
      <el-table :data="advances" style="width: 100%">
        <el-table-column prop="vehicle.license" label="司机">
          <template v-slot="scope">
            <div v-if="editingId === scope.row.id">
              <FleetSelect v-model="editingAdvance.vehicle_id" />
            </div>
            <div v-else>
              {{ scope.row.vehicle.license }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额">
          <template v-slot="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingAdvance.amount" type="number" placeholder="请输入金额" />
            </div>
            <div v-else>
              {{ scope.row.amount }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="advance_time" label="预付款时间">
          <template v-slot="scope">
            <div v-if="editingId === scope.row.id">
              <el-date-picker v-model="editingAdvance.advance_time" type="datetime" placeholder="选择预付款时间" />
            </div>
            <div v-else>
              {{ formatDate(scope.row.advance_time) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注">
          <template v-slot="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingAdvance.note" placeholder="请输入备注" />
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
        layout="prev, pager, next" :total="totalAdvances" />
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { addAdvance, delAdvance, getAdvances, updateAdvance } from '../../services/financeService';
import { formatDate } from '../../utils/time';
import FleetSelect from '@/components/select/FleetSelect.vue';

export default defineComponent({
  name: 'Advance',
  components: {
    FleetSelect,
  },
  setup() {
    const form = ref({
      vehicle_id: 0,
      amount: 0,
      advance_time: '',
      note: '', // Added note field
    });

    const advances = ref<{ id: number, vehicle: { id: number, license: string }, amount: number, advance_time: string, note: string }[]>([]);
    const editingAdvance = ref({ vehicle_id: 0, amount: 0, advance_time: '', note: '' });
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
        console.error('Failed to fetch advances', error);
      }
    };

    const addParameter = async () => {
      try {
        await addAdvance(form.value);
        alert('预付款录入成功');
        resetForm();
        fetchParameters(); // 刷新列表
      } catch (error) {
        console.error('Failed to add advance', error);
      }
    };

    const removeParameter = async (advanceId: number) => {
      try {
        await delAdvance(advanceId);
        alert('预付款删除成功');
        fetchParameters(); // 刷新列表
      } catch (error) {
        console.error('Failed to delete advance', error);
      }
    };

    const editParameter = (advance: { id: number, vehicle: { id: number, license: string }, amount: number, advance_time: string, note: string }) => {
      editingId.value = advance.id;
      editingAdvance.value = { vehicle_id: advance.vehicle.id, amount: advance.amount, advance_time: advance.advance_time, note: advance.note };
    };

    const saveParameter = async (advanceId: number) => {
      try {
        await updateAdvance({ advance_id: advanceId, ...editingAdvance.value });
        alert('预付款更新成功');
        cancelEdit();
        fetchParameters(); // 刷新列表
      } catch (error) {
        console.error('Failed to update advance', error);
      }
    };

    const cancelEdit = () => {
      editingId.value = null;
      editingAdvance.value = { vehicle_id: 0, amount: 0, advance_time: '', note: '' };
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchParameters();
    };

    const resetForm = () => {
      form.value = {
        vehicle_id: 0,
        amount: 0,
        advance_time: '',
        note: '', // Reset note field
      };
    };

    onMounted(fetchParameters);

    return {
      form,
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
