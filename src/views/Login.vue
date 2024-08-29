<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">欢迎登录</h2>
      <el-form :model="loginForm" @submit.prevent="handleLogin" class="login-form" label-width="auto"
        label-position="left">
        <el-form-item v-if="isPasswordLogin" label="用户名" :error="errors.username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" @blur="validateUsername"></el-input>
        </el-form-item>
        <el-form-item v-else label="手机号" :error="errors.phone">
          <el-input v-model="loginForm.phone" placeholder="请输入手机号" @blur="validatePhone"></el-input>
        </el-form-item>
        <el-form-item v-if="isPasswordLogin" label="密码" :error="errors.password">
          <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" show-password @blur="validatePassword"></el-input>
        </el-form-item>
        <el-form-item v-else label="验证码" :error="errors.verificationCode">
          <el-input v-model="loginForm.verificationCode" placeholder="请输入验证码" class="verification-input" @blur="validateVerificationCode">
            <template #append>
              <el-button :disabled="isCountingDown || !loginForm.phone" @click="handleGetVerification"
                class="get-verification-button">
                {{ isCountingDown ? countdownText : '获取验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-button" plain>登录</el-button>
        </el-form-item>
      </el-form>

      <!-- 切换登录方式 -->
      <div class="toggle-login-method">
        <el-link @click="toggleLoginMethod">
          {{ isPasswordLogin ? '使用验证码登录' : '使用密码登录' }}
        </el-link>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginByPassword, loginByVerification, getVerification } from '@/services/authService';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter();
    const isPasswordLogin = ref(true);
    const loginForm = ref({
      username: '',
      password: '',
      phone: '',
      verificationCode: '',
    });

    const isCountingDown = ref(false);
    const countdownText = ref('');
    let countdownTimer: ReturnType<typeof setInterval>;

    const errors = ref({
      username: null as string | null,
      password: null as string | null,
      phone: null as string | null,
      verificationCode: null as string | null,
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

    const validatePhone = () => {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!loginForm.value.phone) {
        errors.value.phone = '请输入手机号';
      } else if (!phoneRegex.test(loginForm.value.phone)) {
        errors.value.phone = '手机号格式不正确';
      } else {
        errors.value.phone = null;
      }
    };

    const validateVerificationCode = () => {
      const codeRegex = /^\d{6}$/;
      if (!loginForm.value.verificationCode) {
        errors.value.verificationCode = '请输入验证码';
      } else if (!codeRegex.test(loginForm.value.verificationCode)) {
        errors.value.verificationCode = '验证码必须是6位数字';
      } else {
        errors.value.verificationCode = null;
      }
    };

    const handleLogin = async () => {
      if (isPasswordLogin.value) {
        validateUsername();
        validatePassword();
        if (errors.value.username || errors.value.password) return;
      } else {
        validatePhone();
        validateVerificationCode();
        if (errors.value.phone || errors.value.verificationCode) return;
      }

      try {
        if (isPasswordLogin.value) {
          const response = await loginByPassword(loginForm.value.username, loginForm.value.password);
          clearForm();
          const token = response.data.token;
          localStorage.setItem('token', token);
          router.push('/dashboard');
        } else {
          const response = await loginByVerification(loginForm.value.phone, loginForm.value.verificationCode);
          clearForm();
          const token = response.data.token;
          localStorage.setItem('token', token);
          router.push('/dashboard');
        }
      } catch (error) {
        ElMessage.error('登录失败，请稍后再试');
        console.error('登录失败', error);
      }
    };

    const handleGetVerification = async () => {
      validatePhone();
      if (errors.value.phone) return;

      try {
        await getVerification(loginForm.value.phone);
        ElMessage.success('验证码已发送');
        startCountdown();
      } catch (error) {
        ElMessage.error('获取验证码失败，请稍后再试');
        console.error('获取验证码失败', error);
      }
    };

    const startCountdown = () => {
      let countdown = 60;
      isCountingDown.value = true;
      countdownText.value = `${countdown}秒后重新获取`;
      countdownTimer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(countdownTimer);
          isCountingDown.value = false;
          countdownText.value = '';
        } else {
          countdownText.value = `${countdown}秒后重新获取`;
        }
      }, 1000);
    };

    const clearForm = () => {
      loginForm.value = {
        username: '',
        password: '',
        phone: '',
        verificationCode: '',
      };
    };

    const toggleLoginMethod = () => {
      clearForm();
      isPasswordLogin.value = !isPasswordLogin.value;
    };

    return {
      errors,
      loginForm,
      handleLogin,
      isPasswordLogin,
      toggleLoginMethod,
      handleGetVerification,
      isCountingDown,
      countdownText,
      validateUsername,
      validatePassword,
      validatePhone,
      validateVerificationCode,
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

.verification-input .el-input__inner {
  width: calc(100% - 120px); /* 输入框宽度 */
}

.get-verification-button {
  width: 120px; /* 按钮宽度 */
}

.login-button {
  width: 100%;
  height: 40px;
}

.toggle-login-method {
  margin-top: 20px;
}
</style>
