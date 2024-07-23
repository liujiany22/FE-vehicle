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
import StartSite from '@/components/StartSite.vue';
import EndSite from '@/components/EndSite.vue';
import Category from '@/components/Category.vue';
import Fleet from '@/components/Fleet.vue';
import SiteOwner from '@/components/SiteOwner.vue';
import PaymentMethod from '@/components/PaymentMethod.vue';
import DetailEntry from '@/components/DetailEntry.vue';
// import TransportPriceEntry from '@/components/TransportPriceEntry.vue';



export default defineComponent({
  name: 'Dashboard',
  components: {
    Sidebar,
    PasswordSetting,
    StartSite,
    EndSite,
    Category,
    Fleet,
    SiteOwner,
    PaymentMethod,
    TransportDetailEntry,
    // TransportPriceEntry,
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
