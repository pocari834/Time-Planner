// utils/storage.js - 本地存储工具函数

const STORAGE_KEYS = {
  TIME_PLANS: 'time_plans',
  TODAY_PROJECTS: 'today_projects',
  LEVEL_TASKS: 'level_tasks',
  CALENDAR_EVENTS: 'calendar_events',
  TIMER_STATE: 'timer_state'
}

/**
 * 保存数据到本地存储
 */
export function saveData(key, data) {
  try {
    wx.setStorageSync(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('保存数据失败:', e)
    return false
  }
}

/**
 * 从本地存储读取数据
 */
export function loadData(key, defaultValue = null) {
  try {
    const data = wx.getStorageSync(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (e) {
    console.error('读取数据失败:', e)
    return defaultValue
  }
}

/**
 * 删除本地存储数据
 */
export function removeData(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除数据失败:', e)
    return false
  }
}

export { STORAGE_KEYS }

