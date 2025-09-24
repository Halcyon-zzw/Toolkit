// 功能二的独立JavaScript文件
(function() {
    // 设置默认日期
    function setDefaultDates() {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 6); // 7天后（包含当天，所以是+6）

        // 格式化日期为 YYYY-MM-DD
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');

        if (startDateInput && endDateInput) {
            startDateInput.value = formatDate(today);
            endDateInput.value = formatDate(endDate);
        }
    }

    // 当结束日期改变时，自动更新开始日期为结束日期的7天前
    function setupDateListeners() {
        const endDateInput = document.getElementById('endDate');
        if (endDateInput) {
            endDateInput.addEventListener('change', function() {
                const endDate = new Date(this.value);
                if (!isNaN(endDate)) {
                    const startDate = new Date(endDate);
                    startDate.setDate(endDate.getDate() - 6); // 7天前（包含当天，所以是-6）

                    // 格式化日期为 YYYY-MM-DD
                    const formatDate = (date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    };

                    const startDateInput = document.getElementById('startDate');
                    if (startDateInput) {
                        startDateInput.value = formatDate(startDate);
                    }
                }
            });
        }
    }

    // 下载模板功能
    function setupDownloadTemplate() {
        const downloadBtn = document.getElementById('downloadTemplate');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                // 创建一个隐藏的a标签用于下载
                const a = document.createElement('a');
                a.href = 'talk_template.xlsx'; // 相对路径，Chrome扩展会正确解析
                a.download = 'talk_template.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        }
    }

    // 文件上传处理
    function setupFileUpload() {
        let uploadedFile = null;

        const fileInput = document.getElementById('excelFile');
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                const fileNameDisplay = document.getElementById('fileName');
                const parseBtn = document.getElementById('parseBtn');

                // 清除之前的消息和数据
                const messageArea = document.getElementById('messageArea');
                const columnData = document.getElementById('columnData');

                if (messageArea) messageArea.innerHTML = '';
                if (columnData) columnData.classList.add('hidden');
                if (fileNameDisplay) fileNameDisplay.textContent = '';

                if (!file) {
                    if (parseBtn) parseBtn.disabled = true;
                    uploadedFile = null;
                    return;
                }

                // 检查文件类型
                if (!file.name.endsWith('.xlsx')) {
                    if (messageArea) {
                        messageArea.innerHTML = '<div class="error-message">错误：请上传.xlsx格式的Excel文件</div>';
                    }
                    if (parseBtn) parseBtn.disabled = true;
                    uploadedFile = null;
                    return;
                }

                if (fileNameDisplay) {
                    fileNameDisplay.textContent = '已选择: ' + file.name;
                }
                uploadedFile = file;
                if (parseBtn) parseBtn.disabled = false;
            });
        }

        // 开始解析按钮处理
        const parseBtn = document.getElementById('parseBtn');
        if (parseBtn) {
            parseBtn.addEventListener('click', async function() {
                if (!uploadedFile) {
                    return;
                }

                const messageArea = document.getElementById('messageArea');
                const columnData = document.getElementById('columnData');

                // 清除之前的消息和数据
                if (messageArea) messageArea.innerHTML = '';
                if (columnData) columnData.classList.add('hidden');

                try {
                    // 获取日期范围
                    const startDate = document.getElementById('startDate').value;
                    const endDate = document.getElementById('endDate').value;

                    if (!startDate || !endDate) {
                        if (messageArea) {
                            messageArea.innerHTML = '<div class="error-message">错误：请选择日期范围</div>';
                        }
                        return;
                    }

                    // 使用xlsx库读取Excel文件
                    const reader = new FileReader();
                    reader.onload = async function(e) {
                        try {
                            const data = new Uint8Array(e.target.result);
                            const workbook = XLSX.read(data, {type: 'array'});

                            // 获取第一个工作表
                            const firstSheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[firstSheetName];

                            // 将工作表转换为JSON格式
                            const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

                            if (jsonData.length === 0) {
                                if (messageArea) {
                                    messageArea.innerHTML = '<div class="error-message">错误：Excel文件为空</div>';
                                }
                                return;
                            }

                            // 获取第一列数据
                            const firstColumnData = [];
                            for (let i = 0; i < jsonData.length; i++) {
                                const row = jsonData[i];
                                firstColumnData.push(row[0] !== undefined ? row[0] : '');
                            }

                            // 注意：根据需求，第一列内容不再展示在页面

                            // 开始处理数据
                            if (messageArea) {
                                messageArea.innerHTML = '<div class="success-message">正在处理数据，请稍候...</div>';
                            }

                            // 处理教师数据
                            const results = await processTeacherData(firstColumnData, startDate, endDate);

                            // 显示结果
                            displayResultsAndDown(results, endDate);

                        } catch (error) {
                            if (messageArea) {
                                messageArea.innerHTML = `<div class="error-message">错误：文件解析失败 - ${error.message}</div>`;
                            }
                        }
                    };

                    reader.onerror = function() {
                        const messageArea = document.getElementById('messageArea');
                        if (messageArea) {
                            messageArea.innerHTML = '<div class="error-message">错误：文件读取失败</div>';
                        }
                    };

                    // 读取为ArrayBuffer
                    reader.readAsArrayBuffer(uploadedFile);
                } catch (error) {
                    if (messageArea) {
                        messageArea.innerHTML = `<div class="error-message">错误：处理失败 - ${error.message}</div>`;
                    }
                }
            });
        }
    }

    // 登录获取token
    async function login(userName, password) {
        const response = await fetch('https://www.talk915.com/users/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
                loginId: userName,
                isApp: 2,
                loginMode: 1
            })
        });

        if (!response.ok) {
            throw new Error(`登录失败: ${response.status}`);
        }

        const data = await response.json();
        if (data.resultCode !== 0) {
            throw new Error(`登录失败: ${data.resultMessage}`);
        }

        return data.resultData?.token;
    }

    // 获取教师列表
    async function getTeacherList(token) {
        const response = await fetch('https://www.talk915.com/users/teacherProxy/queryScheduledClassesSelectList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            }
        });

        if (!response.ok) {
            throw new Error(`获取教师列表失败: ${response.status}`);
        }

        const data = await response.json();
        if (data.resultCode !== 0) {
            throw new Error(`获取教师列表失败: ${data.resultMessage}`);
        }

        return data.resultData || [];
    }

    // 查询课程统计数据
    async function getClassStatistics(token, teacherId, startDate, endDate) {
        const response = await fetch('https://www.talk915.com/users/teacherProxy/queryClassStatisticsPageList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({
                area: 0,
                tutorName: "",
                tutorStatus: 2,
                classStartDate: startDate,
                classEndDate: endDate,
                currPage: 1,
                pageSize: 10,
                teacherId: teacherId,
                exportStatus: 0
            })
        });

        if (!response.ok) {
            throw new Error(`获取课程统计数据失败: ${response.status}`);
        }

        const data = await response.json();
        if (data.resultCode !== 0) {
            throw new Error(`获取课程统计数据失败: ${data.resultMessage}`);
        }

        return data.resultData?.classStatisticsRespDTO || [];
    }

    // 处理教师数据
    async function processTeacherData(teaNameList, startDate, endDate) {
        const messageArea = document.getElementById('messageArea');
        const results = [];

        try {
            // 步骤1: 获取token和教师列表
            if (messageArea) {
                messageArea.innerHTML = '<div class="success-message">正在获取认证信息...</div>';
            }

            const token1 = await login('ta-peng', 'tapeng123456');
            const teaListResp1 = token1 ? await getTeacherList(token1) : [];

            const token2 = await login('ta-fonpeng', 'fonpeng123456');
            const teaListResp2 = token2 ? await getTeacherList(token2) : [];

            // 步骤2: 遍历处理每个教师（注意过滤标题行）
            for (let i = 1; i < teaNameList.length; i++) {
                const teaName = teaNameList[i];

                // 更新进度
                if (messageArea) {
                    messageArea.innerHTML = `<div class="success-message">正在处理第 ${i}/${teaNameList.length - 1} 位教师: ${teaName}</div>`;
                }

                // 匹配教师ID
                const teacher1 = teaListResp1.find(t => t.teaName === teaName);
                const teaId1 = teacher1?.teaId;

                let teaId2 = null;
                if (!teaId1) {
                    const teacher2 = teaListResp2.find(t => t.teaName === teaName);
                    teaId2 = teacher2?.teaId;
                }

                // 如果都未匹配到，跳过
                if (!teaId1 && !teaId2) {
                    results.push({
                        name: teaName,
                        openedClass: '',
                        status: '',
                        finishedClass: ''
                    });
                    continue;
                }

                // 选择token和teaId
                const token = teaId1 ? token1 : token2;
                const teaId = teaId1 ? teaId1 : teaId2;

                // 查询课程统计数据
                const statistics = await getClassStatistics(token, teaId, startDate, endDate);

                // 若 resultData.classStatisticsRespDTO 为空，跳过
                if (!statistics || statistics.length === 0) {
                    results.push({
                        name: teaName,
                        openedClass: '',
                        status: '',
                        finishedClass: ''
                    });
                    continue;
                }

                // 提取列表中第一个元素的 openedClass 和 finishedClass 值
                const stat = statistics[0];
                const openedClass = stat.openedClass || 0;
                const finishedClass = stat.finishedClass || 0;
                const status = openedClass >= 20 ? '✅' : '❎';

                results.push({
                    name: teaName,
                    openedClass: openedClass,
                    status: status,
                    finishedClass: finishedClass
                });
                displayResults(results);
                // 休眠0.5秒
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            return results;
        } catch (error) {
            throw new Error(`处理教师数据失败: ${error.message}`);
        }
    }

    // 提取创建表格的方法
    function createResultsTable(results, showIndex = false) {
        const table = document.createElement('table');
        table.id = 'resultsTable';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '20px';
        table.style.fontSize = '14px';

        // 表格头部
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.style.backgroundColor = '#f8f9fa';
        headerRow.style.border = '1px solid #ddd';

        // 根据是否显示序号动态设置表头
        const headers = showIndex ? ['序号', '教师姓名', '开课数', '状态', '完课数'] : ['教师姓名', '开课数', '状态', '完课数'];

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.border = '1px solid #ddd';
            th.style.padding = '8px';
            th.style.textAlign = 'left';
            th.style.fontWeight = 'bold';
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // 表格主体
        const tbody = document.createElement('tbody');

        results.forEach((result, index) => {
            const row = document.createElement('tr');
            row.style.border = '1px solid #ddd';

            // 为奇数行添加背景色
            if (index % 2 === 1) {
                row.style.backgroundColor = '#f8f9fa';
            }

            // 根据是否显示序号动态设置列数据
            const columns = showIndex
                ? [index + 1, result.name, result.openedClass, result.status, result.finishedClass]
                : [result.name, result.openedClass, result.status, result.finishedClass];

            columns.forEach(cellText => {
                const td = document.createElement('td');
                td.textContent = cellText;
                td.style.border = '1px solid #ddd';
                td.style.padding = '8px';
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        return table;
    }

    // 显示结果
    function displayResults(results) {
        const messageArea = document.getElementById('messageArea');
        const container = document.querySelector('.container');

        // 移除之前的结果表格（如果存在）
        const existingTable = document.getElementById('resultsTable');
        const existingDownloadBtn = document.getElementById('downloadResultsBtn');
        if (existingTable) {
            existingTable.remove();
        }
        if (existingDownloadBtn) {
            existingDownloadBtn.remove();
        }

        // 创建结果表格
        const table = createResultsTable(results, true);

        // 添加到页面
        container.appendChild(table);
    }

    // 显示结果
    function displayResultsAndDown(results, endDate) {
        const messageArea = document.getElementById('messageArea');
        const container = document.querySelector('.container');

        // 移除之前的结果表格（如果存在）
        const existingTable = document.getElementById('resultsTable');
        const existingDownloadBtn = document.getElementById('downloadResultsBtn');
        if (existingTable) {
            existingTable.remove();
        }
        if (existingDownloadBtn) {
            existingDownloadBtn.remove();
        }

        // 创建结果表格
        const table = createResultsTable(results);

        // 添加到页面
        container.appendChild(table);

        // 添加下载按钮
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'downloadResultsBtn';
        downloadBtn.textContent = `下载结果文件 talk_statistics_${endDate}.xlsx`;
        downloadBtn.style.marginTop = '20px';
        downloadBtn.style.background = '#28a745';
        downloadBtn.addEventListener('click', function() {
            downloadResults(results, endDate);
        });

        container.appendChild(downloadBtn);

        // 显示完成消息
        if (messageArea) {
            messageArea.innerHTML = '<div class="success-message">数据处理完成！</div>';
        }
    }

    // 下载结果
    function downloadResults(results, endDate) {
        // 创建工作簿
        const wb = XLSX.utils.book_new();

        // 准备数据（包含标题行）
        const wsData = [
            ['教师姓名', '开课数', '状态', '完课数'], // 表头
            ...results.map(result => [
                result.name,
                result.openedClass,
                result.status,
                result.finishedClass
            ])
        ];

        // 创建工作表
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '教师课程统计');

        // 生成文件名
        const filename = `talk_statistics_${endDate}.xlsx`;

        // 下载文件
        XLSX.writeFile(wb, filename);
    }

    // DOM加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        setDefaultDates();
        setupDateListeners();
        setupDownloadTemplate();
        setupFileUpload();
    });
})();
