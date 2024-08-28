<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">欢迎登录</h2>
      <p class="login-description">请输入您的用户名和密码登录系统</p>
      <el-form :model="loginForm" @submit.prevent="handleLogin" class="login-form">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="loginForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
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
        console.error('登录失败', error);
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-box {
  max-width: 400px;
  width: 100%;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.login-description {
  font-size: 14px;
  color: #999;
  margin-bottom: 30px;
}

.login-form {
  text-align: left;
}

.el-form-item {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 40px;
}
</style>
