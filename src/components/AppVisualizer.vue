<script setup lang="ts">
import * as THREE from 'three'
import { GUI } from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import vertexShader from '/src/assets/shaders/vertex.glsl'
import fragmentShader from '/src/assets/shaders/fragment.glsl'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

import { onMounted, ref, nextTick } from 'vue'
import { useAudioStore } from '@/stores/useAudioStore'

const visualizer = ref<HTMLElement | null>(null)

// ИНИЦИАЛИЗАЦИЯ СЦЕНЫ, КАМЕРЫ, РЕНДЕРА
const store = useAudioStore()
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, 1000)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, -2, 14)
camera.lookAt(0, 0, 0)

// ПАРАМЕТРЫ
const params = {
  red: 1.0,
  green: 1.0,
  blue: 1.0,
  threshold: 0.5,
  strength: 0.5,
  radius: 0.8,
}

renderer.outputColorSpace = THREE.SRGBColorSpace

// ПОСТПРОЦЕССИНГ
const renderScene = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight * 0.9),
  params.strength,
  params.radius,
  params.threshold,
)
const bloomComposer = new EffectComposer(renderer)
bloomComposer.addPass(renderScene)
bloomComposer.addPass(bloomPass)
const outputPass = new OutputPass()
bloomComposer.addPass(outputPass)

const uniforms = {
  u_time: { type: 'f', value: 0.0 },
  u_frequency: { type: 'f', value: 0.0 },
  u_red: { type: 'f', value: 1.0 },
  u_green: { type: 'f', value: 1.0 },
  u_blue: { type: 'f', value: 1.0 },
}

// СВЕТ
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
dirLight.position.set(10, 10, 10)
scene.add(dirLight)

// МАТЕРИАЛ
const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
})

// СОЗДАНИЕ ОБЪЕКТА
const geometry = new THREE.IcosahedronGeometry(4, 30)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
mesh.material.wireframe = true

// УПРАВЛЕНИЕ КАМЕРОЙ
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.25
controls.screenSpacePanning = false
controls.minDistance = 2
controls.maxDistance = 10

// GUI
const gui = new GUI({ autoPlace: false })
const colorsFolder = gui.addFolder('Цвет')
colorsFolder
  .add(params, 'red', 0, 1)
  .name('Красный')
  .onChange(function (value) {
    uniforms.u_red.value = Number(value)
    localStorage.setItem('visualizerParams', JSON.stringify(params))
  })
colorsFolder
  .add(params, 'green', 0, 1)
  .name('Зеленый')
  .onChange(function (value) {
    uniforms.u_green.value = Number(value)
    localStorage.setItem('visualizerParams', JSON.stringify(params))
  })
colorsFolder
  .add(params, 'blue', 0, 1)
  .name('Синий')
  .onChange(function (value) {
    uniforms.u_blue.value = Number(value)
    localStorage.setItem('visualizerParams', JSON.stringify(params))
  })

const bloomFolder = gui.addFolder('Свечение')
bloomFolder
  .add(params, 'threshold', 0, 1)
  .name('Порог')
  .onChange(function (value) {
    bloomPass.threshold = Number(value)
    bloomComposer.render()
    localStorage.setItem('visualizerParams', JSON.stringify(params))
  })
bloomFolder
  .add(params, 'strength', 0, 3)
  .name('Сила')
  .onChange(function (value) {
    bloomPass.strength = Number(value)
    bloomComposer.render()
    localStorage.setItem('visualizerParams', JSON.stringify(params))
  })
bloomFolder
  .add(params, 'radius', 0, 1)
  .name('Радиус')
  .onChange(function (value) {
    bloomPass.radius = Number(value)
    bloomComposer.render()
    localStorage.setItem('visualizerParams', JSON.stringify(params))
  })

const geometryFolder = gui.addFolder('Геометрия')
geometryFolder
  .add(mesh.scale, 'x', 0.5, 5)
  .name('Размер по X')
  .onChange(() => mesh.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z))
geometryFolder
  .add(mesh.scale, 'y', 0.5, 5)
  .name('Размер по Y')
  .onChange(() => mesh.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z))
geometryFolder
  .add(mesh.scale, 'z', 0.5, 5)
  .name('Размер по Z')
  .onChange(() => mesh.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z))

const materialFolder = gui.addFolder('Материал')
materialFolder.add(mesh.material, 'wireframe').name('Wireframe')
materialFolder
  .add(mesh.material, 'opacity', 0, 1)
  .name('Прозрачность')
  .onChange((value) => (mesh.material.transparent = value < 1))

function updateRendererSize() {
  nextTick(() => {
    const footer = document.querySelector('.footer') as HTMLElement | null
    const footerHeight = footer ? footer.offsetHeight : 0

    renderer.setSize(window.innerWidth, window.innerHeight - footerHeight)
    camera.aspect = window.innerWidth / (window.innerHeight - footerHeight)
    camera.updateProjectionMatrix()

    if (window.innerWidth < 800) {
      camera.position.z = 20
    } else {
      camera.position.z = 14
    }
  })
}

const resizeObserver = new ResizeObserver(() => {
  updateRendererSize()
})

const footer = document.querySelector('.footer')
if (footer) {
  resizeObserver.observe(footer)
}

window.addEventListener('resize', updateRendererSize)

// анимация
const clock = new THREE.Clock()

function animate() {
  uniforms.u_time.value = clock.getElapsedTime()

  if (store.analyser) {
    uniforms.u_frequency.value = store.analyser.getAverageFrequency()
  }

  bloomComposer.render()
  requestAnimationFrame(animate)
  controls.update()
}

onMounted(() => {
  nextTick(() => {
    const savedParams = localStorage.getItem('visualizerParams')
    if (savedParams) {
      const parsedParams = JSON.parse(savedParams)
      Object.assign(params, parsedParams)

      // Применить параметры к шейдерам
      uniforms.u_red.value = parsedParams.red
      uniforms.u_green.value = parsedParams.green
      uniforms.u_blue.value = parsedParams.blue

      // Применить параметры к эффекту свечения
      bloomPass.threshold = parsedParams.threshold
      bloomPass.strength = parsedParams.strength
      bloomPass.radius = parsedParams.radius

      gui.updateDisplay()
    }

    updateRendererSize()

    store.initAudio(camera, 32)
    store.loadSong({
      name: 'dominic fike - baby doll',
      src: '/songs/dominic vike - baby doll.mp3',
    })

    if (visualizer.value) {
      const guiContainer = document.createElement('div')
      guiContainer.style.position = 'absolute'
      guiContainer.style.top = '0px'
      guiContainer.style.right = '0px'

      guiContainer.addEventListener('click', (event) => {
        console.log('click')
        event.stopPropagation()
      })

      // ОБРАБОТКА МЫШИ

      let isRotating = false
      let holdTimeout: number | null = null
      let lastMouseX = 0
      let lastMouseY = 0

      visualizer.value?.addEventListener('mousedown', (event) => {
        lastMouseX = event.clientX
        lastMouseY = event.clientY

        holdTimeout = setTimeout(() => {
          isRotating = true
        }, 300)
      })

      visualizer.value?.addEventListener('mousemove', (event) => {
        if (isRotating) {
          const deltaX = event.clientX - lastMouseX
          const deltaY = event.clientY - lastMouseY
          mesh.rotation.y += deltaX * 0.01
          mesh.rotation.x += deltaY * 0.01
          lastMouseX = event.clientX
          lastMouseY = event.clientY
        }
      })

      visualizer.value?.addEventListener('mouseup', (event) => {
        if (guiContainer.contains(event.target as Node)) {
          return
        }

        if (holdTimeout) {
          clearTimeout(holdTimeout)
        }

        if (!isRotating) {
          store.togglePlay()
        }

        isRotating = false
      })

      visualizer.value.appendChild(renderer.domElement)
      visualizer.value.appendChild(guiContainer)
      guiContainer.appendChild(gui.domElement)

      animate()
    } else {
      console.error("Div with class 'visualizer' not found!")
    }
  })
})
</script>

<template>
  <div ref="visualizer" class="visualizer">
    <div class="visualizer-title">Аудиовизуалайзер</div>
  </div>
</template>

<style scoped>
.visualizer {
  position: relative;
  width: 100%;
}

.visualizer-title {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  z-index: 10;
  letter-spacing: 5px;
}
</style>
