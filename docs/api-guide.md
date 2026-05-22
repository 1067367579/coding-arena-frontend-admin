# CodeFlow OJ Admin - API 通信与网关对接指南

为了实现前后端逻辑的解耦及微服务网关的安全代理，项目通过高度集成的网络控制器和分模块接口文件对外提供服务。本文档针对网络层的底层流向及全量接口签名进行详细说明。

---

## 🌐 Vite 反向代理网关配置 (Vite Proxy)

在本地开发阶段，为规避跨域请求限制，前端使用了 Vite 提供的开发代理服务。该规则配置于根目录下的 [vite.config.js](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/vite.config.js)：

* **代理路径规则**：
  ```javascript
  server: {
    proxy: {
      "/dev-api": {
        target: "http://127.0.0.1:19090/system",
        rewrite: (p) => p.replace(/^\/dev-api/,""),
      }
    }
  }
  ```
  - **触发条件**：所有以 `/dev-api` 开头的 Axios 请求都会被代理拦截。
  - **转发目标**：会被转换为对后端微服务网关 `http://127.0.0.1:19090/system` 对应地址的访问。
  - **路径重写 (`rewrite`)**：将 `/dev-api` 去掉。如请求 `/dev-api/admin/login`，在后端接收时为 `/system/admin/login`。

---

## 🔒 网络拦截器核心逻辑 (Request/Response Interceptors)

网络请求在 [request.js](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/utils/request.js) 中统一创建了默认超时的 Axios 实例。

### 1. 请求拦截器 (Request Interceptor)
在发送任何 API 请求前，拦截器会自动从 Cookie 中获取认证 Token 并追加到 HTTP 报文的 Header 中：
```javascript
service.interceptors.request.use(
  (config) => { 
    if(getToken()) {
      config.headers["authentication"] = "Bearer " + getToken();
    }
    return config;
  },
  (error) => Promise.reject(error)
)
```

### 2. 响应拦截器 (Response Interceptor)
对后端传回的报文进行前置解包与鉴权校验：
```javascript
service.interceptors.response.use(
  (res) => { 
    const code = res.data.code;
    const msg = res.data.msg;
    
    if(code === 1000) {
      return Promise.resolve(res.data); // 成功，直接返回后端 data 载荷
    } 
    
    if(code === 3001) {
      // 令牌过期或异常
      removeToken(); // 清空前端 Cookie 令牌
      router.push("/oj/login"); // 强制跳转回登录页进行二次认证
    }
    return Promise.reject(new Error(msg)); // 业务错误，抛出具体后端提示语
  },
  (error) => Promise.reject(error)
)
```

---

## 📂 API 服务模块参考手册 (API Reference)

所有的具体请求均按业务模型划分在 [src/apis](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/apis) 中。以下是全量接口函数的功能描述及参数签名：

### 1. 管理员账户层接口 [admin.js](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/apis/admin.js)
负责管理后台操作人员的会话生命周期与安全修改。

* **`loginService(data)`** (POST)
  - **功能**：管理员登录。
  - **参数**：`data: { userName, passWord }` (JSON 格式)
  - **返回值**：若成功，返回数据包中包含用户的 Token。
* **`logoutService()`** (GET)
  - **功能**：管理员登出。
* **`updatePasswordService(data)`** (POST)
  - **功能**：修改密码。
  - **参数**：`data: { oldPassword, newPassword }`

---

### 2. 评测用户管理接口 [cuser.js](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/apis/cuser.js)
负责管理在 OJ 上提交评测的刷题用户（学生/竞赛选手）。

* **`getUserListService(params)`** (GET)
  - **功能**：查询刷题用户列表（带分页与名称过滤）。
  - **参数**：`params: { pageNum, pageSize, query }`

---

### 3. 竞赛配置接口 [exam.js](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/apis/exam.js)
负责维护比赛周期的状态、属性及比赛内题目的关联关系。

* **`getExamListService(params)`** (GET)
  - **功能**：获取竞赛列表（带分页与模糊查询）。
  - **参数**：`params: { pageNum, pageSize, query }`
* **`addExamService(data)`** (POST)
  - **功能**：创建竞赛。
  - **参数**：`data: { title, examDate: [startTime, endTime] }`
* **`getExamDetailService(examId)`** (GET)
  - **功能**：查询竞赛的详细基本配置。
* **`editExamService(data)`** (POST)
  - **功能**：保存对竞赛名称与周期的修改。
* **`deleteExamService(examId)`** (POST)
  - **功能**：删除该竞赛。
* **`getExamQuestionListService(examId)`** (GET)
  - **功能**：查询已经关联到该竞赛的所有算法题目。
* **`addExamQuestionService(data)`** (POST)
  - **功能**：为竞赛追加绑定一道已有的题库题目。
  - **参数**：`data: { examId, questionId }`
* **`deleteExamQuestionService(examId, questionId)`** (POST)
  - **功能**：在竞赛题目列表中移除某道题目的绑定。

---

### 4. 题库维护接口 [question.js](file:///Users/lujingxiang/VueProjects/Vue3/oj-b/src/apis/question.js)
负责 OJ 题目的添加、属性配置、代码模版以及判题用例文件的存取。

* **`getQuestionListService(params)`** (GET)
  - **功能**：获取公共题库列表。
* **`getQuestionDetailService(questionId)`** (GET)
  - **功能**：获取某道算法题目的全量属性值（用于编辑时回显数据）。
* **`addQuestionService(formData)`** (POST)
  - **功能**：发布题目。
  - **参数**：`formData`。**特别注意：由于包含测试用例二进制文件上传，此接口入参必须为 `FormData` 对象**，具体包含以下字段：
    - `title` (string)
    - `difficulty` (number)
    - `content` (富文本 HTML)
    - `timeLimit` (number, 毫秒)
    - `spaceLimit` (number, 字节)
    - `defaultCode` (string, Java默认模板)
    - `mainFunc` (string, Java测试驱动代码)
    - `questionCase` (原生的 `File` 对象，拖拽上传的测试用例包)
* **`editQuestionService(formData)`** (POST)
  - **功能**：编辑题目。
  - **参数**：`formData` (入参数据格式与添加题目一致，且必须携带 `questionId` 字段以匹配目标题目)。
* **`deleteQuestionService(questionId)`** (POST)
  - **功能**：在公共题库中彻底删除该题目。
