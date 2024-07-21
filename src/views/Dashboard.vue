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
import TransportStartPoint from '@/components/TransportStartPoint.vue';
import TransportEndPoint from '@/components/TransportEndPoint.vue';
import TransportCategory from '@/components/TransportCategory.vue';
import TransportFleet from '@/components/TransportFleet.vue';
import SiteOwner from '@/components/SiteOwner.vue';
import PaymentMethod from '@/components/PaymentMethod.vue';
import TransportDetailEntry from '@/components/TransportDetailEntry.vue';
import TransportPriceEntry from '@/components/TransportPriceEntry.vue';
import SiteReconciliationReport from '@/components/SiteReconciliationReport.vue';



export default defineComponent({
  name: 'Dashboard',
  components: {
    Sidebar,
    PasswordSetting,
    TransportStartPoint,
    TransportEndPoint,
    TransportCategory,
    TransportFleet,
    SiteOwner,
    PaymentMethod,
    TransportDetailEntry,
    TransportPriceEntry,
    SiteReconciliationReport,
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
