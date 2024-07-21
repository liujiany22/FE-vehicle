<template>
    <div class="home">
      <el-row>
        <el-col :span="24">
          <h1>Welcome to Your Vue.js App</h1>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-card>
            <h2>About Us</h2>
            <p>Some information about the application.</p>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <h2>Contact</h2>
            <p>How to reach us.</p>
          </el-card>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-button type="primary" @click="goToLogin">Login</el-button>
          <el-button type="primary" @click="goToSignup">Signup</el-button>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    name: 'Home',
    setup() {
      const router = useRouter();
  
      const goToLogin = () => {
        router.push('/login');
      };

      const goToSignup = () => {
        router.push('/signup');
      };
  
      return {
        goToLogin,
        goToSignup,
      };
    },
  });
  </script>
  
  <style scoped>
  .home {
    padding: 20px;
  }
  
  .el-card {
    margin: 20px 0;
  }
  </style>
  