// 功能二的独立JavaScript文件
(function() {
    // 全局状态变量
    let analysisState = {
        isAnalyzing: false,
        results: [],
        currentIndex: 0,
        teaNameList: [],
        startDate: '',
        endDate: '',
        totalTeachers: 0,
        token1: null,
        token2: null,
        teaListResp1: [],
        teaListResp2: []
    };

    // 最近一次完成结果存储键（用于2小时内回显）
    const LAST_RESULTS_KEY = 'feature2LastResults';

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

    // 下载模板功能 - 使用Chrome扩展API
    function setupDownloadTemplate() {
        const downloadBtn = document.getElementById('downloadTemplate');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                // 使用 Chrome 下载 API
                chrome.downloads.download({
                    url: chrome.runtime.getURL('assets/talk_template.xlsx'),
                    filename: 'talk_template.xlsx'
                });
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

        // 开始统计按钮处理
        const parseBtn = document.getElementById('parseBtn');
        if (parseBtn) {
            parseBtn.addEventListener('click', async function() {
                // 清除之前的分析状态
                clearAnalysisState();

                // 点击开始分析后，移除可能存在的“继续统计”按钮（需求2）
                const _continueBtn = document.getElementById('continueAnalysisBtn');
                if (_continueBtn) _continueBtn.remove();

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
                            displayResults(results);
                            //展示下载按钮
                            showDownButton(results, endDate);
                            // 保存最近一次完成的结果（需求1）
                            saveLastResults(results, endDate);
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
        let results = [...analysisState.results]; // 从保存的结果开始

        try {
            // 如果不是从中断恢复，初始化状态
            if (!analysisState.isAnalyzing) {
                analysisState.isAnalyzing = true;
                analysisState.results = [];
                analysisState.currentIndex = 1; // 从索引1开始（跳过标题行）
                analysisState.teaNameList = teaNameList;
                analysisState.startDate = startDate;
                analysisState.endDate = endDate;
                analysisState.totalTeachers = teaNameList.length - 1; // 减去标题行
                results = [];
            }

            // 步骤1: 获取token和教师列表（如果需要）
            if (!analysisState.token1 || !analysisState.token2 ||
                analysisState.teaListResp1.length === 0 || analysisState.teaListResp2.length === 0) {
                if (messageArea) {
                    messageArea.innerHTML = '<div class="success-message">正在获取认证信息...</div>';
                }

                const token1 = await login('ta-peng', 'tapeng123456');
                const teaListResp1 = token1 ? await getTeacherList(token1) : [];

                const token2 = await login('ta-fonpeng', 'fonpeng123456');
                const teaListResp2 = token2 ? await getTeacherList(token2) : [];

                // 保存tokens和教师列表到分析状态
                analysisState.token1 = token1;
                analysisState.token2 = token2;
                analysisState.teaListResp1 = teaListResp1;
                analysisState.teaListResp2 = teaListResp2;
                saveAnalysisState();
            }

            // 从当前索引继续处理
            for (let i = analysisState.currentIndex; i < teaNameList.length; i++) {
                const teaName = teaNameList[i];

                // 更新进度
                if (messageArea) {
                    messageArea.innerHTML = `<div class="success-message">正在处理第 ${i}/${analysisState.totalTeachers} 位教师: ${teaName}</div>`;
                }

                // 匹配教师ID
                const teacher1 = analysisState.teaListResp1.find(t => t.teaName === teaName);
                const teaId1 = teacher1?.teaId;

                let teaId2 = null;
                if (!teaId1) {
                    const teacher2 = analysisState.teaListResp2.find(t => t.teaName === teaName);
                    teaId2 = teacher2?.teaId;
                }

                // 如果都未匹配到，跳过
                if (!teaId1 && !teaId2) {
                    results.push({
                        name: teaName,
                        openedClass: '',
                        opendClassGte20: '',
                        finishedClass: ''
                    });
                    analysisState.results = results;
                    analysisState.currentIndex = i + 1;
                    saveAnalysisState();
                    displayResults(results);
                    continue;
                }

                // 选择token和teaId
                const token = teaId1 ? analysisState.token1 : analysisState.token2;
                const teaId = teaId1 ? teaId1 : teaId2;

                // 查询课程统计数据
                const statistics = await getClassStatistics(token, teaId, startDate, endDate);

                // 若 resultData.classStatisticsRespDTO 为空，跳过
                if (!statistics || statistics.length === 0) {
                    results.push({
                        name: teaName,
                        openedClass: 0,
                        opendClassGte20: '❎',
                        finishedClass: 0
                    });
                    analysisState.results = results;
                    analysisState.currentIndex = i + 1;
                    saveAnalysisState();
                    displayResults(results);
                    // 休眠0.5秒
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue;
                }

                // 提取列表中第一个元素的 openedClass 和 finishedClass 值
                const stat = statistics[0];
                const openedClass = stat.openedClass || 0;
                const finishedClass = stat.finishedClass || 0;
                const opendClassGte20 = openedClass >= 20 ? '✅' : '❎';

                results.push({
                    name: teaName,
                    openedClass: openedClass,
                    opendClassGte20: opendClassGte20,
                    finishedClass: finishedClass
                });

                analysisState.results = results;
                analysisState.currentIndex = i + 1;
                saveAnalysisState();
                displayResults(results);

                // 休眠0.5秒
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // 分析完成，清除状态
            clearAnalysisState();

            // 显示完成消息
            if (messageArea) {
                messageArea.innerHTML = '<div class="success-message">数据处理完成</div>';
            }

            // 展示下载按钮
            showDownButton(results, endDate);

            // 保存最近一次完成的结果（需求1）
            saveLastResults(results, endDate);

            // 分析完成后不再展示“正在继续统计”按钮（需求3）
            const _continueBtnDone = document.getElementById('continueAnalysisBtn');
            if (_continueBtnDone) _continueBtnDone.remove();

            return results;
        } catch (error) {
            // 保存当前状态以便恢复
            saveAnalysisState();
            throw new Error(`处理教师数据失败: ${error.message}`);
        }
    }

    // 保存分析状态到chrome.storage
    function saveAnalysisState() {
        chrome.storage.local.set({ analysisState: analysisState });
    }

    // 清除分析状态
    function clearAnalysisState() {
        analysisState = {
            isAnalyzing: false,
            results: [],
            currentIndex: 0,
            teaNameList: [],
            startDate: '',
            endDate: '',
            totalTeachers: 0,
            token1: null,
            token2: null,
            teaListResp1: [],
            teaListResp2: []
        };
        chrome.storage.local.remove(['analysisState']);
    }

    // 加载分析状态
    function loadAnalysisState() {
        chrome.storage.local.get(['analysisState', LAST_RESULTS_KEY], function(result) {
            // 未完成任务优先显示继续统计
            if (result.analysisState && result.analysisState.isAnalyzing) {
                analysisState = result.analysisState;
                if (analysisState.results.length > 0) {
                    displayResults(analysisState.results);
                }
                showContinueAnalysisButton();
                return;
            }

            // 2小时内进入则展示上次完成结果并展示下载按钮（需求1）
            const last = result[LAST_RESULTS_KEY];
            if (last && Array.isArray(last.results) && last.results.length > 0 && last.savedAt) {
                const now = Date.now();
                const TWO_HOURS = 2 * 60 * 60 * 1000;
                if (now - last.savedAt <= TWO_HOURS) {
                    displayResults(last.results);
                    showDownButton(last.results, last.endDate || '');
                }
            }
        });
    }

    // 显示继续统计按钮
    function showContinueAnalysisButton() {
        const container = document.querySelector('.container');
        const messageArea = document.getElementById('messageArea');

        // 移除已存在的继续统计按钮
        const existingContinueBtn = document.getElementById('continueAnalysisBtn');
        if (existingContinueBtn) {
            existingContinueBtn.remove();
        }

        // 添加继续统计按钮（统一样式）
        const continueBtn = document.createElement('button');
        continueBtn.id = 'continueAnalysisBtn';
        continueBtn.textContent = '继续统计';
        continueBtn.className = 'btn btn-warning';

        continueBtn.addEventListener('click', function() {
            continueBtn.disabled = true;
            continueBtn.textContent = '正在继续统计...';

            // 继续统计过程
            processTeacherData(
                analysisState.teaNameList,
                analysisState.startDate,
                analysisState.endDate
            ).catch(error => {
                if (messageArea) {
                    messageArea.innerHTML = `<div class="error-message">错误：${error.message}</div>`;
                }
            });
        });

        container.appendChild(continueBtn);

        if (messageArea) {
            messageArea.innerHTML = '<div class="success-message">检测到未完成的分析任务，您可以选择继续统计</div>';
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
        const headers = showIndex ? ['序号', '教师姓名', '开课数', '开课数大于等于20', '完课数'] : ['教师姓名', '开课数', '开课数大于等于20', '完课数'];

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
                ? [index + 1, result.name, result.openedClass, result.opendClassGte20, result.finishedClass]
                : [result.name, result.openedClass, result.opendClassGte20, result.finishedClass];

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
    function showDownButton(results, endDate) {
        const messageArea = document.getElementById('messageArea');
        const container = document.querySelector('.container');

        // 若已存在下载按钮，先移除，避免重复
        const existed = document.getElementById('downloadResultsBtn');
        if (existed) existed.remove();

        // 添加下载按钮（统一样式）
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'downloadResultsBtn';
        downloadBtn.textContent = `下载结果文件 talk_statistics_${endDate}.xlsx`;
        downloadBtn.className = 'btn btn-success mt-20';
        downloadBtn.addEventListener('click', function() {
            downloadResults(results, endDate);
        });

        container.appendChild(downloadBtn);

        // 显示完成消息
        if (messageArea) {
            messageArea.innerHTML = '<div class="success-message">数据处理完成</div>';
        }
    }

    // 下载结果
    function downloadResults(results, endDate) {
        // 创建工作簿
        const wb = XLSX.utils.book_new();

        // 准备数据（包含标题行）
        const wsData = [
            ['教师姓名', '开课数', '开课数大于等于20', '完课数'], // 表头
            ...results.map(result => [
                result.name,
                result.openedClass,
                result.opendClassGte20,
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

    // 保存最近一次完成的结果（2小时内展示）
    function saveLastResults(results, endDate) {
        const data = {};
        data[LAST_RESULTS_KEY] = {
            results: results,
            endDate: endDate,
            savedAt: Date.now()
        };
        chrome.storage.local.set(data);
    }

    // DOM加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        setDefaultDates();
        setupDateListeners();
        setupDownloadTemplate();
        setupFileUpload();
        // 加载之前保存的分析状态
        loadAnalysisState();
    });
})();
