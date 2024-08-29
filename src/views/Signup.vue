<template>
  <div class="signup-container">
    <div class="signup-box">
      <h2 class="signup-title">欢迎注册</h2>
      <el-form :model="signupForm" @submit.prevent="handleSignup" class="signup-form" label-width="auto" label-position="left">
        <el-form-item label="用户名" :error="errors.username">
          <el-input v-model="signupForm.username" placeholder="请输入用户名" @blur="validateUsername"></el-input>
        </el-form-item>
        <el-form-item label="密码" :error="errors.password">
          <el-input type="password" v-model="signupForm.password" placeholder="请输入密码" show-password @blur="validatePassword"></el-input>
        </el-form-item>
        <el-form-item label="口令" :error="errors.keyword">
          <el-input type="password" v-model="signupForm.keyword" placeholder="请输入注册口令" show-password @blur="validateKeyword"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSignup" class="signup-button" plain>注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { signup } from '@/services/authService';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'Signup',
  setup() {
    const router = useRouter();
    const signupForm = reactive({
      username: '',
      password: '',
      keyword: '',
    });

    const errors = ref({
      username: null as string | null,
      password: null as string | null,
      keyword: null as string | null,
    });

    const validateUsername = () => {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!signupForm.username) {
        errors.value.username = '请输入用户名';
      } else if (!usernameRegex.test(signupForm.username)) {
        errors.value.username = '用户名只能包含字母、数字或下划线，长度3-20个字符';
      } else {
        errors.value.username = null;
      }
    };

    const validatePassword = () => {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!signupForm.password) {
        errors.value.password = '请输入密码';
      } else if (!passwordRegex.test(signupForm.password)) {
        errors.value.password = '密码至少8个字符，且包含字母和数字';
      } else {
        errors.value.password = null;
      }
    };

    const validateKeyword = () => {
      const keywordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!signupForm.keyword) {
        errors.value.keyword = '请输入注册口令';
      } else if (!keywordRegex.test(signupForm.keyword)) {
        errors.value.keyword = '注册口令至少8个字符，且包含字母和数字';
      } else {
        errors.value.keyword = null;
      }
    };

    const handleSignup = async () => {
      validateUsername();
      validatePassword();
      validateKeyword();

      if (errors.value.username || errors.value.password || errors.value.keyword) return;

      try {
        await signup(signupForm.username, signupForm.password, signupForm.keyword);
        ElMessage.success('注册成功');
        router.push('/login');
      } catch (error) {
        ElMessage.error('注册失败，请稍后再试');
        console.error('注册失败', error);
      }
    };

    return {
      signupForm,
      errors,
      handleSignup,
      validateUsername,
      validatePassword,
      validateKeyword,
    };
  },
});
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.signup-box {
  max-width: 400px;
  width: 100%;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.signup-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.signup-form {
  text-align: left;
}

.el-form-item {
  margin-bottom: 20px;
}

.signup-button {
  width: 100%;
  height: 40px;
}
</style>
