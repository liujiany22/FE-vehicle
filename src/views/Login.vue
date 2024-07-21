<!-- src/views/Login.vue -->
<template>
  <div class="login">
    <el-form :model="loginForm" @submit.prevent="handleLogin">
      <el-form-item label="Username">
        <el-input v-model="loginForm.username"></el-input>
      </el-form-item>
      <el-form-item label="Password">
        <el-input type="password" v-model="loginForm.password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">Login</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/authService';

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter();
    const loginForm = reactive({
      username: '',
      password: '',
    });

    const handleLogin = async () => {
      try {
        const response = await login(loginForm.username, loginForm.password);
        const token = response.data.token;
        localStorage.setItem('token', token);
        router.push('/dashboard');
      } catch (error) {
        console.error('Login failed', error);
      }
    };

    return {
      loginForm,
      handleLogin,
    };
  },
});
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>