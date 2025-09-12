// 由于 Chrome 扩展无法直接访问本地文件系统，使用文件夹选择器时会得到 FileSystemEntries（通过 <input webkitdirectory>）。
// 我们基于用户选择的文件快照在浏览器内做合并/去重计算，并生成可下载的合并结果或执行删除操作的清单。
// 注意：浏览器侧无法直接写入目标目录，只能通过打包下载（zip）或让用户自行处理。为保证可用性：
// - 迁移功能：将源目录复制合并到目标目录的“预执行”，输出冲突统计与清单，并提供一个打包后的 zip 下载（合并后的镜像）。
// - 去重功能：仅展示重复分组，支持在页面内“标记删除”，最终生成一个删除脚本供用户在本地执行。

// 简单的事件绑定与 UI 切换
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const id = btn.dataset.tab;
    document.getElementById(`tab-${id}`).classList.add('active');
  });
});

// 工具函数：读取 <input webkitdirectory> 的文件项（去掉顶层目录名，得到相对路径 relPath）
function collectFilesFromInputEnhanced(inputEl) {
  const files = Array.from(inputEl?.files || []);
  if (files.length === 0) return { files: [], root: '' };
  const first = files[0];
  const firstPath = first.webkitRelativePath || first.name;
  const root = firstPath.includes('/') ? firstPath.split('/')[0] : '';
  const toRel = (p) => {
    if (!root) return p;
    const idx = p.indexOf('/');
    return idx >= 0 ? p.slice(idx + 1) : p;
  };
  return {
    root,
    files: files.map(f => {
      const raw = f.webkitRelativePath || f.name;
      return { file: f, displayPath: raw, relPath: toRel(raw) };
    })
  };
}

function basename(path) {
  if (!path) return '';
  const noTrail = path.replace(/\/+$/, '');
  const idx = noTrail.lastIndexOf('/');
  return idx >= 0 ? noTrail.slice(idx + 1) : noTrail;
}

// 根名展示绑定
function bindRootNameDisplay(inputEl, displayElId) {
  inputEl.addEventListener('change', () => {
    const files = Array.from(inputEl.files || []);
    if (files.length === 0) {
      document.getElementById(displayElId).value = '';
      return;
    }
    const firstPath = files[0].webkitRelativePath || files[0].name;
    const root = firstPath.includes('/') ? firstPath.split('/')[0] : firstPath;
    document.getElementById(displayElId).value = root || '';
  });
}

bindRootNameDisplay(document.getElementById('srcDir'), 'srcRoot');
bindRootNameDisplay(document.getElementById('dstDir'), 'dstRoot');
bindRootNameDisplay(document.getElementById('scanDir'), 'scanRoot');

// 计算文件哈希（流式处理，减少内存消耗）
async function computeFileHash(file) {
  try {
    const reader = file.stream().getReader();
    const chunks = [];
    let totalSize = 0;
    
    // 分块读取文件，避免一次性加载大文件
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      chunks.push(value);
      totalSize += value.length;
    }
    
    // 合并所有块
    const allChunks = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, offset);
      offset += chunk.length;
    }
    
    const hasher = await crypto.subtle.digest('SHA-256', allChunks);
    const arr = Array.from(new Uint8Array(hasher));
    return arr.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Hash computation error:', error);
    throw error;
  }
}

// 防抖函数，减少频繁的脚本更新
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 迁移逻辑（基于源/目标快照计算冲突与合并结果）
document.getElementById('btnMigrate').addEventListener('click', async () => {
  const srcEnhanced = collectFilesFromInputEnhanced(document.getElementById('srcDir'));
  // 目标目录可能为空：只要用户选择了目录，即认为有效
  const dstInput = document.getElementById('dstDir');
  const dstEnhanced = collectFilesFromInputEnhanced(dstInput);
  const resultEl = document.getElementById('migrateResult');
  resultEl.innerHTML = '';

  if (srcEnhanced.files.length === 0 || !dstInput || !dstInput.files || dstInput.files.length === 0) {
    resultEl.textContent = '请同时选择源目录与目标目录（目标目录可为空）';
    return;
  }

  // 绝对路径与根名一致性提示（不拦截，仅提示）
  const SRC = (document.getElementById('srcRoot').value || '').trim();
  const DST = (document.getElementById('dstRoot').value || '').trim();
  const srcName = basename(SRC);
  const dstName = basename(DST);
  const warns = [];
  if (SRC && srcEnhanced.root && srcName && srcName !== srcEnhanced.root) {
    warns.push(`源绝对路径末段“${srcName}”与所选目录根名“${srcEnhanced.root}”不一致，请确认。`);
  }
  if (DST && dstEnhanced.root && dstName && dstName !== dstEnhanced.root) {
    warns.push(`目标绝对路径末段“${dstName}”与所选目录根名“${dstEnhanced.root}”不一致，请确认。`);
  }
  if (warns.length) {
    const w = document.createElement('div');
    w.className = 'muted';
    w.textContent = warns.join(' ');
    resultEl.appendChild(w);
  }

  // 记录目标已存在的相对路径集合（归一化后，用于判断是否跳过同步）
  const dstPathSet = new Set(dstEnhanced.files.map(x => x.relPath));
  const conflicts = [];
  const mergedList = []; // { file, relPath, displayPath }

  for (const s of srcEnhanced.files) {
    if (dstPathSet.has(s.relPath)) {
      // 目标目录中存在相同相对路径的文件，跳过同步
      conflicts.push(s.displayPath);
    } else {
      // 目标目录中不存在此相对路径，需要同步
      mergedList.push({ file: s.file, relPath: s.relPath, displayPath: s.displayPath });
    }
  }

  const conflictCount = conflicts.length;
  const showCount = Math.min(conflictCount, 10);
  const group = document.createElement('div');
  group.className = 'group';
  group.innerHTML = `
    <div class="group-header">
      <div>
        <strong>迁移完成（预览）</strong>
        <span class="muted">将同步 ${mergedList.length} 个文件，跳过目标目录中已存在的 ${conflictCount} 个文件</span>
      </div>
      <div class="pill">冲突 ${conflictCount}</div>
    </div>
    <div class="group-body" id="conflict-body"></div>
  `;
  resultEl.appendChild(group);
  const body = group.querySelector('#conflict-body');

  if (conflictCount > 0) {
    const list = document.createElement('div');
    list.className = 'mono';
    const slice = conflicts.slice(0, showCount);
    slice.forEach(p => {
      const row = document.createElement('div');
      row.className = 'file-row';
      row.innerHTML = `<span class="path">${p}</span>`;
      list.appendChild(row);
    });
    body.appendChild(list);

    if (conflictCount > showCount) {
      const moreBtn = document.createElement('button');
      moreBtn.className = 'secondary';
      moreBtn.textContent = '更多';
      let shown = showCount;
      moreBtn.addEventListener('click', () => {
        const next = conflicts.slice(shown, Math.min(shown + 50, conflictCount));
        next.forEach(p => {
          const row = document.createElement('div');
          row.className = 'file-row';
          row.innerHTML = `<span class=\"path\">${p}</span>`;
          list.appendChild(row);
        });
        shown += next.length;
        if (shown >= conflictCount) moreBtn.remove();
      });
      body.appendChild(moreBtn);
    }
  }

  function buildMigrateScriptLines() {
    const SRC = (document.getElementById('srcRoot').value || '').trim();
    const DST = (document.getElementById('dstRoot').value || '').trim();
    const SRC_ABS = SRC.replace(/\/+$/, '');
    const DST_ABS = DST.replace(/\/+$/, '');
    const lines = ['#!/usr/bin/env bash', 'set -euo pipefail',
      `SRC="${SRC_ABS}"`,
      `DST="${DST_ABS}"`,
      '', '# 从 ${SRC} 复制到 ${DST}',
    ];
    const parents = new Set();
    function parentDir(path) {
      const idx = path.lastIndexOf('/');
      return idx > 0 ? path.slice(0, idx) : '';
    }
    mergedList.forEach(item => {
      const dir = parentDir(item.relPath);
      if (dir) parents.add(dir);
    });
    Array.from(parents).sort().forEach(d => {
      lines.push(`mkdir -p -- "${'${DST}'}/${d}"`);
    });
    lines.push('');
    mergedList.forEach(item => {
      lines.push(`# 拷贝 ${item.relPath}`);
      lines.push(`cp -n -- "${'${SRC}'}/${item.relPath}" "${'${DST}'}/${item.relPath}"`);
    });
    return lines;
  }

  // 脚本预览
  const migrateScriptEl = document.getElementById('migrateScript');
  migrateScriptEl.textContent = buildMigrateScriptLines().join('\n') + '\n';

  // 在脚本预览旁放置操作按钮（先清理旧的）
  const migrateScriptContainer = document.getElementById('migrateScript').parentElement;
  const oldMigrateActions = migrateScriptContainer.querySelector('#migrateActions');
  if (oldMigrateActions) oldMigrateActions.remove();
  const migrateActions = document.createElement('div');
  migrateActions.id = 'migrateActions';
  migrateActions.className = 'actions';
  const migrateRunBtn = document.createElement('button');
  migrateRunBtn.textContent = '立即执行（复制到剪贴板）';
  migrateRunBtn.addEventListener('click', async () => {
    const SRC = (document.getElementById('srcRoot').value || '').trim();
    const DST = (document.getElementById('dstRoot').value || '').trim();
    if (!SRC || !DST) {
      alert('请填写源/目标的绝对路径后再执行');
      return;
    }
    const lines = buildMigrateScriptLines();
    await navigator.clipboard.writeText(lines.join('\n') + '\n');
    alert('脚本已复制到剪贴板。打开终端，粘贴回车执行');
  });
  const migrateExportBtn = document.createElement('button');
  migrateExportBtn.className = 'secondary';
  migrateExportBtn.textContent = '导出复制脚本';
  migrateExportBtn.addEventListener('click', async () => {
    const lines = buildMigrateScriptLines();
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/x-sh' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'copy_increment.sh';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  migrateActions.appendChild(migrateRunBtn);
  migrateActions.appendChild(migrateExportBtn);
  // 将按钮放到预览区下方
  migrateScriptContainer.appendChild(migrateActions);
});

// 去重逻辑
document.getElementById('btnScan').addEventListener('click', async () => {
  const scanButton = document.getElementById('btnScan');
  // 禁用按钮，防止重复点击
  scanButton.disabled = true;
  scanButton.textContent = '扫描中...';
  
  try {
    const scanInput = document.getElementById('scanDir');
    const scanEnhanced = collectFilesFromInputEnhanced(scanInput);
    const resultEl = document.getElementById('dedupeResult');
    resultEl.innerHTML = '';
    if (!scanInput || !scanInput.files || scanInput.files.length === 0) {
      resultEl.textContent = '请选择扫描目录';
      scanButton.disabled = false;
      scanButton.textContent = '开始扫描';
      return;
    }

    const absPrefix = ''; // 方案A：不在页面采集绝对路径，由输入框直接用于脚本

    // 绝对路径与根名一致性提示（不拦截，仅提示）
    const SCAN = (document.getElementById('scanRoot').value || '').trim();
    const scanName = basename(SCAN);
    if (SCAN && scanEnhanced.root && scanName && scanName !== scanEnhanced.root) {
      const w = document.createElement('div');
      w.className = 'muted';
      w.textContent = `扫描绝对路径末段"${scanName}"与所选目录根名"${scanEnhanced.root}"不一致，请确认。`;
      resultEl.appendChild(w);
    }

    // 计算哈希并分组（优化：减少批处理大小，增加进度提示）
    const groups = new Map(); // hash -> [{relPath, displayPath, file}]
    const batch = 3; // 减少批处理大小，降低内存峰值
    const totalFiles = scanEnhanced.files.length;
    
    // 创建进度条容器
    const progressContainer = document.createElement('div');
    progressContainer.style.width = '100%';
    progressContainer.style.backgroundColor = '#f0f0f0';
    progressContainer.style.borderRadius = '4px';
    progressContainer.style.marginTop = '10px';
    progressContainer.style.marginBottom = '10px';
    progressContainer.style.overflow = 'hidden';
    
    // 创建进度条
    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '20px';
    progressBar.style.backgroundColor = '#4CAF50';
    progressBar.style.transition = 'width 0.3s';
    progressContainer.appendChild(progressBar);
    
    // 创建进度文本
    const progressText = document.createElement('div');
    progressText.className = 'muted';
    progressText.textContent = `正在扫描 0/${totalFiles} 个文件...`;
    
    resultEl.appendChild(progressText);
    resultEl.appendChild(progressContainer);
    
    // 处理文件的函数
    let processedFiles = 0;
    
    for (let i = 0; i < totalFiles; i += batch) {
      const slice = scanEnhanced.files.slice(i, i + batch);
      
      // 并行处理每批文件
      const hashPromises = slice.map(async (x) => {
        try {
          return await computeFileHash(x.file);
        } catch (error) {
          console.error(`处理文件 ${x.displayPath} 时出错:`, error);
          return 'error-' + Math.random().toString(36).substring(2, 15); // 生成唯一错误标识
        }
      });
      
      const hashes = await Promise.all(hashPromises);
      
      for (let j = 0; j < slice.length; j++) {
        const item = slice[j];
        const hash = hashes[j];
        if (!groups.has(hash)) groups.set(hash, []);
        groups.get(hash).push({ relPath: item.relPath, displayPath: item.displayPath, file: item.file });
      }
      
      // 更新进度
      processedFiles += slice.length;
      const progress = Math.min(100, Math.round(processedFiles / totalFiles * 100));
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `正在扫描 ${processedFiles}/${totalFiles} 个文件... ${progress}%`;
      
      // 让出控制权，避免阻塞UI
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // 移除进度提示
    progressText.remove();
    progressContainer.remove();
    
    // 恢复按钮状态
    scanButton.disabled = false;
    scanButton.textContent = '开始扫描';

    // 展示重复分组（至少 2 个文件）
    const dupes = [...groups.entries()].filter(([, arr]) => arr.length > 1);
    if (dupes.length === 0) {
      // 在结果区域提示，并清空脚本预览
      const info = document.createElement('div');
      info.className = 'muted';
      info.textContent = '未发现重复文件';
      resultEl.appendChild(info);
      const dedupeScriptElEmpty = document.getElementById('dedupeScript');
      if (dedupeScriptElEmpty) dedupeScriptElEmpty.textContent = '';
      return;
    }

    const deletionSet = new Set(); // 保存 relPath，用于生成绝对路径
    function buildDedupeScriptLines() {
      const SCAN_RAW = (document.getElementById('scanRoot').value || '').trim();
      const SCAN = SCAN_RAW.replace(/\/+$/, '');
      const lines = ['#!/usr/bin/env bash', 'set -euo pipefail',
        `SCAN="${SCAN}"`,
        ''
      ];
      const paths = Array.from(deletionSet).sort();
      lines.push(`# 使用全路径删除：${'${SCAN}'}`);
      paths.forEach(p => { lines.push(`rm -f -- "${'${SCAN}'}/${p}"`); });
      return lines;
    }

    // 脚本预览元素
    const dedupeScriptEl = document.getElementById('dedupeScript');
    
    // 防抖更新脚本预览
    const debouncedUpdateScript = debounce(() => {
      dedupeScriptEl.textContent = buildDedupeScriptLines().join('\n') + '\n';
    }, 300);
    
    // 虚拟滚动优化：只渲染前10个重复组，其余折叠
    const maxVisibleGroups = 10;
    const visibleDupes = dupes.slice(0, maxVisibleGroups);
    const hiddenDupes = dupes.slice(maxVisibleGroups);
    
    visibleDupes.forEach(([hash, arr], idx) => {
      const group = document.createElement('div');
      group.className = 'group';
      group.innerHTML = `
        <div class="group-header">
          <div>
            <strong>重复组 #${idx + 1}</strong>
            <span class="muted mono">SHA256: ${hash.slice(0, 16)}…</span>
          </div>
          <div class="pill">${arr.length} 文件</div>
        </div>
        <div class="group-body"></div>
      `;
      const body = group.querySelector('.group-body');
      const totalCount = arr.length;
      let deletedInGroup = 0; // 当前组被标记删除的数量
      
      // 只渲染前5个文件，其余折叠
      const maxVisibleFiles = 5;
      const visibleFiles = arr.slice(0, maxVisibleFiles);
      const hiddenFiles = arr.slice(maxVisibleFiles);
    
      visibleFiles.forEach((item, i) => {
        const row = document.createElement('div');
        row.className = 'file-row mono';
        const keep = i === 0; // 默认保留第一份
        row.innerHTML = `
          <span class="path">${item.displayPath}</span>
          <div class="ops">
            <button class="${keep ? 'secondary' : 'danger'}" data-act="${keep ? 'keep' : 'delete'}">${keep ? '删除' : '已删除'}</button>
          </div>
        `;
        const btn = row.querySelector('button');
        // 初始化：除第一条外默认加入删除计划
        if (!keep) { deletionSet.add(item.relPath); deletedInGroup++; }

        btn.addEventListener('click', () => {
          if (btn.dataset.act === 'delete') {
            // 当前为已删除 → 还原为未删除
            btn.dataset.act = 'keep';
            btn.textContent = '删除';
            btn.className = 'secondary';
            deletionSet.delete(item.relPath);
            if (deletedInGroup > 0) deletedInGroup--;
          } else {
            // 当前为未删除 → 准备标记为已删除，校验是否会导致整组全删
            if (deletedInGroup + 1 >= totalCount) {
              alert('同一重复组中至少保留一个文件，不能全部删除');
              return;
            }
            // 通过校验，标记为已删除
            btn.dataset.act = 'delete';
            btn.textContent = '已删除';
            btn.className = 'danger';
            deletionSet.add(item.relPath);
            deletedInGroup++;
          }
          // 防抖刷新脚本预览，减少频繁更新
          debouncedUpdateScript();
        });
        body.appendChild(row);
      });
      
      // 处理隐藏的文件（自动加入删除计划，但不显示）
      hiddenFiles.forEach((item, i) => {
        if (i > 0) { // 除第一个外都加入删除计划
          deletionSet.add(item.relPath);
          deletedInGroup++;
        }
      });
      
      // 如果有隐藏文件，显示"更多"按钮
      if (hiddenFiles.length > 0) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'secondary';
        moreBtn.textContent = `更多 ${hiddenFiles.length} 个文件...`;
        moreBtn.addEventListener('click', () => {
          // 展开隐藏文件
          hiddenFiles.forEach((item, i) => {
            const row = document.createElement('div');
            row.className = 'file-row mono';
            const keep = i === 0;
            row.innerHTML = `
              <span class="path">${item.displayPath}</span>
              <div class="ops">
                <button class="${keep ? 'secondary' : 'danger'}" data-act="${keep ? 'keep' : 'delete'}">${keep ? '删除' : '已删除'}</button>
              </div>
            `;
            const btn = row.querySelector('button');
            if (!keep) { deletionSet.add(item.relPath); deletedInGroup++; }
            
            btn.addEventListener('click', () => {
              if (btn.dataset.act === 'delete') {
                btn.dataset.act = 'keep';
                btn.textContent = '删除';
                btn.className = 'secondary';
                deletionSet.delete(item.relPath);
                if (deletedInGroup > 0) deletedInGroup--;
              } else {
                if (deletedInGroup + 1 >= totalCount) {
                  alert('同一重复组中至少保留一个文件，不能全部删除');
                  return;
                }
                btn.dataset.act = 'delete';
                btn.textContent = '已删除';
                btn.className = 'danger';
                deletionSet.add(item.relPath);
                deletedInGroup++;
              }
              debouncedUpdateScript();
            });
            body.appendChild(row);
          });
          moreBtn.remove();
        });
        body.appendChild(moreBtn);
      }

      resultEl.appendChild(group);
    });
    
    // 如果有隐藏的重复组，显示折叠提示
    if (hiddenDupes.length > 0) {
      const hiddenInfo = document.createElement('div');
      hiddenInfo.className = 'muted';
      hiddenInfo.textContent = `还有 ${hiddenDupes.length} 个重复组未显示（共 ${hiddenDupes.reduce((sum, [, arr]) => sum + arr.length, 0)} 个文件）`;
      resultEl.appendChild(hiddenInfo);
    }

    // 初次渲染脚本预览（包含默认删除项）
    dedupeScriptEl.textContent = buildDedupeScriptLines().join('\n') + '\n';

    // 在脚本预览旁放置操作按钮（删除脚本，先清理旧的）
    const dedupeScriptContainer = document.getElementById('dedupeScript').parentElement;
    const oldDedupeActions = dedupeScriptContainer.querySelector('#dedupeActions');
    if (oldDedupeActions) oldDedupeActions.remove();
    const dedupeActions = document.createElement('div');
    dedupeActions.id = 'dedupeActions';
    dedupeActions.className = 'actions';
    const dedupeRunBtn = document.createElement('button');
    dedupeRunBtn.textContent = '立即执行（复制到剪贴板）';
    dedupeRunBtn.addEventListener('click', async () => {
      if (deletionSet.size === 0) {
        alert('尚未选择需要删除的文件');
        return;
      }
      const SCAN = (document.getElementById('scanRoot').value || '').trim();
      if (!SCAN) {
        alert('请填写扫描目录的绝对路径后再执行');
        return;
      }
      const script = buildDedupeScriptLines();
      await navigator.clipboard.writeText(script.join('\n') + '\n');
      alert('脚本已复制到剪贴板。打开终端，粘贴回车执行');
    });
    const dedupeExportBtn = document.createElement('button');
    dedupeExportBtn.className = 'secondary';
    dedupeExportBtn.textContent = '导出删除脚本';
    dedupeExportBtn.addEventListener('click', () => {
      if (deletionSet.size === 0) {
        alert('尚未选择需要删除的文件');
        return;
      }
      const script = buildDedupeScriptLines();
      const blob = new Blob([script.join('\n') + '\n'], { type: 'text/x-sh' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'delete_dupes.sh';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    dedupeActions.appendChild(dedupeRunBtn);
    dedupeActions.appendChild(dedupeExportBtn);
    dedupeScriptContainer.appendChild(dedupeActions);
   } catch (error) {
     console.error('扫描过程出错:', error);
     const errorEl = document.createElement('div');
     errorEl.className = 'error';
     errorEl.textContent = `扫描过程出错: ${error.message}`;
     resultEl.appendChild(errorEl);
   } finally {
     // 确保按钮状态恢复
     scanButton.disabled = false;
     scanButton.textContent = '开始扫描';
   }
});

// 已移除复制变量模板按钮逻辑（按需求）
