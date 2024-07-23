<template>
  <div class="start-site">
    <el-card>
      <h2>运输起点参数</h2>
      <el-form @submit.prevent="addParameter">
        <el-form-item label="工地名称">
          <el-input v-model="newParameter.name" placeholder="请输入工地名称"></el-input>
        </el-form-item>
        <el-form-item label="工地负责人">
          <el-input v-model="newParameter.manager" placeholder="请输入工地负责人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="newParameter.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addParameter">添加</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="parameters" style="width: 100%">
        <el-table-column prop="name" label="工地名称"></el-table-column>
        <el-table-column prop="manager" label="工地负责人"></el-table-column>
        <el-table-column prop="manager_phone" label="联系电话"></el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button type="danger" @click="removeParameter(scope.row.id)">删除</el-button>
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
import { addStartSite, delStartSite, getStartSites } from '@/services/transportService';

export default defineComponent({
  name: 'StartSite',
  setup() {
    const parameters = ref<{ id: number, name: string, manager: string, manager_phone: string }[]>([]);
    const newParameter = ref({ name: '', manager: '', phone: '' });
    const currentPage = ref(1);
    const perPage = ref(20);
    const totalPages = ref(0);

    const fetchParameters = async () => {
      try {
        const response = await getStartSites(perPage.value, currentPage.value);
        parameters.value = response.data.start_sites;
        totalPages.value = response.data.total_pages;
      } catch (error) {
        console.error('Failed to fetch parameters', error);
      }
    };

    const addParameter = async () => {
      if (newParameter.value.name.trim() && newParameter.value.manager.trim() && newParameter.value.phone.trim()) {
        try {
          const response = await addStartSite(newParameter.value);
          fetchParameters();  // Refresh the list after adding a new parameter
          newParameter.value = { name: '', manager: '', phone: '' };
        } catch (error) {
          console.error('Failed to add parameter', error);
        }
      }
    };

    const removeParameter = async (id: number) => {
      try {
        await delStartSite(id);
        fetchParameters();  // Refresh the list after deleting a parameter
      } catch (error) {
        console.error('Failed to delete parameter', error);
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchParameters();
    };

    onMounted(fetchParameters);

    return {
      parameters,
      newParameter,
      currentPage,
      perPage,
      totalPages,
      addParameter,
      removeParameter,
      handlePageChange,
    };
  },
});
</script>

<style scoped>
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
