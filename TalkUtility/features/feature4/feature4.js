// feature4.js - 差评处理功能
document.addEventListener('DOMContentLoaded', function() {
    // DOM元素引用
    const fileInputWrapper = document.getElementById('fileInputWrapper');
    const excelFile = document.getElementById('excelFile');
    const fileInputText = document.getElementById('fileInputText');
    const dataTableSection = document.getElementById('dataTableSection');
    const dataTableBody = document.getElementById('dataTableBody');
    const startProcess = document.getElementById('startProcess');
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const exportSection = document.getElementById('exportSection');
    const exportExcel = document.getElementById('exportExcel');

    // 数据存储
    let excelData = [];
    let processedData = [];
    let accessToken = '';

    // 文件选择处理
    fileInputWrapper.addEventListener('click', function() {
        excelFile.click();
    });

    excelFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileInputText.textContent = `已选择: ${file.name}`;
            fileInputText.classList.add('selected-file');

            // 立即解析Excel文件
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,  // 返回数组格式而不是对象格式
                        defval: ''  // 空单元格的默认值
                    });

                    parseExcelData(jsonData);
                } catch (error) {
                    console.error('Excel解析失败:', error);
                    alert('Excel解析失败，请确保文件格式正确');
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            fileInputText.textContent = '点击选择Excel文件 (.xlsx, .xls)';
            fileInputText.classList.remove('selected-file');
            dataTableSection.classList.add('hidden');
            exportSection.classList.add('hidden');
        }
    });

    // 解析Excel数据并展示
    function parseExcelData(jsonData) {
        if (jsonData.length === 0) {
            alert('Excel文件为空');
            return;
        }

        excelData = [];

        // 检查是否有表头（第一行是否包含文本内容）
        let hasHeader = false;
        let startRow = 0;

        if (jsonData.length > 0) {
            const firstRow = jsonData[0];
            // 简单判断：如果第一行的前几列包含文本而不是纯数字，认为有表头
            hasHeader = firstRow.some((cell, index) =>
                index < 4 && typeof cell === 'string' && cell.trim() !== ''
            );
            startRow = hasHeader ? 1 : 0;
        }

        // 处理数据行
        for (let i = startRow; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length >= 8 && (row[0] || row[1] || row[2] || row[7])) { // 至少有一列有数据
                excelData.push({
                    index: i - startRow + 1,
                    teacherName: row[0] || `内容${i - startRow + 1}`,
                    classInfo: row[1] || `内容${i - startRow + 1}`,
                    classId: row[2] || `内容${i - startRow + 1}`,
                    processContent: row[7] || `内容${i - startRow + 1}`,
                    result: '-'
                });
            }
        }

        if (excelData.length === 0) {
            alert('没有找到有效的数据行');
            return;
        }

        displayDataTable();
    }

    // 显示数据表格
    function displayDataTable() {
        dataTableBody.innerHTML = '';

        excelData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.index}</td>
                <td>${item.teacherName}</td>
                <td>${item.classInfo}</td>
                <td>${item.classId}</td>
                <td>${item.processContent}</td>
                <td class="result-column">${item.result}</td>
            `;
            dataTableBody.appendChild(row);
        });

        dataTableSection.classList.remove('hidden');
    }

    // API接口调用函数
    async function login() {
        try {
            const response = await fetch('https://trmk.teachingrecord.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'Seven',
                    password: 'bb033dc62f44af605a3bebd824a8ae89'
                })
            });

            const data = await response.json();
            if (data.code === 200 && data.data?.access_token) {
                accessToken = data.data.access_token;
                return true;
            } else {
                console.error('登录失败:', data);
                return false;
            }
        } catch (error) {
            console.error('登录请求失败:', error);
            return false;
        }
    }

    async function searchTeacher(teacherName) {
        try {
            // 取教师姓名的第一个单词
            const firstName = teacherName.split(' ')[0];
            const response = await fetch(`https://trmk.teachingrecord.com/api/search/user?name=${encodeURIComponent(firstName)}`, {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            if (data.code === 200 && data.data?.list) {
                // 查找匹配的老师，忽略空格数量差异
                const normalizeString = (str) => str.replace(/\s+/g, ' ').trim().toLowerCase();
                const normalizedTeacherName = normalizeString(teacherName);

                const teacher = data.data.list.find(t =>
                    normalizeString(t.name) === normalizedTeacherName
                );

                return teacher ? teacher.user_id : null;
            }
            return null;
        } catch (error) {
            console.error('搜索老师失败:', error);
            return null;
        }
    }

    async function getEvaluationList(userId) {
        try {
            const response = await fetch(`https://trmk.teachingrecord.com/api/evaluation/list?follow_status=2&user_id=${userId}&page=1&pageSize=10`, {
                method: 'GET',
                headers: {
                    'app-id': 'app_75535bab9a72a',
                    'authorization': `Bearer ${accessToken}`,
                    'if-none-match': 'W/"f5619ad603f4b2490609a1e6c74e680eea1da040"',
                    'priority': 'u=1, i',
                    'Cookie': `team_id=0; app_id=app_75535bab9a72a; sidebarStatus=0; Admin-Token=${accessToken}`
                }
            });

            const data = await response.json();
            if (data.code === 200 && data.data?.list) {
                return data.data.list;
            }
            return [];
        } catch (error) {
            console.error('获取差评列表失败:', error);
            return [];
        }
    }

    // 处理单行数据
    async function processRow(item, index) {
        try {
            // 更新当前行状态为处理中
            updateRowResult(index, '正在处理...', 'status-processing');

            // 步骤1: 搜索老师
            const userId = await searchTeacher(item.teacherName);
            if (!userId) {
                updateRowResult(index, '未找到老师信息', 'status-error');
                return;
            }

            // 步骤2: 获取差评列表
            const evaluationList = await getEvaluationList(userId);
            if (evaluationList.length === 0) {
                updateRowResult(index, '未找到课程信息', 'status-error');
                return;
            }

            // 步骤3: 查找匹配的课程
            const classInfo = evaluationList.find(evaluation =>
                evaluation.class_id === item.classId
            );

            if (!classInfo) {
                updateRowResult(index, '未找到课程信息', 'status-error');
                return;
            }

            // 步骤4: 构建参数
            const params = {
                "status": 1,
                "source": 15,
                "model_id": classInfo.id,
                "relation_model": "Evaluate",
                "app_id": "app_51ce9f828be6",
                "user_id": classInfo.user_id,
                "name": classInfo.teacher_name,
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
                "extra": classInfo.extra || {}
            };

            // 将构建的参数展示在结果列中
            const resultText = JSON.stringify(params, null, 2);
            updateRowResult(index, resultText, 'status-success');

        } catch (error) {
            console.error(`处理第${index + 1}行失败:`, error);
            updateRowResult(index, '处理失败: ' + error.message, 'status-error');
        }
    }

    // 更新行结果显示
    function updateRowResult(index, result, statusClass = '') {
        const rows = dataTableBody.querySelectorAll('tr');
        if (rows[index]) {
            const resultCell = rows[index].querySelector('.result-column');
            resultCell.textContent = result;
            resultCell.className = `result-column ${statusClass}`;
        }

        // 同步更新processedData
        if (processedData[index]) {
            processedData[index].result = result;
        }
    }

    // 开始处理按钮事件
    startProcess.addEventListener('click', async function() {
        if (excelData.length === 0) {
            alert('没有数据需要处理');
            return;
        }

        // 显示进度条
        progressSection.classList.remove('hidden');
        startProcess.disabled = true;

        // 登录获取token
        progressText.textContent = '正在登录...';
        const loginSuccess = await login();
        if (!loginSuccess) {
            alert('登录失败，无法继续处理');
            progressSection.classList.add('hidden');
            startProcess.disabled = false;
            return;
        }

        // 初始化处理数据
        processedData = excelData.map(item => ({ ...item }));

        // 逐行处理数据
        for (let i = 0; i < excelData.length; i++) {
            const progress = ((i + 1) / excelData.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `正在处理第 ${i + 1}/${excelData.length} 行...`;

            await processRow(excelData[i], i);

            // 添加延迟避免请求过于频繁
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 处理完成
        progressText.textContent = '处理完成！';
        startProcess.disabled = false;
        exportSection.classList.remove('hidden');
    });

    // 导出Excel功能
    exportExcel.addEventListener('click', function() {
        if (processedData.length === 0) {
            alert('没有数据可导出');
            return;
        }

        // 准备导出数据
        const exportData = [
            ['序号', '教师姓名', '课程信息', '课程ID', '处理内容', '处理结果']
        ];

        processedData.forEach(item => {
            exportData.push([
                item.index,
                item.teacherName,
                item.classInfo,
                item.classId,
                item.processContent,
                item.result
            ]);
        });

        // 创建工作簿
        const ws = XLSX.utils.aoa_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "差评处理结果");

        // 生成文件名
        const now = new Date();
        const fileName = `差评处理结果_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

        // 下载文件
        XLSX.writeFile(wb, fileName);
    });
});