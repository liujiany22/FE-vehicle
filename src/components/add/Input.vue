<!-- src/add/Input.vue -->
<template>
    <el-form-item :label="label">
      <el-input v-model="modelValue" :placeholder="placeholder"></el-input>
    </el-form-item>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
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
    emits: ['update:modelValue']
  });
  </script>
  