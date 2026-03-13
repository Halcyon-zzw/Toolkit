# teacherrecord.com 接口文档

基础域名：`https://teacherrecord.com`

认证方式：通过 `Cookie` 请求头传递登录凭证（`PHPSESSID` 等字段）。

---

## 1. 获取简历列表

### 基本信息

| 项目 | 内容 |
|------|------|
| 接口地址 | `POST /company/recruit/list_act` |
| Content-Type | `application/x-www-form-urlencoded` |
| 认证 | Cookie |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `type` | string | 是 | 列表类型。`unprocessed`=未处理，`pre_review`=初筛中 |
| `limit` | int | 是 | 每页条数，如 `10` |
| `page` | int | 是 | 页码，从 `1` 开始 |
| `name` | string | 否 | 按教师姓名搜索 |
| `job_id` | string | 否 | 职位 ID |
| `country` | string | 否 | 国家筛选 |
| `ethnicity` | string | 否 | 种族筛选 |
| `tefl_filter` | string | 否 | TEFL 认证筛选 |
| `sex` | string | 否 | 性别筛选 |
| `advance_event` | string | 否 | 高级事件筛选 |
| `skype` | string | 否 | Skype 筛选 |
| `wechat` | string | 否 | 微信筛选 |
| `whats_app` | string | 否 | WhatsApp 筛选 |
| `phone` | string | 否 | 电话筛选 |
| `qq` | string | 否 | QQ 筛选 |
| `expect_filter` | string | 否 | 期望筛选 |
| `degree` | string | 否 | 学历筛选 |
| `sort` | string | 否 | 排序方式 |

### 请求示例

```bash
curl --location --request POST 'https://teacherrecord.com/company/recruit/list_act' \
--header 'Cookie: PHPSESSID=xxx; username=xxx' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'type=unprocessed' \
--data-urlencode 'limit=10' \
--data-urlencode 'page=1' \
--data-urlencode 'name=' \
--data-urlencode 'job_id=' \
--data-urlencode 'country=' \
--data-urlencode 'ethnicity=' \
--data-urlencode 'tefl_filter=' \
--data-urlencode 'sex=' \
--data-urlencode 'advance_event=' \
--data-urlencode 'skype=' \
--data-urlencode 'wechat=' \
--data-urlencode 'whats_app=' \
--data-urlencode 'phone=' \
--data-urlencode 'qq=' \
--data-urlencode 'expect_filter=' \
--data-urlencode 'degree=' \
--data-urlencode 'sort='
```

### 响应结构

```json
{
  "code": 0,
  "status": 0,
  "msg": "获取成功",
  "count": 1,
  "data": [
    {
      "id": 1557164,
      "tch_is_interview": false,
      "resume_matching_rate": 0,
      "is_status": {
        "id": 0,
        "name": "未处理",
        "info": { "cn": "未处理", "en": "Received by Employer" }
      },
      "demo_video_status": null,
      "defer_processing": 0,
      "demo_video": "",
      "create_time": "2026/03/10 04:13",
      "up_time": 1773087196,
      "advance_event": 0,
      "job_info": {
        "id": 986,
        "name": "职位名称",
        "cat_id": { "id": 2, "name": "Teach Online", "co_name": "Teach Online", "tch_name": "Teach Online" },
        "extra_remarks": null,
        "overtime": 864000
      },
      "teacher": {
        "id": 1267723,
        "tk": "22F038FE",
        "pid": null,
        "name": "Diana",
        "sex": "Female",
        "age": "1977-10-05",
        "c_status": 0,
        "avatar": "https://cdn-cn.teacherrecord.com/...",
        "video": "https://teacherrecord.com/service/shareVideo/...",
        "nationality": {
          "id": 36,
          "name": "South Africa",
          "country_code": "ZAF",
          "cname": "南非"
        },
        "current_location": {
          "id": "36",
          "cname": "南非",
          "ename": "South Africa"
        },
        "teach_experience": { "id": "65", "name": "3-5年", "tch_name": "3-5 Years" },
        "degree": { "id": "32", "name": "专科", "tch_name": "College" },
        "certification": [],
        "ip_country": "ZA"
      },
      "interview": {
        "is_reinterview": 0,
        "start_time": null,
        "end_time": null,
        "room_id": "0",
        "interviewer": {
          "id": 4,
          "email": "peng@teacherrecord.com",
          "name": "Talk915-master"
        }
      },
      "career_record": null,
      "interview_task_status": 0,
      "has_interview_task": 1
    }
  ]
}
```

### 响应字段说明

| 字段路径 | 类型 | 说明 |
|----------|------|------|
| `code` | int | 状态码，`0` 表示成功 |
| `count` | int | 符合条件的总记录数 |
| `data` | array | 简历列表 |
| `data[].id` | int | 投递记录 ID |
| `data[].create_time` | string | 投递时间 |
| `data[].is_status.name` | string | 处理状态（未处理 / 初筛中等） |
| `data[].job_info.id` | int | 职位 ID，用于构造来源字段 `TR{id}` |
| `data[].teacher.tk` | string | 教师唯一标识，用于获取简历详情 |
| `data[].teacher.id` | int | 教师 ID |
| `data[].teacher.name` | string | 教师姓名 |
| `data[].teacher.sex` | string | 性别 |
| `data[].teacher.nationality.cname` | string | 国籍（中文） |
| `data[].teacher.ip_country` | string | IP 归属国家 ISO2 代码 |
| `data[].teacher.certification` | array | 认证列表，含 `name` 字段（如 TEFL/TESOL） |
| `data[].teacher.teach_experience.name` | string | 教学经验年限 |
| `data[].teacher.degree.name` | string | 学历 |

---

## 2. 获取简历详情页

### 基本信息

| 项目 | 内容 |
|------|------|
| 接口地址 | `GET /service/shareResume/{tk}` |
| 认证 | Cookie |
| 返回格式 | HTML 页面 |

### 路径参数

| 参数 | 说明 |
|------|------|
| `tk` | 教师唯一标识，来自列表接口 `teacher.tk` |

### 查询参数

| 参数 | 说明 |
|------|------|
| `lang` | 语言，`cn`=中文 |
| `head_logo` | 头像显示，`-1`=不显示 |
| `type` | 简历类型，`zl`=标准简历 |

### 请求示例

```bash
curl 'https://teacherrecord.com/service/shareResume/22F038FE?lang=cn&head_logo=-1&type=zl' \
--header 'Cookie: PHPSESSID=xxx'
```

### 从 HTML 中提取的关键信息

返回 HTML，通过正则从页面内容中提取：

| 字段 | 正则表达式 |
|------|-----------|
| 邮箱 | `copyText\('([^']+@[^']+)'\)` |
| WhatsApp | `<strong>WhatsApp:&nbsp;<\/strong>([^<]+)` |
| Teams | `<strong>Teams:&nbsp;<\/strong>([^<]+)` |
| 教学年限 | `<strong>教学年限: <\/strong>([^<]+)<br\/>` |
