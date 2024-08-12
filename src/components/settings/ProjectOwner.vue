<template>
  <div class="project-owner">
    <el-card>
      <h2>项目-老板参数</h2>
      <el-form @submit.prevent="addParameter">
        <el-form-item label="老板名">
          <el-input v-model="newParameter.owner" placeholder="请输入老板名" class="custom-input"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="newParameter.phone" placeholder="请输入联系电话" class="custom-input"></el-input>
        </el-form-item>
        <el-form-item label="项目名">
          <el-input v-model="newParameter.name" placeholder="请输入项目名" class="custom-input"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addParameter">添加</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="parameters" style="width: 100%">
        <el-table-column prop="owner" label="老板名">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingParameter.owner" />
            </div>
            <div v-else>
              {{ scope.row.owner }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="owner_phone" label="联系电话">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingParameter.owner_phone" />
            </div>
            <div v-else>
              {{ scope.row.owner_phone }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="项目名">
          <template v-slot:default="scope">
            <div v-if="editingId === scope.row.id">
              <el-input v-model="editingParameter.name" />
            </div>
            <div v-else>
              {{ scope.row.name }}
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
      <el-pagination
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-size="perPage"
        layout="prev, pager, next"
        :total="totalPages * perPage"
      />
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { addProjectOwner, delProjectOwner, getProjectOwners, updateProjectOwner } from '@/services/transportService';

export default defineComponent({
  name: 'ProjectOwner',
  setup() {
    const parameters = ref<{ id: number, owner: string, owner_phone: string, name: string }[]>([]);
    const newParameter = ref({ owner: '', phone: '', name: '' });
    const editingParameter = ref({ owner: '', owner_phone: '', name: '' });
    const editingId = ref<number | null>(null);
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalPages = ref(0);

    const fetchParameters = async () => {
      try {
        const response = await getProjectOwners(perPage.value, currentPage.value);
        parameters.value = response.data.projects;
        totalPages.value = response.data.total_pages;
      } catch (error) {
        console.error('Failed to fetch parameters', error);
      }
    };

    const addParameter = async () => {
      if (newParameter.value.owner.trim() && newParameter.value.phone.trim() && newParameter.value.name.trim()) {
        try {
          await addProjectOwner({
            site_id: 0, // Assuming site_id is not needed, adjust if necessary
            owner: newParameter.value.owner,
            phone: newParameter.value.phone,
            name: newParameter.value.name,
          });
          fetchParameters();
          newParameter.value = { owner: '', phone: '', name: '' };
        } catch (error) {
          console.error('Failed to add parameter', error);
        }
      }
    };

    const removeParameter = async (id: number) => {
      try {
        await delProjectOwner(id);
        fetchParameters();
      } catch (error) {
        console.error('Failed to delete parameter', error);
      }
    };

    const editParameter = (parameter: { id: number, owner: string, owner_phone: string, name: string }) => {
      editingId.value = parameter.id;
      editingParameter.value = { ...parameter };
    };

    const saveParameter = async (id: number) => {
      try {
        await updateProjectOwner({
          project_id: id,
          owner: editingParameter.value.owner,
          phone: editingParameter.value.owner_phone,
          name: editingParameter.value.name,
        });
        fetchParameters();
        cancelEdit();
      } catch (error) {
        console.error('Failed to update parameter', error);
      }
    };

    const cancelEdit = () => {
      editingId.value = null;
      editingParameter.value = { owner: '', owner_phone: '', name: '' };
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

.project-owner {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
