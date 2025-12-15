// services/timerService.js - 计时器服务

import { saveData, loadData, STORAGE_KEYS } from '../utils/storage.js'
import { getCurrentTimeInMinutes, formatHours } from '../utils/time.js'

class TimerService {
  constructor() {
    this.timers = {
      work: null,
      study: null
    }
    this.state = {
      work: { running: false, startTime: null, totalMinutes: 0 },
      study: { running: false, startTime: null, totalMinutes: 0 }
    }
    this.loadState()
  }

  /**
   * 加载状态
   */
  loadState() {
    const savedState = loadData(STORAGE_KEYS.TIMER_STATE, {
      work: { running: false, startTime: null, totalMinutes: 0 },
      study: { running: false, startTime: null, totalMinutes: 0 }
    })
    this.state = savedState
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

    this.state[type].running = true
    this.state[type].startTime = getCurrentTimeInMinutes()
    this.saveState()

    // 每秒更新一次（实际可以降低频率）
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

    const endTime = getCurrentTimeInMinutes()
    const duration = endTime - this.state[type].startTime
    
    this.state[type].totalMinutes += duration
    this.state[type].running = false
    this.state[type].startTime = null
    
    if (this.timers[type]) {
      clearInterval(this.timers[type])
      this.timers[type] = null
    }

    this.saveState()
    return duration
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
   * 获取当前总时间（分钟）
   */
  getCurrentTotal(type) {
    let total = this.state[type].totalMinutes
    if (this.state[type].running && this.state[type].startTime) {
      const current = getCurrentTimeInMinutes()
      total += current - this.state[type].startTime
    }
    return total
  }

  /**
   * 获取格式化的总时间
   */
  getFormattedTotal(type) {
    return formatHours(this.getCurrentTotal(type))
  }

  /**
   * 获取计时器状态
   */
  getState(type) {
    return {
      running: this.state[type].running,
      total: this.getFormattedTotal(type)
    }
  }

  /**
   * 重置计时器
   */
  resetTimer(type) {
    this.stopTimer(type)
    this.state[type].totalMinutes = 0
    this.saveState()
  }
}

export default new TimerService()

