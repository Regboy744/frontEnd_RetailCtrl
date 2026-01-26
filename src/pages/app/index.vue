<template>
 <div class="grid auto-rows-min gap-4 md:grid-cols-3">
  <div class="aspect-video rounded-xl bg-muted/50" />
  <div class="aspect-video rounded-xl bg-muted/50" />
  <div class="aspect-video rounded-xl bg-muted/50" />
 </div>
 <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
</template>

<script setup lang="ts">
// This overrides the page title with the meta title
definePage({
 meta: {
  title: 'Big deals',
 },
})
</script>
