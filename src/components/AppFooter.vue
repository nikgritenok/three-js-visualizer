<script setup lang="ts">
import { useAudioStore } from '@/stores/useAudioStore'
import { ref } from 'vue'
import type { ISong } from '@/types'

const store = useAudioStore()

const visible = ref(false)
const showVolumeSlider = ref(false)

function formatTime(duration: number): string {
  const totalSeconds = Math.floor(duration)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const updateTime = (event: Event) => {
  const input = event.target as HTMLInputElement
  const newTime = parseFloat(input.value)
  store.setTime(newTime)
}

const playSong = async (song: ISong) => {
  await store.loadSong(song)
  store.play()
}

const toggleVolume = () => {
  showVolumeSlider.value = !showVolumeSlider.value
}

const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    store.loadUserSong(file)
  }
}
</script>

<template>
  <div class="footer flex">
    <div class="player box flex gap-3">
      <div class="flex">
        <app-drawer v-model:visible="visible" header="Список песен">
          <ul>
            <li
              v-for="song in store.songs"
              :key="song.name"
              @click="(playSong(song), (visible = false))"
            >
              {{ song.name }}
            </li>
          </ul>
        </app-drawer>
        <div class="song" @click="visible = true">
          <i class="pi pi-play"></i>
          <span>{{ store.currentSong && store.currentSong.name }}</span>
        </div>
        <app-button class="upload" variant="text" label="Primary"
          >Загрузить свою песню<input type="file" @change="handleFileUpload" accept="audio/*"
        /></app-button>
      </div>
      <div class="progress">
        <span>{{ formatTime(store.currentTime) }}</span>
        <input
          type="range"
          id="progress"
          :value="store.currentTime"
          :max="store.duration"
          step="0.01"
          @input="updateTime($event)"
        />
        <span>{{ formatTime(store.duration) }}</span>
      </div>
      <div class="controls gap-2 flex">
        <i class="pi pi-step-backward" @click="store.prev()"></i>
        <i v-if="store.sound?.isPlaying" class="pi pi-pause" @click="store.pause()"></i>
        <i v-else class="pi pi-play" @click="store.play()"></i>
        <i class="pi pi-step-forward" @click="store.next()"></i>
      </div>
      <div class="volume">
        <i class="pi pi-volume-up" @click="toggleVolume"></i>
        <div class="volume-slider" v-if="showVolumeSlider">
          <input
            type="range"
            orient="vertical"
            min="0"
            max="1"
            step="0.01"
            v-model="store.volume"
            @input="store.setVolume(parseFloat(($event.target as HTMLInputElement).value ?? 0))"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player {
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  height: 40px;

  display: flex;
  align-items: center;

  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.box {
  background: rgba(255, 255, 255, 0.85);
  color: #000;
  padding: 10px;
}

.song {
  cursor: pointer;
  width: 500px;
  max-width: 50%;
  margin-top: -10px;
  padding-top: 10px;
  display: flex;
  align-items: center;
  gap: 3px;
}

li {
  cursor: pointer;
}

.volume {
  display: flex;
  align-items: center;
  position: relative;
}

.volume-slider {
  position: absolute;
  bottom: 60px; /* Расположить выше иконки */
  left: 50%;
  transform: translateX(-50%); /* Центрирование */
  display: flex;
  justify-content: center;
}

.volume-slider input[type='range'] {
  flex-grow: 1;
  width: 100%;
  transform: rotate(-90deg); /* Поворачиваем ползунок */
  width: 80px;
}

.progress {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.progress input[id='progress'] {
  flex-grow: 1;
  margin: 0 10px;
}

.upload {
  position: relative;
  z-index: 10;
  color: #000;
}

.upload input[type='file'] {
  opacity: 0;
  position: absolute;
  z-index: 11;
}
</style>
