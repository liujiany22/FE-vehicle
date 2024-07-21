<!-- src/views/PasswordSetting.vue -->
<template>
  <div class="password-setting">
    <el-form :model="form" @submit.prevent="handleSubmit">
      <el-form-item label="Current Password">
        <el-input type="password" v-model="form.currentPassword"></el-input>
      </el-form-item>
      <el-form-item label="New Password">
        <el-input type="password" v-model="form.newPassword"></el-input>
      </el-form-item>
      <el-form-item label="Confirm New Password">
        <el-input type="password" v-model="form.confirmNewPassword"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">Submit</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { changePassword } from '@/services/authService';

export default defineComponent({
  name: 'PasswordSetting',
  setup() {
    const form = reactive({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });

    const handleSubmit = async () => {
      if (form.newPassword !== form.confirmNewPassword) {
        alert('New passwords do not match!');
        return;
      }
      try {
        await changePassword(form.currentPassword, form.newPassword);
        alert('Password changed successfully!');
      } catch (error) {
        console.error('Failed to change password', error);
        alert('Failed to change password. Please try again.');
      }
    };

    return {
      form,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.password-setting {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>
