查看TalkUtility项目，在docs/api/生成接口文档

-----------分界线，上述需求已经处理，请忽略------------------

迟到提醒功能中新增逻辑：
1、在左上角添加一个编辑按钮，点击按钮后，打开一个对话框，对话框中可以输入中文、英文的模版。
2、点击保存按钮后，将模版覆盖当前页面显示框的内容。
3、{{time}}的获取逻辑不变。
模版示例：
中文：
您好！{{time}}有课，您已迟到。

请务必在上课开始后10分钟内进入教室上课，超时记为缺勤。

课程一旦开始，任何情况下均不可取消。如果CS询问取消事宜，请勿直接同意或提议取消。可强调 “遇到问题，无法进入教室”，并请CS协助让学生稍作等候。

如因特殊情况（如网络或设备故障）导致无法进入教室，请务必在上课开始后10分钟内通过手机APP或网页端尝试登录。

因为如果老师不能上课，必须在课前取消。课程开始后申请取消，判定为缺勤取消，除非是老师正在上课过程中遇到故障导致课程中断，才有可能排除缺勤原因。

请注意：巡课中发现迟到我们会尽量提醒，但无法覆盖每一节课，请自觉按时进入教室上课。
英文：
Hello! You are late for your {{time}} class.

Please enter the classroom within 10 minutes after the class starts. Arrivals beyond this time will be recorded as absent without notice.

Once a class begins, it cannot be canceled under any circumstances. If CS inquires about cancellation, do not agree or suggest it. You can emphasize, "Experiencing an issue and unable to enter the classroom," and request that CS ask the student to wait.

If you cannot enter the classroom due to special circumstances (e.g., network or device issues), please log in via the mobile app or web browser within 10 minutes of the class start.

If teacher is unable to conduct a class, they must cancel it before the class starts. If a cancellation is requested after the class has begun, it will be recorded as absent without notice, unless the class is interrupted due to any issues during the lesson.

Please note: During class inspections, we will try to remind those who are late, but we cannot cover every session. Please make sure to attend class on time.


我的疑问

1. 当前 feature3 的实现情况：我需要先查看 features/feature3/ 下的文件，了解当前页面结构和逻辑，才能更好地集成新功能。您方便让我先查看一下吗？
可以
2. 模版的默认值：文档中提供的中英文示例，是否就是默认模版？还是说当前已有其他默认内容？
默认内容为当前页面显示框的内容。
3. 显示方式：保存后是只显示中文模版还是中英文都显示？还是需要切换语言的功能？
都显示。
说明：点击编辑后，展示的内容永久变更。

-----------分界线，上述需求已经处理，请忽略------------------

编辑按钮在右上角

# 说明
1. 已完成的需求追加到demand_tree_completed.md中，不需要修改本文件.
2. 忽略最后出现的“-----------分界线，上述需求已经处理，请忽略------------------”字样以上的需求
3. 请先给出你的理解，有问题提出来。