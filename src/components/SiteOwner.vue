<template>
  <div class="site-owner">
    <el-card>
      <h2>工地老板名参数</h2>
      <el-form @submit.prevent="addParameter">
        <el-form-item label="工地老板名">
          <el-input v-model="newParameter.ownerName" placeholder="请输入工地老板名"></el-input>
        </el-form-item>
        <el-form-item label="工地名称">
          <el-input v-model="newParameter.siteName" placeholder="请输入工地名称"></el-input>
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
        <el-table-column prop="owner" label="工地老板名"></el-table-column>
        <el-table-column prop="phone" label="联系电话"></el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button type="danger" @click="removeParameter(scope.$index, scope.row.id)">删除</el-button>
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
import { addSiteOwner, deleteSiteOwner, getSiteOwners } from '@/services/transportService';

export default defineComponent({
  name: 'SiteOwner',
  setup() {
    const parameters = ref<{ id: number, name: string, owner: string, phone: string }[]>([]);
    const newParameter = ref({ siteName: '', ownerName: '', phone: '' });
    const currentPage = ref(1);
    const perPage = ref(20);
    const totalPages = ref(0);

    const fetchParameters = async () => {
      try {
        const response = await getSiteOwners(perPage.value, currentPage.value);
        parameters.value = response.data.site2owner;
        totalPages.value = response.data.total_pages;
      } catch (error) {
        console.error('Failed to fetch parameters', error);
      }
    };

    const addParameter = async () => {
      if (newParameter.value.siteName.trim() && newParameter.value.ownerName.trim() && newParameter.value.phone.trim()) {
        try {
          const response = await addSiteOwner(newParameter.value);
          fetchParameters();
          newParameter.value = { siteName: '', ownerName: '', phone: '' };
        } catch (error) {
          console.error('Failed to add parameter', error);
        }
      }
    };

    const removeParameter = async (index: number, id: number) => {
      try {
        await deleteSiteOwner(id);
        fetchParameters();
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
.site-owner {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>