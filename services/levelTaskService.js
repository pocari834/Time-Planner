// services/levelTaskService.js - 三级任务服务

import { saveData, loadData, STORAGE_KEYS } from '../utils/storage.js'
import { generateId } from '../utils/uuid.js'

class LevelTaskService {
  constructor() {
    this.level1Tasks = this.loadTasks()
  }

  /**
   * 加载任务
   */
  loadTasks() {
    return loadData(STORAGE_KEYS.LEVEL_TASKS, [])
  }

  /**
   * 保存任务
   */
  saveTasks() {
    saveData(STORAGE_KEYS.LEVEL_TASKS, this.level1Tasks)
  }

  /**
   * 添加一级任务
   */
  addLevel1(title) {
    const level1 = {
      id: generateId(),
      title,
      level2Tasks: [],
      createdAt: Date.now()
    }
    this.level1Tasks.push(level1)
    this.saveTasks()
    return level1
  }

  /**
   * 删除一级任务
   */
  deleteLevel1(id) {
    const index = this.level1Tasks.findIndex(l1 => l1.id === id)
    if (index > -1) {
      this.level1Tasks.splice(index, 1)
      this.saveTasks()
      return true
    }
    return false
  }

  /**
   * 更新一级任务
   */
  updateLevel1(id, updates) {
    const level1 = this.level1Tasks.find(l1 => l1.id === id)
    if (level1) {
      Object.assign(level1, updates)
      this.saveTasks()
      return level1
    }
    return null
  }

  /**
   * 添加二级任务
   */
  addLevel2(level1Id, title) {
    const level1 = this.level1Tasks.find(l1 => l1.id === level1Id)
    if (level1) {
      const level2 = {
        id: generateId(),
        title,
        level3Tasks: [],
        createdAt: Date.now()
      }
      level1.level2Tasks.push(level2)
      this.saveTasks()
      return level2
    }
    return null
  }

  /**
   * 删除二级任务
   */
  deleteLevel2(level1Id, level2Id) {
    const level1 = this.level1Tasks.find(l1 => l1.id === level1Id)
    if (level1) {
      const index = level1.level2Tasks.findIndex(l2 => l2.id === level2Id)
      if (index > -1) {
        level1.level2Tasks.splice(index, 1)
        this.saveTasks()
        return true
      }
    }
    return false
  }

  /**
   * 更新二级任务
   */
  updateLevel2(level1Id, level2Id, updates) {
    const level1 = this.level1Tasks.find(l1 => l1.id === level1Id)
    if (level1) {
      const level2 = level1.level2Tasks.find(l2 => l2.id === level2Id)
      if (level2) {
        Object.assign(level2, updates)
        this.saveTasks()
        return level2
      }
    }
    return null
  }

  /**
   * 添加三级任务（SOP步骤）
   */
  addLevel3(level1Id, level2Id, title) {
    const level1 = this.level1Tasks.find(l1 => l1.id === level1Id)
    if (level1) {
      const level2 = level1.level2Tasks.find(l2 => l2.id === level2Id)
      if (level2) {
        const level3 = {
          id: generateId(),
          title,
          completed: false,
          createdAt: Date.now()
        }
        level2.level3Tasks.push(level3)
        this.saveTasks()
        return level3
      }
    }
    return null
  }

  /**
   * 删除三级任务
   */
  deleteLevel3(level1Id, level2Id, level3Id) {
    const level1 = this.level1Tasks.find(l1 => l1.id === level1Id)
    if (level1) {
      const level2 = level1.level2Tasks.find(l2 => l2.id === level2Id)
      if (level2) {
        const index = level2.level3Tasks.findIndex(l3 => l3.id === level3Id)
        if (index > -1) {
          level2.level3Tasks.splice(index, 1)
          this.saveTasks()
          return true
        }
      }
    }
    return false
  }

  /**
   * 切换三级任务完成状态
   */
  toggleLevel3(level1Id, level2Id, level3Id) {
    const level1 = this.level1Tasks.find(l1 => l1.id === level1Id)
    if (level1) {
      const level2 = level1.level2Tasks.find(l2 => l2.id === level2Id)
      if (level2) {
        const level3 = level2.level3Tasks.find(l3 => l3.id === level3Id)
        if (level3) {
          level3.completed = !level3.completed
          this.saveTasks()
          return level3
        }
      }
    }
    return null
  }

  /**
   * 获取所有任务
   */
  getAllTasks() {
    return this.level1Tasks
  }
}

export default new LevelTaskService()

