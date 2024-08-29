<template>
	<div class="account-management">
		<!-- 用户名更改 -->
		<el-card>
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
			<el-form :model="phoneForm" @submit.prevent="handlePhoneChange" label-width="70px">
				<el-form-item label="新手机号" :error="errors.phone">
					<el-input v-model="phoneForm.newPhone" placeholder="请输入新手机号" @blur="validatePhone" class="custom-input">
						<template #append>
							<el-button type="primary" @click="handlePhoneChange" plain>更改</el-button>
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

		<!-- 登出和注销 -->
			<el-button type="warning" @click="handleLogout" plain>登出</el-button>
			<el-button type="danger" @click="handleCancel" plain>注销</el-button>
		</el-card>
	</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { logout, cancel, getVerification, changePassword, changePhone, changeUsername } from '@/services/authService';

export default defineComponent({
	name: 'AccountManagement',
	setup() {
		const usernameForm = ref({ newUsername: '' });
		const phoneForm = ref({ newPhone: '', verification: '' });
		const passwordForm = ref({ oldPassword: '', newPassword: '', verification: '' });

		const errors = ref({
			username: null as string | null,
			phone: null as string | null,
			oldPassword: null as string | null,
			newPassword: null as string | null,
			verification: null as string | null,
		});

		const isCountingDown = ref(false);
		const countdownText = ref('');
		let countdownTimer: ReturnType<typeof setInterval>;

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

		const validatePhone = () => {
			const phoneRegex = /^1[3-9]\d{9}$/;
			if (!phoneForm.value.newPhone) {
				errors.value.phone = '请输入手机号';
			} else if (!phoneRegex.test(phoneForm.value.newPhone)) {
				errors.value.phone = '手机号格式不正确';
			} else {
				errors.value.phone = null;
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

		const validateVerificationCode = () => {
			const codeRegex = /^\d{6}$/;
			if (!phoneForm.value.verification && !passwordForm.value.verification) {
				errors.value.verification = '请输入验证码';
			} else if (!codeRegex.test(phoneForm.value.verification || passwordForm.value.verification)) {
				errors.value.verification = '验证码必须是6位数字';
			} else {
				errors.value.verification = null;
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

		const handlePhoneChange = async () => {
			validatePhone();
			// validateVerificationCode();
			if (errors.value.phone || errors.value.verification) return;

			try {
				await changePhone('', phoneForm.value.newPhone);
				ElMessage.success('手机号已更改');
			} catch (error) {
				ElMessage.error('更改手机号失败，请稍后再试');
			}
		};

		const handlePasswordChange = async () => {
			validateOldPassword();
			validateNewPassword();
			// validateVerificationCode();
			if (errors.value.oldPassword || errors.value.newPassword || errors.value.verification) return;

			try {
				await changePassword(passwordForm.value.oldPassword, passwordForm.value.newPassword);
				ElMessage.success('密码已更改');
			} catch (error) {
				ElMessage.error('更改密码失败，请稍后再试');
			}
		};

		const handleGetVerification = async () => {
			validatePhone();
			if (errors.value.phone) return;

			try {
				await getVerification(phoneForm.value.newPhone);
				ElMessage.success('验证码已发送');
				startCountdown();
			} catch (error) {
				ElMessage.error('获取验证码失败，请稍后再试');
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

		const handleLogout = async () => {
			try {
				await logout();
				ElMessage.success('已登出');
			} catch (error) {
				ElMessage.error('登出失败，请稍后再试');
			}
		};

		const handleCancel = async () => {
			try {
				await cancel();
				ElMessage.success('账户已注销');
			} catch (error) {
				ElMessage.error('注销账户失败，请稍后再试');
			}
		};

		const showMessage = () => {
			ElMessage.warning('维护中')
		};

		onMounted(() => {
			showMessage();
		})

		return {
			usernameForm,
			phoneForm,
			passwordForm,
			errors,
			isCountingDown,
			countdownText,
			validateUsername,
			validateOldPassword,
			validateNewPassword,
			validatePhone,
			validateVerificationCode,
			handleUsernameChange,
			handlePhoneChange,
			handlePasswordChange,
			handleGetVerification,
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