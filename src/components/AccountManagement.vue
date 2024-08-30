<template>
	<div class="account-management">
		<el-card>
			<template #header>
				<div class="card-header">
					<span>用户信息</span>
				</div>
			</template>
			<!-- 用户信息展示 -->
			<el-descriptions :border="true" direction="vertical" column="4">
				<el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
				<el-descriptions-item label="用户名">{{ userInfo.name }}</el-descriptions-item>
				<el-descriptions-item label="账户状态">{{ userInfo.status === 'online' ? "在线" : "离线" }}&nbsp&nbsp&nbsp<el-button
						type="warning" @click="handleLogout" plain size="small">登出</el-button>
					<el-button type="danger" @click="handleCancel" size="small" plain>注销</el-button></el-descriptions-item>
			</el-descriptions>
			<!-- 登出和注销 -->

		</el-card>
		<el-card>
			<template #header>
				<div class="card-header">
					<span>信息修改</span>
				</div>
			</template>
			<el-form :model="usernameForm" @submit.prevent="handleUsernameChange" label-width="70px">
				<el-form-item label="新用户名" :error="errors.username">
					<el-input v-model="usernameForm.newUsername" placeholder="请输入新用户名" @blur="validateUsername"
						class="custom-input">
						<template #append>
							<el-button type="primary" @click="handleUsernameChange" plain>更改</el-button>
						</template>
					</el-input>
				</el-form-item>
			</el-form>
			<el-form :model="passwordForm" @submit.prevent="handlePasswordChange" label-width="70px">
				<el-form-item label="旧密码" :error="errors.oldPassword">
					<el-input type="password" v-model="passwordForm.oldPassword" placeholder="请输入旧密码" @blur="validateOldPassword"
						class="custom-input"></el-input>
				</el-form-item>
				<el-form-item label="新密码" :error="errors.newPassword">
					<el-input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码" @blur="validateNewPassword"
						class="custom-input">
						<template #append>
							<el-button type="primary" @click="handlePasswordChange" plain>更改</el-button>
						</template>
					</el-input>
				</el-form-item>
			</el-form>
		</el-card>

		<el-card v-if="userInfo.manager">
			<template #header>
				<div class="card-header">
					<span>管理员信息</span>
				</div>
			</template>
			<!-- 管理员操作区 -->
			<el-form :model="tokenForm" label-width="70px">
				<el-form-item label="旧口令">
					<el-input v-model="tokenForm.oldToken" readonly class="custom-input"></el-input>
				</el-form-item>
				<el-form-item label="新口令" :error="errors.token">
					<el-input v-model="tokenForm.newToken" placeholder="请输入新口令" @blur="validateNewToken" class="custom-input">
						<template #append>
							<el-button type="primary" @click="handleTokenChange" plain>更改</el-button>
						</template>
					</el-input>
				</el-form-item>
			</el-form>
		</el-card>
	</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { logout, cancel, changePassword, changeUsername, getInfo, getToken, updateToken } from '@/services/authService';
import router from '@/router';

export default defineComponent({
	name: 'AccountManagement',
	setup() {
		const userInfo = ref({
			id: '',
			name: '',
			phone: '',
			register_time: '',
			loginTime: '',
			status: '',
			manager: false,
		});

		const tokenForm = ref({ oldToken: '', newToken: '' });
		const usernameForm = ref({ newUsername: '' });
		const passwordForm = ref({ oldPassword: '', newPassword: '' });

		const errors = ref({
			username: null as string | null,
			oldPassword: null as string | null,
			newPassword: null as string | null,
			token: null as string | null,
		});

		// 获取用户信息
		const loadUserInfo = async () => {
			try {
				const response = await getInfo();
				userInfo.value = response.data;
				if (userInfo.value.manager) {
					await loadToken();
				}
			} catch (error) {
				ElMessage.error('加载用户信息失败');
			}
		};

		// 获取Token信息
		const loadToken = async () => {
			try {
				const response = await getToken();
				tokenForm.value.oldToken = response.data.token;
			} catch (error) {
				ElMessage.error('加载Token信息失败');
			}
		};

		const validateUsername = () => {
			const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
			if (!usernameForm.value.newUsername) {
				errors.value.username = '请输入用户名';
			} else if (!usernameRegex.test(usernameForm.value.newUsername)) {
				errors.value.username = '用户名只能包含字母、数字或下划线，长度3-20个字符';
			} else {
				errors.value.username = null;
			}
		};

		const validateOldPassword = () => {
			if (!passwordForm.value.oldPassword) {
				errors.value.oldPassword = '请输入旧密码';
			} else {
				errors.value.oldPassword = null;
			}
		};

		const validateNewPassword = () => {
			const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
			if (!passwordForm.value.newPassword) {
				errors.value.newPassword = '请输入新密码';
			} else if (!passwordRegex.test(passwordForm.value.newPassword)) {
				errors.value.newPassword = '密码至少8个字符，且包含字母和数字';
			} else {
				errors.value.newPassword = null;
			}
		};

		const validateNewToken = () => {
			const tokenRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
			if (!tokenForm.value.newToken) {
				errors.value.token = '请输入新口令';
			} else if (!tokenRegex.test(tokenForm.value.newToken)) {
				errors.value.token = '口令至少8个字符，且包含字母和数字';
			} else {
				errors.value.token = null;
			}
		};

		const handleUsernameChange = async () => {
			validateUsername();
			if (errors.value.username) return;

			try {
				await changeUsername(usernameForm.value.newUsername);
				ElMessage.success('用户名已更改');
			} catch (error) {
				ElMessage.error('更改用户名失败，请稍后再试');
			}
		};

		const handlePasswordChange = async () => {
			validateOldPassword();
			validateNewPassword();
			if (errors.value.oldPassword || errors.value.newPassword) return;

			try {
				await changePassword(passwordForm.value.oldPassword, passwordForm.value.newPassword);
				ElMessage.success('密码已更改');
			} catch (error) {
				ElMessage.error('更改密码失败，请稍后再试');
			}
		};

		const handleTokenChange = async () => {
			validateNewToken();
			if (errors.value.token) return;

			try {
				await updateToken(tokenForm.value.newToken);
				ElMessage.success('Token已更新');
				await loadToken(); // 重新加载旧Token
			} catch (error) {
				ElMessage.error('更新Token失败，请稍后再试');
			}
		};

		const handleLogout = async () => {
			try {
				await logout();
				localStorage.removeItem('token');
				ElMessage.success('已登出');
				router.push('/');
			} catch (error) {
				ElMessage.error('登出失败，请稍后再试');
			}
		};

		const handleCancel = async () => {
			try {
				await cancel();
				localStorage.removeItem('token');
				ElMessage.success('账户已注销');
				router.push('/');
			} catch (error) {
				ElMessage.error('注销账户失败，请稍后再试');
			}
		};

		onMounted(() => {
			loadUserInfo();
		});

		return {
			userInfo,
			tokenForm,
			usernameForm,
			passwordForm,
			errors,
			validateUsername,
			validateOldPassword,
			validateNewPassword,
			validateNewToken,
			handleUsernameChange,
			handlePasswordChange,
			handleTokenChange,
			handleLogout,
			handleCancel,
		};
	},
});
</script>

<style scoped>
@import '@/assets/select.css';
/* 引入共享样式 */
</style>
