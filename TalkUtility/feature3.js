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
        let text = document.querySelector('#enContent').textContent;
        
        try {
            text = text.trim();
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
        let text = document.querySelector('#zhContent').textContent;
        
        try {
            text = text.trim();
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