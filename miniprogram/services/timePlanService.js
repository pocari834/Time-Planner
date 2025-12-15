// services/timePlanService.js - 时间规划服务

import { saveData, loadData, STORAGE_KEYS } from '../utils/storage.js'
import { generateId } from '../utils/uuid.js'
import { formatTimeRange } from '../utils/time.js'

class TimePlanService {
  constructor() {
    this.plans = this.loadPlans()
  }

  /**
   * 加载时间规划
   */
  loadPlans() {
    return loadData(STORAGE_KEYS.TIME_PLANS, [])
  }

  /**
   * 保存时间规划
   */
  savePlans() {
    saveData(STORAGE_KEYS.TIME_PLANS, this.plans)
  }

  /**
   * 添加时间规划
   */
  addPlan(type, title, startTime, endTime) {
    const plan = {
      id: generateId(),
      type, // 'work' | 'study'
      title,
      startTime,
      endTime,
      createdAt: Date.now()
    }
    this.plans.push(plan)
    this.savePlans()
    return plan
  }

  /**
   * 删除时间规划
   */
  deletePlan(id) {
    const index = this.plans.findIndex(p => p.id === id)
    if (index > -1) {
      this.plans.splice(index, 1)
      this.savePlans()
      return true
    }
    return false
  }

  /**
   * 获取今日的时间规划
   */
  getTodayPlans() {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    
    return this.plans
      .filter(plan => {
        const planDate = new Date(plan.createdAt)
        const planDateStr = `${planDate.getFullYear()}-${planDate.getMonth() + 1}-${planDate.getDate()}`
        return planDateStr === todayStr
      })
      .map(plan => ({
        ...plan,
        display: formatTimeRange(plan.startTime, plan.endTime)
      }))
  }

  /**
   * 获取所有规划
   */
  getAllPlans() {
    return this.plans.map(plan => ({
      ...plan,
      display: formatTimeRange(plan.startTime, plan.endTime)
    }))
  }
}

export default new TimePlanService()

