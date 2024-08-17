<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <Sidebar @changeModule="currentModule = $event" />
    <div class="content">
      <component :is="currentModule" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import PasswordSetting from '@/components/PasswordSetting.vue';
import StartSite from '@/components/settings/StartSite.vue';
import EndSite from '@/components/settings/EndSite.vue';
import Category from '@/components/settings/Category.vue';
import Fleet from '@/components/settings/Fleet.vue';
import ProjectOwner from '@/components/settings/ProjectOwner.vue';
import PaymentMethod from '@/components/settings/PaymentMethod.vue';
import TransportDetailEntry from '@/components/TransportDetailEntry.vue';
import TransportPriceEntry from '@/components/TransportPriceEntry.vue';
import StartExcel from '@/components/reports/StartExcel.vue';
import EndExcel from '@/components/reports/EndExcel.vue';
import Advance from '@/components/finance/Advance.vue';
import Settlement from '@/components/finance/Settlement.vue';
import DriverExcel from '@/components/reports/DriverExcel.vue';
import AdvanceSearch from '@/components/finance/AdvanceSearch.vue';
import PaymentDetailEntry from '@/components/Payment/PaymentDetailEntry.vue';
import PaymentDetailSearch from '@/components/Payment/PaymentDetailSearch.vue';

export default defineComponent({
  name: 'Dashboard',
  components: {
    Sidebar,
    PasswordSetting,
    StartSite,
    EndSite,
    Category,
    Fleet,
    ProjectOwner,
    PaymentMethod,
    TransportDetailEntry,
    TransportPriceEntry,
    StartExcel,
    EndExcel,
    Advance,
    Settlement,
    DriverExcel,
    AdvanceSearch,
    PaymentDetailEntry,
    PaymentDetailSearch,
  },
  setup() {
    const currentModule = ref('Module1Feature1');

    return {
      currentModule,
    };
  },
});
</script>

<style scoped>
.dashboard {
  display: flex;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>
