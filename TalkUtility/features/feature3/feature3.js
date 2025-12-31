// 功能三的JavaScript文件

// 默认模版
const DEFAULT_TEMPLATES = {
    zh: `您好！{{time}}有课，您已迟到。
务必在上课开始后10分钟内进入教室上课，超时记为缺勤。
若不能上课，在上课开始后十分钟内必须进入教室，然后给CS留言取消课，否则记为缺勤（如果电脑遇到故障，可以通过手机APP或网页端登录）。
因为如果老师不能上课，必须在课前取消。课程开始后申请取消，判定为缺勤取消，除非是老师正在上课过程中遇到故障导致课程中断，才有可能排除缺勤原因。
请注意: 提醒并非我们的职责。我们偶尔巡课发现迟到会提醒，但并非每一节课都会巡到。望您自觉遵守时间。`,
    en: `Hello! You are late for your {{time}} class.
 Please enter the classroom within 10 minutes after the class starts. Arrivals beyond this time will be recorded as absent without notice.
If you are unable to teach, please make sure to enter the classroom within ten minutes after the class starts and then leave a message with CS to cancel the class. Otherwise, it will be record as absent without notice.(if experiencing computer issues, log in via the mobile app or web browser).
If teacher is unable to conduct a class, they must cancel it before the class starts. If a cancellation is requested after the class has begun, it will be recorded as absent without notice, unless the class is interrupted due to any issues during the lesson.
It's not our duty to remind.We sometimes randomly check classes and may remind you if there's lateness, but this does not apply to every class. Please be punctual and pay attention to your schedule.`
};

// 当前使用的模版
let currentTemplates = { ...DEFAULT_TEMPLATES };

document.addEventListener('DOMContentLoaded', function() {
    // 初始化：加载模版并渲染内容
    loadAndRenderTemplates();

    // 编辑模版按钮事件
    document.getElementById('editTemplateBtn').addEventListener('click', openTemplateModal);

    // 模态框关闭按钮事件
    document.querySelector('.close').addEventListener('click', closeTemplateModal);
    document.getElementById('cancelTemplateBtn').addEventListener('click', closeTemplateModal);

    // 保存模版按钮事件
    document.getElementById('saveTemplateBtn').addEventListener('click', saveTemplate);

    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('templateModal');
        if (event.target === modal) {
            closeTemplateModal();
        }
    });

    // 定时器存储，用于防止多次点击导致的状态混乱
    let enBtnTimer = null;
    let zhBtnTimer = null;

    // 按钮是否正在处理中
    let enBtnProcessing = false;
    let zhBtnProcessing = false;

    // 英文复制按钮事件
    document.getElementById('copyEnBtn').addEventListener('click', function() {
        if (!enBtnProcessing) {
            copyToClipboard('en', this, enBtnTimer, enBtnProcessing);
        }
    });

    // 中文复制按钮事件
    document.getElementById('copyZhBtn').addEventListener('click', function() {
        if (!zhBtnProcessing) {
            copyToClipboard('zh', this, zhBtnTimer, zhBtnProcessing);
        }
    });
});

// 获取当前时间（半小时制）
function getCurrentTime() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    if (minute < 30) {
        return `${hour}:00`;
    } else {
        return `${hour}:30`;
    }
}

// 从 Chrome Storage 加载模版并渲染
function loadAndRenderTemplates() {
    chrome.storage.sync.get(['lateReminderTemplates'], function(result) {
        if (result.lateReminderTemplates) {
            currentTemplates = result.lateReminderTemplates;
        } else {
            currentTemplates = { ...DEFAULT_TEMPLATES };
        }

        renderTemplates();
    });
}

// 渲染模版内容到页面
function renderTemplates() {
    const time = getCurrentTime();

    // 渲染中文内容
    const zhContent = currentTemplates.zh.replace(/\{\{time\}\}/g, time);
    renderContent('zhContent', zhContent);

    // 渲染英文内容
    const enContent = currentTemplates.en.replace(/\{\{time\}\}/g, time);
    renderContent('enContent', enContent);
}

// 将文本内容渲染为 HTML（每行一个 p 标签）
function renderContent(elementId, content) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';

    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const p = document.createElement('p');
        p.setAttribute('data-line', String(index + 1));
        p.textContent = line;
        container.appendChild(p);
    });
}

// 打开模版编辑模态框
function openTemplateModal() {
    const modal = document.getElementById('templateModal');
    const zhInput = document.getElementById('zhTemplateInput');
    const enInput = document.getElementById('enTemplateInput');

    // 加载当前模版到输入框
    zhInput.value = currentTemplates.zh;
    enInput.value = currentTemplates.en;

    // 显示模态框
    modal.style.display = 'block';
}

// 关闭模版编辑模态框
function closeTemplateModal() {
    const modal = document.getElementById('templateModal');
    modal.style.display = 'none';
}

// 保存模版
function saveTemplate() {
    const zhInput = document.getElementById('zhTemplateInput');
    const enInput = document.getElementById('enTemplateInput');

    const newTemplates = {
        zh: zhInput.value.trim(),
        en: enInput.value.trim()
    };

    // 验证输入
    if (!newTemplates.zh || !newTemplates.en) {
        alert('中文和英文模版不能为空！');
        return;
    }

    // 保存到 Chrome Storage
    chrome.storage.sync.set({ lateReminderTemplates: newTemplates }, function() {
        // 更新当前模版
        currentTemplates = newTemplates;

        // 重新渲染页面
        renderTemplates();

        // 关闭模态框
        closeTemplateModal();

        // 提示保存成功
        alert('模版保存成功！');
    });
}

// 复制内容到剪贴板
function copyToClipboard(lang, btn, timer, processing) {
    // 标记正在处理
    processing = true;

    // 清除之前的定时器
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }

    const originalText = lang === 'zh' ? '复制中文' : '复制英文';

    try {
        // 获取对应语言的内容
        const contentId = lang === 'zh' ? 'zhContent' : 'enContent';
        const paragraphs = document.querySelectorAll(`#${contentId} p[data-line]`);
        const lines = [];

        // 提取所有段落文本
        paragraphs.forEach((p) => {
            lines.push(p.textContent);
        });

        // 用换行符连接
        const finalText = lines.join('\n');

        // 复制到剪贴板
        navigator.clipboard.writeText(finalText).then(() => {
            // 显示成功提示
            btn.textContent = '已复制';

            // 设置定时器恢复原文本
            timer = setTimeout(() => {
                btn.textContent = originalText;
                processing = false;
                timer = null;
            }, 2000);
        }).catch(err => {
            console.error('复制失败: ', err);

            // 显示错误提示
            btn.textContent = '复制失败';

            // 设置定时器恢复原文本
            timer = setTimeout(() => {
                btn.textContent = originalText;
                processing = false;
                timer = null;
            }, 2000);
        });
    } catch (err) {
        console.error('复制失败: ', err);
        btn.textContent = '复制失败';

        timer = setTimeout(() => {
            btn.textContent = originalText;
            processing = false;
            timer = null;
        }, 2000);
    }
}
