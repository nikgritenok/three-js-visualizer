<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import AppVisualizer from './components/AppVisualizer.vue'
</script>

<template>
  <div class="wrapper">
    <header><AppHeader /></header>

    <div class="visualizer">
      <AppVisualizer />
    </div>

    <footer>
      <AppFooter />
    </footer>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  max-height: 50vh;
}

header {
  flex: 0 0 auto;
  flex-shrink: 1;
}

.visualizer {
  width: 100%;
  height: 100%;
  display: block;
}

footer {
  flex: 0 0 auto;
  flex-shrink: 1;
}
</style>
