<script setup lang="ts">
import AppFooter from './components/AppFooter.vue'
import AppVisualizer from './components/AppVisualizer.vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { Analytics } from '@vercel/analytics/vue'
</script>

<template>
  <div class="wrapper">
    <Analytics />
    <SpeedInsights />
    <AppVisualizer />
    <AppFooter />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
