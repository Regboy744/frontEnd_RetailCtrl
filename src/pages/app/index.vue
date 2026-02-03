<script setup lang="ts">
import ForecastWidget from '@/features/weather-forecast/components/ForecastWidget.vue'

//import WeatherWidget from '@/features/weather-forecast/components/WeatherWidget.vue'

// This overrides the page title with the meta title
definePage({
 meta: {
  title: 'Dashboard',
 },
})
</script>

<template>
 <div class="space-y-6">
  <!-- Weather Forecast Widget -->
  <!-- <WeatherWidget /> -->
  <ForecastWidget />
  <!-- Placeholder for future widgets -->
  <div class="grid auto-rows-min gap-4 md:grid-cols-3">
   <div class="aspect-video rounded-xl bg-muted/50" />
   <div class="aspect-video rounded-xl bg-muted/50" />
   <div class="aspect-video rounded-xl bg-muted/50" />
  </div>
 </div>
</template>
