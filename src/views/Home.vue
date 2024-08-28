<template>
  <div class="home">
    <el-row>
      <el-col :span="24" class="header">
        <h1>宏图渣土清运有限公司管理系统</h1>
        <p>立 信 于 心 ， 尽 责 至 善</p>
      </el-col>
    </el-row>
    <el-row class="info-section">
      <el-col :span="8">
        <el-card shadow="hover">
          <h2>公司简介</h2>
          <p>待定: 宏图渣土清运有限公司致力于提供专业、高效的清运服务，专注客户需求，提供全方位的解决方案。</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <h2>经营范围</h2>
          <p>建筑垃圾清运，砂石料运输及销售，供应铺路石渣，云梯车租赁。</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <h2>联系我们</h2>
          <p>电话：待定</p>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="action-buttons">
      <el-col :span="24">
        <el-button type="primary" size="large" @click="goToLogin">登录</el-button>
        <el-button type="success" size="large" @click="goToSignup">注册</el-button>
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
  padding: 40px 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 2.5em;
  font-weight: bold;
  color: #333;
}

.header p {
  font-size: 1.2em;
  color: #777;
}

.info-section {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  flex-grow: 1;
}

.el-card {
  text-align: center;
  background-color: #fff;
  width: 100%;
}

.el-card h2 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}

.el-card p {
  font-size: 1em;
  color: #555;
}

.action-buttons {
  text-align: center;
  margin-top: 20px;
}

.el-button {
  margin: 0 10px;
  width: 150px;
}
</style>
