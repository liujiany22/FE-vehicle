<template>
  <div class="start-site">
    <el-card>
      <h2>运输起点参数</h2>
      <el-form @submit.prevent="addParameter" label-width="auto" label-position="left">
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
          <el-button type="primary" @click="addParameter" plain>添加</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="parameters" style="width: 100%" border>
        <el-table-column prop="name" label="工地名称" show-overflow-tooltip>
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingParameter.name" />
            </div>
            <div v-else>
              {{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="工地负责人" show-overflow-tooltip>
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingParameter.manager" />
            </div>
            <div v-else>
              {{ scope.row.manager }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="manager_phone" label="联系电话" show-overflow-tooltip>
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingParameter.manager_phone" />
            </div>
            <div v-else>
              {{ scope.row.manager_phone }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" show-overflow-tooltip>
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-button type="primary" @click="saveParameter(scope.row.id)" plain size="small">保存</el-button>
              <el-button @click="cancelEdit" plain size="small">取消</el-button>
            </div>
            <div v-else>
              <el-button @click="editParameter(scope.row)" plain size="small">修改</el-button>
              <el-button type="danger" @click="removeParameter(scope.row.id)" plain size="small">删除</el-button>
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
import { addStartSite, delStartSite, getStartSites, updateStartSite } from '@/services/transportService';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'StartSite',
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
        const response = await getStartSites(perPage.value, currentPage.value);
        parameters.value = response.data.start_sites;
        totalPages.value = response.data.total_pages;
      } catch (error) {
        ElMessage.error('参数获取失败，请稍后再试');
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
          await addStartSite(newParameter.value);
          fetchParameters();
          newParameter.value = { name: '', manager: '', phone: '' };
        } catch (error) {
          ElMessage.error('参数添加失败，请稍后再试');
          console.error('Failed to add parameter', error);
        }
      }
    };

    const removeParameter = async (id: number) => {
      try {
        await delStartSite(id);
        fetchParameters();
      } catch (error) {
        ElMessage.error('参数删除失败，请稍后再试');
        console.error('Failed to delete parameter', error);
      }
    };

    const editParameter = (parameter: { id: number, name: string, manager: string, manager_phone: string }) => {
      editingId.value = parameter.id;
      editingParameter.value = { ...parameter };
    };

    const saveParameter = async (id: number) => {
      try {
        await updateStartSite({ site_id: id, ...editingParameter.value });
        fetchParameters();
        cancelEdit();
      } catch (error) {
        ElMessage.error('参数更新失败，请稍后再试');
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

.start-site {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
