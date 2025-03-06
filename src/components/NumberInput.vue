<script setup lang="ts">
defineProps<{
  modelValue: number;
  label: string;
  id: string;
  hint: string;
  placeholder: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: number): void
}>();
</script>

<template>
  <div>
    <label :for="id" class="block text-sm font-medium">
      {{ label }}
    </label>
    <div class="mt-1 relative">
      <input
        :id="id"
        type="number"
        :value="modelValue"
        @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
        min="0"
        :placeholder="placeholder"
        class="max-w-[100px] block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
               focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        :aria-describedby="`${id}-hint`"
      />
      <p :id="`${id}-hint`" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ hint }}
      </p>
    </div>
  </div>
</template>
