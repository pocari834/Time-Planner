// services/timerService.js - 计时器服务

import { saveData, loadData, STORAGE_KEYS } from '../utils/storage.js'
import { getCurrentTimeInMinutes, formatHours, formatTimeSmart } from '../utils/time.js'

class TimerService {
  constructor() {
    this.timers = {
      work: null,
      study: null
    }
    this.state = {
      work: { running: false, startTime: null, totalSeconds: 0 },
      study: { running: false, startTime: null, totalSeconds: 0 }
    }
    this.loadState()
  }

  /**
   * 加载状态
   */
  loadState() {
    const savedState = loadData(STORAGE_KEYS.TIMER_STATE, {
      work: { running: false, startTime: null, totalSeconds: 0 },
      study: { running: false, startTime: null, totalSeconds: 0 }
    })
    // 兼容旧数据格式（totalMinutes）
    if (savedState.work.totalMinutes !== undefined) {
      savedState.work.totalSeconds = savedState.work.totalMinutes * 60
      delete savedState.work.totalMinutes
    }
    if (savedState.study.totalMinutes !== undefined) {
      savedState.study.totalSeconds = savedState.study.totalMinutes * 60
      delete savedState.study.totalMinutes
    }
    this.state = savedState
    // 如果之前有运行中的计时器，不自动恢复，让用户手动控制
    if (savedState.work.running && savedState.work.startTime) {
      savedState.work.running = false
      savedState.work.startTime = null
    }
    if (savedState.study.running && savedState.study.startTime) {
      savedState.study.running = false
      savedState.study.startTime = null
    }
    this.saveState()
  }

  /**
   * 保存状态
   */
  saveState() {
    saveData(STORAGE_KEYS.TIMER_STATE, this.state)
  }

  /**
   * 开始计时
   */
  startTimer(type) {
    if (this.state[type].running) {
      return false
    }

    // 清除之前的定时器（如果有）
    if (this.timers[type]) {
      clearInterval(this.timers[type])
      this.timers[type] = null
    }

    this.state[type].running = true
    this.state[type].startTime = Date.now() // 使用时间戳（毫秒）
    this.saveState()

    // 每秒更新一次
    this.timers[type] = setInterval(() => {
      this.updateTimer(type)
    }, 1000)

    return true
  }

  /**
   * 停止计时
   */
  stopTimer(type) {
    if (!this.state[type].running) {
      return false
    }

    const endTime = Date.now()
    const durationSeconds = Math.floor((endTime - this.state[type].startTime) / 1000)
    
    this.state[type].totalSeconds += durationSeconds
    this.state[type].running = false
    this.state[type].startTime = null
    
    if (this.timers[type]) {
      clearInterval(this.timers[type])
      this.timers[type] = null
    }

    this.saveState()
    return durationSeconds // 返回秒数
  }

  /**
   * 更新计时器
   */
  updateTimer(type) {
    if (!this.state[type].running) {
      return
    }
    // 触发更新事件，由页面监听
    this.onUpdate && this.onUpdate(type, this.getCurrentTotal(type))
  }

  /**
   * 获取当前总时间（秒）
   */
  getCurrentTotalSeconds(type) {
    let total = this.state[type].totalSeconds || 0
    if (this.state[type].running && this.state[type].startTime) {
      const current = Date.now()
      const elapsedSeconds = Math.floor((current - this.state[type].startTime) / 1000)
      total += elapsedSeconds
    }
    return total
  }

  /**
   * 获取当前总时间（分钟）- 用于兼容
   */
  getCurrentTotal(type) {
    return this.getCurrentTotalSeconds(type) / 60
  }

  /**
   * 获取格式化的总时间（小时格式）
   */
  getFormattedTotal(type) {
    return formatHours(this.getCurrentTotal(type))
  }

  /**
   * 获取格式化的总时间（智能格式：秒/分钟/小时）
   */
  getFormattedTotalSmart(type) {
    const totalSeconds = this.getCurrentTotalSeconds(type)
    return formatTimeSmart(totalSeconds / 60)
  }

  /**
   * 获取计时器状态
   */
  getState(type) {
    return {
      running: this.state[type].running,
      total: this.getFormattedTotalSmart(type)
    }
  }

  /**
   * 重置计时器
   */
  resetTimer(type) {
    this.stopTimer(type)
    this.state[type].totalSeconds = 0
    this.saveState()
  }
}

export default new TimerService()

