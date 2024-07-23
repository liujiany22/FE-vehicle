<template>
    <div class="fleet">
        <el-card>
            <h2>运输车队参数</h2>
            <el-form @submit.prevent="addParameter">
                <el-form-item label="司机车牌号">
                    <el-input v-model="newParameter.license" placeholder="请输入司机车牌号"></el-input>
                </el-form-item>
                <el-form-item label="司机名字">
                    <el-input v-model="newParameter.driver" placeholder="请输入司机名字"></el-input>
                </el-form-item>
                <el-form-item label="司机电话号码">
                    <el-input v-model="newParameter.phone" placeholder="请输入司机电话号码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addParameter">添加</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="parameters" style="width: 100%">
                <el-table-column prop="license" label="司机车牌号"></el-table-column>
                <el-table-column prop="driver" label="司机名字"></el-table-column>
                <el-table-column prop="phone" label="司机电话号码"></el-table-column>
                <el-table-column label="操作">
                    <template v-slot:default="scope">
                        <el-button type="danger" @click="removeParameter(scope.$index, scope.row.id)">删除</el-button>
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
import { addFleet, delFleet, getFleets } from '@/services/transportService';

export default defineComponent({
    name: 'Fleet',
    setup() {
        const parameters = ref<{ id: number, license: string, driver: string, phone: string }[]>([]);
        const newParameter = ref({ license: '', driver: '', phone: '' });
        const currentPage = ref(1);
        const perPage = ref(20);
        const totalPages = ref(0);

        const fetchParameters = async () => {
            try {
                const response = await getFleets(perPage.value, currentPage.value);
                parameters.value = response.data.vehicle;
                totalPages.value = response.data.total_pages;
            } catch (error) {
                console.error('Failed to fetch parameters', error);
            }
        };

        const addParameter = async () => {
            if (newParameter.value.license.trim() && newParameter.value.driver.trim() && newParameter.value.phone.trim()) {
                try {
                    const response = await addFleet(newParameter.value);
                    fetchParameters();
                    newParameter.value = { license: '', driver: '', phone: '' };
                } catch (error) {
                    console.error('Failed to add parameter', error);
                }
            }
        };

        const removeParameter = async (index: number, id: number) => {
            try {
                await delFleet(id);
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
.fleet {
    padding: 20px;
}

.el-card {
    margin-bottom: 20px;
}

.el-form-item {
    margin-bottom: 20px;
}
</style>
