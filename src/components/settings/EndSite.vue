<template>
  <div class="end-site">
    <el-card>
      <h2>运输终点参数</h2>
      <el-form @submit.prevent="addParameter">
        <el-form-item label="工地名称" :error="errors.name">
          <el-input v-model="newParameter.name" placeholder="请输入工地名称" class="custom-input"></el-input>
        </el-form-item>
        <el-form-item label="工地负责人" :error="errors.manager">
          <el-input v-model="newParameter.manager" placeholder="请输入工地负责人" class="custom-input"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" :error="errors.phone">
          <el-input v-model="newParameter.phone" placeholder="请输入联系电话" class="custom-input"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addParameter">添加</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="parameters" style="width: 100%">
        <el-table-column prop="name" label="工地名称">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingParameter.name" />
            </div>
            <div v-else>
              {{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="工地负责人">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingParameter.manager" />
            </div>
            <div v-else>
              {{ scope.row.manager }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="manager_phone" label="联系电话">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingParameter.manager_phone" />
            </div>
            <div v-else>
              {{ scope.row.manager_phone }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
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
        layout="prev, pager, next" :total="totalPages * perPage" />
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { addEndSite, delEndSite, getEndSites, updateEndSite } from '@/services/transportService';

export default defineComponent({
  name: 'EndSite',
  setup() {
    const parameters = ref<{ id: number, name: string, manager: string, manager_phone: string }[]>([]);
    const newParameter = ref({ name: '', manager: '', phone: '' });
    const editingParameter = ref({ name: '', manager: '', manager_phone: '' });
    const editingId = ref<number | null>(null);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalPages = ref(0);
    const errors = ref<{ name: string | null; manager: string | null; phone: string | null }>({
      name: null,
      manager: null,
      phone: null,
    });

    const fetchParameters = async () => {
      try {
        const response = await getEndSites(perPage.value, currentPage.value);
        parameters.value = response.data.end_sites;
        totalPages.value = response.data.total_pages;
      } catch (error) {
        console.error('Failed to fetch parameters', error);
      }
    };

    const validateInputs = () => {
      errors.value.name = newParameter.value.name.trim() ? null : '工地名称不能为空';
      errors.value.manager = newParameter.value.manager.trim() ? null : '工地负责人不能为空';
      errors.value.phone = newParameter.value.phone.trim() ? null : '联系电话不能为空';

      return !errors.value.name && !errors.value.manager && !errors.value.phone;
    };

    const addParameter = async () => {
      if (validateInputs()) {
        try {
          await addEndSite(newParameter.value);
          fetchParameters();
          newParameter.value = { name: '', manager: '', phone: '' };
        } catch (error) {
          console.error('Failed to add parameter', error);
        }
      }
    };

    const removeParameter = async (id: number) => {
      try {
        await delEndSite(id);
        fetchParameters();
      } catch (error) {
        console.error('Failed to delete parameter', error);
      }
    };

    const editParameter = (parameter: { id: number, name: string, manager: string, manager_phone: string }) => {
      editingId.value = parameter.id;
      editingParameter.value = { ...parameter };
    };

    const saveParameter = async (id: number) => {
      try {
        await updateEndSite({ site_id: id, ...editingParameter.value });
        fetchParameters();
        cancelEdit();
      } catch (error) {
        console.error('Failed to update parameter', error);
      }
    };

    const cancelEdit = () => {
      editingId.value = null;
      editingParameter.value = { name: '', manager: '', manager_phone: '' };
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchParameters();
    };

    onMounted(fetchParameters);

    return {
      parameters,
      newParameter,
      editingParameter,
      editingId,
      currentPage,
      perPage,
      totalPages,
      errors,
      addParameter,
      removeParameter,
      editParameter,
      saveParameter,
      cancelEdit,
      handlePageChange,
    };
  },
});
</script>

<style scoped>
@import '@/assets/select.css'; /* 引入共享样式 */

.end-site {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
