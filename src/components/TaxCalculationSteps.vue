<script setup lang="ts">
import { Step } from '../types';

defineProps<{
  title: string;
  steps: Step[];
}>();
</script>

<template>
  <div>
    <h3 class="font-medium mb-2 text-gray-800 dark:text-gray-200">{{ title }}</h3>
    <ul class="list-disc pl-5 space-y-1">
      <li v-for="(step, i) in steps" :key="i" class="text-sm">
        <span :class="{'font-medium': i === steps.length - 1}">{{ step.title }}</span><br>
        <span class="italic">{{ step.calculation }}</span>
      </li>
    </ul>
  </div>
</template>
