<template>
  <div class="home">
    <el-row>
      <el-col :span="24" class="header">
        <h1>宏图渣土清运有限公司管理系统</h1>
        <p>立 信 于 心 ， 尽 责 至 善</p>
      </el-col>
    </el-row>
    <el-row class="info-section">
      <el-col :span="24">
        <el-carousel :interval="5000" type="card" height="250px">
          <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
            <el-card shadow="hover">
              <h2>{{ item.title }}</h2>
              <p>{{ item.content }}</p>
            </el-card>
          </el-carousel-item>
        </el-carousel>
      </el-col>
    </el-row>
    <el-row class="action-buttons">
      <el-col :span="24">
        <el-button type="primary" size="large" @click="goToLogin" plain>登录</el-button>
        <el-button type="success" size="large" @click="goToSignup" plain>注册</el-button>
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

    const carouselItems = [
      {
        title: '公司简介',
        content: '待定: 宏图渣土清运有限公司致力于提供专业、高效的清运服务，专注客户需求，提供全方位的解决方案。',
      },
      {
        title: '经营范围',
        content: '建筑垃圾清运，砂石料运输及销售，供应铺路石渣，云梯车租赁。',
      },
      {
        title: '联系我们',
        content: '电话：待定',
      },
    ];

    return {
      goToLogin,
      goToSignup,
      carouselItems,
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
  justify-content: flex-start;
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
  margin-bottom: 20px;
}

.el-carousel {
  width: 100%;
}

.el-card {
  text-align: center;
  background-color: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  margin-bottom: 40px; /* Optional: To add some space below the buttons */
}

.el-button {
  margin: 0 10px;
  width: 150px;
}
</style>
