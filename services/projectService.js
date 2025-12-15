// services/projectService.js - 项目服务

import { saveData, loadData, STORAGE_KEYS } from '../utils/storage.js'
import { generateId } from '../utils/uuid.js'

class ProjectService {
  constructor() {
    this.projects = this.loadProjects()
  }

  /**
   * 加载项目
   */
  loadProjects() {
    return loadData(STORAGE_KEYS.TODAY_PROJECTS, [])
  }

  /**
   * 保存项目
   */
  saveProjects() {
    saveData(STORAGE_KEYS.TODAY_PROJECTS, this.projects)
  }

  /**
   * 添加项目
   */
  addProject(title) {
    const project = {
      id: generateId(),
      title,
      status: '进行中', // '进行中' | '已完成' | '已暂停'
      tasks: [],
      createdAt: Date.now()
    }
    this.projects.push(project)
    this.saveProjects()
    return project
  }

  /**
   * 删除项目
   */
  deleteProject(id) {
    const index = this.projects.findIndex(p => p.id === id)
    if (index > -1) {
      this.projects.splice(index, 1)
      this.saveProjects()
      return true
    }
    return false
  }

  /**
   * 更新项目
   */
  updateProject(id, updates) {
    const project = this.projects.find(p => p.id === id)
    if (project) {
      Object.assign(project, updates)
      this.saveProjects()
      return project
    }
    return null
  }

  /**
   * 添加任务到项目
   */
  addTaskToProject(projectId, taskTitle, priority = 'danger') {
    const project = this.projects.find(p => p.id === projectId)
    if (project) {
      const task = {
        id: generateId(),
        title: taskTitle,
        completed: false,
        priority, // 'success' | 'warning' | 'danger'
        createdAt: Date.now()
      }
      project.tasks.push(task)
      this.saveProjects()
      return task
    }
    return null
  }

  /**
   * 切换任务完成状态
   */
  toggleTask(projectId, taskId) {
    const project = this.projects.find(p => p.id === projectId)
    if (project) {
      const task = project.tasks.find(t => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        this.saveProjects()
        return task
      }
    }
    return null
  }

  /**
   * 删除任务
   */
  deleteTask(projectId, taskId) {
    const project = this.projects.find(p => p.id === projectId)
    if (project) {
      const index = project.tasks.findIndex(t => t.id === taskId)
      if (index > -1) {
        project.tasks.splice(index, 1)
        this.saveProjects()
        return true
      }
    }
    return false
  }

  /**
   * 获取所有项目
   */
  getAllProjects() {
    return this.projects
  }
}

export default new ProjectService()

