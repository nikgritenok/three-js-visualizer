<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (!containerRef.value) return

  const scene = new THREE.Scene()

  const { clientWidth } = containerRef.value

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer()
  containerRef.value.appendChild(renderer.domElement)

  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  function animate() {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
    renderer.render(scene, camera)
  }
  animate()

  function onResize() {
    if (!containerRef.value) return

    const header = document.querySelector('header') as HTMLElement
    const footer = document.querySelector('footer') as HTMLElement

    const headerHeight = header?.offsetHeight || 0
    const footerHeight = footer?.offsetHeight || 0
    const availableHeight = window.innerHeight - headerHeight - footerHeight

    const { clientWidth } = containerRef.value
    camera.aspect = clientWidth / availableHeight
    camera.updateProjectionMatrix()
    renderer.setSize(clientWidth, availableHeight)
  }

  window.addEventListener('resize', onResize)

  // Initialize the size on mount
  onResize()

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    if (containerRef.value && renderer.domElement) {
      containerRef.value.removeChild(renderer.domElement)
    }
  })
})
</script>

<template>
  <div ref="containerRef" class="visualizer"></div>
</template>

<style scoped>
.visualizer {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
