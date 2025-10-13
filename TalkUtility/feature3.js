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
        try {
            // 获取所有的 p 标签
            const paragraphs = document.querySelectorAll('#enContent p[data-line]');
            const lines = [];

            // 遍历每个段落，提取文本内容
            paragraphs.forEach((p, index) => {
                let text = p.textContent;

                // 根据 template.HTML 的格式规则：
                // 第2段（data-line="2"）开头需要有一个空格
                if (p.getAttribute('data-line') === '2') {
                    // 第2段前面已经有空格了，直接使用
                    text = text;
                } else if (index === 0) {
                    // 第1段：正常文本，后面不换行
                    text = text;
                } else {
                    // 其他段落：正常文本
                    text = text;
                }

                lines.push(text);
            });

            // 按照 template.HTML 的格式拼接：
            // 第1段后换行，第2段（带前导空格），第3段前换行，第4段前换行
            const finalText = lines.join('\n');

            await navigator.clipboard.writeText(finalText);
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
        try {
            // 获取所有的 p 标签
            const paragraphs = document.querySelectorAll('#zhContent p[data-line]');
            const lines = [];

            // 遍历每个段落，提取文本内容
            paragraphs.forEach((p) => {
                lines.push(p.textContent);
            });

            // 按照 template.HTML 的格式拼接：段落之间用换行分隔
            const finalText = lines.join('\n');

            await navigator.clipboard.writeText(finalText);
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