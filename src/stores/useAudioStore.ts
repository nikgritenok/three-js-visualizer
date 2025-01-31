import { defineStore } from 'pinia'
import * as THREE from 'three'
import type { ISong } from '@/types'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    currentSong: { name: '', src: '' } as ISong,
    sound: null as THREE.Audio | null,
    listener: null as THREE.AudioListener | null,
    analyser: null as THREE.AudioAnalyser | null,
    currentTime: 0,
    duration: 0,
    volume: 0.5 as number,
    songs: [
      { name: 'dominic fike - baby doll', src: '/songs/dominic vike - baby doll.mp3' },
      { name: 'frozy - kompa passion', src: '/songs/frozy - kompa passion.mp3' },
      { name: 'saluki - north north', src: '/songs/saluki - north north.mp3' },
    ],
  }),

  actions: {
    initAudio(camera: THREE.Camera, analyserSize = 32) {
      this.listener = new THREE.AudioListener()
      camera.add(this.listener)

      this.sound = new THREE.Audio(this.listener)
      this.analyser = new THREE.AudioAnalyser(this.sound, analyserSize)
    },

    updateProgress() {
      if (!this.sound) return

      const update = () => {
        if (!this.sound || !this.sound.isPlaying) return
        this.currentTime = this.sound.context.currentTime
        requestAnimationFrame(update)
      }

      update()
    },

    async loadSong(song: ISong): Promise<void> {
      console.log('2 шаг: Выбрана песня', song)

      if (!this.sound || !this.listener) return

      if (this.sound.isPlaying) {
        this.sound.stop()
      }

      const audioLoader = new THREE.AudioLoader()

      try {
        const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
          audioLoader.load(
            song.src,
            (buffer) => resolve(buffer),
            undefined,
            (error) => reject(error),
          )
        })

        this.sound!.setBuffer(buffer)
        this.sound!.setVolume(this.volume)
        this.sound!.onEnded = () => this.setCurrentSong({ name: '', src: '' })
        this.duration = buffer.duration

        console.log('3 шаг: Песня загружена', song)
        this.setCurrentSong(song)
      } catch (error) {
        console.error('Ошибка при загрузке песни:', error)
      }
    },

    setVolume(volume: number) {
      this.volume = volume
      if (this.sound) {
        this.sound.setVolume(volume)
      }
    },
    setTime(time: number) {
      if (this.sound && this.sound.isPlaying) {
        this.sound.stop() // Останавливаем воспроизведение
        this.sound.play(time) // Запускаем воспроизведение с нового времени (в секундах)
        this.currentTime = time // Обновляем текущее время
      }
    },

    play() {
      if (this.sound && !this.sound.isPlaying) {
        this.sound.play()
        this.updateProgress()
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
      this.currentTime = 0
      this.loadSong(this.songs[nextIndex])
    },

    prev() {
      const currentIndex = this.songs.findIndex((song) => song.src === this.currentSong.src)
      const prevIndex = (currentIndex - 1 + this.songs.length) % this.songs.length
      this.currentTime = 0
      this.loadSong(this.songs[prevIndex])
    },

    setCurrentSong(song: ISong) {
      this.currentSong = song
    },
  },
})
