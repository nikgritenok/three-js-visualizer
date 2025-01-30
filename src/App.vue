<script setup lang="ts">
import AppFooter from './components/AppFooter.vue'
import AppVisualizer from './components/AppVisualizer.vue'
</script>

<template>
  <div class="wrapper">
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
