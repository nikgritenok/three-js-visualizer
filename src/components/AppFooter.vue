<script setup lang="ts">
import { useAudioStore } from '@/stores/useAudioStore'
import { ref } from 'vue'

const store = useAudioStore()

const visible = ref(false)

const songs = [
  { name: 'dominic fike - baby doll', src: '/src/assets/songs/dominic vike - baby doll.mp3' },
  { name: 'frozy - kompa passion', src: '/src/assets/songs/frozy - kompa passion.mp3' },
]

// Функция для выбора песни
const playSong = (songSrc: string) => {
  store.loadSong(songSrc)
}
</script>

<template>
  <div class="footer flex">
    <div class="player box">
      <div class="flex">
        <app-drawer v-model:visible="visible" header="Список песен">
          <ul>
            <li v-for="song in songs" :key="song.name" @click="playSong(song.src)">
              {{ song.name }}
            </li>
          </ul>
        </app-drawer>
        <div class="song" @click="visible = true">
          <i class="pi pi-play"></i>
          <span>{{ store.currentSong }}</span>
        </div>
      </div>
    </div>
    <div class="progress"></div>
    <div class="controls"></div>
    <div class="volume"></div>
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
