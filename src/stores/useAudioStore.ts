import { defineStore } from 'pinia'
import * as THREE from 'three'
import type { ISong } from '@/types'
import { Volume } from 'three/examples/jsm/Addons.js'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    currentSong: { name: '', src: '' } as ISong,
    sound: null as THREE.Audio | null,
    listener: null as THREE.AudioListener | null,
    analyser: null as THREE.AudioAnalyser | null,
    volume: 0.5 as number,
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

      const audioLoader = new THREE.AudioLoader()

      audioLoader.load(song.src, (buffer) => {
        this.sound!.setBuffer(buffer)

        // Событие окончания трека
        this.sound!.onEnded = () => this.setCurrentSong({ name: '', src: '' })

        // Устанавливаем текущую песню и сразу запускаем проигрывание
        this.setCurrentSong(song)
        this.play()
      })
    },

    setVolume(volume: number) {
      this.volume = volume
      if (this.sound) {
        this.sound.setVolume(volume)
      }
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

    next() {
      const currentIndex = this.songs.findIndex((song) => song.src === this.currentSong.src)
      const nextIndex = (currentIndex + 1) % this.songs.length
      this.loadSong(this.songs[nextIndex])
    },

    prev() {
      const currentIndex = this.songs.findIndex((song) => song.src === this.currentSong.src)
      const prevIndex = (currentIndex - 1 + this.songs.length) % this.songs.length
      this.loadSong(this.songs[prevIndex])
    },

    setCurrentSong(song: ISong) {
      this.currentSong = song
    },
  },
})
