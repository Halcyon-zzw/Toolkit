// ==================== 脚本声明与权限请求 ====================
"auto";
auto.waitFor();

// 请求截图权限
var hasScreenCapture = false;
try {
    hasScreenCapture = requestScreenCapture(false);
    if (!hasScreenCapture) {
        toast("请在弹出窗口中授权截图权限");
        sleep(1000);
        hasScreenCapture = requestScreenCapture(true);
    }
} catch (e) {
    toast("截图权限请求失败: " + e.message);
    sleep(2000);
}

// 请求悬浮窗权限
try {
    if (!floaty.checkPermission()) {
        toast("请允许悬浮窗权限");
        floaty.requestPermission();
        sleep(1000);
    }
} catch (e) {
    toast("悬浮窗权限请求失败: " + e.message);
    sleep(2000);
}

// ==================== 可配置参数 ====================
var config = {
    // 主循环间隔（毫秒）
    mainLoopInterval: 10000,

    // 子循环最大重试次数
    maxRetryCount: 3,

    // 动作间延时（毫秒）
    actionDelay: {
        min: 500,
        max: 1000
    },

    // 坐标配置
    areas: {
        // 选择词条按钮
        wordButton: { left: 240, top: 2200, right: 370, bottom: 2300 },
        // 刷新按钮
        refreshButton: { left: 400, top: 1500, right: 680, bottom: 1600 },
        // OCR识别区域
        ocrArea: { left: 80, top: 750, right: 990, bottom: 850 },
        // 三个词条位置
        wordPositions: [
            { left: 80, top: 1100, right: 300, bottom: 1300 },
            { left: 430, top: 1100, right: 650, bottom: 1300 },
            { left: 770, top: 1100, right: 990, bottom: 1300 }
        ]
    },

    // 控制按钮位置（左下角）
    controlButton: {
        x: 50,
        y: 1600,
        width: 60,
        height: 40
    }
};

// ==================== 词条配置 ====================
var needWordListRaw = [
    "猴子:化身仗势", "猴子:万化随行", "猴子:应物随心",
    "猴子:天地倾", "猴子:江海翻", "猴子:称心如意",
    "猴子:大闹天宫", "猴子:乱点天宫", "猴子:风卷残云",
    "猴子:翻江倒海", "猴子:乘胜追击", "猴子:战意升腾",
    "猴子:斗战激昂", "猴子:无处遁行",
    "哥斯拉:高速轰击", "哥斯拉:火球喷发", "哥斯拉:高速火球",
    "哥斯拉:轰击爆发", "哥斯拉:帝皇支援", "哥斯拉:核能增幅",
    "哥斯拉:万兽之王", "哥斯拉:致命强化", "哥斯拉:灼烧岩浆",
    "天使:神圣契约", "天使:圣羽加持", "天使:战神化身", "天使:奥术连奏"
];

var allWordListRaw = [
    "猴子:化身仗势", "猴子:万化随行", "猴子:应物随心",
    "猴子:天地倾", "猴子:江海翻", "猴子:称心如意",
    "猴子:大闹天宫", "猴子:乱点天宫", "猴子:风卷残云",
    "猴子:翻江倒海", "猴子:乘胜追击", "猴子:战意升腾",
    "猴子:斗战激昂", "猴子:无处遁行",
    "哥斯拉:高速轰击", "哥斯拉:火球喷发", "哥斯拉:高速火球",
    "哥斯拉:轰击爆发", "哥斯拉:帝皇支援", "哥斯拉:核能增幅",
    "哥斯拉:万兽之王", "哥斯拉:致命强化", "哥斯拉:灼烧岩浆",
    "天使:神圣契约", "天使:圣羽加持", "天使:战神化身", "天使:奥术连奏",
    "毒液:血肉盛宴"
];

// 处理后去除前缀
var needWordList = [];
var allWordList = [];

function extractWordNames(rawList) {
    var result = [];
    for (var i = 0; i < rawList.length; i++) {
        var str = rawList[i];
        var colonIndex = str.indexOf(":");
        if (colonIndex > 0) {
            result.push(str.substring(colonIndex + 1));
        } else {
            result.push(str);
        }
    }
    return result;
}

needWordList = extractWordNames(needWordListRaw);
allWordList = extractWordNames(allWordListRaw);

// ==================== 全局变量 ====================
var isRunning = false;
var isExiting = false;
var workThread = null;
var controlWindow = null;
var logWindow = null;
var logLines = [];
var isLogExpanded = true;

// ==================== 工具函数 ====================
function randomDelay() {
    var delay = random(config.actionDelay.min, config.actionDelay.max);
    sleep(delay);
}

function randomClick(area) {
    var x = random(area.left, area.right);
    var y = random(area.top, area.bottom);
    try {
        click(x, y);
    } catch (e) {
        addLog("点击失败: " + e.message);
    }
}

function cleanText(str) {
    // 移除所有空白字符和特殊字符
    if (!str) return "";
    return str.replace(/[\s\n\r\t]+/g, "").trim();
}

function ocrWordItems() {
    var area = config.areas.ocrArea;
    try {
        if (!hasScreenCapture) {
            addLog("无截图权限");
            return [];
        }

        var img = captureScreen();
        if (!img) {
            addLog("截图失败");
            return [];
        }

        var clip = images.clip(img, area.left, area.top,
            area.right - area.left,
            area.bottom - area.top);
        img.recycle();

        var result = ocr(clip);
        clip.recycle();

        if (result && result.length > 0) {
            var words = [];
            for (var i = 0; i < result.length; i++) {
                var text = "";
                if (typeof result[i] === "string") {
                    text = result[i];
                } else if (result[i] && result[i].text) {
                    text = result[i].text;
                }

                text = cleanText(text);
                if (text.length > 0 && text.length <= 10) {
                    words.push(text);
                }
            }
            return words;
        }
    } catch (e) {
        addLog("OCR错误: " + e.message);
    }
    return [];
}

// ==================== 日志窗口 ====================
function addLog(msg) {
    var time = new Date().toLocaleTimeString();
    var logMsg = "[" + time + "] " + msg;
    console.log(logMsg);
    logLines.push(logMsg);

    if (logLines.length > 15) {
        logLines.shift();
    }

    if (logWindow && logWindow.logText) {
        try {
            ui.run(function() {
                logWindow.logText.setText(logLines.join("\n"));
            });
        } catch (e) {}
    }
}

function createLogWindow() {
    if (logWindow) {
        try { logWindow.close(); } catch(e) {}
    }

    try {
        logWindow = floaty.window(
            <frame bg="#66000000" layout_width="match_parent" layout_height="wrap_content">
                <vertical layout_width="match_parent" layout_height="wrap_content" padding="5">
                    <horizontal layout_width="match_parent" layout_height="wrap_content">
                        <text text="日志" textColor="#ffffff" textSize="12sp" layout_weight="1"/>
                        <button id="toggleBtn" text="收起" textSize="10sp" w="50" h="30" bg="#444444" textColor="#ffffff"/>
                    </horizontal>
                    <text id="logText" text="" textColor="#00ff00" textSize="10sp"
                          layout_width="match_parent" layout_height="wrap_content"
                          maxLines="10" visibility="visible"/>
                </vertical>
            </frame>
        );

        logWindow.setPosition(10, 50);

        logWindow.toggleBtn.on("click", function() {
            isLogExpanded = !isLogExpanded;
            ui.run(function() {
                if (isLogExpanded) {
                    logWindow.toggleBtn.setText("收起");
                    logWindow.logText.setVisibility(0);
                } else {
                    logWindow.toggleBtn.setText("展开");
                    logWindow.logText.setVisibility(8);
                }
            });
        });
    } catch (e) {
        console.log("创建日志窗口失败: " + e.message);
    }
}

// ==================== 控制窗口 ====================
function createControlWindow() {
    if (controlWindow) {
        try { controlWindow.close(); } catch(e) {}
    }

    try {
        controlWindow = floaty.window(
            <frame>
                <button id="controlBtn" text="开始"
                        w="{{config.controlButton.width}}px"
                        h="{{config.controlButton.height}}px"
                        bg="#4CAF50" textColor="#ffffff"
                        textSize="14sp"/>
            </frame>
        );

        controlWindow.setPosition(config.controlButton.x, config.controlButton.y);

        controlWindow.controlBtn.on("click", function() {
            if (!isRunning) {
                startWork();
            } else {
                stopWork();
            }
        });
    } catch (e) {
        console.log("创建控制窗口失败: " + e.message);
    }
}

// ==================== 启停控制 ====================
function startWork() {
    if (isRunning) return;

    if (auto.service === null) {
        toast("请先开启无障碍服务");
        auto.waitFor();
        sleep(1000);
    }

    if (!hasScreenCapture) {
        try {
            hasScreenCapture = requestScreenCapture(false);
            if (!hasScreenCapture) {
                toast("截图权限不足");
                return;
            }
        } catch (e) {
            toast("截图权限请求失败");
            return;
        }
    }

    isRunning = true;
    isExiting = false;

    ui.run(function() {
        controlWindow.controlBtn.setText("停止");
        controlWindow.controlBtn.setBackgroundColor(colors.parseColor("#F44336"));
    });

    addLog("脚本已启动");
    toast("脚本已启动");

    startWorkThread();
}

function stopWork() {
    isRunning = false;

    if (workThread && workThread.isAlive()) {
        workThread.interrupt();
        workThread = null;
    }

    ui.run(function() {
        controlWindow.controlBtn.setText("开始");
        controlWindow.controlBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
    });

    addLog("脚本已停止");
    toast("脚本已停止");
}

// ==================== 主工作线程 ====================
function startWorkThread() {
    if (workThread && workThread.isAlive()) {
        workThread.interrupt();
    }

    workThread = threads.start(function() {
        addLog("工作线程启动");

        while (isRunning && !isExiting) {
            try {
                addLog("--- 新一轮循环 ---");

                for (var retry = 0; retry < config.maxRetryCount && isRunning; retry++) {
                    addLog("第" + (retry + 1) + "次尝试");

                    // 点击词条按钮
                    randomClick(config.areas.wordButton);
                    randomDelay();
                    sleep(1000);

                    // OCR识别
                    var words = ocrWordItems();
                    if (words.length > 0) {
                        addLog("识别: " + words.join(", "));
                    } else {
                        addLog("未识别到词条");
                    }

                    if (words.length < 3) {
                        addLog("词条不足3个");
                        back();
                        sleep(500);
                        continue;
                    }

                    // 检查是否包含优先词条
                    var hasNeedWord = false;
                    for (var i = 0; i < words.length; i++) {
                        if (needWordList.indexOf(words[i]) >= 0) {
                            hasNeedWord = true;
                            break;
                        }
                    }

                    // 刷新逻辑
                    if (!hasNeedWord) {
                        addLog("刷新词条");
                        randomClick(config.areas.refreshButton);
                        sleep(1000);

                        words = ocrWordItems();
                        if (words.length > 0) {
                            addLog("刷新后: " + words.join(", "));
                        }

                        if (words.length < 3) {
                            addLog("刷新后识别失败");
                            break;
                        }
                    }

                    // 选择词条
                    var selectedIndex = -1;

                    for (var w = 0; w < needWordList.length; w++) {
                        var idx = words.indexOf(needWordList[w]);
                        if (idx >= 0 && idx < 3) {
                            selectedIndex = idx;
                            addLog("命中优先: " + needWordList[w]);
                            break;
                        }
                    }

                    if (selectedIndex < 0) {
                        for (var w2 = 0; w2 < allWordList.length; w2++) {
                            var idx2 = words.indexOf(allWordList[w2]);
                            if (idx2 >= 0 && idx2 < 3) {
                                selectedIndex = idx2;
                                addLog("命中可选: " + allWordList[w2]);
                                break;
                            }
                        }
                    }

                    if (selectedIndex >= 0) {
                        addLog("点击词条" + (selectedIndex + 1));
                        randomClick(config.areas.wordPositions[selectedIndex]);
                        break;
                    } else {
                        addLog("无可用词条");
                        break;
                    }
                }

                // 等待下一个循环
                if (isRunning && !isExiting) {
                    addLog("等待" + (config.mainLoopInterval/1000) + "秒");
                    for (var i = 0; i < config.mainLoopInterval / 100 && isRunning; i++) {
                        sleep(100);
                    }
                }

            } catch (e) {
                addLog("错误: " + e.message);
                sleep(1000);
            }
        }

        addLog("工作线程退出");
    });
}

// ==================== 清理 ====================
function cleanup() {
    isExiting = true;
    isRunning = false;

    if (workThread && workThread.isAlive()) {
        workThread.interrupt();
    }

    if (controlWindow) {
        try { controlWindow.close(); } catch(e) {}
    }

    if (logWindow) {
        try { logWindow.close(); } catch(e) {}
    }
}

// ==================== 主程序 ====================
events.on("exit", cleanup);

toast("正在初始化...");
sleep(1000);

createLogWindow();
sleep(500);

createControlWindow();
sleep(500);

addLog("==================");
addLog("脚本初始化完成");
addLog("截图: " + (hasScreenCapture ? "OK" : "NO"));
addLog("无障碍: " + (auto.service !== null ? "OK" : "NO"));
addLog("优先词条: " + needWordList.length);
addLog("可选词条: " + allWordList.length);
addLog("间隔: " + (config.mainLoopInterval/1000) + "秒");
addLog("==================");
addLog("点击开始运行");

toast("初始化完成");

setInterval(function() {}, 60000);