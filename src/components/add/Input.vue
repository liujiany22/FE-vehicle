<!-- src/add/Input.vue -->
<template>
    <el-form-item :label="label">
      <el-input v-model="inputValue" :placeholder="placeholder" @input="updateValue"></el-input>
    </el-form-item>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, toRefs } from 'vue';
  
  export default defineComponent({
    name: 'Input',
    props: {
      modelValue: {
        type: String,
        required: true
      },
      label: {
        type: String,
        required: true
      },
      placeholder: {
        type: String,
        required: false,
        default: ''
      }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const { modelValue } = toRefs(props);
      
      const inputValue = ref(modelValue.value);
      
      const updateValue = (value: string) => {
        emit('update:modelValue', value);
      };
  
      return {
        inputValue,
        updateValue,
      };
    }
  });
  </script>
  