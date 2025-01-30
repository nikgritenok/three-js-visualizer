import { defineStore } from 'pinia'
import * as THREE from 'three'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    currentSong: '',
    sound: null as THREE.Audio | null,
    listener: null as THREE.AudioListener | null,
  }),

  actions: {
    initAudio(camera: THREE.Camera) {
      this.listener = new THREE.AudioListener()
      camera.add(this.listener)

      this.sound = new THREE.Audio(this.listener)
    },

    loadSong(songPath: string) {
      if (!this.sound || !this.listener) return

      // Если уже есть звук, остановить его перед загрузкой нового
      if (this.sound.isPlaying) {
        this.sound.stop()
      }

      const audioLoader = new THREE.AudioLoader()
      audioLoader.load(songPath, (buffer) => {
        this.sound!.setBuffer(buffer)
        this.sound!.onEnded = () => this.setCurrentSong('')

        this.setCurrentSong(songPath)
        this.play()
      })
    },

    play() {
      if (this.sound && this.sound.isPlaying === false) {
        this.sound.play()
      }
    },

    pause() {
      if (this.sound && this.sound.isPlaying) {
        this.sound.pause()
      }
    },

    setCurrentSong(songPath: string) {
      this.currentSong = songPath
    },
  },
})
