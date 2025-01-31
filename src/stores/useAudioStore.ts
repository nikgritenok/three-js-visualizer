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
    startContextTime: 0,
    offset: 0,
    volume: 0.5 as number,
    songs: [
      { name: 'dominic vike - baby doll', src: '/songs/dominic vike - baby doll.mp3' },
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

    async loadUserSong(file: File) {
      if (!this.sound || !this.listener) return

      try {
        const buffer = await this.decodeAudioFile(file)
        this.setupAudio(buffer)
        this.setCurrentSong({ name: file.name, src: URL.createObjectURL(file) })
        this.resetAudioState()
        this.play()
      } catch (error) {
        console.error('Ошибка при загрузке пользовательского трека:', error)
      }
    },

    async decodeAudioFile(file: File): Promise<AudioBuffer> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer
          if (!arrayBuffer) return reject(new Error('Не удалось прочитать файл'))

          const context = new (window.AudioContext || (window as any).webkitAudioContext)()
          context.decodeAudioData(arrayBuffer, resolve, reject)
        }
        reader.readAsArrayBuffer(file)
      })
    },

    setupAudio(buffer: AudioBuffer) {
      if (!this.sound) return

      this.sound.setBuffer(buffer)
      this.sound.setVolume(this.volume)
      this.sound.onEnded = () => {
        this.setCurrentSong({ name: '', src: '' })
        this.currentTime = 0
      }
      this.duration = buffer.duration
    },

    resetAudioState() {
      this.currentTime = 0
      this.offset = 0
      this.startContextTime = 0
    },

    updateProgress() {
      if (!this.sound) return

      const update = () => {
        if (!this.sound || !this.sound.isPlaying) return

        this.currentTime = this.sound.context.currentTime - this.startContextTime + this.offset

        requestAnimationFrame(update)
      }

      requestAnimationFrame(update)
    },

    async loadSong(song: ISong): Promise<void> {
      console.log('song', song, this.currentSong, this.currentTime)
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
        this.sound!.onEnded = () => (
          this.setCurrentSong({ name: '', src: '' }), (this.currentTime = 0)
        )
        this.duration = buffer.duration

        this.setCurrentSong(song)

        this.currentTime = 0
        this.offset = 0
        this.startContextTime = 0
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
      this.sound?.stop()
      this.sound.offset = time
      this.sound?.play()
      this.currentTime = time
    },

    play() {
      if (!this.sound || this.sound.isPlaying) return

      this.startContextTime = this.sound.context.currentTime

      this.sound.offset = this.offset
      this.sound.play()

      this.updateProgress()
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
        this.offset = this.currentTime
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
