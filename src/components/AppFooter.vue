<script setup lang="ts">
import { useAudioStore } from '@/stores/useAudioStore'
import { ref } from 'vue'
import type { ISong } from '@/types'

const store = useAudioStore()

const visible = ref(false)

// Функция для выбора песни
const playSong = (song: ISong) => {
  console.log(song)
  store.loadSong(song)
}
</script>

<template>
  <div class="footer flex">
    <div class="player box flex">
      <div class="flex">
        <app-drawer v-model:visible="visible" header="Список песен">
          <ul>
            <li v-for="song in store.songs" :key="song.name" @click="playSong(song)">
              {{ song.name }}
            </li>
          </ul>
        </app-drawer>
        <div class="song" @click="visible = true">
          <i class="pi pi-play"></i>
          <span>{{ store.currentSong && store.currentSong.name }}</span>
        </div>
      </div>
      <div class="progress"></div>
      <div class="controls gap-2 flex">
        <i class="pi pi-step-backward" @click="store.prev()"></i>
        <i v-if="store.sound?.isPlaying" class="pi pi-pause" @click="store.pause()"></i>
        <i v-else class="pi pi-play" @click="store.play()"></i>
        <i class="pi pi-step-forward" @click="store.next()"></i>
      </div>
      <div class="volume"></div>
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

  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.box {
  background: rgba(255, 255, 255, 0.85);
  color: #000;
  padding: 10px;
}

.song {
  cursor: pointer;
  width: 300px;
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
</style>
