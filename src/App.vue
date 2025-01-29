<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div class="wrapper">
    <header><AppHeader /></header>

    <div class="visualizer"></div>

    <footer>
      <AppFooter />
    </footer>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.visualizer {
  flex: 1;
  background-color: #282c34;
}
</style>
