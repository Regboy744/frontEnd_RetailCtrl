<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
 icon: Component
 label: string
 value: string | number
 subValue?: string
 iconBg: string // e.g., 'bg-blue-100'
 iconColor: string // e.g., 'text-blue-600'
}

defineProps<Props>()
</script>

<template>
 <div
  class="flex flex-col md:flex-row items-stretch rounded-lg border border-muted/20 shadow-sm overflow-hidden"
 >
  <!-- Icon Container: Top on mobile, Left on desktop -->
  <div
   :class="[
    iconBg,
    'flex items-center justify-center w-full md:w-20 h-16 md:h-20 flex-shrink-0',
   ]"
  >
   <component :is="icon" :class="[iconColor, 'w-9 h-9 md:w-10 md:h-10']" />
  </div>

  <!-- Data Container: Below on mobile, Right on desktop -->
  <div
   class="flex-1 flex flex-col justify-center items-center bg-card px-3 md:px-3 py-2 md:py-0 gap-0"
  >
   <span class="text-xs text-muted-foreground font-medium">
    {{ label }}
   </span>
   <strong class="text-lg md:text-xl font-bold tracking-tight text-foreground">
    {{ value }}
   </strong>
   <span v-if="subValue" class="text-xs text-muted-foreground/70 font-normal">
    {{ subValue }}
   </span>
  </div>
 </div>
</template>
