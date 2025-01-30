import { defineStore } from 'pinia'
import * as THREE from 'three'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    currentSong: '',
    sound: null as THREE.Audio | null,
    listener: null as THREE.AudioListener | null,
    analyser: null as THREE.AudioAnalyser | null,
  }),

  actions: {
    initAudio(camera: THREE.Camera, analyserSize = 32) {
      // Создаем слушатель звука и прикрепляем к камере
      this.listener = new THREE.AudioListener()
      camera.add(this.listener)

      // Создаем сам звук
      this.sound = new THREE.Audio(this.listener)

      // Создаем Analyser, который будет возвращать данные частот
      this.analyser = new THREE.AudioAnalyser(this.sound, analyserSize)
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

        // Событие окончания трека
        this.sound!.onEnded = () => this.setCurrentSong('')

        // Устанавливаем текущую песню и сразу запускаем проигрывание
        this.setCurrentSong(songPath)
        this.play()
      })
    },

    play() {
      if (this.sound && !this.sound.isPlaying) {
        this.sound.play()
      }
    },

    togglePlay() {
      if (this.sound?.isPlaying) {
        this.pause()
      } else {
        this.play()
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
