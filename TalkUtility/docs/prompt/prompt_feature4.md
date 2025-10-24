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
  app-id: app_75535bab9a72a
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
  app-id: app_75535bab9a72a
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

# 功能4功能处理
## 页面描述
在TalkUtility项目中生成新的功能4页面，并实现功能4的功能。
1. 生成选择excel按钮供用户选择excel文件
2. 选择excel后生成，将excel的第1、2、3、8列展示在页面表格中。对提取的值赋值，列1: teacherName, 列2: classInfo, 列3: classId, 列8: processContent。后面新开一列展示处理结果：内容默认展示"-"。
   注意：excel存在表头。缺失表头的情况，使用内容${序号}作为表头
3. 生成“开始处理”按钮，点击后，将表格数据进行逐行处理。展示处理进度，处理结果实时展示在表格中。处理逻辑如下：
```
1. 使用接口1登录获取${access_token}供其他接口使用。
2. 遍历表格数据，使用接口2获取老师列表。
   a. 入参name = teacherName的第一个单词。获取结果后，通过将表格中的teacherName与返回结果中的name字段比较获取对应的user_id。注意：获取结果后，老师名称可能存在多个单词，单词直接的空格数量可能不一样，请忽略空格数量带来的影响。
      如果未找到对应的数据则在处理结果中展示"未找到老师信息"，结束当前循环。
   b. 执行接口4获取差评列表，user_id = ${步骤a获取到的user_id}，follow_status = 2。获取对应的结果evaluateResponse。通过比较evaluateResponse.data.list中的classId，获取唯一的classInfo。
      如果未找到对应数据，则处理结果中展示"未找到课程信息"。结束当前循环。
   c. 构建参数。参数如下：
         {
        "status": 1,
        "source": 15,
        "model_id": 294396,  //${classInfo.id}
        "relation_model": "Evaluate",
        "app_id": "app_51ce9f828be6",
        "user_id": "u_065dccbb0cdd9cd7",  //${classInfo.user_id}
        "name": "Dusan S",  //${classInfo.teacher_name}
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
        "extra": {    //${classInfo.extra}
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
      其中extra.remark为excel的${processContent}
      将构建的参数展示在表格中的“处理结果”列中。
   
[//]: # (   c. 构建参数执行接口5保存差评记录。参数如下：)

[//]: # (      {)

[//]: # (        "status": 1,)

[//]: # (        "source": 15,)

[//]: # (        "model_id": 294396,  //${classInfo.id})

[//]: # (        "relation_model": "Evaluate",)

[//]: # (        "app_id": "app_51ce9f828be6",)

[//]: # (        "user_id": "u_065dccbb0cdd9cd7",  //${classInfo.user_id})

[//]: # (        "name": "Dusan S",  //${classInfo.teacher_name})

[//]: # (        "task_info": "",)

[//]: # (        "follower_id": 35,)

[//]: # (        "complaintTypes": [],)

[//]: # (        "is_send_email": "2",)

[//]: # (        "follow_status": 2,)

[//]: # (        "follow_content": "",)

[//]: # (        "category": "",)

[//]: # (        "childCategory": "",)

[//]: # (        "isFollow": false,)

[//]: # (        "remind": false,)

[//]: # (        "keywords": [],)

[//]: # (        "class_id": [],)

[//]: # (        "bad_review": 2,)

[//]: # (        "extra": {    //${classInfo.extra})

[//]: # (          "problem": null,)

[//]: # (          "sumUp": null,)

[//]: # (          "improvement": null,)

[//]: # (          "followType": 0,)

[//]: # (          "SummaryQuestions": "课程进展正常。",)

[//]: # (          "is_true": "3",)

[//]: # (          "appeal": true,)

[//]: # (          "appeal_result": "移除",)

[//]: # (          "HowToImprove": "1 评语中未对课程表示不满，课程无明显问题，1分会拉低老师的评分，麻烦核实，非常感谢！",)

[//]: # (          "remark": "39318867")

[//]: # (        })

[//]: # (      })

[//]: # (      )
[//]: # (      如果执行成功，则处理结果中展示"保存备注成功"。否则处理结果中展示"保存备注失败"。)

[//]: # (      如果保存备注失败，结束当前循环。)

[//]: # (   )
[//]: # (   d. 如果步骤c执行成功。执行该步骤。processContent包含“已移除”，调接口6更新跟进状态为3。否则不处理。)

[//]: # (      如果执行成功，则处理结果中追加展示"更新跟进状态成功"；处理失败则追加展示"更新跟进状态失败"。如果该步骤未执行，则处理结果中追加展示"无需更新跟进状态"。)
   
3. 执行成功后，支持下载处理后的表格。文件名为"差评处理结果_yyyyMMdd_HHmm.xlsx"
   
```
