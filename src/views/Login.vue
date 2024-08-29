<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">欢迎登录</h2>
      <el-form :model="loginForm" @submit.prevent="handleLogin" class="login-form" label-width="auto"
        label-position="left">
        <el-form-item label="用户名" :error="errors.username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" @blur="validateUsername"></el-input>
        </el-form-item>
        <el-form-item label="密码" :error="errors.password">
          <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" show-password @blur="validatePassword"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-button" plain>登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginByPassword } from '@/services/authService';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter();
    const loginForm = ref({
      username: '',
      password: '',
    });

    const errors = ref({
      username: null as string | null,
      password: null as string | null,
    });

    const validateUsername = () => {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!loginForm.value.username) {
        errors.value.username = '请输入用户名';
      } else if (!usernameRegex.test(loginForm.value.username)) {
        errors.value.username = '用户名只能包含字母、数字或下划线，长度3-20个字符';
      } else {
        errors.value.username = null;
      }
    };

    const validatePassword = () => {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!loginForm.value.password) {
        errors.value.password = '请输入密码';
      } else if (!passwordRegex.test(loginForm.value.password)) {
        errors.value.password = '密码至少8个字符，且包含字母和数字';
      } else {
        errors.value.password = null;
      }
    };

    const handleLogin = async () => {
      validateUsername();
      validatePassword();
      if (errors.value.username || errors.value.password) return;

      try {
        const response = await loginByPassword(loginForm.value.username, loginForm.value.password);
        clearForm();
        const token = response.data.token;
        localStorage.setItem('token', token);
        router.push('/dashboard');
      } catch (error) {
        ElMessage.error('登录失败，请稍后再试');
        console.error('登录失败', error);
      }
    };

    const clearForm = () => {
      loginForm.value = {
        username: '',
        password: '',
      };
    };

    return {
      errors,
      loginForm,
      handleLogin,
      validateUsername,
      validatePassword,
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
