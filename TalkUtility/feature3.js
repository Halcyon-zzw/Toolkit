// 功能三的JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    // 获取当前时间
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    let halfHourTime = '';
    if (minute < 30) {
        halfHourTime = `${hour}:00`;
    } else {
        halfHourTime = `${hour}:30`;
    }

    // 设置时间显示
    document.getElementById('time_en').textContent = halfHourTime;
    document.getElementById('time_zh').textContent = halfHourTime;

    // 英文复制按钮事件
    document.getElementById('copyEnBtn').addEventListener('click', function() {
        copyToClipboardEn();
    });

    // 中文复制按钮事件
    document.getElementById('copyZhBtn').addEventListener('click', function() {
        copyToClipboardZh();
    });

    // 复制英文内容到剪贴板（与template.HTML中格式保持一致）
    async function copyToClipboardEn() {
        // 获取时间
        const timeText = document.getElementById('time_en').textContent;

        // 手动构造文本，确保格式与template.HTML完全一致
        const text = `Hello! You are late for your ${timeText} class.
 If you are unable to attend the class, please make sure to enter the classroom within ten minutes after the class starts and then leave  a message with CS to cancel the class. Otherwise, it will be record as absent without notice.
It's not our duty to remind. We sometimes randomly check classes and may remind you if there's lateness, but this does not apply to every class. Please be punctual and pay attention to your schedule.
Important Notice: Recently, the platform has been strictly enforcing the rules. If you notify CS to cancel the class within ten minutes after the class starts but there is no record of you entering the classroom, the platform will still consider this cancellation as absent without notice.  `;

        try {
            await navigator.clipboard.writeText(text);
            // 显示成功提示
            const btn = document.getElementById('copyEnBtn');
            const originalText = btn.textContent;
            btn.textContent = '已复制';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('复制失败: ', err);
            // 显示错误提示
            const btn = document.getElementById('copyEnBtn');
            const originalText = btn.textContent;
            btn.textContent = '复制失败';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }
    }

    // 复制中文内容到剪贴板（与template.HTML中格式保持一致）
    async function copyToClipboardZh() {
        // 获取时间
        const timeText = document.getElementById('time_zh').textContent;

        // 手动构造文本，确保格式与template.HTML完全一致
        const text = `您好！${timeText}有课，您已迟到。如不能上课，请在上课开始后十分钟内务必进入教室，然后给CS留言取消课，否则记为缺勤。
请注意: 提醒并非我们的职责。我们有时巡课发现迟到会提醒，但并非每一节课都会巡到。望您自觉遵守时间。
重要提示: 最近平台抓规则，如果上课开始后十分钟内通知CS取消课，但是没有进入教室的记录，这种取消平台也视为缺勤取消。`;

        try {
            await navigator.clipboard.writeText(text);
            // 显示成功提示
            const btn = document.getElementById('copyZhBtn');
            const originalText = btn.textContent;
            btn.textContent = '已复制';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('复制失败: ', err);
            // 显示错误提示
            const btn = document.getElementById('copyZhBtn');
            const originalText = btn.textContent;
            btn.textContent = '复制失败';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }
    }
});