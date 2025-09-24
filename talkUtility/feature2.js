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
            parseBtn.addEventListener('click', function() {
                if (!uploadedFile) {
                    return;
                }
                
                const messageArea = document.getElementById('messageArea');
                const columnData = document.getElementById('columnData');
                const columnList = document.getElementById('columnList');
                
                // 清除之前的消息和数据
                if (messageArea) messageArea.innerHTML = '';
                if (columnData) columnData.classList.add('hidden');
                
                // 使用xlsx库读取Excel文件
                const reader = new FileReader();
                reader.onload = function(e) {
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
                        
                        // 显示第一列数据
                        if (columnList) {
                            columnList.innerHTML = '';
                            firstColumnData.forEach((value, index) => {
                                const rowElement = document.createElement('div');
                                rowElement.textContent = `${index === 0 ? '标题: ' : `第${index}行: `}${value}`;
                                columnList.appendChild(rowElement);
                            });
                        }
                        
                        if (columnData) {
                            columnData.classList.remove('hidden');
                        }
                        if (messageArea) {
                            messageArea.innerHTML = '<div class="success-message">文件解析成功！</div>';
                        }
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
            });
        }
    }
    
    // DOM加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        setDefaultDates();
        setupDateListeners();
        setupDownloadTemplate();
        setupFileUpload();
    });
})();
