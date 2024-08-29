<template>
	<el-select v-model="localValue" placeholder="请选择单位" class="custom-select" filterable clearable>
		<!-- 默认的取消选项 -->
		<el-option v-if="allowClear" :key="null" :label="'请选择单位'" :value="null">
		</el-option>

		<el-option v-for="unitChoice in unitChoices" :key="unitChoice" :label="unitChoice" :value="unitChoice">
		</el-option>
	</el-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
	name: 'UnitSelect',
	props: {
		modelValue: {
			type: String,
			required: true
		}
	},
	setup(props, { emit }) {
		const unitChoices = [
			'车',
			'方',
			'时间',
		];

		const localValue = ref(props.modelValue);
		const allowClear = ref(true);  // 允许清除选项

		watch(localValue, (newValue) => {
			emit('update:modelValue', newValue);
		});

		watch(() => props.modelValue, (newValue) => {
			localValue.value = newValue;
		});

		return {
			allowClear,
			unitChoices,
			localValue
		};
	},
});
</script>

<style scoped>
@import '@/assets/select.css';
/* 引入共享样式 */
</style>