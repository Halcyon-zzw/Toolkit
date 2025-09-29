// 在 feature1.js 文件中添加复制功能
document.addEventListener('DOMContentLoaded', function() {
    const extractAndFillButton = document.getElementById('extractAndFill');
    const getScheduleButton = document.getElementById('getSchedule');
    const inputText = document.getElementById('inputText');
    const usernameSpan = document.getElementById('username');
    const passwordSpan = document.getElementById('password');
    const scheduleList = document.getElementById('scheduleList');
    const scheduleTitle = document.getElementById('scheduleTitle');
    const scheduleItems = document.getElementById('scheduleItems');

    // 添加复制按钮元素
    const copyUsernameButton = document.getElementById('copyUsername');
    const copyPasswordButton = document.getElementById('copyPassword');

    // 获取当前时间段
    function getCurrentTimeRange() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = now.getHours();

        const startTime = `${hour}:00`;
        // const endTime = `${hour + 1}:00`;
        const endTime = `22:30`;
        const dateStr = `${year}-${month}-${day}`;

        return {
            startTime: startTime,
            endTime: endTime,
            dateStr: dateStr
        };
    }

    // 从模板中提取教师姓名
    function extractTeacherName(text) {
        const nameMatch = text.match(/Name:\s*([^\n]+)/);
        return nameMatch ? nameMatch[1].trim() : null;
    }

    // 登录并获取token
    async function login(loginId, password) {
        const response = await fetch('https://www.talk915.com/users/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
                loginId: loginId,
                isApp: 2,
                loginMode: 1
            })
        });
        const data = await response.json();
        return data.resultData?.token;
    }

    // 获取教师ID
    async function getTeacherId(token, teacherName) {
        const response = await fetch('https://www.talk915.com/users/teacherProxy/queryScheduledClassesSelectList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            }
        });
        const data = await response.json();
        console.log(data);
        // 遍历 resultData 数组并使用 alert 打印每个 teaName
        // const resultData = data.resultData;
        // let teaNameList = [];

        //   for (let i = 0; i < resultData.length; i++) {
        //     const teaName = resultData[i].teaName;
        //     teaNameList.push(teaName);

        //     if ((i + 1) % 10 === 0 || i === resultData.length - 1) {
        //         let alertMessage = "teaNameList:\n";
        //         teaNameList.forEach(name => {
        //             alertMessage += `- ${name}\n`;
        //         });
        //         alertMessage += `\nteacherName: ${teacherName}\n`;
        //         alertMessage += `是否有匹配: ${teaNameList.includes(teacherName)}`;

        //         alert(alertMessage);
        //         teaNameList = [];
        //     }
        // }
        const teacher = data.resultData?.find(t => t.teaName === teacherName);
        return teacher?.teaId;
    }

    // 获取课程列表
    async function getScheduleList(token, teaId, timeRange) {
        const response = await fetch('https://www.talk915.com/users/teacherProxy/queryScheduledClassesList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({
                currPage: 1,
                pageSize: 10,
                lessonStartTime: timeRange.dateStr,
                lessonEndTime: timeRange.dateStr,
                startTime: timeRange.startTime,
                endTime: timeRange.endTime,
                sign: '1',
                subscribeType: 0,
                type: 0,
                teaId: teaId,
                teaStatus: 0,
                commentStatus: 0,
                studentMsg: '',
                classStatus: 1,
                exportStatus: 0
            })
        });
        const data = await response.json();
        return data.resultData?.scheduledCoursesRespDTO || [];
    }

    // 复制文本到剪贴板
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('复制成功');
        }).catch(err => {
            console.error('复制失败:', err);
        });
    }

    // 为复制按钮添加事件监听器
    if (copyUsernameButton) {
        copyUsernameButton.addEventListener('click', function() {
            const username = usernameSpan.textContent;
            if (username && username !== '-') {
                copyToClipboard(username);
                // 可以添加一些视觉反馈，比如按钮文字变化
                const originalText = this.textContent;
                this.textContent = '已复制';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 1000);
            }
        });
    }

    if (copyPasswordButton) {
        copyPasswordButton.addEventListener('click', function() {
            const password = passwordSpan.textContent;
            if (password && password !== '-') {
                copyToClipboard(password);
                // 可以添加一些视觉反馈，比如按钮文字变化
                const originalText = this.textContent;
                this.textContent = '已复制';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 1000);
            }
        });
    }

    // 修改 feature1.js 文件中的 extractAndFillButton 事件处理函数
    extractAndFillButton.addEventListener('click', function() {
        // 隐藏复制按钮，等待重新提取后显示
        copyUsernameButton.style.display = 'none';
        copyPasswordButton.style.display = 'none';

        const text = inputText.value;

        // 使用正则表达式提取账号密码
        const accountMatch = text.match(/说客账号:\s*([^\s]+)/);
        const passwordMatch = text.match(/账户密码:\s*([^\s]+)/);

        if (accountMatch && passwordMatch) {
            const username = accountMatch[1];
            const password = passwordMatch[1];

            // 显示提取结果
            usernameSpan.textContent = username;
            passwordSpan.textContent = password;

            // 显示复制按钮（仅在有值时显示）
            if (username && username !== '-') {
                copyUsernameButton.style.display = 'inline-block';
            }
            if (password && password !== '-') {
                copyPasswordButton.style.display = 'inline-block';
            }

            // 保存到 Chrome 存储并自动填充
            chrome.storage.sync.set({
                username: username,
                password: password
            }, function() {
                // 获取当前标签页
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    const currentTab = tabs[0];
                    if (currentTab.url.includes('talk915.com/teacher/login')) {
                        // 如果当前页面是登录页面，直接填充
                        chrome.tabs.reload(currentTab.id);
                    } else {
                        // 如果不是登录页面，打开新的登录页面
                        chrome.tabs.create({
                            url: 'https://www.talk915.com/teacher/login'
                        });
                    }
                });
            });
        }
    });


    getScheduleButton.addEventListener('click', async function() {
        const text = inputText.value;
        const teacherName = extractTeacherName(text);
        if (!teacherName) {
            alert('无法从模板中提取教师姓名');
            return;
        }

        try {
            // 第一次尝试登录
            let token = await login('ta-peng', 'tapeng123456');
            let teaId = token ? await getTeacherId(token, teacherName) : null;

            // 如果第一次失败，尝试第二次登录
            if (!teaId) {
                token = await login('ta-fonpeng', 'fonpeng123456');
                teaId = token ? await getTeacherId(token, teacherName) : null;
            }

            if (!teaId) {
                alert('无法获取教师ID');
                return;
            }

            const timeRange = getCurrentTimeRange();
            const schedules = await getScheduleList(token, teaId, timeRange);

            // 按时间排序课程列表
            schedules.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

            // 显示结果
            scheduleTitle.textContent = `${teacherName} ${timeRange.startTime} - ${timeRange.endTime} 课程列表如下`;
            scheduleItems.innerHTML = '';

            if (schedules.length === 0) {
                scheduleItems.innerHTML = '<li>当前时间段没有课程</li>';
            } else {
                schedules.forEach((schedule, index) => {
                    const li = document.createElement('li');
                    li.textContent = `${index + 1}. ${schedule.dateTime}`;
                    scheduleItems.appendChild(li);
                });
            }

            scheduleList.style.display = 'block';
        } catch (error) {
            console.error('获取课程列表失败:', error);
            alert('获取课程列表失败');
        }
    });
});
