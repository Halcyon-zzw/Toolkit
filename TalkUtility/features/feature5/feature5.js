// feature5.js - 简历提取

const STORAGE_KEY = 'feature5_data';

// 列字段定义，与表格列顺序一致
const EDITABLE_FIELDS = [
  '沟通渠道', '名字', '语种', '国家', '邮箱', '简历链接', '来源', '网站沟通执行人',
  '初选通过日期', '有无教资',
  '是否需邮件提醒添加WS/Teams', '邮件提醒日期', '邮件执行人',
  'WA/Teams沟通执行人', 'WA/Teams添加日期', 'WA/Teams账号',
  '是否需邮件催发checklist/self-intro', '邮件催发日期', '邮件执行人2',
  'WA/Teams及问卷确认最大开课时长', 'WA/Teams及问卷确认开课时段',
  '特殊备注', '是否约面试', '不约面试原因', '面试时间'
];

// 不可编辑（由提取逻辑填充）的列
const AUTO_FIELDS = new Set(['沟通渠道', '名字', '语种', '国家', '邮箱', '简历链接', '来源', '网站沟通执行人', '有无教资', 'WA/Teams账号']);

let rows = [];
let cookieStr = '';

function isChromeExtension() {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}

// ─── 初始化 ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  loadFromStorage();

  document.getElementById('saveCookieBtn').addEventListener('click', saveCookie);
  document.getElementById('addRowBtn').addEventListener('click', addRow);
  document.getElementById('extractAllBtn').addEventListener('click', extractAll);
  document.getElementById('exportBtn').addEventListener('click', exportExcel);
});

function loadFromStorage() {
  if (!isChromeExtension()) {
    renderTable();
    return;
  }
  chrome.storage.local.get([STORAGE_KEY], function (result) {
    const saved = result[STORAGE_KEY] || { cookie: '', rows: [] };
    cookieStr = saved.cookie || '';
    rows = saved.rows || [];
    document.getElementById('cookieInput').value = cookieStr;
    renderTable();
  });
}

function saveToStorage() {
  if (!isChromeExtension()) return;
  chrome.storage.local.set({ [STORAGE_KEY]: { cookie: cookieStr, rows: rows } });
}

// ─── Cookie ────────────────────────────────────────────────────────────────

function saveCookie() {
  cookieStr = document.getElementById('cookieInput').value.trim();
  saveToStorage();
  const btn = document.getElementById('saveCookieBtn');
  btn.textContent = '已保存';
  setTimeout(() => { btn.textContent = '保存'; }, 1500);
}

// ─── 行操作 ────────────────────────────────────────────────────────────────

function createEmptyRow() {
  const row = { teacherId: '', 备注: '' };
  EDITABLE_FIELDS.forEach(f => { row[f] = ''; });
  return row;
}

function addRow() {
  rows.push(createEmptyRow());
  saveToStorage();
  renderTable();
  // 滚动到最后一行
  const tbody = document.getElementById('tableBody');
  const lastRow = tbody.lastElementChild;
  if (lastRow) lastRow.scrollIntoView({ block: 'nearest' });
}

function deleteRow(index) {
  rows.splice(index, 1);
  saveToStorage();
  renderTable();
}

// ─── 渲染表格 ──────────────────────────────────────────────────────────────

function renderTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  rows.forEach((row, index) => {
    tbody.appendChild(createRowElement(row, index));
  });
}

function createRowElement(row, index) {
  const tr = document.createElement('tr');
  tr.dataset.index = index;

  // teacherId 固定左列
  const tdTeacher = document.createElement('td');
  tdTeacher.className = 'col-fixed-left';
  const teacherCell = document.createElement('div');
  teacherCell.className = 'teacher-id-cell';

  const teacherInput = document.createElement('input');
  teacherInput.type = 'text';
  teacherInput.value = row.teacherId || '';
  teacherInput.placeholder = '输入 teacherId';
  teacherInput.addEventListener('input', function () {
    rows[index].teacherId = this.value;
    extractBtn.style.display = this.value.trim() ? 'inline-block' : 'none';
    saveToStorage();
  });

  const extractBtn = document.createElement('button');
  extractBtn.className = 'btn-extract';
  extractBtn.textContent = '提取';
  extractBtn.style.display = row.teacherId ? 'inline-block' : 'none';
  extractBtn.addEventListener('click', function () {
    extractRow(index, tr, extractBtn);
  });

  teacherCell.appendChild(teacherInput);
  teacherCell.appendChild(extractBtn);
  tdTeacher.appendChild(teacherCell);
  tr.appendChild(tdTeacher);

  // 中间可编辑列
  EDITABLE_FIELDS.forEach(field => {
    const td = document.createElement('td');

    if (field === '有无教资') {
      const btn = document.createElement('button');
      const val = row[field];
      btn.className = 'cert-btn ' + (val === '有' ? 'has' : 'none');
      btn.textContent = val || '无';
      btn.addEventListener('click', function () {
        const newVal = rows[index]['有无教资'] === '有' ? '无' : '有';
        rows[index]['有无教资'] = newVal;
        btn.textContent = newVal;
        btn.className = 'cert-btn ' + (newVal === '有' ? 'has' : 'none');
        saveToStorage();
      });
      td.appendChild(btn);

    } else if (field === '国家') {
      td.className = 'country-cell';
      td.setAttribute('contenteditable', 'true');
      td.textContent = row[field] || '';
      td.addEventListener('blur', function () {
        rows[index][field] = this.textContent;
        saveToStorage();
      });

    } else if (field === '简历链接') {
      td.className = 'resume-link';
      const link = row[field];
      if (link) {
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.textContent = link.length > 30 ? link.substring(0, 30) + '...' : link;
        a.title = link;
        td.appendChild(a);
      }
      td.setAttribute('contenteditable', 'true');
      td.addEventListener('blur', function () {
        const val = this.textContent.trim();
        rows[index][field] = val;
        // 刷新链接显示
        this.innerHTML = '';
        if (val) {
          const a = document.createElement('a');
          a.href = val;
          a.target = '_blank';
          a.textContent = val.length > 30 ? val.substring(0, 30) + '...' : val;
          a.title = val;
          this.appendChild(a);
        }
        saveToStorage();
      });

    } else if (AUTO_FIELDS.has(field)) {
      // 自动填充字段，支持查看但也可手动修改
      td.setAttribute('contenteditable', 'true');
      td.textContent = row[field] || '';
      td.style.background = row[field] ? '' : '#fafafa';
      td.addEventListener('blur', function () {
        rows[index][field] = this.textContent;
        saveToStorage();
      });

    } else {
      // 普通可编辑列
      td.setAttribute('contenteditable', 'true');
      td.textContent = row[field] || '';
      td.addEventListener('blur', function () {
        rows[index][field] = this.textContent;
        saveToStorage();
      });
    }

    tr.appendChild(td);
  });

  // 操作列（删除）
  const tdAction = document.createElement('td');
  tdAction.className = 'col-action';
  const delBtn = document.createElement('button');
  delBtn.className = 'btn-del';
  delBtn.textContent = '×';
  delBtn.title = '删除此行';
  delBtn.addEventListener('click', function () {
    deleteRow(index);
  });
  tdAction.appendChild(delBtn);
  tr.appendChild(tdAction);

  // 备注固定右列
  const tdRemark = document.createElement('td');
  tdRemark.className = 'col-fixed-right remark-cell';
  const textarea = document.createElement('textarea');
  textarea.value = row['备注'] || '';
  textarea.placeholder = '备注（提取后自动追加教学年限）';
  textarea.addEventListener('blur', function () {
    rows[index]['备注'] = this.value;
    saveToStorage();
  });
  tdRemark.appendChild(textarea);
  tr.appendChild(tdRemark);

  return tr;
}

// ─── 提取逻辑 ──────────────────────────────────────────────────────────────

async function extractRow(index, trEl, extractBtn) {
  const teacherId = rows[index].teacherId.trim();
  if (!teacherId) {
    alert('请先输入 teacherId');
    return;
  }
  if (!cookieStr) {
    alert('请先输入并保存 Cookie');
    return;
  }

  // 更新视觉状态
  trEl.className = 'row-loading';
  extractBtn.textContent = '提取中';
  extractBtn.classList.add('loading');
  extractBtn.disabled = true;

  try {
    const actInfo = await fetchActInfo(teacherId);
    if (!actInfo) {
      trEl.className = 'row-error';
      rows[index]['名字'] = '未找到';
      renderTableRow(index, trEl);
      saveToStorage();
      return;
    }

    const teacher = actInfo.teacher;
    const jobInfo = actInfo.job_info;

    // 获取简历 HTML
    const resumeHtml = await fetchResumeHtml(teacher.tk);

    // 解析简历信息
    const resumeInfo = parseResumeHtml(resumeHtml);

    // 判断国家/IP一致性
    const country = teacher.nationality ? teacher.nationality.cname : '';
    const ipCode = teacher.ip_country || '';
    const ipCountry = getCountryName(ipCode);
    const countryDisplay = (country && ipCountry && country !== ipCountry)
      ? country + '\nip地址:' + ipCountry
      : country;

    // 判断教资
    const certList = teacher.certification || [];
    const hasCert = certList.some(c => c && ['TEFL', 'TESOL'].includes(c.name));

    // 简历链接
    const resumeLink = 'https://teacherrecord.com/service/shareResume/' + teacher.tk;

    // 来源
    const jobId = jobInfo ? jobInfo.id : '';
    const source = jobId ? 'TR' + jobId : '';

    // WA/Teams账号
    const waTeams = [resumeInfo.whatsapp, resumeInfo.teams].filter(Boolean).join('\n');

    // 备注：已有内容 + teachingExperience
    const existingRemark = rows[index]['备注'] || '';
    const newRemark = existingRemark
      ? existingRemark + (resumeInfo.teachingExperience ? '\n' + resumeInfo.teachingExperience : '')
      : (resumeInfo.teachingExperience || '');

    // 写入行数据
    rows[index]['沟通渠道'] = 'Whatsapp';
    rows[index]['名字'] = teacher.name || '';
    rows[index]['语种'] = '英语';
    rows[index]['国家'] = countryDisplay;
    rows[index]['邮箱'] = resumeInfo.email || '';
    rows[index]['简历链接'] = resumeLink;
    rows[index]['来源'] = source;
    rows[index]['网站沟通执行人'] = 'Seven';
    rows[index]['有无教资'] = hasCert ? '有' : '无';
    rows[index]['WA/Teams账号'] = waTeams;
    rows[index]['备注'] = newRemark;

    trEl.className = 'row-done';
    saveToStorage();
    renderTable();

  } catch (err) {
    console.error('提取失败', err);
    trEl.className = 'row-error';
    rows[index]['名字'] = '提取失败: ' + err.message;
    saveToStorage();
    renderTable();
  }
}

async function fetchActInfo(teacherId) {
  // 第一次请求：type=unprocessed
  let data = await postListAct(teacherId, 'unprocessed');
  if (!data || !data.data || data.data.length === 0) {
    // 第二次请求：type=pre_review
    data = await postListAct(teacherId, 'pre_review');
  }
  if (!data || !data.data || data.data.length === 0) {
    return null;
  }
  return data.data[0];
}

async function postListAct(name, type) {
  const body = new URLSearchParams({
    name: name,
    type: type,
    limit: '10',
    page: '1',
    job_id: '',
    country: '',
    ethnicity: '',
    tefl_filter: '',
    sex: '',
    advance_event: '',
    skype: '',
    wechat: '',
    whats_app: '',
    phone: '',
    qq: '',
    expect_filter: '',
    degree: '',
    sort: ''
  });

  const resp = await fetch('https://teacherrecord.com/company/recruit/list_act', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieStr
    },
    body: body.toString()
  });

  if (!resp.ok) throw new Error('list_act 请求失败: ' + resp.status);
  return await resp.json();
}

async function fetchResumeHtml(tk) {
  const url = `https://teacherrecord.com/service/shareResume/${tk}?lang=cn&head_logo=-1&type=zl`;
  const resp = await fetch(url, {
    headers: { 'Cookie': cookieStr }
  });
  if (!resp.ok) throw new Error('简历页请求失败: ' + resp.status);
  return await resp.text();
}

function parseResumeHtml(html) {
  // 提取邮箱
  const emailMatch = html.match(/copyText\('([^']+@[^']+)'\)/);
  const email = emailMatch ? emailMatch[1] : '';

  // 提取 WhatsApp
  const waMatch = html.match(/<strong>WhatsApp:&nbsp;<\/strong>([^<]+)/);
  const whatsapp = waMatch ? waMatch[1].trim() : '';

  // 提取 Teams
  const teamsMatch = html.match(/<strong>Teams:&nbsp;<\/strong>([^<]+)/);
  const teams = teamsMatch ? teamsMatch[1].trim() : '';

  // 提取教学年限
  const expMatch = html.match(/<strong>教学年限: <\/strong>([^<]+)<br\/>/);
  const teachingExperience = expMatch ? expMatch[1].trim() : '';

  return { email, whatsapp, teams, teachingExperience };
}

// ─── 全部提取 ──────────────────────────────────────────────────────────────

async function extractAll() {
  if (!cookieStr) {
    alert('请先输入并保存 Cookie');
    return;
  }
  const btn = document.getElementById('extractAllBtn');
  btn.disabled = true;
  btn.textContent = '提取中...';

  const tbody = document.getElementById('tableBody');
  for (let i = 0; i < rows.length; i++) {
    if (!rows[i].teacherId || !rows[i].teacherId.trim()) continue;
    const trEl = tbody.children[i];
    const extractBtn = trEl ? trEl.querySelector('.btn-extract') : null;
    await extractRow(i, trEl || document.createElement('tr'), extractBtn || document.createElement('button'));
  }

  btn.disabled = false;
  btn.textContent = '全部提取';
}

// ─── 辅助：更新单行 DOM（renderTable 中已整体重渲染，此处备用） ──────────────

function renderTableRow(index, trEl) {
  renderTable();
}

// ─── 导出 Excel ───────────────────────────────────────────────────────────

function exportExcel() {
  if (rows.length === 0) {
    alert('暂无数据可导出');
    return;
  }

  const headers = [
    'teacherId', '沟通渠道', '名字', '语种', '国家', '邮箱', '简历链接', '来源',
    '网站沟通执行人', '初选通过日期', '有无教资',
    '是否需邮件提醒添加WS/Teams', '邮件提醒日期', '邮件执行人',
    'WA/Teams沟通执行人', 'WA/Teams添加日期', 'WA/Teams账号',
    '是否需邮件催发checklist/self-intro', '邮件催发日期', '邮件执行人',
    'WA/Teams及问卷确认最大开课时长', 'WA/Teams及问卷确认开课时段',
    '特殊备注', '是否约面试', '不约面试原因', '面试时间', '备注'
  ];

  const dataArr = [headers];
  rows.forEach(row => {
    dataArr.push([
      row.teacherId || '',
      row['沟通渠道'] || '',
      row['名字'] || '',
      row['语种'] || '',
      row['国家'] || '',
      row['邮箱'] || '',
      row['简历链接'] || '',
      row['来源'] || '',
      row['网站沟通执行人'] || '',
      row['初选通过日期'] || '',
      row['有无教资'] || '',
      row['是否需邮件提醒添加WS/Teams'] || '',
      row['邮件提醒日期'] || '',
      row['邮件执行人'] || '',
      row['WA/Teams沟通执行人'] || '',
      row['WA/Teams添加日期'] || '',
      row['WA/Teams账号'] || '',
      row['是否需邮件催发checklist/self-intro'] || '',
      row['邮件催发日期'] || '',
      row['邮件执行人2'] || '',
      row['WA/Teams及问卷确认最大开课时长'] || '',
      row['WA/Teams及问卷确认开课时段'] || '',
      row['特殊备注'] || '',
      row['是否约面试'] || '',
      row['不约面试原因'] || '',
      row['面试时间'] || '',
      row['备注'] || ''
    ]);
  });

  const xlsxUrl = chrome.runtime.getURL('lib/xlsx.full.min.js');
  const script = document.createElement('script');
  script.src = xlsxUrl;
  script.onload = function () {
    const ws = XLSX.utils.aoa_to_sheet(dataArr);
    // 设置列宽
    ws['!cols'] = headers.map((h, i) => {
      if (i === 0 || i === headers.length - 1) return { wch: 20 };
      if (h.length > 10) return { wch: h.length + 4 };
      return { wch: 14 };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '简历提取');
    const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(wb, `简历提取_${ts}.xlsx`);
  };
  // 如果 XLSX 已加载，直接执行
  if (typeof XLSX !== 'undefined') {
    script.onload();
  } else {
    document.head.appendChild(script);
  }
}

// ─── 国家代码表 ────────────────────────────────────────────────────────────

function getCountryName(code) {
  if (!code) return '';
  const found = COUNTRY_CODE_LIST.find(c => c.value === code.toUpperCase());
  return found ? found.name : code;
}

const COUNTRY_CODE_LIST = [
  { value: 'CN', name: '中国' },
  { value: 'TW', name: '中国台湾' },
  { value: 'GB', name: '英国' },
  { value: 'US', name: '美国' },
  { value: 'AU', name: '澳大利亚' },
  { value: 'CA', name: '加拿大' },
  { value: 'NZ', name: '新西兰' },
  { value: 'JP', name: '日本' },
  { value: 'ZA', name: '南非' },
  { value: 'RU', name: '俄罗斯' },
  { value: 'ZW', name: '津巴布韦' },
  { value: 'IT', name: '意大利' },
  { value: 'MX', name: '墨西哥' },
  { value: 'MY', name: '马来西亚' },
  { value: 'PH', name: '菲律宾' },
  { value: 'PL', name: '波兰' },
  { value: 'AI', name: '安圭拉' },
  { value: 'AL', name: '阿尔巴尼亚' },
  { value: 'AM', name: '亚美尼亚' },
  { value: 'AO', name: '安哥拉' },
  { value: 'AQ', name: '南极洲' },
  { value: 'AR', name: '阿根廷' },
  { value: 'AS', name: '美属萨摩亚' },
  { value: 'AT', name: '奥地利' },
  { value: 'AW', name: '阿鲁巴' },
  { value: 'AX', name: '奥兰' },
  { value: 'AZ', name: '阿塞拜疆' },
  { value: 'BA', name: '波黑' },
  { value: 'BB', name: '巴巴多斯' },
  { value: 'BD', name: '孟加拉国' },
  { value: 'BE', name: '比利时' },
  { value: 'BF', name: '布基纳法索' },
  { value: 'BG', name: '保加利亚' },
  { value: 'BH', name: '巴林' },
  { value: 'BI', name: '布隆迪' },
  { value: 'BJ', name: '贝宁' },
  { value: 'BL', name: '圣巴泰勒米' },
  { value: 'BM', name: '百慕大' },
  { value: 'BN', name: '文莱' },
  { value: 'BO', name: '玻利维亚' },
  { value: 'BQ', name: '荷兰加勒比区' },
  { value: 'BR', name: '巴西' },
  { value: 'BS', name: '巴哈马' },
  { value: 'BT', name: '不丹' },
  { value: 'BV', name: '布韦岛' },
  { value: 'BW', name: '博茨瓦纳' },
  { value: 'BY', name: '白俄罗斯' },
  { value: 'BZ', name: '伯利兹' },
  { value: 'CC', name: '科科斯（基林）群岛' },
  { value: 'CD', name: '刚果民主共和国' },
  { value: 'CF', name: '中非' },
  { value: 'CG', name: '刚果共和国' },
  { value: 'CH', name: '瑞士' },
  { value: 'CI', name: '科特迪瓦' },
  { value: 'CK', name: '库克群岛' },
  { value: 'CL', name: '智利' },
  { value: 'CM', name: '喀麦隆' },
  { value: 'CO', name: '哥伦比亚' },
  { value: 'CR', name: '哥斯达黎加' },
  { value: 'CU', name: '古巴' },
  { value: 'CV', name: '佛得角' },
  { value: 'CW', name: '库拉索' },
  { value: 'CX', name: '圣诞岛' },
  { value: 'CY', name: '塞浦路斯' },
  { value: 'CZ', name: '捷克' },
  { value: 'DE', name: '德国' },
  { value: 'DJ', name: '吉布提' },
  { value: 'DK', name: '丹麦' },
  { value: 'DM', name: '多米尼克' },
  { value: 'DO', name: '多米尼加' },
  { value: 'DZ', name: '阿尔及利亚' },
  { value: 'EC', name: '厄瓜多尔' },
  { value: 'EE', name: '爱沙尼亚' },
  { value: 'EG', name: '埃及' },
  { value: 'EH', name: '西撒哈拉' },
  { value: 'ER', name: '厄立特里亚' },
  { value: 'ES', name: '西班牙' },
  { value: 'ET', name: '埃塞俄比亚' },
  { value: 'FI', name: '芬兰' },
  { value: 'FJ', name: '斐济' },
  { value: 'FK', name: '福克兰群岛' },
  { value: 'FM', name: '密克罗尼西亚联邦' },
  { value: 'FO', name: '法罗群岛' },
  { value: 'FR', name: '法国' },
  { value: 'GA', name: '加蓬' },
  { value: 'GD', name: '格林纳达' },
  { value: 'GE', name: '格鲁吉亚' },
  { value: 'GF', name: '法属圭亚那' },
  { value: 'GG', name: '根西' },
  { value: 'GH', name: '加纳' },
  { value: 'GI', name: '直布罗陀' },
  { value: 'GL', name: '格陵兰' },
  { value: 'GM', name: '冈比亚' },
  { value: 'GN', name: '几内亚' },
  { value: 'GP', name: '瓜德罗普' },
  { value: 'GQ', name: '赤道几内亚' },
  { value: 'GR', name: '希腊' },
  { value: 'GS', name: '南乔治亚和南桑威奇群岛' },
  { value: 'GT', name: '危地马拉' },
  { value: 'GU', name: '关岛' },
  { value: 'GW', name: '几内亚比绍' },
  { value: 'GY', name: '圭亚那' },
  { value: 'HK', name: '香港' },
  { value: 'HM', name: '赫德岛和麦克唐纳群岛' },
  { value: 'HN', name: '洪都拉斯' },
  { value: 'HR', name: '克罗地亚' },
  { value: 'HT', name: '海地' },
  { value: 'HU', name: '匈牙利' },
  { value: 'ID', name: '印尼' },
  { value: 'IE', name: '爱尔兰' },
  { value: 'IL', name: '以色列' },
  { value: 'IM', name: '马恩岛' },
  { value: 'IN', name: '印度' },
  { value: 'IO', name: '英属印度洋领地' },
  { value: 'IQ', name: '伊拉克' },
  { value: 'IR', name: '伊朗' },
  { value: 'IS', name: '冰岛' },
  { value: 'JE', name: '泽西' },
  { value: 'JM', name: '牙买加' },
  { value: 'JO', name: '约旦' },
  { value: 'KE', name: '肯尼亚' },
  { value: 'KG', name: '吉尔吉斯斯坦' },
  { value: 'KH', name: '柬埔寨' },
  { value: 'KI', name: '基里巴斯' },
  { value: 'KM', name: '科摩罗' },
  { value: 'KN', name: '圣基茨和尼维斯' },
  { value: 'KP', name: '朝鲜' },
  { value: 'KR', name: '韩国' },
  { value: 'KW', name: '科威特' },
  { value: 'KY', name: '开曼群岛' },
  { value: 'KZ', name: '哈萨克斯坦' },
  { value: 'LA', name: '老挝' },
  { value: 'LB', name: '黎巴嫩' },
  { value: 'LC', name: '圣卢西亚' },
  { value: 'LI', name: '列支敦士登' },
  { value: 'LK', name: '斯里兰卡' },
  { value: 'LR', name: '利比里亚' },
  { value: 'LS', name: '莱索托' },
  { value: 'LT', name: '立陶宛' },
  { value: 'LU', name: '卢森堡' },
  { value: 'LV', name: '拉脱维亚' },
  { value: 'LY', name: '利比亚' },
  { value: 'MA', name: '摩洛哥' },
  { value: 'MC', name: '摩纳哥' },
  { value: 'MD', name: '摩尔多瓦' },
  { value: 'ME', name: '黑山' },
  { value: 'MF', name: '法属圣马丁' },
  { value: 'MG', name: '马达加斯加' },
  { value: 'MH', name: '马绍尔群岛' },
  { value: 'MK', name: '北马其顿' },
  { value: 'ML', name: '马里' },
  { value: 'MM', name: '缅甸' },
  { value: 'MN', name: '蒙古' },
  { value: 'MO', name: '澳门' },
  { value: 'MP', name: '北马里亚纳群岛' },
  { value: 'MQ', name: '马提尼克' },
  { value: 'MR', name: '毛里塔尼亚' },
  { value: 'MS', name: '蒙特塞拉特' },
  { value: 'MT', name: '马耳他' },
  { value: 'MU', name: '毛里求斯' },
  { value: 'MV', name: '马尔代夫' },
  { value: 'MW', name: '马拉维' },
  { value: 'MZ', name: '莫桑比克' },
  { value: 'NA', name: '纳米比亚' },
  { value: 'NC', name: '新喀里多尼亚' },
  { value: 'NE', name: '尼日尔' },
  { value: 'NF', name: '诺福克岛' },
  { value: 'NG', name: '尼日利亚' },
  { value: 'NI', name: '尼加拉瓜' },
  { value: 'NL', name: '荷兰' },
  { value: 'NO', name: '挪威' },
  { value: 'NP', name: '尼泊尔' },
  { value: 'NR', name: '瑙鲁' },
  { value: 'NU', name: '纽埃' },
  { value: 'OM', name: '阿曼' },
  { value: 'PA', name: '巴拿马' },
  { value: 'PE', name: '秘鲁' },
  { value: 'PF', name: '法属波利尼西亚' },
  { value: 'PG', name: '巴布亚新几内亚' },
  { value: 'PK', name: '巴基斯坦' },
  { value: 'PM', name: '圣皮埃尔和密克隆' },
  { value: 'PN', name: '皮特凯恩群岛' },
  { value: 'PR', name: '波多黎各' },
  { value: 'PS', name: '巴勒斯坦' },
  { value: 'PT', name: '葡萄牙' },
  { value: 'PW', name: '帕劳' },
  { value: 'PY', name: '巴拉圭' },
  { value: 'QA', name: '卡塔尔' },
  { value: 'RE', name: '留尼汪' },
  { value: 'RO', name: '罗马尼亚' },
  { value: 'RS', name: '塞尔维亚' },
  { value: 'RW', name: '卢旺达' },
  { value: 'SA', name: '沙特阿拉伯' },
  { value: 'SB', name: '所罗门群岛' },
  { value: 'SC', name: '塞舌尔' },
  { value: 'SD', name: '苏丹' },
  { value: 'SE', name: '瑞典' },
  { value: 'SG', name: '新加坡' },
  { value: 'SH', name: '圣赫勒拿、阿森松和特里斯坦-达库尼亚' },
  { value: 'SI', name: '斯洛文尼亚' },
  { value: 'SJ', name: '斯瓦尔巴和扬马延' },
  { value: 'SK', name: '斯洛伐克' },
  { value: 'SL', name: '塞拉利昂' },
  { value: 'SM', name: '圣马力诺' },
  { value: 'SN', name: '塞内加尔' },
  { value: 'SO', name: '索马里' },
  { value: 'SR', name: '苏里南' },
  { value: 'SS', name: '南苏丹' },
  { value: 'ST', name: '圣多美和普林西比' },
  { value: 'SV', name: '萨尔瓦多' },
  { value: 'SX', name: '荷属圣马丁' },
  { value: 'SY', name: '叙利亚' },
  { value: 'SZ', name: '斯威士兰' },
  { value: 'TC', name: '特克斯和凯科斯群岛' },
  { value: 'TD', name: '乍得' },
  { value: 'TF', name: '法属南部和南极领地' },
  { value: 'TG', name: '多哥' },
  { value: 'TH', name: '泰国' },
  { value: 'TJ', name: '塔吉克斯坦' },
  { value: 'TK', name: '托克劳' },
  { value: 'TL', name: '东帝汶' },
  { value: 'TM', name: '土库曼斯坦' },
  { value: 'TN', name: '突尼斯' },
  { value: 'TO', name: '汤加' },
  { value: 'TR', name: '土耳其' },
  { value: 'TT', name: '特立尼达和多巴哥' },
  { value: 'TV', name: '图瓦卢' },
  { value: 'TZ', name: '坦桑尼亚' },
  { value: 'UA', name: '乌克兰' },
  { value: 'UG', name: '乌干达' },
  { value: 'UM', name: '美国本土外小岛屿' },
  { value: 'UY', name: '乌拉圭' },
  { value: 'UZ', name: '乌兹别克斯坦' },
  { value: 'VA', name: '梵蒂冈' },
  { value: 'VC', name: '圣文森特和格林纳丁斯' },
  { value: 'VE', name: '委内瑞拉' },
  { value: 'VG', name: '英属维尔京群岛' },
  { value: 'VI', name: '美属维尔京群岛' },
  { value: 'VN', name: '越南' },
  { value: 'VU', name: '瓦努阿图' },
  { value: 'WF', name: '瓦利斯和富图纳' },
  { value: 'WS', name: '萨摩亚' },
  { value: 'YE', name: '也门' },
  { value: 'YT', name: '马约特' },
  { value: 'ZM', name: '赞比亚' },
  { value: 'AD', name: '安道尔' },
  { value: 'AE', name: '阿联酋' },
  { value: 'AF', name: '阿富汗' },
  { value: 'AG', name: '安提瓜和巴布达' }
];
