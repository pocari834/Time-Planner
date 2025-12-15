// services/calendarService.js - 日历服务

import { saveData, loadData, STORAGE_KEYS } from '../utils/storage.js'
import { generateCalendar, formatDate } from '../utils/time.js'
import { generateId } from '../utils/uuid.js'

class CalendarService {
  constructor() {
    this.events = this.loadEvents()
    const now = new Date()
    this.currentYear = now.getFullYear()
    this.currentMonth = now.getMonth() + 1
  }

  /**
   * 加载事件
   */
  loadEvents() {
    return loadData(STORAGE_KEYS.CALENDAR_EVENTS, [])
  }

  /**
   * 保存事件
   */
  saveEvents() {
    saveData(STORAGE_KEYS.CALENDAR_EVENTS, this.events)
  }

  /**
   * 添加事件
   */
  addEvent(date, title, type = 'default') {
    const event = {
      id: generateId(),
      date: date.getTime(),
      title,
      type,
      createdAt: Date.now()
    }
    this.events.push(event)
    this.saveEvents()
    return event
  }

  /**
   * 删除事件
   */
  deleteEvent(id) {
    const index = this.events.findIndex(e => e.id === id)
    if (index > -1) {
      this.events.splice(index, 1)
      this.saveEvents()
      return true
    }
    return false
  }

  /**
   * 获取某一天的事件
   */
  getEventsByDate(date) {
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    return this.events.filter(event => {
      const eventDate = new Date(event.date)
      const eventDateStr = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}-${eventDate.getDate()}`
      return eventDateStr === dateStr
    })
  }

  /**
   * 获取日历数据
   */
  getCalendar(year, month) {
    return {
      calendar: generateCalendar(year, month),
      displayDate: formatDate(new Date(year, month - 1, 1)),
      events: this.events
    }
  }

  /**
   * 设置当前年月
   */
  setCurrentMonth(year, month) {
    this.currentYear = year
    this.currentMonth = month
  }

  /**
   * 获取当前年月
   */
  getCurrentMonth() {
    return {
      year: this.currentYear,
      month: this.currentMonth
    }
  }
}

export default new CalendarService()

