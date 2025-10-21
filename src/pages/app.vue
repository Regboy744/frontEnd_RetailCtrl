<script setup lang="ts">
import Indexlayout from '@/components/app-layout/Indexlayout.vue'
</script>

<template>
 <Indexlayout>
  <RouterView v-slot="{ Component, route }">
   <Suspense v-if="Component" timeout="0">
    <Component :is="Component" :key="route.name"></Component>

    <template #fallback>
     <span> Loading .. </span>
    </template>
   </Suspense>
  </RouterView>
 </Indexlayout>
</template>
