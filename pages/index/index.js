// pages/index/index.js
import timerService from '../../services/timerService.js'
import timePlanService from '../../services/timePlanService.js'
import projectService from '../../services/projectService.js'
import levelTaskService from '../../services/levelTaskService.js'
import calendarService from '../../services/calendarService.js'
import { getCurrentTimeInMinutes } from '../../utils/time.js'

Page({
  data: {
    // 计时器相关
    workTimeTotal: '0.0',
    studyTimeTotal: '0.0',
    workTimerRunning: false,
    studyTimerRunning: false,
    
    // 时间规划
    timePlans: [],
    
    // 项目
    projects: [],
    
    // 三级任务
    level1Tasks: [],
    
    // 日历
    calendarDays: [],
    calendarDisplayDate: '',
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    
    // 弹窗状态
    showTimePlanModal: false,
    showProjectModal: false,
    showTaskModal: false,
    showLevel1Modal: false,
    showLevel2Modal: false,
    showLevel3Modal: false,
    
    // 表单数据
    timePlanTypeIndex: 0,
    timePlanTypes: ['工作', '学习'],
    timePlanTitle: '',
    timePlanStartTime: '',
    timePlanEndTime: '',
    projectTitle: '',
    taskTitle: '',
    currentProjectId: '',
    level1Title: '',
    level2Title: '',
    level3Title: '',
    currentLevel1Id: '',
    currentLevel2Id: ''
  },

  onLoad() {
    this.loadData()
    this.initCalendar()
    this.startTimerUpdate()
  },

  onUnload() {
    this.stopTimerUpdate()
  },

  /**
   * 加载所有数据
   */
  loadData() {
    // 加载时间规划
    this.setData({
      timePlans: timePlanService.getTodayPlans()
    })
    
    // 加载项目
    this.setData({
      projects: projectService.getAllProjects()
    })
    
    // 加载三级任务
    this.setData({
      level1Tasks: levelTaskService.getAllTasks()
    })
    
    // 更新计时器显示
    this.updateTimerDisplay()
  },

  /**
   * 初始化日历
   */
  initCalendar() {
    const { year, month } = calendarService.getCurrentMonth()
    this.updateCalendar(year, month)
  },

  /**
   * 更新日历
   */
  updateCalendar(year, month) {
    const calendarData = calendarService.getCalendar(year, month)
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    
    const calendarDays = calendarData.calendar.map(day => {
      const dayStr = `${day.date.getFullYear()}-${day.date.getMonth() + 1}-${day.date.getDate()}`
      return {
        ...day,
        isToday: dayStr === todayStr
      }
    })
    
    this.setData({
      calendarDays,
      calendarDisplayDate: calendarData.displayDate,
      currentYear: year,
      currentMonth: month
    })
  },

  /**
   * 开始计时器更新
   */
  startTimerUpdate() {
    timerService.onUpdate = (type, total) => {
      if (type === 'work') {
        this.setData({
          workTimeTotal: total
        })
      } else if (type === 'study') {
        this.setData({
          studyTimeTotal: total
        })
      }
    }
    
    this.timerInterval = setInterval(() => {
      this.updateTimerDisplay()
    }, 1000)
  },

  /**
   * 停止计时器更新
   */
  stopTimerUpdate() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
  },

  /**
   * 更新计时器显示
   */
  updateTimerDisplay() {
    const workState = timerService.getState('work')
    const studyState = timerService.getState('study')
    
    this.setData({
      workTimeTotal: workState.total,
      workTimerRunning: workState.running,
      studyTimeTotal: studyState.total,
      studyTimerRunning: studyState.running
    })
  },

  // ========== 计时器相关 ==========
  startWorkTimer() {
    if (timerService.startTimer('work')) {
      wx.showToast({
        title: '开始工作计时',
        icon: 'success'
      })
    }
  },

  stopWorkTimer() {
    const duration = timerService.stopTimer('work')
    if (duration) {
      wx.showToast({
        title: `工作 ${(duration / 60).toFixed(1)} 小时`,
        icon: 'success'
      })
    }
  },

  startStudyTimer() {
    if (timerService.startTimer('study')) {
      wx.showToast({
        title: '开始学习计时',
        icon: 'success'
      })
    }
  },

  stopStudyTimer() {
    const duration = timerService.stopTimer('study')
    if (duration) {
      wx.showToast({
        title: `学习 ${(duration / 60).toFixed(1)} 小时`,
        icon: 'success'
      })
    }
  },

  // ========== 时间规划相关 ==========
  showAddTimePlanModal() {
    this.setData({
      showTimePlanModal: true,
      timePlanTitle: '',
      timePlanStartTime: '',
      timePlanEndTime: '',
      timePlanTypeIndex: 0
    })
  },

  hideAddTimePlanModal() {
    this.setData({ showTimePlanModal: false })
  },

  onTimePlanTypeChange(e) {
    this.setData({
      timePlanTypeIndex: parseInt(e.detail.value)
    })
  },

  onTimePlanTitleInput(e) {
    this.setData({ timePlanTitle: e.detail.value })
  },

  onTimePlanStartTimeChange(e) {
    this.setData({ timePlanStartTime: e.detail.value })
  },

  onTimePlanEndTimeChange(e) {
    this.setData({ timePlanEndTime: e.detail.value })
  },

  confirmAddTimePlan() {
    const { timePlanTitle, timePlanStartTime, timePlanEndTime, timePlanTypeIndex } = this.data
    
    if (!timePlanTitle || !timePlanStartTime || !timePlanEndTime) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    const [startHour, startMin] = timePlanStartTime.split(':').map(Number)
    const [endHour, endMin] = timePlanEndTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    if (endMinutes <= startMinutes) {
      wx.showToast({
        title: '结束时间必须大于开始时间',
        icon: 'none'
      })
      return
    }

    const type = timePlanTypeIndex === 0 ? 'work' : 'study'
    timePlanService.addPlan(type, timePlanTitle, startMinutes, endMinutes)
    
    this.setData({
      timePlans: timePlanService.getTodayPlans(),
      showTimePlanModal: false
    })
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  // ========== 项目相关 ==========
  showAddProjectModal() {
    this.setData({
      showProjectModal: true,
      projectTitle: ''
    })
  },

  hideAddProjectModal() {
    this.setData({ showProjectModal: false })
  },

  onProjectTitleInput(e) {
    this.setData({ projectTitle: e.detail.value })
  },

  confirmAddProject() {
    const { projectTitle } = this.data
    if (!projectTitle.trim()) {
      wx.showToast({
        title: '请输入项目名称',
        icon: 'none'
      })
      return
    }

    projectService.addProject(projectTitle)
    this.setData({
      projects: projectService.getAllProjects(),
      showProjectModal: false
    })
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  deleteProject(e) {
    const projectId = e.currentTarget.dataset.projectId
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个项目吗？',
      success: (res) => {
        if (res.confirm) {
          projectService.deleteProject(projectId)
          this.setData({
            projects: projectService.getAllProjects()
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // ========== 任务相关 ==========
  showAddTaskModal(e) {
    const projectId = e.currentTarget.dataset.projectId
    this.setData({
      showTaskModal: true,
      taskTitle: '',
      currentProjectId: projectId
    })
  },

  hideAddTaskModal() {
    this.setData({ showTaskModal: false })
  },

  onTaskTitleInput(e) {
    this.setData({ taskTitle: e.detail.value })
  },

  confirmAddTask() {
    const { taskTitle, currentProjectId } = this.data
    if (!taskTitle.trim()) {
      wx.showToast({
        title: '请输入任务名称',
        icon: 'none'
      })
      return
    }

    projectService.addTaskToProject(currentProjectId, taskTitle)
    this.setData({
      projects: projectService.getAllProjects(),
      showTaskModal: false
    })
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  toggleTask(e) {
    const { projectId, taskId } = e.currentTarget.dataset
    projectService.toggleTask(projectId, taskId)
    this.setData({
      projects: projectService.getAllProjects()
    })
  },

  // ========== 三级任务相关 ==========
  showAddLevel1Modal() {
    this.setData({
      showLevel1Modal: true,
      level1Title: ''
    })
  },

  hideAddLevel1Modal() {
    this.setData({ showLevel1Modal: false })
  },

  onLevel1TitleInput(e) {
    this.setData({ level1Title: e.detail.value })
  },

  confirmAddLevel1() {
    const { level1Title } = this.data
    if (!level1Title.trim()) {
      wx.showToast({
        title: '请输入名称',
        icon: 'none'
      })
      return
    }

    levelTaskService.addLevel1(level1Title)
    this.setData({
      level1Tasks: levelTaskService.getAllTasks(),
      showLevel1Modal: false
    })
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  deleteLevel1(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个一级任务吗？',
      success: (res) => {
        if (res.confirm) {
          levelTaskService.deleteLevel1(id)
          this.setData({
            level1Tasks: levelTaskService.getAllTasks()
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  editLevel1(e) {
    const id = e.currentTarget.dataset.id
    const level1 = levelTaskService.getAllTasks().find(l1 => l1.id === id)
    if (level1) {
      this.setData({
        showLevel1Modal: true,
        level1Title: level1.title,
        editingLevel1Id: id
      })
    }
  },

  showAddLevel2Modal(e) {
    const level1Id = e.currentTarget.dataset.level1Id
    this.setData({
      showLevel2Modal: true,
      level2Title: '',
      currentLevel1Id: level1Id
    })
  },

  hideAddLevel2Modal() {
    this.setData({ showLevel2Modal: false })
  },

  onLevel2TitleInput(e) {
    this.setData({ level2Title: e.detail.value })
  },

  confirmAddLevel2() {
    const { level2Title, currentLevel1Id } = this.data
    if (!level2Title.trim()) {
      wx.showToast({
        title: '请输入名称',
        icon: 'none'
      })
      return
    }

    levelTaskService.addLevel2(currentLevel1Id, level2Title)
    this.setData({
      level1Tasks: levelTaskService.getAllTasks(),
      showLevel2Modal: false
    })
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  deleteLevel2(e) {
    const { level1Id, level2Id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个二级任务吗？',
      success: (res) => {
        if (res.confirm) {
          levelTaskService.deleteLevel2(level1Id, level2Id)
          this.setData({
            level1Tasks: levelTaskService.getAllTasks()
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  editLevel2(e) {
    const { level1Id, level2Id } = e.currentTarget.dataset
    const level1 = levelTaskService.getAllTasks().find(l1 => l1.id === level1Id)
    if (level1) {
      const level2 = level1.level2Tasks.find(l2 => l2.id === level2Id)
      if (level2) {
        this.setData({
          showLevel2Modal: true,
          level2Title: level2.title,
          currentLevel1Id: level1Id,
          editingLevel2Id: level2Id
        })
      }
    }
  },

  showAddLevel3Modal(e) {
    const { level1Id, level2Id } = e.currentTarget.dataset
    this.setData({
      showLevel3Modal: true,
      level3Title: '',
      currentLevel1Id: level1Id,
      currentLevel2Id: level2Id
    })
  },

  hideAddLevel3Modal() {
    this.setData({ showLevel3Modal: false })
  },

  onLevel3TitleInput(e) {
    this.setData({ level3Title: e.detail.value })
  },

  confirmAddLevel3() {
    const { level3Title, currentLevel1Id, currentLevel2Id } = this.data
    if (!level3Title.trim()) {
      wx.showToast({
        title: '请输入步骤名称',
        icon: 'none'
      })
      return
    }

    levelTaskService.addLevel3(currentLevel1Id, currentLevel2Id, level3Title)
    this.setData({
      level1Tasks: levelTaskService.getAllTasks(),
      showLevel3Modal: false
    })
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  deleteLevel3(e) {
    const { level1Id, level2Id, level3Id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个步骤吗？',
      success: (res) => {
        if (res.confirm) {
          levelTaskService.deleteLevel3(level1Id, level2Id, level3Id)
          this.setData({
            level1Tasks: levelTaskService.getAllTasks()
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  toggleLevel3(e) {
    const { level1Id, level2Id, level3Id } = e.currentTarget.dataset
    levelTaskService.toggleLevel3(level1Id, level2Id, level3Id)
    this.setData({
      level1Tasks: levelTaskService.getAllTasks()
    })
  },

  editLevel3(e) {
    const { level1Id, level2Id, level3Id } = e.currentTarget.dataset
    const level1 = levelTaskService.getAllTasks().find(l1 => l1.id === level1Id)
    if (level1) {
      const level2 = level1.level2Tasks.find(l2 => l2.id === level2Id)
      if (level2) {
        const level3 = level2.level3Tasks.find(l3 => l3.id === level3Id)
        if (level3) {
          this.setData({
            showLevel3Modal: true,
            level3Title: level3.title,
            currentLevel1Id: level1Id,
            currentLevel2Id: level2Id,
            editingLevel3Id: level3Id
          })
        }
      }
    }
  },

  addToToday(e) {
    const title = e.currentTarget.dataset.level3Title
    projectService.addProject(title)
    this.setData({
      projects: projectService.getAllProjects()
    })
    wx.showToast({
      title: '已添加到今日任务',
      icon: 'success'
    })
  },

  // ========== 日历相关 ==========
  prevMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth--
    if (currentMonth < 1) {
      currentMonth = 12
      currentYear--
    }
    calendarService.setCurrentMonth(currentYear, currentMonth)
    this.updateCalendar(currentYear, currentMonth)
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
    calendarService.setCurrentMonth(currentYear, currentMonth)
    this.updateCalendar(currentYear, currentMonth)
  },

  selectDate(e) {
    const date = e.currentTarget.dataset.date
    // 可以在这里添加选择日期的逻辑
    console.log('选择日期:', date)
  }
})

