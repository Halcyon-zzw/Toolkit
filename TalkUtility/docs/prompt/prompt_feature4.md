# 功能4: 差评处理

# 功能4接口文档

## 1. 登录获取Token

### 请求信息
- **URL**: `https://trmk.teachingrecord.com/api/login`
- **请求方式**: POST
- **请求头**:
  ```
  Content-Type: application/json
  ```

### 请求参数
```json
{
  "username": "Seven",
  "password": "bb033dc62f44af605a3bebd824a8ae89"
}
```

**账号信息**：
- 用户名：`Seven`
- 密码：`9&&iZffZEi`（原始密码，需MD5加密为 `bb033dc62f44af605a3bebd824a8ae89`）

### 响应示例
```json
{
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 7838208000000
  },
  "message": "Success",
  "code": 200
}
```

## 2. 获取老师列表

### 请求信息
- **URL**: `https://trmk.teachingrecord.com/api/search/user?name={teacherName}`
- **请求方式**: GET
- **请求头**:
  ```
  authorization: Bearer {access_token}
  ```

### 请求参数
- **查询参数**: `name` - 老师姓名

### 响应示例
```json
{
  "data": {
    "list": [
      {
        "id": 15880,
        "name": "Amber Tang",
        "user_id": "u_c174f0490e2a890e",
        "app_id": "app_75535bab9a72a",
        "roles": [
          {
            "teacher_id": "1498212",
            "name": "Amber Tang",
            "cached_project": {
              "meta": {
                "host": "https://www.talk915.com",
                "password": "tapeng123456",
                "username": "ta-peng"
              }
            }
          }
        ]
      }
    ],
    "total": 1
  },
  "message": "Success",
  "code": 200,
  "meta": {
    "page": 1,
    "pageSize": 50,
    "total": 1
  }
}
```

## 3. 获取老师详细信息

### 请求信息
- **URL**: `https://trmk.teachingrecord.com/api/search/user?user_id={userId}`
- **请求方式**: GET
- **请求头**:
  ```
  authorization: Bearer {access_token}
  ```

### 请求参数
- **查询参数**: `user_id` - 用户ID

### 响应示例
同接口2的响应格式

## 4. 获取差评列表

### 请求信息
- **URL**: `https://trmk.teachingrecord.com/api/evaluation/list`
- **请求方式**: GET
- **请求头**:
  ```
  authorization: Bearer {access_token}
  ```

### 请求参数
- **查询参数**:
   - `follow_status=2` - 跟进状态
   - `user_id` - 用户ID
   - `page=1` - 页码
   - `pageSize=10` - 每页大小
   - `group_id` - 分组ID（可选）

### 响应示例
```json
{
  "data": {
    "list": [
      {
        "id": 294396,
        "user_id": "u_065dccbb0cdd9cd7",
        "teacher_name": "Dusan S",
        "class_id": "39318867",
        "content": "No.1 It's so good.",
        "stars": 3,
        "follow_status": 2,
        "extra": {
          "SummaryQuestions": "课程进展正常。",
          "is_true": "3",
          "appeal": true,
          "appeal_result": "移除",
          "HowToImprove": "1 评语中未对课程表示不满，课程无明显问题，1分会拉低老师的评分，麻烦核实，非常感谢！",
          "remark": "39318867"
        },
        "class_start_time": "2025-10-21 21:30:00",
        "class_end_time": "2025-10-21 21:55:00"
      }
    ],
    "is_audit_permission": 0
  },
  "message": "Success",
  "code": 200,
  "meta": {
    "page": "1",
    "pageSize": "10",
    "total": 1
  }
}
```

## 5. 保存差评记录

### 请求信息
- **URL**: `https://trmk.teachingrecord.com/api/task/add`
- **请求方式**: POST
- **请求头**:
  ```
  authorization: Bearer {access_token}
  ```

### 请求参数
```json
{
  "status": 1,
  "source": 15,
  "model_id": 294396,
  "relation_model": "Evaluate",
  "app_id": "app_51ce9f828be6",
  "user_id": "u_065dccbb0cdd9cd7",
  "name": "Dusan S",
  "task_info": "",
  "follower_id": 35,
  "complaintTypes": [],
  "is_send_email": "2",
  "follow_status": 2,
  "follow_content": "",
  "category": "",
  "childCategory": "",
  "isFollow": false,
  "remind": false,
  "keywords": [],
  "class_id": [],
  "bad_review": 2,
  "extra": {
    "problem": null,
    "sumUp": null,
    "improvement": null,
    "followType": 0,
    "SummaryQuestions": "课程进展正常。",
    "is_true": "3",
    "appeal": true,
    "appeal_result": "移除",
    "HowToImprove": "1 评语中未对课程表示不满，课程无明显问题，1分会拉低老师的评分，麻烦核实，非常感谢！",
    "remark": "39318867"
  }
}
```

### 响应示例
```json
{
  "data": [],
  "message": "Success",
  "code": 200
}
```

## 关键字段说明

### 差评记录关键字段
- `id`: 评价记录ID
- `user_id`: 用户ID
- `teacher_name`: 老师姓名
- `class_id`: 课程ID
- `content`: 评价内容
- `stars`: 评分星级
- `follow_status`: 跟进状态（2表示待处理）
- `extra.appeal`: 是否申诉
- `extra.appeal_result`: 申诉结果
- `extra.HowToImprove`: 改进建议

### 老师信息关键字段
- `user_id`: 用户唯一标识
- `roles[].teacher_id`: 老师在平台的ID
- `roles[].cached_project.meta`: 平台登录信息

## 6. 更新评价跟进状态

### 请求信息
- **URL**: `https://trmk.teachingrecord.com/api/evaluation/operation`
- **请求方式**: POST
- **请求头**:
  ```
  authorization: Bearer {access_token}
  ```

### 请求参数
- **查询参数**:
  - `follow_status=3` - 更新后的跟进状态
  - `id=294396` - 评价记录ID

### 响应示例
```json
{
  "data": [],
  "message": "Success",
  "code": 200
}
```

## 接口说明

### 功能描述
此接口用于更新评价记录的跟进状态，通常用于将差评标记为已处理状态。

### 关键参数说明
- `follow_status`: 跟进状态代码
  - `2` = 待处理
  - `3` = 已处理/已完成
- `id`: 评价记录的唯一标识符


# 功能4页面实现

## 页面功能描述

### 1. 文件选择功能
- 生成选择Excel按钮供用户选择Excel文件

### 2. 数据展示功能
选择Excel后：
- 将Excel的第1、2、3、8列展示在页面表格中
- 对提取的值赋值：
  - 列1: `teacherName`
  - 列2: `classInfo`
  - 列3: `classId`
  - 列8: `processContent`
- 新增一列展示“处理结果”，默认显示"-"
- 新增一列展示"处理后记录信息"，默认显示"-"

**注意**：
- Excel存在表头
- 缺失表头的情况，使用内容`${序号}`作为表头

### 3. 数据处理流程

#### 3.1 初始化
- 使用接口1登录获取`${access_token}`供其他接口使用

#### 3.2 遍历表格数据处理

**步骤a：获取老师信息**
- 使用接口2获取老师列表
- 入参`name` = `teacherName`的第一个单词
- 获取结果后，通过将表格中的`teacherName`与返回结果中的`name`字段比较获取对应的`user_id`
- **注意**：忽略空格数量带来的影响
- 如果未找到对应的数据，则在处理结果中展示"未找到老师信息"，结束当前循环

**步骤b：获取差评信息**
- 执行接口4获取差评列表
- `user_id` = 步骤a获取到的`user_id`
- `follow_status` = 2
- 获取对应的结果`evaluateResponse`
- 通过比较`evaluateResponse.data.list`中的`classId`，获取唯一的`classInfo`
- 如果未找到对应数据，则处理结果中展示"未找到课程信息"，结束当前循环

**步骤c：保存备注**
- 构建参数：
```
{
  "status": 1,
  "source": 15,
  "model_id": 294396,  // ${classInfo.id}
  "relation_model": "Evaluate",
  "app_id": "app_51ce9f828be6",
  "user_id": "u_065dccbb0cdd9cd7",  // ${classInfo.user_id}
  "name": "Dusan S",  // ${classInfo.teacher_name}
  "task_info": "",
  "follower_id": 35,
  "complaintTypes": [],
  "is_send_email": "2",
  "follow_status": 2,
  "follow_content": "",
  "category": "",
  "childCategory": "",
  "isFollow": false,
  "remind": false,
  "keywords": [],
  "class_id": [],
  "bad_review": 2,
  "extra": {  // ${classInfo.extra}
    "problem": null,
    "sumUp": null,
    "improvement": null,
    "followType": 0,
    "SummaryQuestions": "课程进展正常。",
    "is_true": "3",
    "appeal": true,
    "appeal_result": "移除",
    "HowToImprove": "1 评语中未对课程表示不满，课程无明显问题，1分会拉低老师的评分，麻烦核实，非常感谢！",
    "remark": "39318867"  // ${processContent}
  }
}
```
- 将参数发送给接口5，保存备注
- 执行成功：处理结果中展示"保存备注成功"
- 执行失败：处理结果中展示"保存备注失败"，结束当前循环

**步骤d：更新跟进状态**
- 如果步骤c执行成功且`processContent`包含"已移除"：
  - 调接口6更新跟进状态为3。入参：`id=${classInfo.id}`，`follow_status=3`
  - 执行成功：处理结果中追加展示"更新跟进状态成功"
  - 执行失败：处理结果中追加展示"更新跟进状态失败"
- 如果步骤c执行成功且`processContent`不包含"已移除"：处理结果中追加展示"无需更新跟进状态"

**步骤e：查看记录信息**
- 执行接口4获取差评列表
  - `user_id` = 步骤a获取到的`user_id`
  - `class_id` = excel提取的`classId`
  - `follow_status`不传
- 获取对应的结果`evaluateResponse`
- 通过比较`evaluateResponse.data.list`中的`classId`，获取唯一的`classInfo`
- 如果未找到对应数据，则“处理后记录信息”中展示"未找到处理结果"
- 如果找到对应数据，则“处理后记录信息”中展示：
  ```
  跟进状态: `${classInfo.follow_status}` //根据具体值展示对应信息。1: 未跟进、2: 跟进中、3: 跟进完成
  备注内容: `${classInfo.extra.remark}`
  ```


### 4. 结果导出功能
- 执行成功后，支持下载处理后的表格
- 文件名格式：`差评处理结果_yyyyMMdd_HHmm.xlsx`


