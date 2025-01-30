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

import { onMounted, ref } from 'vue'

let footerHeight = 0

// Создание сцены, камеры и рендера
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight - footerHeight)
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, -2, 14)
camera.lookAt(0, 0, 0)

// Параметры

const params = {
  red: 1.0,
  green: 1.0,
  blue: 1.0,
  threshold: 0.5,
  strength: 0.5,
  radius: 0.8,
}

renderer.outputColorSpace = THREE.SRGBColorSpace

// Постпроцессинг

const renderScene = new RenderPass(scene, camera)

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight - footerHeight),
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

// Свет

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
dirLight.position.set(10, 10, 10)
scene.add(dirLight)

// Материал

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
})

// Создание объекта
const geometry = new THREE.IcosahedronGeometry(4, 30)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
mesh.material.wireframe = true

// Управление камерой
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.25
controls.screenSpacePanning = false
controls.minDistance = 2
controls.maxDistance = 10

// Звук
const listener = new THREE.AudioListener()
camera.add(listener)

const sound = new THREE.Audio(listener)

const audioLoader = new THREE.AudioLoader()
audioLoader.load('/src/assets//songs/song.mp3', function (buffer) {
  sound.setBuffer(buffer)
  visualizer.value?.addEventListener('click', function () {
    sound.play()
  })
})

const analyser = new THREE.AudioAnalyser(sound, 32)

// GUI

const gui = new GUI({ autoPlace: false })

const colorsFolder = gui.addFolder('Colors')
colorsFolder.add(params, 'red', 0, 1).onChange(function (value) {
  uniforms.u_red.value = Number(value)
})
colorsFolder.add(params, 'green', 0, 1).onChange(function (value) {
  uniforms.u_green.value = Number(value)
})
colorsFolder.add(params, 'blue', 0, 1).onChange(function (value) {
  uniforms.u_blue.value = Number(value)
})

const bloomFolder = gui.addFolder('Bloom')
bloomFolder.add(params, 'threshold', 0, 1).onChange(function (value) {
  bloomPass.threshold = Number(value)
})
bloomFolder.add(params, 'strength', 0, 3).onChange(function (value) {
  bloomPass.strength = Number(value)
})
bloomFolder.add(params, 'radius', 0, 1).onChange(function (value) {
  bloomPass.radius = Number(value)
})

// Получаем ссылку на div с классом visualizer
const visualizer = ref<HTMLElement | null>(null)

// Обработчик события на изменение размера окна
function updateRendererSize() {
  footerHeight = document.querySelector('.footer')?.clientHeight || 0
  if (visualizer.value) {
    visualizer.value.style.height = `${window.innerHeight - footerHeight}px`
  }
  renderer.setSize(window.innerWidth, window.innerHeight - footerHeight)
  bloomPass.setSize(window.innerWidth, window.innerHeight - footerHeight)
  camera.aspect = window.innerWidth / (window.innerHeight - footerHeight)
  camera.updateProjectionMatrix()
}

// Добавление обработчика события на изменение окна
window.addEventListener('resize', updateRendererSize)

// Добавление обработчика события на движение мыши
let mouseX = 0
let mouseY = 0
document.addEventListener('mousemove', function (e) {
  const windowHalfX = window.innerWidth / 2
  const windowHalfY = window.innerHeight / 2
  mouseX = (e.clientX - windowHalfX) / 100
  mouseY = (e.clientY - windowHalfY) / 100
})

const clock = new THREE.Clock()

// Функция анимации
function animate() {
  uniforms.u_time.value = clock.getElapsedTime()
  uniforms.u_frequency.value = analyser.getAverageFrequency()
  bloomComposer.render()
  requestAnimationFrame(animate)

  controls.update()
  renderer.render(scene, camera)
}

onMounted(() => {
  if (visualizer.value) {
    // Создание контейнера для GUI
    const guiContainer = document.createElement('div')
    guiContainer.style.position = 'absolute'
    guiContainer.style.top = '0px'
    guiContainer.style.right = '0px'

    // Останавливаем всплытие события
    guiContainer.addEventListener('click', (event) => {
      event.stopPropagation()
    })

    // Добавление элементов в visualizer
    visualizer.value.appendChild(renderer.domElement) // Если renderer уже инициализирован
    visualizer.value.appendChild(guiContainer) // Добавляем контейнер для GUI в visualizer

    // Добавление элементов GUI внутрь созданного контейнера
    guiContainer.appendChild(gui.domElement)

    updateRendererSize() // Убедитесь, что размеры обновляются при монтировании

    animate()
  } else {
    console.error("Div with class 'visualizer' not found!")
  }
})
</script>

<template>
  <div ref="visualizer" class="visualizer"></div>
</template>

<style scoped>
.visualizer {
  position: relative;
  width: 100%;
  height: 100vh;
}
</style>
