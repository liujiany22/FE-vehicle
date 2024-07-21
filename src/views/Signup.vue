<!-- src/views/Signup.vue -->
<template>
    <div class="signup">
      <el-form :model="signupForm" @submit.prevent="handleSignup">
        <el-form-item label="Username">
          <el-input v-model="signupForm.username"></el-input>
        </el-form-item>
        <el-form-item label="Password">
          <el-input type="password" v-model="signupForm.password"></el-input>
        </el-form-item>
        <el-form-item label="Phone">
          <el-input v-model="signupForm.phone"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSignup">Signup</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { signup } from '@/services/authService';
  
  export default defineComponent({
    name: 'Signup',
    setup() {
      const router = useRouter();
      const signupForm = reactive({
        username: '',
        password: '',
        phone: ''
      });
  
      const handleSignup = async () => {
        try {
          await signup(signupForm.username, signupForm.password, signupForm.phone);
          router.push('/login');
        } catch (error) {
          console.error('Signup failed', error);
        }
      };
  
      return {
        signupForm,
        handleSignup,
      };
    },
  });
  </script>
  
  <style scoped>
  .signup {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 4px;
  }
  </style>
  