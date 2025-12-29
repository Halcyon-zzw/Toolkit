# 教学记录管理平台 API 文档

基础域名：`https://trmk.teachingrecord.com`

---

## 1. 登录获取 Token

### 接口信息
- **URL**: `/api/login`
- **请求方式**: POST
- **Content-Type**: application/json

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码（MD5加密后） |

### 账号信息
- **用户名**: Seven
- **原始密码**: 9&&iZffZEi
- **MD5密码**: bb033dc62f44af605a3bebd824a8ae89

### 响应格式
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Number | 状态码，200 表示成功 |
| message | String | 响应消息 |
| data | Object | 数据对象 |
| data.access_token | String | 访问令牌 |
| data.token_type | String | 令牌类型，通常为 "bearer" |
| data.expires_in | Number | 过期时间（毫秒） |

---

## 2. 搜索用户（按姓名）

### 接口信息
- **URL**: `/api/search/user`
- **请求方式**: GET
- **请求头**: 需要携带 `authorization`

### 请求头参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| authorization | String | 是 | Bearer {access_token} |

### 查询参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | String | 是 | 教师姓名（支持模糊匹配） |

### 响应格式
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Number | 状态码，200 表示成功 |
| message | String | 响应消息 |
| data | Object | 数据对象 |
| data.list | Array | 用户列表 |
| data.list[].id | Number | 用户记录ID |
| data.list[].name | String | 用户姓名 |
| data.list[].user_id | String | 用户唯一标识 |
| data.list[].app_id | String | 应用ID |
| data.list[].roles | Array | 角色列表 |
| data.list[].roles[].teacher_id | String | 教师ID |
| data.list[].roles[].name | String | 教师姓名 |
| data.list[].roles[].cached_project | Object | 缓存的项目信息 |
| data.list[].roles[].cached_project.meta | Object | 元数据 |
| data.list[].roles[].cached_project.meta.host | String | 平台域名 |
| data.list[].roles[].cached_project.meta.username | String | 平台账号 |
| data.list[].roles[].cached_project.meta.password | String | 平台密码 |
| data.total | Number | 总数 |
| meta | Object | 分页信息 |
| meta.page | Number | 当前页码 |
| meta.pageSize | Number | 每页大小 |
| meta.total | Number | 总记录数 |

---

## 3. 搜索用户（按 user_id）

### 接口信息
- **URL**: `/api/search/user`
- **请求方式**: GET
- **请求头**: 需要携带 `authorization`

### 请求头参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| authorization | String | 是 | Bearer {access_token} |

### 查询参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user_id | String | 是 | 用户唯一标识 |

### 响应格式
与接口2相同

---

## 4. 获取差评列表

### 接口信息
- **URL**: `/api/evaluation/list`
- **请求方式**: GET
- **请求头**: 需要携带 `authorization`

### 请求头参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| authorization | String | 是 | Bearer {access_token} |

### 查询参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user_id | String | 是 | 用户ID |
| follow_status | Number | 否 | 跟进状态：1-未跟进，2-跟进中，3-跟进完成 |
| page | Number | 否 | 页码，默认 1 |
| pageSize | Number | 否 | 每页大小，默认 10 |
| group_id | String | 否 | 分组ID |
| class_id | String | 否 | 课程ID |

### 响应格式
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Number | 状态码，200 表示成功 |
| message | String | 响应消息 |
| data | Object | 数据对象 |
| data.list | Array | 评价列表 |
| data.list[].id | Number | 评价记录ID |
| data.list[].user_id | String | 用户ID |
| data.list[].teacher_name | String | 教师姓名 |
| data.list[].class_id | String | 课程ID |
| data.list[].content | String | 评价内容 |
| data.list[].stars | Number | 评分星级 |
| data.list[].follow_status | Number | 跟进状态 |
| data.list[].class_start_time | String | 课程开始时间 |
| data.list[].class_end_time | String | 课程结束时间 |
| data.list[].extra | Object | 额外信息 |
| data.list[].extra.SummaryQuestions | String | 问题总结 |
| data.list[].extra.is_true | String | 是否真实 |
| data.list[].extra.appeal | Boolean | 是否申诉 |
| data.list[].extra.appeal_result | String | 申诉结果 |
| data.list[].extra.HowToImprove | String | 改进建议 |
| data.list[].extra.remark | String | 备注 |
| data.is_audit_permission | Number | 审核权限 |
| meta | Object | 分页信息 |
| meta.page | String | 当前页码 |
| meta.pageSize | String | 每页大小 |
| meta.total | Number | 总记录数 |

---

## 5. 保存差评任务/备注

### 接口信息
- **URL**: `/api/task/add`
- **请求方式**: POST
- **Content-Type**: application/json
- **请求头**: 需要携带 `authorization`

### 请求头参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| authorization | String | 是 | Bearer {access_token} |

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | Number | 是 | 状态，固定值：1 |
| source | Number | 是 | 来源，固定值：15 |
| model_id | Number | 是 | 模型ID（评价记录ID） |
| relation_model | String | 是 | 关联模型，固定值："Evaluate" |
| app_id | String | 是 | 应用ID |
| user_id | String | 是 | 用户ID |
| name | String | 是 | 教师姓名 |
| task_info | String | 是 | 任务信息，可为空字符串 |
| follower_id | Number | 是 | 跟进者ID，固定值：35 |
| complaintTypes | Array | 是 | 投诉类型，可为空数组 |
| is_send_email | String | 是 | 是否发送邮件，固定值："2" |
| follow_status | Number | 是 | 跟进状态，固定值：2 |
| follow_content | String | 是 | 跟进内容，可为空字符串 |
| category | String | 是 | 分类，可为空字符串 |
| childCategory | String | 是 | 子分类，可为空字符串 |
| isFollow | Boolean | 是 | 是否跟进，固定值：false |
| remind | Boolean | 是 | 是否提醒，固定值：false |
| keywords | Array | 是 | 关键词，可为空数组 |
| class_id | Array | 是 | 课程ID，可为空数组 |
| bad_review | Number | 是 | 差评标识，固定值：2 |
| extra | Object | 是 | 额外信息对象 |
| extra.problem | Any | 否 | 问题，可为 null |
| extra.sumUp | Any | 否 | 总结，可为 null |
| extra.improvement | Any | 否 | 改进，可为 null |
| extra.followType | Number | 是 | 跟进类型，固定值：0 |
| extra.SummaryQuestions | String | 否 | 问题总结（从差评列表获取） |
| extra.is_true | String | 否 | 是否真实（从差评列表获取） |
| extra.appeal | Boolean | 否 | 是否申诉（从差评列表获取） |
| extra.appeal_result | String | 否 | 申诉结果（从差评列表获取） |
| extra.HowToImprove | String | 否 | 改进建议（从差评列表获取） |
| extra.remark | String | 是 | 备注（来自Excel的处理内容） |

### 响应格式
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Number | 状态码，200 表示成功 |
| message | String | 响应消息 |
| data | Array | 数据数组，通常为空 |

---

## 6. 更新评价跟进状态

### 接口信息
- **URL**: `/api/evaluation/operation`
- **请求方式**: POST
- **Content-Type**: application/json
- **请求头**: 需要携带 `authorization`

### 请求头参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| authorization | String | 是 | Bearer {access_token} |

### 查询参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 评价记录ID |
| follow_status | Number | 是 | 更新后的跟进状态：1-未跟进，2-跟进中，3-跟进完成 |

### 响应格式
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Number | 状态码，200 表示成功 |
| message | String | 响应消息 |
| data | Array | 数据数组，通常为空 |

---

## 业务流程说明

### 差评处理完整流程
1. 使用接口1登录获取 access_token
2. 使用接口2根据教师姓名搜索获取 user_id
3. 使用接口4获取该教师的待处理差评列表（follow_status=2）
4. 使用接口5保存备注到差评记录
5. 如果处理内容包含"已移除"，使用接口6更新跟进状态为3（已完成）
6. 使用接口4验证处理结果

### 跟进状态说明
- **1**: 未跟进
- **2**: 跟进中（待处理）
- **3**: 跟进完成（已处理）
