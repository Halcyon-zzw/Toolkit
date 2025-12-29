# 说客英语平台 API 文档

基础域名：`https://www.talk915.com`

---

## 1. 用户登录

### 接口信息
- **URL**: `/users/user/login`
- **请求方式**: POST
- **Content-Type**: application/json

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| loginId | String | 是 | 登录账号 |
| password | String | 是 | 登录密码 |
| isApp | Number | 是 | 应用类型，固定值：2 |
| loginMode | Number | 是 | 登录模式，固定值：1 |

### 响应格式
| 字段名 | 类型 | 说明 |
|--------|------|------|
| resultData | Object | 结果数据对象 |
| resultData.token | String | 认证令牌，用于后续请求 |

---

## 2. 查询教师选择列表

### 接口信息
- **URL**: `/users/teacherProxy/queryScheduledClassesSelectList`
- **请求方式**: POST
- **Content-Type**: application/json
- **请求头**: 需要携带 `token`

### 请求头参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | String | 是 | 登录接口返回的认证令牌 |

### 请求参数
无需传递请求体参数

### 响应格式
| 字段名 | 类型 | 说明 |
|--------|------|------|
| resultData | Array | 教师列表数组 |
| resultData[].teaId | String | 教师ID |
| resultData[].teaName | String | 教师姓名 |

---

## 3. 查询排课课程列表

### 接口信息
- **URL**: `/users/teacherProxy/queryScheduledClassesList`
- **请求方式**: POST
- **Content-Type**: application/json
- **请求头**: 需要携带 `token`

### 请求头参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | String | 是 | 登录接口返回的认证令牌 |

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| currPage | Number | 是 | 当前页码 |
| pageSize | Number | 是 | 每页大小 |
| lessonStartTime | String | 是 | 课程开始日期，格式：YYYY-MM-DD |
| lessonEndTime | String | 是 | 课程结束日期，格式：YYYY-MM-DD |
| startTime | String | 是 | 开始时间，格式：HH:mm |
| endTime | String | 是 | 结束时间，格式：HH:mm |
| sign | String | 是 | 标识，固定值：'1' |
| subscribeType | Number | 是 | 预约类型，固定值：0 |
| type | Number | 是 | 类型，固定值：0 |
| teaId | String | 是 | 教师ID |
| teaStatus | Number | 是 | 教师状态，固定值：0 |
| commentStatus | Number | 是 | 评论状态，固定值：0 |
| studentMsg | String | 是 | 学生信息，可为空字符串 |
| classStatus | Number | 是 | 课程状态，固定值：1 |
| exportStatus | Number | 是 | 导出状态，固定值：0 |

### 响应格式
| 字段名 | 类型 | 说明 |
|--------|------|------|
| resultData | Object | 结果数据对象 |
| resultData.scheduledCoursesRespDTO | Array | 课程列表数组 |
| resultData.scheduledCoursesRespDTO[].dateTime | String | 课程时间 |
| resultData.scheduledCoursesRespDTO[].classId | String | 课程ID |

---

## 常用账号信息

### 管理账号
- **账号1**: ta-peng / tapeng123456
- **账号2**: ta-fonpeng / fonpeng123456

**使用说明**: 在查询教师信息时，如果第一个账号无法获取到教师ID，会自动尝试使用第二个账号登录重试。
