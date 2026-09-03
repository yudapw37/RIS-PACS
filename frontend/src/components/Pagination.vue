<template>
  <div class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 gap-4">
    <div class="flex items-center gap-3">
      <span class="text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tampilkan</span>
      <select 
        :value="itemsPerPage" 
        @change="$emit('update:itemsPerPage', Number(($event.target as HTMLSelectElement).value)); $emit('update:currentPage', 1)" 
        class="text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-3 pr-8 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all cursor-pointer text-slate-700 dark:text-slate-200 shadow-sm dark:shadow-none appearance-none relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_10px_center]"
      >
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
      <span class="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400">dari total <span class="font-bold text-slate-700 dark:text-slate-200">{{ totalItems }}</span> entri</span>
    </div>
    
    <div class="flex items-center gap-2">
      <button 
        @click="$emit('update:currentPage', currentPage - 1)" 
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      
      <span class="text-sm font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 px-3 flex items-center">
        Hal <span class="mx-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-2.5 py-1 min-w-[2rem] text-center shadow-sm dark:shadow-none">{{ currentPage }}</span> / {{ totalPages || 1 }}
      </span>

      <button 
        @click="$emit('update:currentPage', currentPage + 1)" 
        :disabled="currentPage >= totalPages"
        class="pagination-btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}>()

defineEmits(['update:itemsPerPage', 'update:currentPage'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))
</script>\n