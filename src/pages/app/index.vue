<template>
 <div class="grid auto-rows-min gap-4 md:grid-cols-3">
  <div class="aspect-video rounded-xl bg-muted/50" />
  <div class="aspect-video rounded-xl bg-muted/50" />
  <div class="aspect-video rounded-xl bg-muted/50" />
 </div>
 <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
</template>

<script lang="ts">
export const description = 'A sidebar that collapses to icons.'
export const iframeHeight = '800px'
export const containerClass = 'w-full h-full'
</script>

// This override the page title with the meta title
<script setup lang="ts">
definePage({
 meta: {
  title: 'Big deals', // optional override
 },
})
</script>
