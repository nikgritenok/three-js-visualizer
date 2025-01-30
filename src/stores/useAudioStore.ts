import { defineStore } from 'pinia'
import * as THREE from 'three'
import type { ISong } from '@/types'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    currentSong: { name: '', src: '' } as ISong,
    sound: null as THREE.Audio | null,
    listener: null as THREE.AudioListener | null,
    analyser: null as THREE.AudioAnalyser | null,
    songs: [
      { name: 'dominic fike - baby doll', src: '/src/assets/songs/dominic vike - baby doll.mp3' },
      { name: 'frozy - kompa passion', src: '/src/assets/songs/frozy - kompa passion.mp3' },
      { name: 'saluki - north north', src: '/src/assets/songs/saluki - north north.mp3' },
    ],
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

    loadSong(song: ISong) {
      if (!this.sound || !this.listener) return

      // Если уже есть звук, остановить его перед загрузкой нового
      if (this.sound.isPlaying) {
        this.sound.stop()
      }
      if (song.src) {
        console.log('song.src', song.src)
      } else {
        console.log('song.src', 'empty')
      }

      const audioLoader = new THREE.AudioLoader()
      console.log('song.src', song.src)
      audioLoader.load(song.src, (buffer) => {
        this.sound!.setBuffer(buffer)

        // Событие окончания трека
        this.sound!.onEnded = () => this.setCurrentSong({ name: '', src: '' })

        // Устанавливаем текущую песню и сразу запускаем проигрывание
        this.setCurrentSong(song)
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

    setCurrentSong(song: ISong) {
      this.currentSong = song
    },
  },
})
