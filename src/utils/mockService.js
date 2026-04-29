const now = new Date()
const day = 24 * 60 * 60 * 1000

const formatDateTime = (date) => {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const users = [
  {
    userId: 3001,
    nickName: 'DevKnight',
    gender: 1,
    phone: '13800000000',
    email: 'devknight@example.com',
    wechat: 'devknight_oj',
    school: '示例大学',
    major: '软件工程',
    introduce: '热爱算法与工程实践',
    status: 1,
  },
  {
    userId: 3002,
    nickName: 'AlgoAlice',
    gender: 0,
    phone: '13900000000',
    email: 'alice@example.com',
    wechat: 'alice_code',
    school: '北方理工大学',
    major: '计算机科学',
    introduce: '动态规划专项训练中',
    status: 1,
  },
  {
    userId: 3003,
    nickName: 'BugHunter',
    gender: 2,
    phone: '13700000000',
    email: 'bug@example.com',
    wechat: 'bughunter',
    school: '南方科技学院',
    major: '信息安全',
    introduce: '喜欢边界测试',
    status: 0,
  },
]

const questions = [
  { questionId: 1001, title: '两数之和', difficulty: 1, createName: 'admin', createTime: formatDateTime(new Date(now.getTime() - 12 * day)) },
  { questionId: 1002, title: '最长无重复子串', difficulty: 2, createName: 'admin', createTime: formatDateTime(new Date(now.getTime() - 10 * day)) },
  { questionId: 1003, title: '合并 K 个升序链表', difficulty: 3, createName: 'teacher', createTime: formatDateTime(new Date(now.getTime() - 9 * day)) },
  { questionId: 1004, title: '岛屿数量', difficulty: 2, createName: 'teacher', createTime: formatDateTime(new Date(now.getTime() - 6 * day)) },
  { questionId: 1005, title: '有效括号', difficulty: 1, createName: 'admin', createTime: formatDateTime(new Date(now.getTime() - 4 * day)) },
]

const exams = [
  {
    examId: 2001,
    title: '春季算法挑战赛',
    startTime: formatDateTime(new Date(now.getTime() + day)),
    endTime: formatDateTime(new Date(now.getTime() + day + 3 * 60 * 60 * 1000)),
    status: 0,
    createName: 'admin',
    createTime: formatDateTime(new Date(now.getTime() - 3 * day)),
    examQuestionList: questions.slice(0, 3),
  },
  {
    examId: 2002,
    title: 'Java 后端工程师编程赛',
    startTime: formatDateTime(new Date(now.getTime() + 2 * day)),
    endTime: formatDateTime(new Date(now.getTime() + 2 * day + 4 * 60 * 60 * 1000)),
    status: 1,
    createName: 'teacher',
    createTime: formatDateTime(new Date(now.getTime() - 2 * day)),
    examQuestionList: questions.slice(1, 5),
  },
  {
    examId: 2003,
    title: '数据结构专项练习赛',
    startTime: formatDateTime(new Date(now.getTime() - 3 * day)),
    endTime: formatDateTime(new Date(now.getTime() - 3 * day + 4 * 60 * 60 * 1000)),
    status: 1,
    createName: 'admin',
    createTime: formatDateTime(new Date(now.getTime() - 8 * day)),
    examQuestionList: questions.slice(0, 4),
  },
]

const ok = (payload = {}) => Promise.resolve({
  data: {
    code: 1000,
    msg: 'mock success',
    ...payload,
  },
})

const pageRows = (rows, params = {}) => {
  const pageNum = Number(params.pageNum || 1)
  const pageSize = Number(params.pageSize || rows.length || 10)
  const start = (pageNum - 1) * pageSize
  return {
    rows: rows.slice(start, start + pageSize),
    total: rows.length,
  }
}

const questionDetail = (questionId) => {
  const base = questions.find((item) => String(item.questionId) === String(questionId)) || questions[0]
  return {
    ...base,
    timeLimit: 1000,
    spaceLimit: 262144,
    content: '<p>这是用于后台预览的题目描述，可在设计阶段替代后端详情数据。</p>',
    defaultCode: 'public class Main {\\n    public static void main(String[] args) {\\n        System.out.println(\"Hello OJ\");\\n    }\\n}',
  }
}

export function mockRequest(config) {
  const { url, method = 'get', params = {}, data = {} } = config

  if (url === '/sys/user/login') return ok({ data: 'mock-admin-token' })
  if (url === '/sys/user/info') return ok({ data: { nickName: '管理员' } })
  if (url === '/sys/user/logout') return ok()

  if (url === '/sys/cuser/list') {
    const rows = users.filter((item) => {
      const matchId = !params.userId || String(item.userId).includes(String(params.userId))
      const matchName = !params.nickName || item.nickName.includes(params.nickName)
      return matchId && matchName
    })
    return ok(pageRows(rows, params))
  }
  if (url === '/sys/cuser/status/update') return ok({ data })

  if (url === '/sys/question/list') {
    const rows = questions.filter((item) => {
      const matchTitle = !params.title || item.title.includes(params.title)
      const matchDifficulty = !params.difficulty || String(item.difficulty) === String(params.difficulty)
      return matchTitle && matchDifficulty
    })
    return ok(pageRows(rows, params))
  }
  if (url === '/sys/question/detail') return ok({ data: questionDetail(params.questionId) })
  if (url === '/sys/question/add') return ok({ data: { questionId: 1099 } })
  if (url === '/sys/question/edit') return ok({ data })
  if (url === '/sys/question/delete') return ok()

  if (url === '/sys/exam/list') {
    const rows = exams.filter((item) => !params.title || item.title.includes(params.title))
    return ok(pageRows(rows, params))
  }
  if (url === '/sys/exam/detail') {
    const exam = exams.find((item) => String(item.examId) === String(params.examId)) || exams[0]
    return ok({ data: exam })
  }
  if (url === '/sys/exam/add') return ok({ data: { examId: 2099 } })
  if (url === '/sys/exam/edit') return ok({ data })
  if (url === '/sys/exam/delete') return ok()
  if (url === '/sys/exam/publish') return ok()
  if (url === '/sys/exam/publish/cancel') return ok()
  if (url === '/sys/exam/question/add') return ok()
  if (url === '/sys/exam/question/delete') return ok()

  return ok()
}
