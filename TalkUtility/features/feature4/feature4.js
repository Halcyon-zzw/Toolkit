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
    let currentProcessIndex = 0;
    let isProcessing = false;

    // 存储键名
    const STORAGE_KEYS = {
        EXCEL_DATA: 'feature4_excel_data',
        PROCESSED_DATA: 'feature4_processed_data',
        CURRENT_INDEX: 'feature4_current_index',
        ACCESS_TOKEN: 'feature4_access_token',
        IS_PROCESSING: 'feature4_is_processing',
        FILE_NAME: 'feature4_file_name'
    };

    // 检查Chrome扩展环境
    function isChromeExtension() {
        return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    }

    // 存储状态到Chrome storage
    function saveState() {
        if (!isChromeExtension()) {
            console.log('📝 非Chrome扩展环境，跳过状态保存');
            return;
        }

        chrome.storage.local.set({
            [STORAGE_KEYS.EXCEL_DATA]: excelData,
            [STORAGE_KEYS.PROCESSED_DATA]: processedData,
            [STORAGE_KEYS.CURRENT_INDEX]: currentProcessIndex,
            [STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
            [STORAGE_KEYS.IS_PROCESSING]: isProcessing,
            [STORAGE_KEYS.FILE_NAME]: fileInputText.textContent
        });
    }

    // 从Chrome storage恢复状态
    function restoreState() {
        if (!isChromeExtension()) {
            console.log('📱 非Chrome扩展环境，跳过状态恢复');
            return;
        }

        chrome.storage.local.get([
            STORAGE_KEYS.EXCEL_DATA,
            STORAGE_KEYS.PROCESSED_DATA,
            STORAGE_KEYS.CURRENT_INDEX,
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.IS_PROCESSING,
            STORAGE_KEYS.FILE_NAME
        ], function(result) {
            if (result[STORAGE_KEYS.EXCEL_DATA] && result[STORAGE_KEYS.EXCEL_DATA].length > 0) {
                excelData = result[STORAGE_KEYS.EXCEL_DATA];
                processedData = result[STORAGE_KEYS.PROCESSED_DATA] || excelData.map(item => ({ ...item }));
                currentProcessIndex = result[STORAGE_KEYS.CURRENT_INDEX] || 0;
                accessToken = result[STORAGE_KEYS.ACCESS_TOKEN] || '';
                isProcessing = result[STORAGE_KEYS.IS_PROCESSING] || false;

                // 恢复文件名显示
                if (result[STORAGE_KEYS.FILE_NAME] && result[STORAGE_KEYS.FILE_NAME] !== '点击选择Excel文件 (.xlsx, .xls)') {
                    fileInputText.textContent = result[STORAGE_KEYS.FILE_NAME];
                    fileInputText.classList.add('selected-file');
                }

                // 恢复表格显示
                displayDataTable();

                // 更新按钮状态
                updateProcessButton();

                // 如果有处理过的数据，显示导出按钮
                if (processedData.some(item => item.result !== '-')) {
                    exportSection.classList.remove('hidden');
                }
            }
        });
    }

    // 清除存储状态
    function clearState() {
        if (isChromeExtension()) {
            chrome.storage.local.remove([
                STORAGE_KEYS.EXCEL_DATA,
                STORAGE_KEYS.PROCESSED_DATA,
                STORAGE_KEYS.CURRENT_INDEX,
                STORAGE_KEYS.ACCESS_TOKEN,
                STORAGE_KEYS.IS_PROCESSING,
                STORAGE_KEYS.FILE_NAME
            ]);
        }
        currentProcessIndex = 0;
        isProcessing = false;
    }

    // 更新处理按钮状态
    function updateProcessButton() {
        if (currentProcessIndex > 0 && currentProcessIndex < excelData.length) {
            startProcess.textContent = '继续处理';
        } else if (currentProcessIndex >= excelData.length) {
            startProcess.textContent = '重新处理';
        } else {
            startProcess.textContent = '开始处理';
        }
    }

    // 页面加载时恢复状态
    restoreState();

    // 文件选择处理
    fileInputWrapper.addEventListener('click', function() {
        excelFile.click();
    });

    excelFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // 新选择文件时清除之前的状态
            clearState();

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
            clearState();
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
                    classId: String(row[2] || `内容${i - startRow + 1}`), // 确保classId为字符串类型
                    processContent: row[7] || `内容${i - startRow + 1}`,
                    result: '-',
                    recordInfo: '-'  // 新增处理后记录信息字段
                });
            }
        }

        if (excelData.length === 0) {
            alert('没有找到有效的数据行');
            return;
        }

        // 初始化processedData
        processedData = excelData.map(item => ({ ...item }));
        currentProcessIndex = 0;

        displayDataTable();
        updateProcessButton();
        saveState();
    }

    // 显示数据表格
    function displayDataTable() {
        dataTableBody.innerHTML = '';

        const dataToDisplay = processedData.length > 0 ? processedData : excelData;
        dataToDisplay.forEach((item, index) => {
            const row = document.createElement('tr');
            const resultClass = item.result === '-' ? '' :
                               item.result.includes('正在处理') ? 'status-processing' :
                               item.result.includes('未找到') || item.result.includes('失败') ? 'status-error' : 'status-success';

            row.innerHTML = `
                <td>${item.index}</td>
                <td>${item.teacherName}</td>
                <td>${item.classInfo}</td>
                <td>${item.classId}</td>
                <td>${item.processContent}</td>
                <td class="result-column ${resultClass}">${item.result}</td>
                <td class="record-info-column">${item.recordInfo || '-'}</td>
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
                    'authorization': `Bearer ${accessToken}`

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

    // 接口5：保存差评记录
    async function saveTaskRecord(params) {
        try {
            const response = await fetch('https://trmk.teachingrecord.com/api/task/add', {
                method: 'POST',
                headers: {
                    'authorization': `Bearer ${accessToken}`,
                    'content-type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify(params)
            });

            const data = await response.json();
            return data.code === 200;
        } catch (error) {
            console.error('保存差评记录失败:', error);
            return false;
        }
    }

    // 接口6：更新评价跟进状态
    async function updateEvaluationStatus(evaluationId, followStatus) {
        try {
            const response = await fetch(`https://trmk.teachingrecord.com/api/evaluation/operation?follow_status=${followStatus}&id=${evaluationId}`, {
                method: 'POST',
                headers: {
                    'authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            return data.code === 200;
        } catch (error) {
            console.error('更新评价跟进状态失败:', error);
            return false;
        }
    }

    // 处理单行数据
    async function processRow(item, index) {
        let resultMessages = [];

        try {
            // 更新当前行状态为处理中
            updateRowResult(index, '正在处理...', 'status-processing');

            // 步骤a: 搜索老师
            const userId = await searchTeacher(item.teacherName);
            if (!userId) {
                updateRowResult(index, '未找到老师信息', 'status-error');
                return;
            }

            // 步骤b: 获取差评列表
            const evaluationList = await getEvaluationList(userId);
            if (evaluationList.length === 0) {
                updateRowResult(index, '未找到课程信息', 'status-error');
                return;
            }

            // 查找匹配的课程
            const classInfo = evaluationList.find(evaluation =>
                String(evaluation.class_id) === String(item.classId)
            );

            if (!classInfo) {
                updateRowResult(index, '未找到课程信息', 'status-error');
                return;
            }

            // 步骤c: 保存备注
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
                "extra": {
                    ...(classInfo.extra || {}),
                    "remark": item.processContent  // 将Excel的processContent设置到extra.remark
                }
            };

            const saveSuccess = await saveTaskRecord(params);
            if (!saveSuccess) {
                updateRowResult(index, '保存备注失败', 'status-error');
                return;
            }
            resultMessages.push('保存备注成功');

            // 步骤d: 更新跟进状态（如果processContent包含"已移除"）
            if (item.processContent.includes('已移除')) {
                const updateSuccess = await updateEvaluationStatus(classInfo.id, 3);
                if (updateSuccess) {
                    resultMessages.push('更新跟进状态成功');
                } else {
                    resultMessages.push('更新跟进状态失败');
                }
            } else {
                resultMessages.push('无需更新跟进状态');
            }

            // 步骤e: 查看记录信息
            const updatedEvaluationList = await getEvaluationList(userId);
            const updatedClassInfo = updatedEvaluationList.find(evaluation =>
                String(evaluation.class_id) === String(item.classId)
            );

            if (updatedClassInfo) {
                const followStatusText = {
                    1: '未跟进',
                    2: '跟进中',
                    3: '跟进完成'
                };

                const recordInfo = `跟进状态: ${followStatusText[updatedClassInfo.follow_status] || updatedClassInfo.follow_status}\n评论: ${updatedClassInfo.extra?.remark || '无'}`;
                updateRecordInfo(index, recordInfo);
            } else {
                updateRecordInfo(index, '未找到处理结果');
            }

            // 更新处理结果
            updateRowResult(index, resultMessages.join('；'), 'status-success');

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

        // 保存状态
        saveState();
    }

    // 更新记录信息显示
    function updateRecordInfo(index, recordInfo) {
        const rows = dataTableBody.querySelectorAll('tr');
        if (rows[index]) {
            const recordInfoCell = rows[index].querySelector('.record-info-column');
            recordInfoCell.textContent = recordInfo;
        }

        // 同步更新processedData
        if (processedData[index]) {
            processedData[index].recordInfo = recordInfo;
        }

        // 保存状态
        saveState();
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
        isProcessing = true;

        // 如果是重新处理，重置所有数据
        if (currentProcessIndex >= excelData.length) {
            currentProcessIndex = 0;
            processedData = excelData.map(item => ({ ...item, result: '-' }));
            displayDataTable();
        }

        // 登录获取token（如果没有token或需要重新登录）
        if (!accessToken) {
            progressText.textContent = '正在登录...';
            const loginSuccess = await login();
            if (!loginSuccess) {
                alert('登录失败，无法继续处理');
                progressSection.classList.add('hidden');
                startProcess.disabled = false;
                isProcessing = false;
                return;
            }
        }

        // 确保processedData已初始化
        if (processedData.length === 0) {
            processedData = excelData.map(item => ({ ...item }));
        }

        // 从当前位置继续处理数据
        for (let i = currentProcessIndex; i < excelData.length; i++) {
            currentProcessIndex = i;
            const progress = ((i + 1) / excelData.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `正在处理第 ${i + 1}/${excelData.length} 行...`;

            await processRow(excelData[i], i);

            // 更新当前处理位置
            currentProcessIndex = i + 1;
            saveState();

            // 添加延迟避免请求过于频繁
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 处理完成 - 统计结果
        isProcessing = false;

        // 统计处理结果
        const totalCount = excelData.length;
        const successCount = processedData.filter(item =>
            item.result !== '-' &&
            !item.result.includes('未找到') &&
            !item.result.includes('失败') &&
            !item.result.includes('正在处理')
        ).length;
        const errorCount = processedData.filter(item =>
            item.result.includes('未找到') ||
            item.result.includes('失败')
        ).length;

        progressText.textContent = `处理完成！总计 ${totalCount} 条，成功 ${successCount} 条，失败 ${errorCount} 条`;
        console.log(`🎉 处理完成统计:`, {
            总计: totalCount,
            成功: successCount,
            失败: errorCount,
            成功率: `${((successCount / totalCount) * 100).toFixed(1)}%`
        });

        startProcess.disabled = false;
        updateProcessButton();
        exportSection.classList.remove('hidden');
        saveState();
    });

    // 导出Excel功能
    exportExcel.addEventListener('click', function() {
        if (processedData.length === 0) {
            alert('没有数据可导出');
            return;
        }

        // 准备导出数据
        const exportData = [
            ['序号', '教师姓名', '课程信息', '课程ID', '处理内容', '处理结果', '处理后记录信息']
        ];

        processedData.forEach(item => {
            exportData.push([
                item.index,
                item.teacherName,
                item.classInfo,
                item.classId,
                item.processContent,
                item.result,
                item.recordInfo || '-'
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