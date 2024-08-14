<!-- src/components/Sidebar.vue -->
<template>
    <el-menu default-active="1" class="el-menu-vertical-demo" @select="handleSelect">
        <el-sub-menu index="1">
            <template v-slot:title>用户管理</template>
            <el-menu-item index="PasswordSetting">修改密码</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
            <template v-slot:title>运输参数设置</template>
            <el-menu-item index="StartSite">运输起点参数</el-menu-item>
            <el-menu-item index="EndSite">运输终点参数</el-menu-item>
            <el-menu-item index="Category">运输品类参数</el-menu-item>
            <el-menu-item index="Fleet">运输车队参数</el-menu-item>
            <el-menu-item index="ProjectOwner">项目-老板参数</el-menu-item>
            <el-menu-item index="PaymentMethod">付款方式参数</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
            <template v-slot:title>运输明细管理</template>
            <el-menu-item index="TransportDetailEntry">运输明细录入</el-menu-item>
            <el-menu-item index="TransportPriceEntry">运输单价录入</el-menu-item>
            <el-menu-item index="StartExcel">起点对账表</el-menu-item>
            <el-menu-item index="EndExcel">终点对账表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
            <template v-slot:title>财务系统管理</template>
            <el-menu-item index="Advance">预支录入</el-menu-item>
            <el-menu-item index="AdvanceSearch">预支查询</el-menu-item>
            <el-menu-item index="Settlement">工地结算明细</el-menu-item>
            <el-menu-item index="DriverExcel">驾驶员对账表</el-menu-item>
        </el-sub-menu>
    </el-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Sidebar',
    setup(_, { emit }) {
        const handleSelect = (key: string) => {
            emit('changeModule', key);
        };

        return {
            handleSelect,
        };
    },
});
</script>

<style scoped>
.el-menu-vertical-demo {
    width: 200px;
    height: 100vh;
    border-right: 1px solid #ebeef5;
}
</style>