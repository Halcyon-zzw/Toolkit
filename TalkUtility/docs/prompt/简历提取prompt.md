根据要求，生成新的功能：简历提取。
# 页面要求
## **输入文本**
“cokie”，非必填
## 列表
标题如下：

```
teacherId: 输入框（固定在页面的最左端，输入内容后输入框最右边生成小按钮“提取”，点击提取后执行后端逻辑，后端逻辑稍后给出，当前表头生成“全部提取”按钮，点击每行依次执行后端逻辑。）
沟通渠道: Whatsapp
名字: $teacherInfo.name
语种: 英语
国家: $teacherInfo.country(if $teacherInfo.ipCountry 与 $teacherInfo.country不一致，换行展示""ip地址:$teacherInfo.ipCountry")
邮箱: $resumeInfo.email
简历链接: $teacherInfo.resumeLink
来源: TR+$teacherInfo.jobId
网站沟通执行人: Seven
初选通过日期: null
有无教资: $teacherInfo.haveCertification ? "有" : "无" 
是否需邮件提醒添加WS/Teams: null
邮件提醒日期: null
邮件执行人: null
WA/Teams沟通执行人: null
WA/Teams添加日期: null
WA/Teams账号: $resumeInfo.whatsapp \n $resumeInfo.teams  // WhatsApp或Teams账号
是否需邮件催发checklist/self-intro: null
邮件催发日期: null
邮件执行人: null
WA/Teams及问卷确认最大开课时长: null
WA/Teams及问卷确认开课时段: null
特殊备注: null
是否约面试: null
不约面试原因: null
面试时间: null
备注: 输入框（固定在页面的最右端，中间的列支持滑动。） 点击提取后，展示逻辑为：$输入内容 + “\n” + $teacherInfo.teachingExperience

其他说明：展示数据后，支持用户修改。有无教资：使用按钮，点击后快速修改。
支持删除行数据。
表格下方新增导出excel按钮。
```

# 接口
## 获取简历列表接口

```
curl --location --request POST 'https://teacherrecord.com/company/recruit/list_act' \
--header 'Host: teacherrecord.com' \
--header 'Connection: keep-alive' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Cookie: think_var=zh-cn; username=peng%40teacherrecord.com; cn_name=%E7%91%9E%E9%93%A0%E7%A7%91%E6%8A%80%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8; cn_avatar=https%3A%2F%2Fcdn.teacherrecord.com%2Fupload%2F20221027%2F241139-2e80b8dcdad14b8b5c7cefc9900e41e3.png; cn_user_type=company; PHPSESSID=0vtn29o8s5g7laigej71b9tvr7' \
--data-urlencode 'job_id=' \
--data-urlencode 'name=' \
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
--data-urlencode 'sort=' \
--data-urlencode 'type=unprocessed' \
--data-urlencode 'limit=10' \
--data-urlencode 'page=1'
```
接口响应
```
  {
    "count": 0,
    "data": [
        {
            "id": 1557164,
            "tch_is_interview": false,
            "resume_matching_rate": 0,
            "is_status": {
                "id": 0,
                "name": "未处理",
                "info": {
                    "cn": "未处理",
                    "en": "Received by Employer"
                }
            },
            "demo_video_status": null,
            "defer_processing": 0,
            "demo_video": "",
            "create_time": "2026/03/10 04:13",
            "up_time": 1773087196,
            "advance_event": 0,
            "job_info": {
                "id": 986,
                "name": "High booking rate-Online English Teaching Jobs (All Nationalities Welcome)",
                "cat_id": {
                    "id": 2,
                    "name": "Teach Online",
                    "co_name": "Teach Online",
                    "tch_name": "Teach Online"
                },
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
                "avatar": "https://cdn-cn.teacherrecord.com/static/sky/public/img/df_ava.png",
                "video": "https://teacherrecord.com/service/shareVideo/MDAwMDAwMDAwMLCKr5iyy3LatNufnw",
                "nationality": {
                    "id": 36,
                    "name": "South Africa",
                    "country_code": "ZAF",
                    "cname": "南非"
                },
                "current_location": {
                    "id": "36",
                    "cname": "南非",
                    "ename": "South Africa",
                    "info": {
                        "id": 36,
                        "name": "South Africa",
                        "country_code": "ZAF",
                        "cname": "南非",
                        "tch_show": 1,
                        "nationality": "South African",
                        "flag": "🇿🇦",
                        "currency": "ZAR",
                        "currency_symbol": "R",
                        "phonecode": "27"
                    }
                },
                "teach_experience": {
                    "id": "65",
                    "name": "3-5年",
                    "co_name": "3-5年",
                    "tch_name": "3-5 Years",
                    "data": ""
                },
                "degree": {
                    "id": "32",
                    "name": "专科",
                    "co_name": "专科",
                    "tch_name": "College",
                    "data": ""
                },
                "certification": [],
                "recruitment_price": {
                    "id": 0,
                    "num": 0,
                    "original_price": 0,
                    "ls_jg": 0,
                    "ls_jstime": 0,
                    "is_default": true,
                    "show": false
                },
                "co_group": 0,
                "ip_country": "ZA"
            },
            "interview": {
                "is_reinterview": 0,
                "start_time": null,
                "end_time": null,
                "start_timestamp": 0,
                "end_timestamp": null,
                "room_id": "0",
                "room_pw": null,
                "interviewer": {
                    "id": 4,
                    "email": "peng@teacherrecord.com",
                    "name": "Talk915-master"
                },
                "playback_url": null,
                "can_playback": false,
                "can_reinterview": false,
                "can_share": false,
                "can_edit_file": true,
                "reschedule_times": 3,
                "live_urls": {
                    "tch": "https://teacherrecord.com/index/service/joinMeeting/token/eRyaJnpcZcCaI6MTU1NzE2NCwidHlwZSI6InRjaCJ9",
                    "corp": "https://teacherrecord.com/index/service/joinMeeting/token/eRyaJnpcZcCaI6MTU1NzE2NCwidHlwZSI6ImNvcnAifQO0O0OO0O0O"
                },
                "material": null,
                "show_teacher_link": false
            },
            "career_record": null,
            "interview_task_status": 0,
            "has_interview_task": 1,
            "salary": {
                "num": null,
                "entrust": null,
                "trial_salary": null,
                "can_modify": 3,
                "show": false
            },
            "allow_salary": true
        }
    ],
    "code": 0,
    "status": 0,
    "msg": "获取成功"
}

```
将接口添加到接口文档中，文档名称“docs/api/teacherrecord_api.md接口文档”

# 处理逻辑
```
1. 请求/list_act, actInfo = response.data。 第一次请求，参数：name = $teacherId，type=unprocessed，
if actInfo 为空
   name = $teacherId，type=pre_review，再次请求
if actInfo 依旧为空
  直接返回空元素
2. 提取教师信息，见参考代码
```

## 参考代码：
代码1:
```
import json
from typing import List, Dict, Any

async def main(args: Args) -> Output:
    params = args.params
    
    # 解析输入的数据源（JSON字符串）
    input_data = params['input']
    
    # 将JSON字符串解析为Python对象
    try:
        data_list = json.loads(input_data)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON解析失败: {e}")
    
    # 获取第一个数据（注意：输入可能是包含page_layout的完整响应）
    if isinstance(data_list, dict) and 'data' in data_list:
        # 如果输入是完整的API响应，包含data字段
        actual_data = data_list['data']
        page_layout = data_list.get('page_layout', [])
    else:
        # 如果输入直接是数据数组
        actual_data = data_list
        page_layout = []
    
    if not actual_data:
        raise ValueError("数据源为空，无法获取第一个数据")
    
    first_item = actual_data[0]
    
    # 构建输出对象，提取关键信息并保持原字段名
    ret: Output = {
        "data": first_item,
        # 基本信息
        "id": first_item.get('id'),
        "tch_is_interview": first_item.get('tch_is_interview'),
        "resume_matching_rate": first_item.get('resume_matching_rate'),
        "demo_video_status": first_item.get('demo_video_status'),
        "defer_processing": first_item.get('defer_processing'),
        "demo_video": first_item.get('demo_video'),
        "create_time": first_item.get('create_time'),
        "up_time": first_item.get('up_time'),
        "advance_event": first_item.get('advance_event'),
        
        # 状态信息
        "is_status": first_item.get('is_status'),
        "interview_task_status": first_item.get('interview_task_status'),
        "has_interview_task": first_item.get('has_interview_task'),
        
        # 工作信息
        "job_info": {
            "id": first_item.get('job_info', {}).get('id'),
            "name": first_item.get('job_info', {}).get('name'),
            "cat_id": first_item.get('job_info', {}).get('cat_id'),
            "extra_remarks": first_item.get('job_info', {}).get('extra_remarks'),
            "overtime": first_item.get('job_info', {}).get('overtime')
        },
        
        # 教师信息
        "teacher": {
            "id": first_item.get('teacher', {}).get('id'),
            "tk": first_item.get('teacher', {}).get('tk'),
            "pid": first_item.get('teacher', {}).get('pid'),
            "name": first_item.get('teacher', {}).get('name'),
            "sex": first_item.get('teacher', {}).get('sex'),
            "age": first_item.get('teacher', {}).get('age'),
            "c_status": first_item.get('teacher', {}).get('c_status'),
            "avatar": first_item.get('teacher', {}).get('avatar'),
            "video": first_item.get('teacher', {}).get('video'),
            "nationality": first_item.get('teacher', {}).get('nationality'),
            "current_location": first_item.get('teacher', {}).get('current_location'),
            "teach_experience": first_item.get('teacher', {}).get('teach_experience'),
            "degree": first_item.get('teacher', {}).get('degree'),
            "certification": first_item.get('teacher', {}).get('certification'),
            "recruitment_price": first_item.get('teacher', {}).get('recruitment_price'),
            "co_group": first_item.get('teacher', {}).get('co_group'),
            "ip_country": first_item.get('teacher', {}).get('ip_country')
        },
        
        # 面试信息
        "interview": {
            "is_reinterview": first_item.get('interview', {}).get('is_reinterview'),
            "start_time": first_item.get('interview', {}).get('start_time'),
            "end_time": first_item.get('interview', {}).get('end_time'),
            "start_timestamp": first_item.get('interview', {}).get('start_timestamp'),
            "end_timestamp": first_item.get('interview', {}).get('end_timestamp'),
            "room_id": first_item.get('interview', {}).get('room_id'),
            "room_pw": first_item.get('interview', {}).get('room_pw'),
            "interviewer": first_item.get('interview', {}).get('interviewer'),
            "playback_url": first_item.get('interview', {}).get('playback_url'),
            "can_playback": first_item.get('interview', {}).get('can_playback'),
            "can_reinterview": first_item.get('interview', {}).get('can_reinterview'),
            "can_share": first_item.get('interview', {}).get('can_share'),
            "can_edit_file": first_item.get('interview', {}).get('can_edit_file'),
            "reschedule_times": first_item.get('interview', {}).get('reschedule_times'),
            "live_urls": first_item.get('interview', {}).get('live_urls'),
            "material": first_item.get('interview', {}).get('material'),
            "show_teacher_link": first_item.get('interview', {}).get('show_teacher_link')
        },
        
        # 其他信息
        "career_record": first_item.get('career_record'),
        
        # 薪资信息
        "salary": first_item.get('salary'),
        "allow_salary": first_item.get('allow_salary'),
        
        # 分页信息（如果存在）
        "page_layout": page_layout
    }
    
    return ret
```

代码2:
```
async function main({ params }: Args): Promise<Output> {
    // 从 teacherInfo 获取信息
    const { teacherInfo } = params;
    
    const resumeInfo = get请求(url: https://teacherrecord.com/service/shareResume/{{block_output_161774.teacher.tk}}?lang=cn&head_logo=-1&type=zl)
    // 获取国家信息
    const country = teacherInfo.teacher.nationality.cname;
    
    // 获取简历ID
    const resumeId = teacherInfo.teacher.tk;
    
    // 构建简历链接
    const resumeLink = `https://teacherrecord.com/service/shareResume/${resumeId}`;
    
    // 判断是否有教师资格证
    const certificationInfoList = teacherInfo.teacher.certification || [];
    // 提取所有 name 字段生成数组
    const certificationNameList = certificationInfoList.map(item => item?.name || '');
    
    const haveCertification = certificationInfoList.some(cert => 
      ['TEFL', 'TESOL'].includes(cert.name)
    );
    
    
    
    // 从 resumeInfo HTML 中提取信息
    const extractFromHtml = (html: string, label: string): string => {
      const regex = new RegExp(`<strong>${label}:&nbsp;</strong>([^<]+)`);
      const match = html.match(regex);
      return match ? match[1].trim() : '';
    };
    
    // 提取邮箱
    const emailMatch = resumeInfo.match(/copyText\('([^']+@[^']+)'\)/);
    const email = emailMatch ? emailMatch[1] : '';
    
    // 提取WhatsApp
    const whatsappMatch = resumeInfo.match(/<strong>WhatsApp:&nbsp;<\/strong>([^<]+)/);
    const whatsapp = whatsappMatch ? whatsappMatch[1].trim() : '';
    
    // 提取Teams
    const teamsMatch = resumeInfo.match(/<strong>Teams:&nbsp;<\/strong>([^<]+)/);
    const teams = teamsMatch ? teamsMatch[1].trim() : '';
    
    // 提取教学年限
    const teachingExpMatch = resumeInfo.match(/<strong>教学年限: <\/strong>([^<]+)<br\/>/);
    const teachingExperience = teachingExpMatch ? teachingExpMatch[1].trim() : '';
    
    // 获取网络所在地
    const ipCountryCode = teacherInfo.teacher.ip_country;
    const countryCodeList = getCountryCodeList();
    const ipCountry = countryCodeList.find(country => country.value === ipCountryCode)?.name || ipCountryCode;
    
    // 判断网络与所在地是否一致
    const isLocationConsistent = country === ipCountry;

    const jobId = teacherInfo.job_info.id;
    
    // 构建输出对象
    const ret = {
      // 新增的字段
      "teacherInfo": {
        "name": teacherInfo.teacher.name,
        "country": country,
        "resumeId": resumeId,
        "resumeLink": resumeLink,
        "certificationNameList": certificationNameList,
        "haveCertification": haveCertification,
        "ipCountry": ipCountry,
        "isLocationConsistent": isLocationConsistent,
        "jobId": jobId
      },
      "resumeInfo": {
        "email": email,
        "whatsapp": whatsapp,
        "teams": teams,
        "teachingExperience": teachingExperience
      }
    };
    
    return ret;
  }


function getCountryCodeList() {
    return [
      {
        "value": "CN",
        "name": "中国"
      },
      {
        "value": "TW",
        "name": "中国台湾"
      },
      {
        "value": "GB",
        "name": "英国"
      },
      {
        "value": "US",
        "name": "美国"
      },
      {
        "value": "AU",
        "name": "澳大利亚"
      },
      {
        "value": "CA",
        "name": "加拿大"
      },
      {
        "value": "NZ",
        "name": "新西兰"
      },
      {
        "value": "JP",
        "name": "日本"
      },
      {
        "value": "ZA",
        "name": "南非"
      },
      {
        "value": "RU",
        "name": "俄罗斯"
      },
      {
        "value": "ZW",
        "name": "津巴布韦"
      },
      {
        "value": "IT",
        "name": "意大利"
      },
      {
        "value": "MX",
        "name": "墨西哥"
      },
      {
        "value": "MY",
        "name": "马来西亚"
      },
      {
        "value": "PH",
        "name": "菲律宾"
      },
      {
        "value": "PL",
        "name": "波兰"
      },
      {
        "value": "AI",
        "name": "安圭拉"
      },
      {
        "value": "AL",
        "name": "阿尔巴尼亚"
      },
      {
        "value": "AM",
        "name": "亚美尼亚"
      },
      {
        "value": "AO",
        "name": "安哥拉"
      },
      {
        "value": "AQ",
        "name": "南极洲"
      },
      {
        "value": "AR",
        "name": "阿根廷"
      },
      {
        "value": "AS",
        "name": "美属萨摩亚"
      },
      {
        "value": "AT",
        "name": "奥地利"
      },
      {
        "value": "AW",
        "name": "阿鲁巴"
      },
      {
        "value": "AX",
        "name": "奥兰"
      },
      {
        "value": "AZ",
        "name": "阿塞拜疆"
      },
      {
        "value": "BA",
        "name": "波黑"
      },
      {
        "value": "BB",
        "name": "巴巴多斯"
      },
      {
        "value": "BD",
        "name": "孟加拉国"
      },
      {
        "value": "BE",
        "name": "比利时"
      },
      {
        "value": "BF",
        "name": "布基纳法索"
      },
      {
        "value": "BG",
        "name": "保加利亚"
      },
      {
        "value": "BH",
        "name": "巴林"
      },
      {
        "value": "BI",
        "name": "布隆迪"
      },
      {
        "value": "BJ",
        "name": "贝宁"
      },
      {
        "value": "BL",
        "name": "圣巴泰勒米"
      },
      {
        "value": "BM",
        "name": "百慕大"
      },
      {
        "value": "BN",
        "name": "文莱"
      },
      {
        "value": "BO",
        "name": "玻利维亚"
      },
      {
        "value": "BQ",
        "name": "荷兰加勒比区"
      },
      {
        "value": "BR",
        "name": "巴西"
      },
      {
        "value": "BS",
        "name": "巴哈马"
      },
      {
        "value": "BT",
        "name": "不丹"
      },
      {
        "value": "BV",
        "name": "布韦岛"
      },
      {
        "value": "BW",
        "name": "博茨瓦纳"
      },
      {
        "value": "BY",
        "name": "白俄罗斯"
      },
      {
        "value": "BZ",
        "name": "伯利兹"
      },
      {
        "value": "CC",
        "name": "科科斯（基林）群岛"
      },
      {
        "value": "CD",
        "name": "刚果民主共和国"
      },
      {
        "value": "CF",
        "name": "中非"
      },
      {
        "value": "CG",
        "name": "刚果共和国"
      },
      {
        "value": "CH",
        "name": "瑞士"
      },
      {
        "value": "CI",
        "name": "科特迪瓦"
      },
      {
        "value": "CK",
        "name": "库克群岛"
      },
      {
        "value": "CL",
        "name": "智利"
      },
      {
        "value": "CM",
        "name": "喀麦隆"
      },
      {
        "value": "CO",
        "name": "哥伦比亚"
      },
      {
        "value": "CR",
        "name": "哥斯达黎加"
      },
      {
        "value": "CU",
        "name": "古巴"
      },
      {
        "value": "CV",
        "name": "佛得角"
      },
      {
        "value": "CW",
        "name": "库拉索"
      },
      {
        "value": "CX",
        "name": "圣诞岛"
      },
      {
        "value": "CY",
        "name": "塞浦路斯"
      },
      {
        "value": "CZ",
        "name": "捷克"
      },
      {
        "value": "DE",
        "name": "德国"
      },
      {
        "value": "DJ",
        "name": "吉布提"
      },
      {
        "value": "DK",
        "name": "丹麦"
      },
      {
        "value": "DM",
        "name": "多米尼克"
      },
      {
        "value": "DO",
        "name": "多米尼加"
      },
      {
        "value": "DZ",
        "name": "阿尔及利亚"
      },
      {
        "value": "EC",
        "name": "厄瓜多尔"
      },
      {
        "value": "EE",
        "name": "爱沙尼亚"
      },
      {
        "value": "EG",
        "name": "埃及"
      },
      {
        "value": "EH",
        "name": "西撒哈拉"
      },
      {
        "value": "ER",
        "name": "厄立特里亚"
      },
      {
        "value": "ES",
        "name": "西班牙"
      },
      {
        "value": "ET",
        "name": "埃塞俄比亚"
      },
      {
        "value": "FI",
        "name": "芬兰"
      },
      {
        "value": "FJ",
        "name": "斐济"
      },
      {
        "value": "FK",
        "name": "福克兰群岛"
      },
      {
        "value": "FM",
        "name": "密克罗尼西亚联邦"
      },
      {
        "value": "FO",
        "name": "法罗群岛"
      },
      {
        "value": "FR",
        "name": "法国"
      },
      {
        "value": "GA",
        "name": "加蓬"
      },
      {
        "value": "GD",
        "name": "格林纳达"
      },
      {
        "value": "GE",
        "name": "格鲁吉亚"
      },
      {
        "value": "GF",
        "name": "法属圭亚那"
      },
      {
        "value": "GG",
        "name": "根西"
      },
      {
        "value": "GH",
        "name": "加纳"
      },
      {
        "value": "GI",
        "name": "直布罗陀"
      },
      {
        "value": "GL",
        "name": "格陵兰"
      },
      {
        "value": "GM",
        "name": "冈比亚"
      },
      {
        "value": "GN",
        "name": "几内亚"
      },
      {
        "value": "GP",
        "name": "瓜德罗普"
      },
      {
        "value": "GQ",
        "name": "赤道几内亚"
      },
      {
        "value": "GR",
        "name": "希腊"
      },
      {
        "value": "GS",
        "name": "南乔治亚和南桑威奇群岛"
      },
      {
        "value": "GT",
        "name": "危地马拉"
      },
      {
        "value": "GU",
        "name": "关岛"
      },
      {
        "value": "GW",
        "name": "几内亚比绍"
      },
      {
        "value": "GY",
        "name": "圭亚那"
      },
      {
        "value": "HK",
        "name": "香港"
      },
      {
        "value": "HM",
        "name": "赫德岛和麦克唐纳群岛"
      },
      {
        "value": "HN",
        "name": "洪都拉斯"
      },
      {
        "value": "HR",
        "name": "克罗地亚"
      },
      {
        "value": "HT",
        "name": "海地"
      },
      {
        "value": "HU",
        "name": "匈牙利"
      },
      {
        "value": "ID",
        "name": "印尼"
      },
      {
        "value": "IE",
        "name": "爱尔兰"
      },
      {
        "value": "IL",
        "name": "以色列"
      },
      {
        "value": "IM",
        "name": "马恩岛"
      },
      {
        "value": "IN",
        "name": "印度"
      },
      {
        "value": "IO",
        "name": "英属印度洋领地"
      },
      {
        "value": "IQ",
        "name": "伊拉克"
      },
      {
        "value": "IR",
        "name": "伊朗"
      },
      {
        "value": "IS",
        "name": "冰岛"
      },
      {
        "value": "JE",
        "name": "泽西"
      },
      {
        "value": "JM",
        "name": "牙买加"
      },
      {
        "value": "JO",
        "name": "约旦"
      },
      {
        "value": "KE",
        "name": "肯尼亚"
      },
      {
        "value": "KG",
        "name": "吉尔吉斯斯坦"
      },
      {
        "value": "KH",
        "name": "柬埔寨"
      },
      {
        "value": "KI",
        "name": "基里巴斯"
      },
      {
        "value": "KM",
        "name": "科摩罗"
      },
      {
        "value": "KN",
        "name": "圣基茨和尼维斯"
      },
      {
        "value": "KP",
        "name": "朝鲜"
      },
      {
        "value": "KR",
        "name": "韩国"
      },
      {
        "value": "KW",
        "name": "科威特"
      },
      {
        "value": "KY",
        "name": "开曼群岛"
      },
      {
        "value": "KZ",
        "name": "哈萨克斯坦"
      },
      {
        "value": "LA",
        "name": "老挝"
      },
      {
        "value": "LB",
        "name": "黎巴嫩"
      },
      {
        "value": "LC",
        "name": "圣卢西亚"
      },
      {
        "value": "LI",
        "name": "列支敦士登"
      },
      {
        "value": "LK",
        "name": "斯里兰卡"
      },
      {
        "value": "LR",
        "name": "利比里亚"
      },
      {
        "value": "LS",
        "name": "莱索托"
      },
      {
        "value": "LT",
        "name": "立陶宛"
      },
      {
        "value": "LU",
        "name": "卢森堡"
      },
      {
        "value": "LV",
        "name": "拉脱维亚"
      },
      {
        "value": "LY",
        "name": "利比亚"
      },
      {
        "value": "MA",
        "name": "摩洛哥"
      },
      {
        "value": "MC",
        "name": "摩纳哥"
      },
      {
        "value": "MD",
        "name": "摩尔多瓦"
      },
      {
        "value": "ME",
        "name": "黑山"
      },
      {
        "value": "MF",
        "name": "法属圣马丁"
      },
      {
        "value": "MG",
        "name": "马达加斯加"
      },
      {
        "value": "MH",
        "name": "马绍尔群岛"
      },
      {
        "value": "MK",
        "name": "北马其顿"
      },
      {
        "value": "ML",
        "name": "马里"
      },
      {
        "value": "MM",
        "name": "缅甸"
      },
      {
        "value": "MN",
        "name": "蒙古"
      },
      {
        "value": "MO",
        "name": "澳门"
      },
      {
        "value": "MP",
        "name": "北马里亚纳群岛"
      },
      {
        "value": "MQ",
        "name": "马提尼克"
      },
      {
        "value": "MR",
        "name": "毛里塔尼亚"
      },
      {
        "value": "MS",
        "name": "蒙特塞拉特"
      },
      {
        "value": "MT",
        "name": "马耳他"
      },
      {
        "value": "MU",
        "name": "毛里求斯"
      },
      {
        "value": "MV",
        "name": "马尔代夫"
      },
      {
        "value": "MW",
        "name": "马拉维"
      },
      {
        "value": "MZ",
        "name": "莫桑比克"
      },
      {
        "value": "NA",
        "name": "纳米比亚"
      },
      {
        "value": "NC",
        "name": "新喀里多尼亚"
      },
      {
        "value": "NE",
        "name": "尼日尔"
      },
      {
        "value": "NF",
        "name": "诺福克岛"
      },
      {
        "value": "NG",
        "name": "尼日利亚"
      },
      {
        "value": "NI",
        "name": "尼加拉瓜"
      },
      {
        "value": "NL",
        "name": "荷兰"
      },
      {
        "value": "NO",
        "name": "挪威"
      },
      {
        "value": "NP",
        "name": "尼泊尔"
      },
      {
        "value": "NR",
        "name": "瑙鲁"
      },
      {
        "value": "NU",
        "name": "纽埃"
      },
      {
        "value": "OM",
        "name": "阿曼"
      },
      {
        "value": "PA",
        "name": "巴拿马"
      },
      {
        "value": "PE",
        "name": "秘鲁"
      },
      {
        "value": "PF",
        "name": "法属波利尼西亚"
      },
      {
        "value": "PG",
        "name": "巴布亚新几内亚"
      },
      {
        "value": "PM",
        "name": "圣皮埃尔和密克隆"
      },
      {
        "value": "PN",
        "name": "皮特凯恩群岛"
      },
      {
        "value": "PR",
        "name": "波多黎各"
      },
      {
        "value": "PS",
        "name": "巴勒斯坦"
      },
      {
        "value": "PT",
        "name": "葡萄牙"
      },
      {
        "value": "PK",
        "name": "巴基斯坦"
      },
      {
        "value": "PW",
        "name": "帕劳"
      },
      {
        "value": "PY",
        "name": "巴拉圭"
      },
      {
        "value": "QA",
        "name": "卡塔尔"
      },
      {
        "value": "RE",
        "name": "留尼汪"
      },
      {
        "value": "RO",
        "name": "罗马尼亚"
      },
      {
        "value": "RS",
        "name": "塞尔维亚"
      },
      {
        "value": "RW",
        "name": "卢旺达"
      },
      {
        "value": "SA",
        "name": "沙特阿拉伯"
      },
      {
        "value": "SB",
        "name": "所罗门群岛"
      },
      {
        "value": "SC",
        "name": "塞舌尔"
      },
      {
        "value": "SD",
        "name": "苏丹"
      },
      {
        "value": "SE",
        "name": "瑞典"
      },
      {
        "value": "SG",
        "name": "新加坡"
      },
      {
        "value": "SH",
        "name": "圣赫勒拿、阿森松和特里斯坦-达库尼亚"
      },
      {
        "value": "SI",
        "name": "斯洛文尼亚"
      },
      {
        "value": "SJ",
        "name": "斯瓦尔巴和扬马延"
      },
      {
        "value": "SK",
        "name": "斯洛伐克"
      },
      {
        "value": "SL",
        "name": "塞拉利昂"
      },
      {
        "value": "SM",
        "name": "圣马力诺"
      },
      {
        "value": "SN",
        "name": "塞内加尔"
      },
      {
        "value": "SO",
        "name": "索马里"
      },
      {
        "value": "SR",
        "name": "苏里南"
      },
      {
        "value": "SS",
        "name": "南苏丹"
      },
      {
        "value": "ST",
        "name": "圣多美和普林西比"
      },
      {
        "value": "SV",
        "name": "萨尔瓦多"
      },
      {
        "value": "SX",
        "name": "荷属圣马丁"
      },
      {
        "value": "SY",
        "name": "叙利亚"
      },
      {
        "value": "SZ",
        "name": "斯威士兰"
      },
      {
        "value": "TC",
        "name": "特克斯和凯科斯群岛"
      },
      {
        "value": "TD",
        "name": "乍得"
      },
      {
        "value": "TF",
        "name": "法属南部和南极领地"
      },
      {
        "value": "TG",
        "name": "多哥"
      },
      {
        "value": "TH",
        "name": "泰国"
      },
      {
        "value": "TJ",
        "name": "塔吉克斯坦"
      },
      {
        "value": "TK",
        "name": "托克劳"
      },
      {
        "value": "TL",
        "name": "东帝汶"
      },
      {
        "value": "TM",
        "name": "土库曼斯坦"
      },
      {
        "value": "TN",
        "name": "突尼斯"
      },
      {
        "value": "TO",
        "name": "汤加"
      },
      {
        "value": "TR",
        "name": "土耳其"
      },
      {
        "value": "TT",
        "name": "特立尼达和多巴哥"
      },
      {
        "value": "TV",
        "name": "图瓦卢"
      },
      {
        "value": "TZ",
        "name": "坦桑尼亚"
      },
      {
        "value": "UA",
        "name": "乌克兰"
      },
      {
        "value": "UG",
        "name": "乌干达"
      },
      {
        "value": "UM",
        "name": "美国本土外小岛屿"
      },
      {
        "value": "UY",
        "name": "乌拉圭"
      },
      {
        "value": "UZ",
        "name": "乌兹别克斯坦"
      },
      {
        "value": "VA",
        "name": "梵蒂冈"
      },
      {
        "value": "VC",
        "name": "圣文森特和格林纳丁斯"
      },
      {
        "value": "VE",
        "name": "委内瑞拉"
      },
      {
        "value": "VG",
        "name": "英属维尔京群岛"
      },
      {
        "value": "VI",
        "name": "美属维尔京群岛"
      },
      {
        "value": "VN",
        "name": "越南"
      },
      {
        "value": "VU",
        "name": "瓦努阿图"
      },
      {
        "value": "WF",
        "name": "瓦利斯和富图纳"
      },
      {
        "value": "WS",
        "name": "萨摩亚"
      },
      {
        "value": "YE",
        "name": "也门"
      },
      {
        "value": "AD",
        "name": "安道尔"
      },
      {
        "value": "AE",
        "name": "阿联酋"
      },
      {
        "value": "AF",
        "name": "阿富汗"
      },
      {
        "value": "AG",
        "name": "安提瓜和巴布达"
      },
      {
        "value": "YT",
        "name": "马约特"
      },
      {
        "value": "ZM",
        "name": "赞比亚"
      }
    ];
}

```

resumeInfo
```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <base href="https://teacherrecord.com/">
    <title>Resume - Fahimeh&nbsp;&nbsp;Amooee - TeacherRecord</title>
    <script async>
        let link = document.createElement("link"); link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css?family=Poppins:400,500,600,700|Roboto:300,400,500,600,700|Manrope:500,500,600,700&display=swap";
        document.head.appendChild(link);
    </script>
    <link rel="stylesheet" href="https://cdn-cn.teacherrecord.com/static/lib/layui/layui/css/layui.css" media="all">
    <link rel="stylesheet" href="https://cdn-cn.teacherrecord.com/static/sky/public/new.css" media="all">
    <link rel="stylesheet" href="https://cdn-cn.teacherrecord.com/static/sky/public/public.css?v2.7" media="all">
    <meta name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0">
</head>

<body>
    <style>
        body {
            background-color: #f8f8f8;
            font: 200 14px/24px 'Manrope', 'Poppins', 'Roboto', system-ui, -apple-system, 'Segoe UI', Arial, Verdana, Sans-Serif, sans-serif
        }

        .pop_staff {
            border-radius: 4px;
            margin: 15px auto 40px;
            max-width: 842px;
            border: 1px solid #f7f4f4;
            box-shadow: 0 0 10px 1px #fff
        }

        .div2>p {
            margin-bottom: 10px;
            padding: 6px;
            border-left: 5px solid #165dff;
            font-weight: 500;
            font-size: 1.25rem;
        }

        .div2>div {
            color: #404040e8
        }

        .div2>div strong {
            color: #000;
            font-weight: 500
        }

        .pimg {
            cursor: pointer
        }

        .warn_text {
            color: #ff5722;
            font-style: italic;
            text-decoration-line: line-through
        }

        .video_link {
            display: inline-block;
            overflow: hidden;
            width: 100%;
            text-overflow: ellipsis;
            white-space: nowrap
        }

        .pimg {
            margin-right: 40px !important;
            width: 150px !important;
            height: 150px !important;
            border-radius: 100% !important;
            box-shadow: 0 5px 40px 0 rgba(29, 29, 29, .2)
        }

        .html_cotent {
            padding: 10px 20px;
            border: 1px solid #e6e6e6;
            white-space: pre-line;
            border-radius: 6px;
        }

        .html_cotent b,
        .html_cotent i {
            font-weight: 400;
            font-style: normal
        }

        .pop_staff .user_card_info_top {
            margin-top: 7px
        }

        .tr_logo {
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }

        .tr_logo img {
            padding: 10px 0 0 10px;
            width: 300px;
        }

        .cert_img {
            color: #0086f1;
            text-decoration-line: underline;
            padding-left: 5px;
        }

        .toast {
            top: 50%;
            left: 50%;
            position: fixed;
            -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            border-radius: 5px;
            background: rgba(0, 0, 0, .7);
            color: #fff;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            text-align: center;
            padding: 10px;
            z-index: 13;
            -webkit-animation-duration: .5s;
            animation-duration: .5s
        }

        .toast.in {
            -webkit-animation-name: contentZoomIn;
            animation-name: contentZoomIn
        }

        .toast .iconfont {
            font-size: 30px;
            color: rgba(255, 255, 255, .8);
            margin-bottom: 10px;
            display: block
        }

        .toast .iconfont.icon-loading:before {
            display: block;
            -webkit-transform: rotate(360deg);
            animation: rotation 2.7s linear infinite
        }

        .toast .text {
            text-align: center;
            max-width: 300px;
            color: #fff;
            font-size: 14px
        }

        .notice {
            color: red !important;
            text-align: center;
            font-weight: bold;
            max-width: 800px;
            padding: 20px;
            margin: 0 auto;
            margin-top: 100px
        }

        .tag .tag-badge {
            height: unset;
            padding: 0 5px;
            line-height: 20px;
        }

        .pop_staff .div2>div.expectation-item+.expectation-item:before {
            content: ' ';
            display: block;
            margin-top: -10px;
            margin-bottom: 10px;
            border-bottom: 1px dashed #e6e6e6;
        }

        #ua-info i.layui-icon {
            margin-left: 0px;
        }

        .tooltip {
            position: relative;
            display: inline-block;
            cursor: pointer
        }

        .tooltip .tooltiptext {
            visibility: hidden;
            width: 120px;
            background-color: #555;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 5px 0;
            position: absolute;
            z-index: 1;
            top: 150%;
            left: 50%;
            margin-left: -60px
        }

        .tooltip .tooltiptext::after {
            content: "";
            position: absolute;
            bottom: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent transparent #555 transparent
        }

        .tooltip:hover .tooltiptext {
            visibility: visible
        }

        .tooltip .tooltiptext {
            opacity: 0;
            transition: .35s
        }

        .tooltip:hover .tooltiptext {
            opacity: 1
        }

        @-webkit-keyframes rotation {
            from {
                -webkit-transform: rotate(0deg);
            }

            to {
                -webkit-transform: rotate(360deg);
            }
        }

        @-webkit-keyframes contentZoomIn {
            0% {
                -webkit-transform: translate(-50%, -70%);
                transform: translate(-50%, -70%);
                opacity: 0
            }

            100% {
                -webkit-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
                opacity: 1
            }
        }

        @-webkit-keyframes contentZoomIn {
            0% {
                -webkit-transform: translate(-50%, -70%);
                transform: translate(-50%, -70%);
                opacity: 0
            }

            100% {
                -webkit-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
                opacity: 1
            }
        }

        @keyframes contentZoomIn {
            0% {
                -webkit-transform: translate(-50%, -70%);
                transform: translate(-50%, -70%);
                opacity: 0
            }

            100% {
                -webkit-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
                opacity: 1
            }
        }

        @-webkit-keyframes contentZoomOut {
            0% {
                -webkit-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
                opacity: 1
            }

            100% {
                -webkit-transform: translate(-50%, -30%);
                transform: translate(-50%, -30%);
                opacity: 0
            }
        }

        @keyframes contentZoomOut {
            0% {
                -webkit-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
                opacity: 1
            }

            100% {
                -webkit-transform: translate(-50%, -30%);
                transform: translate(-50%, -30%);
                opacity: 0
            }
        }

        @media screen and (max-width: 500px) {
            body {
                background-color: #fff
            }

            .pop_staff {
                margin-top: unset;
                margin-bottom: unset;
                border: none;
                box-shadow: unset
            }

            .pop_staff .div1 .pimg {
                margin-top: 10px;
                margin-right: 15px !important;
                width: 25% !important;
                height: 25% !important
            }

            .pop_staff .user_card_info_top {
                margin-top: unset
            }
        }
    </style>
    <div>
        <div id="outerdiv"
            style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:2;width:100%;height:100%;display:none;">
            <div id="innerdiv" style="position:absolute;">
                <img id="bigimg" style="background: #fff;border:5px solid #9e9e9e;" src="" /><svg id="bigimgCover"
                    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    style="margin: auto; background: none; display: block;" width="100px" height="100px"
                    viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                    <g transform="translate(80,50)">
                        <g transform="rotate(0)">
                            <circle cx="0" cy="0" r="6" fill="#ffffff" fill-opacity="1"
                                transform="scale(1.20713 1.20713)">
                                <animateTransform attributeName="transform" type="scale" begin="-1.1666666666666665s"
                                    values="1.5 1.5;1 1" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite"></animateTransform>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite" values="1;0" begin="-1.1666666666666665s"></animate>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(71.21320343559643,71.21320343559643)">
                        <g transform="rotate(45)">
                            <circle cx="0" cy="0" r="6" fill="#ffffff" fill-opacity="0.875"
                                transform="scale(1.26963 1.26963)">
                                <animateTransform attributeName="transform" type="scale" begin="-0.9999999999999999s"
                                    values="1.5 1.5;1 1" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite"></animateTransform>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite" values="1;0" begin="-0.9999999999999999s"></animate>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(50,80)">
                        <g transform="rotate(90)">
                            <circle cx="0" cy="0" r="6" fill="#ffffff" fill-opacity="0.75"
                                transform="scale(1.33213 1.33213)">
                                <animateTransform attributeName="transform" type="scale" begin="-0.8333333333333333s"
                                    values="1.5 1.5;1 1" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite"></animateTransform>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite" values="1;0" begin="-0.8333333333333333s"></animate>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(28.786796564403577,71.21320343559643)">
                        <g transform="rotate(135)">
                            <circle cx="0" cy="0" r="6" fill="#ffffff" fill-opacity="0.625"
                                transform="scale(1.39463 1.39463)">
                                <animateTransform attributeName="transform" type="scale" begin="-0.6666666666666665s"
                                    values="1.5 1.5;1 1" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite"></animateTransform>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite" values="1;0" begin="-0.6666666666666665s"></animate>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(20,50.00000000000001)">
                        <g transform="rotate(180)">
                            <circle cx="0" cy="0" r="6" fill="#ffffff" fill-opacity="0.5"
                                transform="scale(1.45713 1.45713)">
                                <animateTransform attributeName="transform" type="scale" begin="-0.49999999999999994s"
                                    values="1.5 1.5;1 1" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite"></animateTransform>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite" values="1;0" begin="-0.49999999999999994s"></animate>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(28.78679656440357,28.786796564403577)">
                        <g transform="rotate(225)">
                            <circle cx="0" cy="0" r="6" fill="#ffffff" fill-opacity="0.375"
                                transform="scale(1.01963 1.01963)">
                                <animateTransform attributeName="transform" type="scale" begin="-0.33333333333333326s"
                                    values="1.5 1.5;1 1" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite"></animateTransform>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite" values="1;0" begin="-0.33333333333333326s"></animate>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(49.99999999999999,20)">
                        <g transform="rotate(270)">
                            <circle cx="0" cy="0" r="6" fill="#ffffff" fill-opacity="0.25"
                                transform="scale(1.08213 1.08213)">
                                <animateTransform attributeName="transform" type="scale" begin="-0.16666666666666663s"
                                    values="1.5 1.5;1 1" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite"></animateTransform>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite" values="1;0" begin="-0.16666666666666663s"></animate>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(71.21320343559643,28.78679656440357)">
                        <g transform="rotate(315)">
                            <circle cx="0" cy="0" r="6" fill="#ffffff" fill-opacity="0.125"
                                transform="scale(1.14463 1.14463)">
                                <animateTransform attributeName="transform" type="scale" begin="0s" values="1.5 1.5;1 1"
                                    keyTimes="0;1" dur="1.333333333333333s" repeatCount="indefinite"></animateTransform>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1.333333333333333s"
                                    repeatCount="indefinite" values="1;0" begin="0s"></animate>
                            </circle>
                        </g>
                    </g>
                </svg></div>
        </div>
        <div
            style="position: fixed;top: 15%;right:0px;background: #FFFFFF;padding-top: 9px;padding-left: 9px;border-radius: 4px 0 0 4px;z-index: 999;border: #008bff61 1px solid;border-right: 0;">
            <div class="layui-btn-container" style="width: 110px;">
                <div class="layui-btn layui-btn-sm layui-btn-normal share">
                    <i class="layui-icon layui-icon-share"></i>Share CV</div>
                <div class="layui-btn layui-btn-sm layui-btn-info set_lang" data-lang="en">
                    <i class="layui-icon layui-icon-menu-fill"></i>Language</div>
                <div class="layui-btn layui-btn-sm layui-btn-primary" onclick="makePdf()">
                    <i class="layui-icon layui-icon-download-circle"></i>Download</div>
            </div>
        </div>
        <div class='pop_staff' id="pdf_content">
            <div id="wm_content">
                <div class='div1'><img class="pimg" title="点击查看大图" src="https://cdn-cn.teacherrecord.com/upload/20250820/1140592-14a0c800183a209b2a7380efb13d0045.jpg!tx_img" data-src="https://cdn-cn.teacherrecord.com/upload/20250820/1140592-14a0c800183a209b2a7380efb13d0045.jpg">
                    <div class="user_card_info_top">
                        <p>Fahimeh&nbsp;&nbsp;Amooee<i class="layui-icon layui-icon-female"></i></p>
                        <p style="font-size: 14px;padding: 0;">伊朗 ⁄ 研究生</p>
                        <p style="font-size: 14px;padding: 0;">证书: TEFL</p>
                        <p style="font-size: 14px;padding: 0;">工作种类: Teach Online</p>
                        <p style="font-size: 14px;padding: 0;">简历编号:TR90901140592</p>
                        <div id="ua-info" style="display:flex;flex-wrap: wrap;flex-direction: column;">
                            <div>
                                <i class="layui-icon layui-icon-location"></i>&nbsp;使用[<span class="iso2_country">IR</span>]网络
                                <span id="showIpInfo" style="color:#FF0000; margin-left: 8px;"></span>
                            </div>
                            <div style="display: flex;gap: 5px"><i class="layui-icon layui-icon-time"></i>2026-02-19
                                21:34:48<i class="layui-icon layui-icon-vercode"></i>dac079c3f0cecbc946888e0bf607c5fc
                            </div>
                        </div>
                    </div>
                    <div class="clear"></div>
                </div>
                <div class='div2'>
                    <p>个人资料</p>
                    <div><strong>名称: </strong>Fahimeh&nbsp;&nbsp;Amooee<br/><strong>年龄: </strong>47
                        岁<br/><strong>国籍: </strong>伊朗<br/><strong>性别: </strong>女<br/><strong>当前所在国家: </strong>伊朗<br/><strong>教学年限: </strong>5年以上<br/><strong>会讲的语言: </strong>English<br/><strong>授课语言: </strong>英语<br/><strong>授课科目: </strong>语言类<br/><strong>VCR介绍视频: </strong><span class="tag-item" style="margin-left: 5px;text-decoration: underline;">审核中</span><br/><strong>教学证书:</strong>
                        <table class="layui-table" style="margin: 4px 0;" lay-size="sm">
                            <colgroup>
                                <col>
                                <col>
                                <col width="80">
                                <col width="80">
                                <col width="80">
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style="text-align: center">证书名称</th>
                                    <th style="text-align: center">颁发机构</th>
                                    <th style="text-align: center">颁发日期</th>
                                    <th style="text-align: center">有效期</th>
                                    <th style="text-align: center">查看附件</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Teaching Certificate</td>
                                    <td></td>
                                    <td style="text-align: center"></td>
                                    <td style="text-align: center"></td>

                                    <td style="text-align: center">
                                        <div class="tooltip" style="width: 100%;text-align: center;">
                                            <span class="tooltiptext">未上传附件</span>
                                            <div style="color: #9E9E9E;">-</div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Degree</td>
                                    <td></td>
                                    <td style="text-align: center"></td>
                                    <td style="text-align: center"></td>

                                    <td style="text-align: center">
                                        <div class="tooltip" style="width: 100%;text-align: center;">
                                            <span class="tooltiptext">未上传附件</span>
                                            <div style="color: #9E9E9E;">-</div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>TR TEFL</td>
                                    <td>TEFL Professional Institute - TeacherRecord</td>
                                    <td style="text-align: center">2025/07 </td>
                                    <td style="text-align: center">长期</td>

                                    <td style="text-align: center">
                                        <a class="cert_img" href="javascript:;"
                                            data-src="https://cdn-cn.teacherrecord.com/https://teacherrecord.com/img/svg?token=HKEK4SrER.j_cpzzay_kfOj0Vq5PhAPA3QZ3q.zLBZQ1TPDl4Wg9QpZQfdWgxJ0VXsfT3ct2YN1ubpmGmK2jmRGMpSunrfalAbUkmbhRbNzmE1BLJSkMk4UBHA9IowuOoBgSoFZHJTQgoOVwtmJT8g_DnFEXEz36fnATmZAqJIHITprK5ww.zbORN0PDf3AX">查看附件</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>CELTA</td>
                                    <td>Cambridge English (ITI CELTA, Istanbul )</td>
                                    <td style="text-align: center">2019/04 </td>
                                    <td style="text-align: center">长期</td>

                                    <td style="text-align: center">
                                        <a class="cert_img" href="javascript:;"
                                            data-src="https://cdn-cn.teacherrecord.com/upload/20251211/1140592-f368247427ff45e09e16fd76069d89f7.jpg">查看附件</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table><strong>教育经历:</strong>
                        <table class="layui-table" style="margin: 4px 0;" lay-size="sm">
                            <colgroup>
                                <col width="150">
                                <col>
                                <col>
                                <col width="150">
                                <col width="150">
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>学历</th>
                                    <th>学校名称</th>
                                    <th>专业</th>
                                    <th style="text-align: center">所在国家</th>
                                    <th style="text-align: center">时间</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>本科</td>
                                    <td>Azad university of Tonekabon</td>
                                    <td>Molecular and Cellular Biology </td>
                                    <td style="text-align: center">伊朗</td>
                                    <td>1999/09 - 2003/02</td>
                                </tr>
                                <tr>
                                    <td>研究生</td>
                                    <td>University of Toronto</td>
                                    <td>Applied Linguistics</td>
                                    <td style="text-align: center">加拿大</td>
                                    <td>2005/08 - 2007/05</td>
                                </tr>
                            </tbody>
                        </table><strong>工作经历: </strong>
                        <table class="layui-table" style="margin: 4px 0;" lay-size="sm">
                            <colgroup>
                                <col>
                                <col width="200">
                                <col width="150">
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>公司/平台名称</th>
                                    <th style="text-align: center">所在国家/城市</th>
                                    <th style="text-align: center">时间</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Safir Culture and Art Institute</td>
                                    <td style="text-align: center"> Online
                                    </td>
                                    <td>2019/09 - 至今</td>
                                </tr>
                                <tr>
                                    <td>Safir Gofteman English Language Academy</td>
                                    <td style="text-align: center">伊朗</td>
                                    <td>2016/03 - 2019/09</td>
                                </tr>
                                <tr>
                                    <td>Safir Gofteman English Language Academy</td>
                                    <td style="text-align: center">伊朗</td>
                                    <td>2012/03 - 2016/09</td>
                                </tr>
                                <tr>
                                    <td>Different platforms</td>
                                    <td style="text-align: center"> Online
                                    </td>
                                    <td>2015/03 - 至今</td>
                                </tr>
                            </tbody>
                        </table><br/><strong>自我介绍: </strong><br />
                        <div class="html_cotent">
                            <div>Dynamic and results-driven English teacher with 15 years of experience in both group
                                classes (6–16 students) and private one-on-one sessions, delivered online and in-person.
                                With 8 years in language centers and 7 years in online instruction, I teach learners of
                                all ages and proficiency levels—from young learners to adults.

                                Certified in TEFL and CELTA, I specialize in tailored lessons for general English, IELTS
                                and exam preparation, business communication, travel English, and job interview
                                readiness. My student-centered approach emphasizes engaging, interactive lessons that
                                build confidence, improve fluency, and foster a lasting love for the English language.

                                With over a decade of freelance online teaching experience, I adapt lessons to
                                individual learning styles, using diverse tools and resources to create effective,
                                flexible learning experiences for students worldwide. I consistently receive positive
                                feedback for delivering personalized instruction that enhances speaking, writing,
                                listening, and reading skills.

                                Outside of teaching, I am a lifelong learner and advocate for well-rounded development.
                                I enjoy watching English movies to deepen my cultural and linguistic understanding and
                                swimming to maintain discipline, perseverance, and a healthy lifestyle—principles I
                                bring into my teaching philosophy. I am also dedicated to continually enhancing my
                                skills and knowledge, staying current with advancements in teaching methodologies,
                                language trends, and educational technology. My long-term goal is to contribute to the
                                development of programs that bridge language barriers and create more opportunities for
                                cross-cultural communication.<br /></div>
                        </div><br/><strong> 工作经验描述: </strong><br/>
                        <div class="html_cotent"></div>
                    </div>
                    <p class="private_info">隐私信息</p>
                    <div class="private_info">
                        <div style="display: flex"><strong>邮箱:&nbsp;</strong><a href="/cdn-cgi/l/email-protection"
                                class="__cf_email__"
                                data-cfemail="0b6d6a6362666e636a66647e6e6e4b6c666a626725686466">[email&#160;protected]</a>
                            <div title="Copy" style="cursor: pointer;margin-left: 5px"
                                onClick="copyText('fahimehamouee@gmail.com')"><svg viewBox="0 0 1024 1024" version="1.1"
                                    xmlns="http://www.w3.org/2000/svg" p-id="4060" width="18" height="18">
                                    <path
                                        d="M394.666667 106.666667h448a74.666667 74.666667 0 0 1 74.666666 74.666666v448a74.666667 74.666667 0 0 1-74.666666 74.666667H394.666667a74.666667 74.666667 0 0 1-74.666667-74.666667V181.333333a74.666667 74.666667 0 0 1 74.666667-74.666666z m0 64a10.666667 10.666667 0 0 0-10.666667 10.666666v448a10.666667 10.666667 0 0 0 10.666667 10.666667h448a10.666667 10.666667 0 0 0 10.666666-10.666667V181.333333a10.666667 10.666667 0 0 0-10.666666-10.666666H394.666667z m245.333333 597.333333a32 32 0 0 1 64 0v74.666667a74.666667 74.666667 0 0 1-74.666667 74.666666H181.333333a74.666667 74.666667 0 0 1-74.666666-74.666666V394.666667a74.666667 74.666667 0 0 1 74.666666-74.666667h74.666667a32 32 0 0 1 0 64h-74.666667a10.666667 10.666667 0 0 0-10.666666 10.666667v448a10.666667 10.666667 0 0 0 10.666666 10.666666h448a10.666667 10.666667 0 0 0 10.666667-10.666666v-74.666667z"
                                        fill="#1296db" p-id="4061"></path>
                                </svg></div>
                        </div>
                        <div style="display: flex"><strong>Teams:&nbsp;</strong><a href="/cdn-cgi/l/email-protection"
                                class="__cf_email__"
                                data-cfemail="e680878e8f8b838e878b899383a6818b878f8ac885898b">[email&#160;protected]</a>
                            <div title="Copy" style="cursor: pointer;margin-left: 5px"
                                onClick="copyText('fahimehamoue@gmail.com')"><svg viewBox="0 0 1024 1024" version="1.1"
                                    xmlns="http://www.w3.org/2000/svg" p-id="4060" width="18" height="18">
                                    <path
                                        d="M394.666667 106.666667h448a74.666667 74.666667 0 0 1 74.666666 74.666666v448a74.666667 74.666667 0 0 1-74.666666 74.666667H394.666667a74.666667 74.666667 0 0 1-74.666667-74.666667V181.333333a74.666667 74.666667 0 0 1 74.666667-74.666666z m0 64a10.666667 10.666667 0 0 0-10.666667 10.666666v448a10.666667 10.666667 0 0 0 10.666667 10.666667h448a10.666667 10.666667 0 0 0 10.666666-10.666667V181.333333a10.666667 10.666667 0 0 0-10.666666-10.666666H394.666667z m245.333333 597.333333a32 32 0 0 1 64 0v74.666667a74.666667 74.666667 0 0 1-74.666667 74.666666H181.333333a74.666667 74.666667 0 0 1-74.666666-74.666666V394.666667a74.666667 74.666667 0 0 1 74.666666-74.666667h74.666667a32 32 0 0 1 0 64h-74.666667a10.666667 10.666667 0 0 0-10.666666 10.666667v448a10.666667 10.666667 0 0 0 10.666666 10.666666h448a10.666667 10.666667 0 0 0 10.666667-10.666666v-74.666667z"
                                        fill="#1296db" p-id="4061"></path>
                                </svg></div>
                        </div>
                        <div style="display: flex"><strong>WhatsApp:&nbsp;</strong>+989362619849<div title="Copy"
                                style="cursor: pointer;margin-left: 5px" onClick="copyText('+989362619849')"><svg
                                    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4060"
                                    width="18" height="18">
                                    <path
                                        d="M394.666667 106.666667h448a74.666667 74.666667 0 0 1 74.666666 74.666666v448a74.666667 74.666667 0 0 1-74.666666 74.666667H394.666667a74.666667 74.666667 0 0 1-74.666667-74.666667V181.333333a74.666667 74.666667 0 0 1 74.666667-74.666666z m0 64a10.666667 10.666667 0 0 0-10.666667 10.666666v448a10.666667 10.666667 0 0 0 10.666667 10.666667h448a10.666667 10.666667 0 0 0 10.666666-10.666667V181.333333a10.666667 10.666667 0 0 0-10.666666-10.666666H394.666667z m245.333333 597.333333a32 32 0 0 1 64 0v74.666667a74.666667 74.666667 0 0 1-74.666667 74.666666H181.333333a74.666667 74.666667 0 0 1-74.666666-74.666666V394.666667a74.666667 74.666667 0 0 1 74.666666-74.666667h74.666667a32 32 0 0 1 0 64h-74.666667a10.666667 10.666667 0 0 0-10.666666 10.666667v448a10.666667 10.666667 0 0 0 10.666666 10.666666h448a10.666667 10.666667 0 0 0 10.666667-10.666666v-74.666667z"
                                        fill="#1296db" p-id="4061"></path>
                                </svg></div>
                        </div>
                        <div style="display: flex"><strong>电话号码:&nbsp;</strong>+989362619849<div title="Copy"
                                style="cursor: pointer;margin-left: 5px" onClick="copyText('+989362619849')"><svg
                                    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4060"
                                    width="18" height="18">
                                    <path
                                        d="M394.666667 106.666667h448a74.666667 74.666667 0 0 1 74.666666 74.666666v448a74.666667 74.666667 0 0 1-74.666666 74.666667H394.666667a74.666667 74.666667 0 0 1-74.666667-74.666667V181.333333a74.666667 74.666667 0 0 1 74.666667-74.666666z m0 64a10.666667 10.666667 0 0 0-10.666667 10.666666v448a10.666667 10.666667 0 0 0 10.666667 10.666667h448a10.666667 10.666667 0 0 0 10.666666-10.666667V181.333333a10.666667 10.666667 0 0 0-10.666666-10.666666H394.666667z m245.333333 597.333333a32 32 0 0 1 64 0v74.666667a74.666667 74.666667 0 0 1-74.666667 74.666666H181.333333a74.666667 74.666667 0 0 1-74.666666-74.666666V394.666667a74.666667 74.666667 0 0 1 74.666666-74.666667h74.666667a32 32 0 0 1 0 64h-74.666667a10.666667 10.666667 0 0 0-10.666666 10.666667v448a10.666667 10.666667 0 0 0 10.666666 10.666666h448a10.666667 10.666667 0 0 0 10.666667-10.666666v-74.666667z"
                                        fill="#1296db" p-id="4061"></path>
                                </svg></div>
                        </div>
                        <div style="display: flex"><strong>护照ID:&nbsp;</strong>B61750656<div title="Copy"
                                style="cursor: pointer;margin-left: 5px" onClick="copyText('B61750656')"><svg
                                    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4060"
                                    width="18" height="18">
                                    <path
                                        d="M394.666667 106.666667h448a74.666667 74.666667 0 0 1 74.666666 74.666666v448a74.666667 74.666667 0 0 1-74.666666 74.666667H394.666667a74.666667 74.666667 0 0 1-74.666667-74.666667V181.333333a74.666667 74.666667 0 0 1 74.666667-74.666666z m0 64a10.666667 10.666667 0 0 0-10.666667 10.666666v448a10.666667 10.666667 0 0 0 10.666667 10.666667h448a10.666667 10.666667 0 0 0 10.666666-10.666667V181.333333a10.666667 10.666667 0 0 0-10.666666-10.666666H394.666667z m245.333333 597.333333a32 32 0 0 1 64 0v74.666667a74.666667 74.666667 0 0 1-74.666667 74.666666H181.333333a74.666667 74.666667 0 0 1-74.666666-74.666666V394.666667a74.666667 74.666667 0 0 1 74.666666-74.666667h74.666667a32 32 0 0 1 0 64h-74.666667a10.666667 10.666667 0 0 0-10.666666 10.666667v448a10.666667 10.666667 0 0 0 10.666666 10.666666h448a10.666667 10.666667 0 0 0 10.666667-10.666666v-74.666667z"
                                        fill="#1296db" p-id="4061"></path>
                                </svg></div>
                        </div>
                    </div>
                    <p style="margin-top: 20px">工作期望</p>
                    <div class="expectation-item">
                        <strong>工作种类: </strong> Teach Online<br/>

                        <strong>周工作时长:</strong> 30-40小时<br/>
                        <strong>周工作几天: </strong>
                        7 天
                        <br/>
                        <strong>每天工作时间段: </strong>
                        09:00-23:00 (北京时间)
                        <br/>
                        <strong>期望薪资: </strong>
                        8-20 美元
                        ⁄ 时薪
                        - 接受面议 <br/>
                        <strong>薪资支付方式: </strong> Payoneer , PayPal <br/>
                        <strong>学生年龄范围: </strong>3-12岁, 13-18岁, 18岁以上<br/>
                    </div>
                    <div class="notice">
                        声明:本简历仅供 Rancca Education 招聘使用,禁止用于其他任何用途。 <br>
                    一经发现我司有权采取一切必要措施,包括但不限于暫停或终止服务
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>
    <script src="https://cdn-cn.teacherrecord.com/static/sky/public/jquery.min.js"></script>
    <script src="https://cdn-cn.teacherrecord.com/static/sky/public/watermark.min.js?v=1.3"></script>
    <script>
        watermark.init({"watermark_parent_node":"wm_content","watermark_txt": `TeacherRecord.com<br/>Rancca Education`,"watermark_x_space":150,"watermark_y_space":75,"watermark_fontsize":"18px","watermark_alpha":0.058,"watermark_angle":45,"watermark_width":240})
    function toast(a){"string"==typeof a&&(a={msg:a});if(a.msg){var b=document.createElement("div");b.id="toastId";b.classList.add("toast","in");b.innerHTML='<p class="text">'+a.msg+"</p>";var c=document.getElementById("toastId");if(null==c){document.body.appendChild(b);c=document.getElementById("toastId");c.classList.add("in");var f=setTimeout(function(){c.classList.remove("in");clearInterval(f);document.body.removeChild(b)},a.time||2E3)}}else console.error("text \u4e0d\u80fd\u4e3a\u7a7a!")}
    function copyText(text,_msg){toast({time:3000,msg:_msg || '复制成功!'});if(!navigator.clipboard&&window.isSecureContext){return navigator.clipboard.writeText(text)}else{if(!document.execCommand('copy'))return Promise.reject();const textArea=document.createElement('textarea');textArea.style.position='fixed';textArea.style.top=textArea.style.left='-100vh';textArea.style.opacity='0';textArea.value=text;document.body.appendChild(textArea);textArea.focus();textArea.select();return new Promise((resolve,reject)=>{document.execCommand('copy')?resolve():reject();textArea.remove();})}}
    </script>
    <script>
        var iso2_country=[{"value":"CN","name":"中国"},{"value":"TW","name":"中国台湾"},{"value":"GB","name":"英国"},{"value":"US","name":"美国"},{"value":"AU","name":"澳大利亚"},{"value":"CA","name":"加拿大"},{"value":"NZ","name":"新西兰"},{"value":"JP","name":"日本"},{"value":"ZA","name":"南非"},{"value":"RU","name":"俄罗斯"},{"value":"ZW","name":"津巴布韦"},{"value":"IT","name":"意大利"},{"value":"MX","name":"墨西哥"},{"value":"MY","name":"马来西亚"},{"value":"PH","name":"菲律宾"},{"value":"PL","name":"波兰"},{"value":"AI","name":"安圭拉"},{"value":"AL","name":"阿尔巴尼亚"},{"value":"AM","name":"亚美尼亚"},{"value":"AO","name":"安哥拉"},{"value":"AQ","name":"南极洲"},{"value":"AR","name":"阿根廷"},{"value":"AS","name":"美属萨摩亚"},{"value":"AT","name":"奥地利"},{"value":"AW","name":"阿鲁巴"},{"value":"AX","name":"奥兰"},{"value":"AZ","name":"阿塞拜疆"},{"value":"BA","name":"波黑"},{"value":"BB","name":"巴巴多斯"},{"value":"BD","name":"孟加拉国"},{"value":"BE","name":"比利时"},{"value":"BF","name":"布基纳法索"},{"value":"BG","name":"保加利亚"},{"value":"BH","name":"巴林"},{"value":"BI","name":"布隆迪"},{"value":"BJ","name":"贝宁"},{"value":"BL","name":"圣巴泰勒米"},{"value":"BM","name":"百慕大"},{"value":"BN","name":"文莱"},{"value":"BO","name":"玻利维亚"},{"value":"BQ","name":"荷兰加勒比区"},{"value":"BR","name":"巴西"},{"value":"BS","name":"巴哈马"},{"value":"BT","name":"不丹"},{"value":"BV","name":"布韦岛"},{"value":"BW","name":"博茨瓦纳"},{"value":"BY","name":"白俄罗斯"},{"value":"BZ","name":"伯利兹"},{"value":"CC","name":"科科斯（基林）群岛"},{"value":"CD","name":"刚果民主共和国"},{"value":"CF","name":"中非"},{"value":"CG","name":"刚果共和国"},{"value":"CH","name":"瑞士"},{"value":"CI","name":"科特迪瓦"},{"value":"CK","name":"库克群岛"},{"value":"CL","name":"智利"},{"value":"CM","name":"喀麦隆"},{"value":"CO","name":"哥伦比亚"},{"value":"CR","name":"哥斯达黎加"},{"value":"CU","name":"古巴"},{"value":"CV","name":"佛得角"},{"value":"CW","name":"库拉索"},{"value":"CX","name":"圣诞岛"},{"value":"CY","name":"塞浦路斯"},{"value":"CZ","name":"捷克"},{"value":"DE","name":"德国"},{"value":"DJ","name":"吉布提"},{"value":"DK","name":"丹麦"},{"value":"DM","name":"多米尼克"},{"value":"DO","name":"多米尼加"},{"value":"DZ","name":"阿尔及利亚"},{"value":"EC","name":"厄瓜多尔"},{"value":"EE","name":"爱沙尼亚"},{"value":"EG","name":"埃及"},{"value":"EH","name":"西撒哈拉"},{"value":"ER","name":"厄立特里亚"},{"value":"ES","name":"西班牙"},{"value":"ET","name":"埃塞俄比亚"},{"value":"FI","name":"芬兰"},{"value":"FJ","name":"斐济"},{"value":"FK","name":"福克兰群岛"},{"value":"FM","name":"密克罗尼西亚联邦"},{"value":"FO","name":"法罗群岛"},{"value":"FR","name":"法国"},{"value":"GA","name":"加蓬"},{"value":"GD","name":"格林纳达"},{"value":"GE","name":"格鲁吉亚"},{"value":"GF","name":"法属圭亚那"},{"value":"GG","name":"根西"},{"value":"GH","name":"加纳"},{"value":"GI","name":"直布罗陀"},{"value":"GL","name":"格陵兰"},{"value":"GM","name":"冈比亚"},{"value":"GN","name":"几内亚"},{"value":"GP","name":"瓜德罗普"},{"value":"GQ","name":"赤道几内亚"},{"value":"GR","name":"希腊"},{"value":"GS","name":"南乔治亚和南桑威奇群岛"},{"value":"GT","name":"危地马拉"},{"value":"GU","name":"关岛"},{"value":"GW","name":"几内亚比绍"},{"value":"GY","name":"圭亚那"},{"value":"HK","name":"香港"},{"value":"HM","name":"赫德岛和麦克唐纳群岛"},{"value":"HN","name":"洪都拉斯"},{"value":"HR","name":"克罗地亚"},{"value":"HT","name":"海地"},{"value":"HU","name":"匈牙利"},{"value":"ID","name":"印尼"},{"value":"IE","name":"爱尔兰"},{"value":"IL","name":"以色列"},{"value":"IM","name":"马恩岛"},{"value":"IN","name":"印度"},{"value":"IO","name":"英属印度洋领地"},{"value":"IQ","name":"伊拉克"},{"value":"IR","name":"伊朗"},{"value":"IS","name":"冰岛"},{"value":"JE","name":"泽西"},{"value":"JM","name":"牙买加"},{"value":"JO","name":"约旦"},{"value":"KE","name":"肯尼亚"},{"value":"KG","name":"吉尔吉斯斯坦"},{"value":"KH","name":"柬埔寨"},{"value":"KI","name":"基里巴斯"},{"value":"KM","name":"科摩罗"},{"value":"KN","name":"圣基茨和尼维斯"},{"value":"KP","name":"朝鲜"},{"value":"KR","name":"韩国"},{"value":"KW","name":"科威特"},{"value":"KY","name":"开曼群岛"},{"value":"KZ","name":"哈萨克斯坦"},{"value":"LA","name":"老挝"},{"value":"LB","name":"黎巴嫩"},{"value":"LC","name":"圣卢西亚"},{"value":"LI","name":"列支敦士登"},{"value":"LK","name":"斯里兰卡"},{"value":"LR","name":"利比里亚"},{"value":"LS","name":"莱索托"},{"value":"LT","name":"立陶宛"},{"value":"LU","name":"卢森堡"},{"value":"LV","name":"拉脱维亚"},{"value":"LY","name":"利比亚"},{"value":"MA","name":"摩洛哥"},{"value":"MC","name":"摩纳哥"},{"value":"MD","name":"摩尔多瓦"},{"value":"ME","name":"黑山"},{"value":"MF","name":"法属圣马丁"},{"value":"MG","name":"马达加斯加"},{"value":"MH","name":"马绍尔群岛"},{"value":"MK","name":"北马其顿"},{"value":"ML","name":"马里"},{"value":"MM","name":"缅甸"},{"value":"MN","name":"蒙古"},{"value":"MO","name":"澳门"},{"value":"MP","name":"北马里亚纳群岛"},{"value":"MQ","name":"马提尼克"},{"value":"MR","name":"毛里塔尼亚"},{"value":"MS","name":"蒙特塞拉特"},{"value":"MT","name":"马耳他"},{"value":"MU","name":"毛里求斯"},{"value":"MV","name":"马尔代夫"},{"value":"MW","name":"马拉维"},{"value":"MZ","name":"莫桑比克"},{"value":"NA","name":"纳米比亚"},{"value":"NC","name":"新喀里多尼亚"},{"value":"NE","name":"尼日尔"},{"value":"NF","name":"诺福克岛"},{"value":"NG","name":"尼日利亚"},{"value":"NI","name":"尼加拉瓜"},{"value":"NL","name":"荷兰"},{"value":"NO","name":"挪威"},{"value":"NP","name":"尼泊尔"},{"value":"NR","name":"瑙鲁"},{"value":"NU","name":"纽埃"},{"value":"OM","name":"阿曼"},{"value":"PA","name":"巴拿马"},{"value":"PE","name":"秘鲁"},{"value":"PF","name":"法属波利尼西亚"},{"value":"PG","name":"巴布亚新几内亚"},{"value":"PM","name":"圣皮埃尔和密克隆"},{"value":"PN","name":"皮特凯恩群岛"},{"value":"PR","name":"波多黎各"},{"value":"PS","name":"巴勒斯坦"},{"value":"PT","name":"葡萄牙"},{"value":"PK","name":"巴基斯坦"},{"value":"PW","name":"帕劳"},{"value":"PY","name":"巴拉圭"},{"value":"QA","name":"卡塔尔"},{"value":"RE","name":"留尼汪"},{"value":"RO","name":"罗马尼亚"},{"value":"RS","name":"塞尔维亚"},{"value":"RW","name":"卢旺达"},{"value":"SA","name":"沙特阿拉伯"},{"value":"SB","name":"所罗门群岛"},{"value":"SC","name":"塞舌尔"},{"value":"SD","name":"苏丹"},{"value":"SE","name":"瑞典"},{"value":"SG","name":"新加坡"},{"value":"SH","name":"圣赫勒拿、阿森松和特里斯坦-达库尼亚"},{"value":"SI","name":"斯洛文尼亚"},{"value":"SJ","name":"斯瓦尔巴和扬马延"},{"value":"SK","name":"斯洛伐克"},{"value":"SL","name":"塞拉利昂"},{"value":"SM","name":"圣马力诺"},{"value":"SN","name":"塞内加尔"},{"value":"SO","name":"索马里"},{"value":"SR","name":"苏里南"},{"value":"SS","name":"南苏丹"},{"value":"ST","name":"圣多美和普林西比"},{"value":"SV","name":"萨尔瓦多"},{"value":"SX","name":"荷属圣马丁"},{"value":"SY","name":"叙利亚"},{"value":"SZ","name":"斯威士兰"},{"value":"TC","name":"特克斯和凯科斯群岛"},{"value":"TD","name":"乍得"},{"value":"TF","name":"法属南部和南极领地"},{"value":"TG","name":"多哥"},{"value":"TH","name":"泰国"},{"value":"TJ","name":"塔吉克斯坦"},{"value":"TK","name":"托克劳"},{"value":"TL","name":"东帝汶"},{"value":"TM","name":"土库曼斯坦"},{"value":"TN","name":"突尼斯"},{"value":"TO","name":"汤加"},{"value":"TR","name":"土耳其"},{"value":"TT","name":"特立尼达和多巴哥"},{"value":"TV","name":"图瓦卢"},{"value":"TZ","name":"坦桑尼亚"},{"value":"UA","name":"乌克兰"},{"value":"UG","name":"乌干达"},{"value":"UM","name":"美国本土外小岛屿"},{"value":"UY","name":"乌拉圭"},{"value":"UZ","name":"乌兹别克斯坦"},{"value":"VA","name":"梵蒂冈"},{"value":"VC","name":"圣文森特和格林纳丁斯"},{"value":"VE","name":"委内瑞拉"},{"value":"VG","name":"英属维尔京群岛"},{"value":"VI","name":"美属维尔京群岛"},{"value":"VN","name":"越南"},{"value":"VU","name":"瓦努阿图"},{"value":"WF","name":"瓦利斯和富图纳"},{"value":"WS","name":"萨摩亚"},{"value":"YE","name":"也门"},{"value":"AD","name":"安道尔"},{"value":"AE","name":"阿联酋"},{"value":"AF","name":"阿富汗"},{"value":"AG","name":"安提瓜和巴布达"},{"value":"YT","name":"马约特"},{"value":"ZM","name":"赞比亚"}];
        document.querySelectorAll('.iso2_country').forEach((el) => {
            el.innerText = iso2_country.find((key) => key.value == el.innerText)?.name || el.innerText;
        });
    </script><!--    <script src="https://cdn.jsdelivr.net/npm/ua-parser-js@0/dist/ua-parser.min.js"></script>-->
    <script src="/public/static/sky/public/ua-parser.min@2.0.3.js"></script>
    <script src="/public/static/sky/public/ua-extensions.js"></script>
    <script>
        var user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36';
        if (user_agent) {
            var parser = new UAParser(user_agent, window.UA_Extensions);
            var ua_html = [];
            var result = parser.getResult();
            if (result.os.name == 'Windows') {
                ua_html.push(`<i class="layui-icon layui-icon-windows"></i>${result.os.name} ${result.os.version}`);
            }
            if (result.os.name == 'Mac OS' || result.os.name == 'iOS') {
                var deviceInfo = '';
                if (result.os.name == 'iOS') {
                    deviceInfo = `${result.device.vendor} ${result.device.model}: `;
                }
                ua_html.push(`<i class="layui-icon layui-icon-ios"></i>${deviceInfo} ${result.os.name} ${result.os.version}`);
            }
            if (result.os.name == 'Android') {
                var deviceVendor = result.device.vendor ? result.device.vendor : '';
                ua_html.push(`<i class="layui-icon layui-icon-android"></i>${deviceVendor} ${result.device.model}`);
            }
            ua_html.push(`<i class="layui-icon layui-icon-website"></i>${result.browser.name} ${result.browser.version}`);
            const html = '<div style="display: flex;gap: 5px">' + ua_html.join('') + '</div>';
            $('#ua-info div:first').append(html)
            console.log(result);
        }
    </script>
    <!--<script src="//cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js"></script>-->
    <!--    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" integrity="sha512-qZvrmS2ekKPF2mSznTQsxqPgnpkI4DNTlrdUmTzrDgektczlKNRRhy5X5AAOnx5S09ydFYWWNSfcEqDTTHgtNA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>-->
    <script src="https://cdn-cn.teacherrecord.com/static/sky/public/jspdf.umd.min@2.5.1.js"></script>
    <script src="https://cdn-cn.teacherrecord.com/static/sky/public/html2canvas.min.js"></script>
    <script>
        var pdf_name='TR90901140592-Fahimeh-resume.pdf';

        function makePdf(preview=false) {
            toast({time:3E3,msg:"Loading..."})
            exportPdf(preview);
        }
        function openDataUrl(dataString) {
            var printWindow = window.open('', '', 'height=800,width=780,location=no');
            printWindow.document.write('<html><head><title>Preview PDF</title>');
            printWindow.document.write('</head><body >');
            printWindow.document.write('<img width="100%" src=\"'+dataString+'\">');
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            /* var d = window.open().document;
             d.write(''); d.close();
             let pageHeader = document.createElement("div");
             pageHeader.style.width='980px';
             pageHeader.style.margin='0 auto';
             pageHeader.innerHTML = '<img width="100%" src=\"'+dataString+'\">';
             d.body.appendChild(pageHeader);*/
        }

        function showProfile() {
            $('.private_info').fadeIn('fast');
            $('.profile_certificate').fadeIn('fast');
            $('.notice').fadeIn('fast');
            $('.tr_logo').fadeIn('fast');
            $('.tag-item').fadeIn('fast');
            $('#ua-info').fadeIn('fast');
        }

        function exportPdf(preview=false) {
            var element = document.getElementById("pdf_content");
            $('.private_info').hide();
            $('.profile_certificate').hide();
            $('.notice').hide();
            $('#ua-info').hide();
            $('.tag-item').hide();
            $('.warn_text').text('***').removeClass('warn_text');
            let opts = {
                scale: 2,
                useCORS:true,
                type: 'view',
                background: '#FFFFFF',
                width: element.offsetWidth + 10,
                height: element.offsetHeight + 80,
            };
            window.scroll(0,0);
            const { jsPDF } = window.jspdf;
            html2canvas(element,opts).then(function(canvas) {
                var pdf = new jsPDF('p', 'mm', 'a4');    //A4纸，纵向
                var a4w = 190, a4h = 277,    //A4大小，210mm x 297mm，四边各保留10mm的边距，显示区域190x277
                    imgHeight = Math.floor(a4h * canvas.width / a4w),    //按A4显示比例换算一页图像的像素高度
                    renderedHeight = 0,
                    offsetHeight = 25;

                let img=canvas.toDataURL('image/jpeg', 1.0);
                // element.childNodes[0].remove();

                if(preview){
                    openDataUrl(img);
                    showProfile()
                    return;
                }
                while(renderedHeight < canvas.height) {
                    let page = document.createElement("canvas");
                    page.width = canvas.width;
                    let ctxH=Math.min(imgHeight, canvas.height - renderedHeight);
                    page.height = ctxH-offsetHeight;
                    let ctxImgData=canvas.getContext('2d').getImageData(0, renderedHeight, canvas.width, ctxH);
                    page.getContext('2d').putImageData(ctxImgData, 0, 0);
                    pdf.addImage(page.toDataURL('image/jpeg', 1.0), 'JPEG', 10, 10, a4w, Math.min(a4h, a4w * page.height / page.width));
                    renderedHeight += imgHeight;
                    renderedHeight -= offsetHeight;
                    if(renderedHeight < canvas.height){
                        pdf.addPage();
                    }
                    delete page;
                }
                pdf.save(pdf_name);
                showProfile()
            });
        }
    </script>
    <script src="/ip.php?api=jsDom&ip=213.195.1.45&domId=showIpInfo"></script>
    <script>
        var cv_url = 'https://teacherrecord.com/service/shareResume/B9FAB74E';
    var screen_width = window.screen.width, screen_height = window.screen.height;
    if(screen_width < 680 && screen_height < 990){
        $('.layui-btn-container').css('width','45px').find('.layui-btn').contents().filter(function(){return this.nodeType !== 1;}).remove()
    }
    $(function(){$(".pimg").click(function(){var _this = $(this);imgShow("#outerdiv", "#innerdiv", "#bigimg", _this);});});
    $('body').on('click', '.cert_img', function () {
        var data = $(this).data();
        if (data["src"]) {
            let imgUrl = data["src"];
            let fileExtension = imgUrl.substring(imgUrl.lastIndexOf('.') + 1);
            if (fileExtension.toLowerCase() === 'pdf') {
                window.open(imgUrl, '_blank');
                return;
            }
            imgShow("#outerdiv", "#innerdiv", "#bigimg", $(this));
        }
    });
    $(".set_lang").on('click', function () {
        $.ajax({
            type: 'post',
            url: '/index/index/set_lang',
            data: $(this).data(),
            complete: function () { window.location.replace(location.href); },
        });
    });
    $(".share").on("click",function(){copyText(cv_url, '复制网址成功!')});

    function unScroll(){$(document).on("scroll.unable",function(a){$(document).scrollTop(0)})}
    function removeUnScroll(){$(document).unbind("scroll.unable")}
    function imgShow(a,b,c,f){unScroll();f=f.data("src");$(c).attr("src",f).hide();$(b).css({top:"45%",left:"45%"});$("#bigimgCover").show();$(a).fadeIn("slow");$(c).load(function(){var d=$(window).width(),g=$(window).height(),h=this.width,k=this.height;if(k>.8*g){var l=.8*g;var e=l/k*h;e>.8*d&&(e=.8*d)}else h>.8*d?(e=.8*d,l=e/h*k):(e=h,l=k);$(c).css("width",e);$("#bigimgCover").hide();$(c).fadeIn("slow");d=(d-e)/2;g=(g-l)/2;$(b).css({top:g,left:d})});$(a).click(function(){$(this).fadeOut("slow");removeUnScroll()})};

    </script>
    <script>
        (function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9da86b901b80fd78',t:'MTc3MzIwOTY3OQ=='};var a=document.createElement('script');a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
    </script>
</body>

</html>
```
