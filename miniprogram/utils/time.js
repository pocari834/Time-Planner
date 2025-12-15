// utils/time.js - 时间处理工具函数

/**
 * 格式化时间（小时:分钟）
 */
export function formatTime(hours, minutes) {
  const h = String(Math.floor(hours)).padStart(2, '0')
  const m = String(Math.floor(minutes % 60)).padStart(2, '0')
  return `${h}:${m}`
}

/**
 * 格式化小时数（保留一位小数）
 */
export function formatHours(totalMinutes) {
  return (totalMinutes / 60).toFixed(1)
}

/**
 * 格式化时间为秒/分钟/小时（智能显示）
 */
export function formatTimeSmart(totalMinutes) {
  const totalSeconds = Math.floor(totalMinutes * 60)
  
  if (totalSeconds < 60) {
    // 小于1分钟，显示秒
    return `${totalSeconds}秒`
  } else if (totalMinutes < 60) {
    // 小于1小时，显示分钟
    const minutes = Math.floor(totalMinutes)
    const seconds = totalSeconds % 60
    if (seconds === 0) {
      return `${minutes}分钟`
    } else {
      return `${minutes}分${seconds}秒`
    }
  } else {
    // 大于等于1小时，显示小时和分钟
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.floor(totalMinutes % 60)
    if (minutes === 0) {
      return `${hours}小时`
    } else {
      return `${hours}小时${minutes}分钟`
    }
  }
}

/**
 * 格式化时间段显示
 */
export function formatTimeRange(startTime, endTime) {
  const start = formatTime(Math.floor(startTime / 60), startTime % 60)
  const end = formatTime(Math.floor(endTime / 60), endTime % 60)
  const duration = formatHours(endTime - startTime)
  return `${start} - ${end} (${duration}h)`
}

/**
 * 获取当前时间戳（分钟）
 */
export function getCurrentTimeInMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/**
 * 计算时间差（分钟）
 */
export function calculateDuration(startMinutes, endMinutes) {
  return endMinutes - startMinutes
}

/**
 * 格式化日期
 */
export function formatDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `${year}年${month}月`
}

/**
 * 获取月份的第一天是星期几（0=周日）
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay()
}

/**
 * 获取月份的天数
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/**
 * 生成日历数组
 */
export function generateCalendar(year, month) {
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInMonth = getDaysInMonth(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)
  
  const calendar = []
  
  // 上个月的日期
  for (let i = firstDay - 1; i >= 0; i--) {
    calendar.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 2, daysInPrevMonth - i)
    })
  }
  
  // 当前月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    calendar.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month - 1, i)
    })
  }
  
  // 下个月的日期（补齐到42个，6行7列）
  const remaining = 42 - calendar.length
  for (let i = 1; i <= remaining; i++) {
    calendar.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month, i)
    })
  }
  
  return calendar
}

