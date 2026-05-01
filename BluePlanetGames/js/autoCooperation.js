// ==================== 防止重复运行 ====================
"auto";
auto.waitFor();

let currentEngine = engines.myEngine();
let runningEngines = engines.all();
let currentSource = currentEngine.getSource() + '';
if (runningEngines.length > 1) {
    runningEngines.forEach(compareEngine => {
        let compareSource = compareEngine.getSource() + '';
        if (currentEngine.id !== compareEngine.id && compareSource === currentSource) {
            compareEngine.forceStop();
        }
    });
}

// ==================== 权限请求 ====================
if (!requestScreenCapture()) {
    toastLog('请求截图权限失败');
    exit();
}

sleep(1000);

// ==================== 可配置参数 ====================
var config = {
    // ========== 点击器配置 ==========
    clicker: {
        area: {
            left: 580, top: 1720, right: 650, bottom: 1780
        },
        time: {
            min: 300, max: 500
        },
        continuousClick: {
            enabled: true,
            duration: 300
        },
        //自动加入按钮偏移位置
        button: {
            x: 200, y: 300
        },
        // OCR检测间隔（毫秒）
        ocrCheckInterval: 5000
    },

    // ========== OCR词条选择配置 ==========
    wordOcr: {
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
            wordButtonArea: { left: 240, top: 2200, right: 370, bottom: 2300 },
            // 刷新按钮
            refreshButtonArea: { left: 400, top: 1550, right: 680, bottom: 1600 },
            // OCR识别区域
            wordOcrArea: { left: 80, top: 750, right: 990, bottom: 830 },
            // 三个词条位置
            wordPositions: [
                { left: 80, top: 1100, right: 300, bottom: 1300 },
                { left: 430, top: 1100, right: 650, bottom: 1300 },
                { left: 770, top: 1100, right: 990, bottom: 1300 }
            ]
        },

        // 开启自动词条按钮位置
        controlButton: {
            x: 140,
            y: 300,
            width: 80,
            height: 80
        }
    },

    // ========== 游戏准备配置 ==========
    gamePrepare: {
        // 停止自动加入判断的识别区域
        joinOcrInfo: {
            checkText: "招募频道",
            checkArea: { left: 500, top: 420, right: 750, bottom: 510}
        },
        
        // 当前楼层识别区域
        levelOcrArea: { left: 420, top: 280, right: 650, bottom: 360 },

        // 方案主入口按钮
        planButtonLocation: { left: 880, top: 1950, right: 940, bottom: 1990 },

        // 方案2按钮（用于彩虹5层和其他）
        plan2ButtonLocation: { left: 480, top: 720, right: 500, bottom: 740 },

        // 方案4按钮（用于彩虹3-4层）
        plan4ButtonLocation: { left: 830, top: 720, right: 850, bottom: 740 },

        // 准备按钮
        prepareButtonLocation: { left: 500, top: 1930, right: 600, bottom: 2000 },

        // 楼层配置映射
        levelConfig: {
            "彩虹3层": "plan4",
            "彩虹4层": "plan4",
            "彩虹5层": "plan2",
            "彩虹6层": "plan4",
            "default": "plan4"
        },

        // 点击间隔基础值（毫秒）
        clickBaseInterval: 100,

        // 点击间隔随机范围（毫秒）
        clickRandomRange: 50
    },

    // ========== 自动加入流程配置 ==========
    autoJoin: {
        // 聊天框位置
        chatBoxLocation: { left: 990, top: 1020, right: 1010, bottom: 1040 },

        // 队伍位置
        teamButtonLocation: { left: 80, top: 1410, right: 100, bottom: 1430 },

        // 选择难度位置
        selectDifficultyButtonLocation: { left: 610, top: 1920, right: 630, bottom: 1940 },

        // 空白区域（队伍界面）
        teamBlankArea: { left: 600, top: 500, right: 630, bottom: 530 },

        // 步骤间延时（毫秒）
        stepDelay: 500
    },

    // ========== 自动召唤配置 ==========
    summon: {
        // 准备状态检测区域
        prepareStatusArea: { left: 330, top: 1900, right: 750, bottom: 2020 },

        // 召唤英雄位置
        summonButtonArea: { left: 730, top: 2200, right: 850, bottom: 2300 },

        // 流畅按钮位置
        fluentButtonArea: { left: 70, top: 570, right: 80, bottom: 590 },

        // 飘字按钮位置
        floatButtonArea: { left: 70, top: 730, right: 80, bottom: 750 },


        // 准备状态检测间隔（毫秒）
        statusCheckInterval: 3000,

        // 准备完成后的等待时间（毫秒）
        waitAfterPrepare: 8000,

        // 召唤点击次数
        summonClickCount: 10,

        // 召唤点击间隔（毫秒）
        summonClickInterval: 800
    }
};

// ==================== 词条配置 ====================
var needWordListRaw = [
    "猴子:化身仗势", "猴子:万化随形", "猴子:应物随心",
    "猴子:大闹天宫",
    "猴子:天地倾", "猴子:江海翻", "猴子:称心如意",
    "猴子:乱点天宫", "猴子:风卷残云", "猴子:翻江倒海", "猴子:乘胜追击",
    "猴子:战意升腾", "猴子:斗战激昂", "猴子:无处遁行", "猴子:无处通行",
    "哥斯拉:高速轰击", "哥斯拉:火球喷发", "哥斯拉:高速火球",
    "哥斯拉:轰击爆发", "哥斯拉:帝皇支援", "哥斯拉:核能增幅",
    "哥斯拉:万兽之王", "哥斯拉:致命强化", "哥斯拉:灼烧岩浆",
    "天使:神圣契约", "天使:圣羽加持", "天使:战神化身"
];

var allWordListRaw = [
    "猴子:化身仗势", "猴子:万化随行", "猴子:应物随心",
    "猴子:大闹天宫",
    "猴子:天地倾", "猴子:江海翻", "猴子:称心如意",
    "猴子:乱点天宫", "猴子:风卷残云", "猴子:翻江倒海", "猴子:乘胜追击",
    "猴子:战意升腾", "猴子:斗战激昂", "猴子:无处遁形", "猴子:无处通行",
    "哥斯拉:高速轰击", "哥斯拉:火球喷发", "哥斯拉:高速火球",
    "哥斯拉:轰击爆发", "哥斯拉:帝皇支援", "哥斯拉:核能增幅",
    "哥斯拉:万兽之王", "哥斯拉:致命强化", "哥斯拉:灼烧岩浆",
    "天使:神圣契约", "天使:圣羽加持", "天使:战神化身", "天使:奥术连奏",
    "毒液:血肉盛宴"
];

// 提取词条名称（去除角色前缀）
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

var needWordList = extractWordNames(needWordListRaw);
var allWordList = extractWordNames(allWordListRaw);

// ==================== 全局变量 ====================
// 点击器状态
var clickerRunning = false;
var clickerPaused = true;
var clickStartTime = 0;
var clickCount = 0;
var clickerControlWindow = null;
var stopBtn = null;
var startBtn = null;
var clickerThread = null;

// OCR状态
var ocrRunning = false;
var ocrThread = null;
var ocrControlWindow = null;

// 通用状态
var isExiting = false;

// 日志系统
var logWindow = null;
var logLines = [];
var isLogExpanded = true;

// 上次OCR检测时间
var lastOcrCheckTime = 0;

// ==================== 日志窗口 ====================
function addLog(msg) {
    var logMsg = msg;
    console.log(logMsg);
    logLines.push(logMsg);

    if (logLines.length > 50) {
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

// ==================== 点击器控制窗口 ====================
function createClickerControlWindow() {
    if (clickerControlWindow != null) {
        try { clickerControlWindow.close(); } catch(e) {}
    }

    clickerControlWindow = floaty.window(
        <vertical layout_width="wrap_content" layout_height="wrap_content">
            <button id="stop" text="停" w="40" h="40" bg="#ff4444" textColor="#ffffff" textSize="12sp" visibility="gone"/>
            <button id="start" text="始" w="40" h="40" bg="#44ff44" textColor="#000000" textSize="12sp"/>
        </vertical>
    );

    var screenWidth = device.width;
    var targetX = screenWidth - config.clicker.button.x - 40;
    var targetY = config.clicker.button.y;
    clickerControlWindow.setPosition(targetX, targetY);

    stopBtn = clickerControlWindow.stop;
    startBtn = clickerControlWindow.start;

    stopBtn.on("click", function() {
        if (!clickerPaused && clickerRunning) {
            pauseClicker();
        }
    });

    startBtn.on("click", function() {
        if (clickerPaused) {
            resumeClicker();
        }
    });

    addLog("点击器控制窗口已创建");
}

// ==================== 点击器暂停 ====================
function pauseClicker() {
    clickerPaused = true;
    clickerRunning = false;
    clickStartTime = 0;

    ui.run(function() {
        stopBtn.setVisibility(8);
        startBtn.setVisibility(0);
    });

    addLog("⏸️ 点击器已暂停");

    if (clickerThread != null && clickerThread.isAlive()) {
        clickerThread.interrupt();
        clickerThread = null;
    }
}

// ==================== 点击器恢复 ====================
function resumeClicker() {
    clickerPaused = false;
    clickerRunning = true;
    clickStartTime = new Date().getTime();
    lastOcrCheckTime = 0;  // 重置OCR检测时间

    ui.run(function() {
        stopBtn.setVisibility(0);
        startBtn.setVisibility(8);
    });

    addLog("▶️ 点击器已启动");
    if (config.clicker.continuousClick.enabled) {
        addLog("⏰ 将连续点击 " + config.clicker.continuousClick.duration + " 秒后自动暂停");
    }

    startClickerThread();
}

// ==================== 自动加入流程 ====================
function executeAutoJoinFlow() {
    addLog("===== 开始自动加入流程 =====");

    // 1. 点击聊天框
    addLog("步骤1: 点击聊天框");
    clickArea(config.autoJoin.chatBoxLocation);
    sleep(config.autoJoin.stepDelay);

    // 2. 点击队伍
    addLog("步骤2: 点击队伍");
    clickArea(config.autoJoin.teamButtonLocation);
    sleep(config.autoJoin.stepDelay);

    // 3. 点击选择难度
    addLog("步骤3: 点击选择难度");
    clickArea(config.autoJoin.selectDifficultyButtonLocation);
    sleep(config.autoJoin.stepDelay);

    // 4. 点击空白区域
    addLog("步骤4: 点击空白区域");
    clickArea(config.autoJoin.teamBlankArea);
    sleep(config.autoJoin.stepDelay);

    addLog("===== 自动加入流程完成 =====");
}

// ==================== 检查准备状态 ====================
function checkPrepareStatus() {
    try {
        var img = captureScreen();
        if (!img) {
            addLog("准备状态检测: 截图失败");
            return false;
        }

        var area = config.summon.prepareStatusArea;
        var clip = images.clip(img, area.left, area.top,
            area.right - area.left,
            area.bottom - area.top);
        img.recycle();

        var result = paddle.ocr(clip);
        clip.recycle();

        if (result && result.length > 0) {
            for (var i = 0; i < result.length; i++) {
                var text = result[i].words || result[i].text || "";
                text = text.replace(/[\s\n\r\t]+/g, "").trim();
                if (text.indexOf("已准备") >= 0) {
                    addLog("准备状态: 检测到【已准备】");
                    return true;
                }
            }
        }

        addLog("准备状态: 未检测到【已准备】");
        return false;

    } catch (e) {
        addLog("准备状态检测异常: " + e.message);
        return false;
    }
}

// ==================== 执行召唤流程 ====================
function executeSummonFlow() {
    addLog("===== 开始召唤流程 =====");

    // 等待准备完成
    addLog("已准备完成，每" + (config.summon.statusCheckInterval/1000) + "秒检测是否开始");
    var isPrepared = true;

    while (isPrepared && !isExiting) {
        isPrepared = checkPrepareStatus()
        if (isPrepared) {
            sleep(config.summon.statusCheckInterval);
        }
    }

    if (isExiting) return;

    addLog("游戏开始，休眠" + (config.summon.waitAfterPrepare/1000) + "秒");
    sleep(config.summon.waitAfterPrepare);

    // 点击召唤按钮10次
    addLog("=====> 开始召唤英雄, " + config.summon.summonClickCount + "次 <=====");
    for (var i = 0; i < config.summon.summonClickCount && !isExiting; i++) {
        addLog("召唤点击: 第" + (i + 1) + "次");
        clickArea(config.summon.summonButtonArea);
        sleep(config.summon.summonClickInterval);
    }
    addLog("===== 召唤流程完成 =====");
    addLog("=====> 关闭流畅、飘字 <=====");
    clickArea(config.summon.fluentButtonArea);
    randomDelay()
    clickArea(config.summon.floatButtonArea)

}

// ==================== 游戏就绪检测 ====================
function checkGameReady() {
    try {
        var img = captureScreen();
        if (!img) {
            addLog("状态: 截图失败，无法检测游戏状态");
            return false;
        }

        var area = config.gamePrepare.joinOcrInfo.checkArea;
        var checkText = config.gamePrepare.joinOcrInfo.checkText;
        var clip = images.clip(img, area.left, area.top,
            area.right - area.left,
            area.bottom - area.top);
        img.recycle();

        var result = paddle.ocr(clip);
        clip.recycle();

        if (result && result.length > 0) {
            for (var i = 0; i < result.length; i++) {
                var text = result[i].words || result[i].text || "";
                text = text.replace(/[\s\n\r\t]+/g, "").trim();
                if (text.indexOf(checkText) >= 0) {
                    addLog("状态: 未进入房间，等待中...");
                    return true;
                }
            }
        }

        return false;

    } catch (e) {
        addLog("状态: OCR检测异常: " + e.message);
        return false;
    }
}

// ==================== 楼层识别 ====================
function recognizeLevel() {
    try {
        var img = captureScreen();
        if (!img) {
            addLog("楼层识别: 截图失败");
            return null;
        }

        var area = config.gamePrepare.levelOcrArea;
        var clip = images.clip(img, area.left, area.top,
            area.right - area.left,
            area.bottom - area.top);
        img.recycle();

        var result = paddle.ocr(clip);
        clip.recycle();

        if (result && result.length > 0) {
            for (var i = 0; i < result.length; i++) {
                var text = result[i].words || result[i].text || "";
                text = text.replace(/[\s\n\r\t]+/g, "").trim();

                // 匹配彩虹X层
                if (text.indexOf("彩虹") >= 0 && text.indexOf("层") >= 0) {
                    return text;
                }
            }
        }

        addLog("楼层识别: 未识别到楼层信息");
        return null;

    } catch (e) {
        addLog("楼层识别: OCR异常: " + e.message);
        return null;
    }
}

// ==================== 执行游戏准备流程 ====================
function executeGamePreparation() {
    addLog("===== 开始游戏准备流程 =====");

    // 1. 识别楼层
    var levelText = recognizeLevel();
    var planType = config.gamePrepare.levelConfig["default"];

    if (levelText) {
        if (config.gamePrepare.levelConfig[levelText]) {
            planType = config.gamePrepare.levelConfig[levelText];
        }
        addLog("楼层识别: " + levelText + " → 使用方案" + (planType === "plan4" ? "4" : "2"));
    } else {
        addLog("楼层识别: 失败/为空 → 使用默认方案2");
    }

    // 2. 点击方案主入口按钮
    var planBtn = config.gamePrepare.planButtonLocation;
    addLog("点击方案按钮");
    clickArea(planBtn);
    addLog("点击: 方案入口 → 方案" + (planType === "plan4" ? "4" : "2") + "按钮 → 准备按钮");
    sleep(config.gamePrepare.clickBaseInterval + random(-config.gamePrepare.clickRandomRange, config.gamePrepare.clickRandomRange));

    // 3. 点击对应方案按钮
    var selectedPlanBtn;
    if (planType === "plan4") {
        selectedPlanBtn = config.gamePrepare.plan4ButtonLocation;
    } else {
        selectedPlanBtn = config.gamePrepare.plan2ButtonLocation;
    }
    addLog("点击具体方案:" + planType);
    clickArea(selectedPlanBtn);
    sleep(500);

    var whiteArea = config.gamePrepare.levelOcrArea;
    addLog("点击空白区域(第1次)");
    clickArea(whiteArea);
    sleep(config.gamePrepare.clickBaseInterval + random(-config.gamePrepare.clickRandomRange, config.gamePrepare.clickRandomRange));
    addLog("点击空白区域(第2次)");
    clickArea(whiteArea);
    sleep(config.gamePrepare.clickBaseInterval + random(-config.gamePrepare.clickRandomRange, config.gamePrepare.clickRandomRange));

    // 4. 点击准备按钮
    addLog("点击准备按钮");
    clickArea(config.gamePrepare.prepareButtonLocation);

    addLog("===== 游戏准备流程完成 =====");
}

// ==================== 点击区域辅助函数 ====================
function clickArea(area) {
    var x = random(area.left, area.right);
    var y = random(area.top, area.bottom);
    try {
        addLog("点击(" + x + ", " + y + ")");
        click(x, y);
    } catch (e) {
        addLog("点击失败: " + e.message);
    }
}

// ==================== 点击器工作线程 ====================
function startClickerThread() {
    if (clickerThread != null && clickerThread.isAlive()) {
        clickerThread.interrupt();
    }

    clickerThread = threads.start(function() {
        var localCount = clickCount;
        lastOcrCheckTime = new Date().getTime();

        // 先执行自动加入流程
        addLog("执行自动加入流程");
        executeAutoJoinFlow();

        // 开始主循环
        addLog("开始自动点击循环");
        while (!clickerPaused && clickerRunning && !isExiting) {
            // 检查是否超时
            if (config.clicker.continuousClick.enabled) {
                var now = new Date().getTime();
                if (clickStartTime > 0) {
                    var elapsedSeconds = (now - clickStartTime) / 1000;

                    if (elapsedSeconds >= config.clicker.continuousClick.duration) {
                        ui.run(function() {
                            pauseClicker();
                        });
                        break;
                    }
                }
            }

            // OCR检测游戏就绪状态（仅自动点击循环中执行）
            if (clickerRunning && !clickerPaused) {
                var currentTime = new Date().getTime();
                if (currentTime - lastOcrCheckTime >= config.clicker.ocrCheckInterval) {
                    lastOcrCheckTime = currentTime;

                    if (!checkGameReady()) {
                        addLog("状态: 进入房间");

                        // 执行准备流程
                        executeGamePreparation();

                        // 执行召唤流程
                        executeSummonFlow();

                        // 自动暂停点击器，改变按钮状态
                        addLog("状态: 流程完成，自动暂停点击器");
                        ui.run(function() {
                            pauseClicker();
                        });
                        break;
                    }
                }
            }

            // 执行点击
            localCount++;
            clickCount = localCount;

            var x = random(config.clicker.area.left, config.clicker.area.right) + random(-5, 5);
            var y = random(config.clicker.area.top, config.clicker.area.bottom) + random(-5, 5);

            click(x, y);

            if (localCount % 50 === 0) {
                var elapsed = clickStartTime > 0 ? ((new Date().getTime() - clickStartTime) / 1000).toFixed(0) : 0;
                addLog("📊 已完成 " + localCount + " 次点击 | 已运行 " + elapsed + " 秒");
            }

            sleep(random(config.clicker.time.min, config.clicker.time.max));
        }

        addLog("点击器工作线程已停止");
    });
}

// ==================== OCR功能 ====================
function captureAndOcr() {
    try {
        var img = captureScreen();
        if (!img) {
            addLog("截图失败");
            return [];
        }

        var area = config.wordOcr.areas.wordOcrArea;
        var clip = images.clip(img, area.left, area.top,
            area.right - area.left,
            area.bottom - area.top);
        img.recycle();

        var start = new Date();
        var result = paddle.ocr(clip);
        clip.recycle();

        if (result && result.length > 0) {
            var words = [];
            for (var i = 0; i < result.length; i++) {
                var text = result[i].words || result[i].text || "";
                text = text.replace(/[\s\n\r\t]+/g, "").trim();
                if (text.length > 1 && text.length <= 10) {
                    words.push(text);
                }
            }
            return words;
        }

        addLog("OCR耗时: " + (new Date() - start) + "ms, 结果为空");
        return [];

    } catch (e) {
        addLog("OCR异常: " + e.message);
        return [];
    }
}

// ==================== OCR工具函数 ====================
function randomDelay() {
    var delay = random(config.wordOcr.actionDelay.min, config.wordOcr.actionDelay.max);
    sleep(delay);
}


// ==================== OCR控制窗口 ====================
function createOcrControlWindow() {
    if (ocrControlWindow) {
        try { ocrControlWindow.close(); } catch(e) {}
    }

    try {
        ocrControlWindow = floaty.window(
            <frame>
                <button id="ocrControlBtn" text="词"
                        w="{{config.wordOcr.controlButton.width}}px"
                        h="{{config.wordOcr.controlButton.height}}px"
                        bg="#4CAF50" textColor="#ffffff"
                        textSize="14sp"/>
            </frame>
        );

        ocrControlWindow.setPosition(config.wordOcr.controlButton.x, config.wordOcr.controlButton.y);

        ocrControlWindow.ocrControlBtn.on("click", function() {
            if (!ocrRunning) {
                startOcr();
            } else {
                stopOcr();
            }
        });
    } catch (e) {
        console.log("创建OCR控制窗口失败: " + e.message);
    }
}

// ==================== OCR启停控制 ====================
function startOcr() {
    if (ocrRunning) return;

    if (auto.service === null) {
        toast("请先开启无障碍服务");
        auto.waitFor();
        sleep(1000);
    }

    ocrRunning = true;

    ui.run(function() {
        ocrControlWindow.ocrControlBtn.setText("OCR停止");
        ocrControlWindow.ocrControlBtn.setBackgroundColor(colors.parseColor("#F44336"));
    });

    addLog("OCR脚本已启动");
    toast("OCR脚本已启动");

    startOcrThread();
}

function stopOcr() {
    ocrRunning = false;

    if (ocrThread && ocrThread.isAlive()) {
        ocrThread.interrupt();
        ocrThread = null;
    }

    ui.run(function() {
        ocrControlWindow.ocrControlBtn.setText("OCR开始");
        ocrControlWindow.ocrControlBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
    });

    addLog("OCR脚本已停止");
    toast("OCR脚本已停止");
}

// ==================== OCR工作线程 ====================
function startOcrThread() {
    if (ocrThread && ocrThread.isAlive()) {
        ocrThread.interrupt();
    }

    ocrThread = threads.start(function() {
        addLog("OCR工作线程启动");

        while (ocrRunning && !isExiting) {
            try {
                addLog("=============start===============")
                for (var retry = 0; retry < config.wordOcr.maxRetryCount && ocrRunning; retry++) {

                    // 点击词条按钮
                    addLog("点击词条")
                    clickArea(config.wordOcr.areas.wordButtonArea);
                    randomDelay();
                    //再次点击，快速点击推出boss箱子页面
                    clickArea(config.wordOcr.areas.wordButtonArea);
                    sleep(1000);

                    // OCR识别
                    var words = captureAndOcr();
                    if (words.length > 0) {
                        addLog("OCR识别: 【" + words.join("】, 【") + "】");
                    }

                    if (words.length < 3) {
                        addLog("词条数量:" + words.length);
                        sleep(500);
                        break;
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
                        addLog("点击刷新词条");
                        clickArea(config.wordOcr.areas.refreshButtonArea);

                        words = captureAndOcr();
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
                            addLog("命中优先词条: 【" + needWordList[w] + "】");
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
                        addLog("点击词条:" + (selectedIndex + 1));
                        clickArea(config.wordOcr.areas.wordPositions[selectedIndex]);
                        break;
                    } else {
                        // 随机选择词条
                        var randomIndex = Math.floor(Math.random() * config.wordOcr.areas.wordPositions.length);
                        clickArea(config.wordOcr.areas.wordPositions[randomIndex]);
                        addLog("无可用词条, 随机选择词条: " + words[randomIndex]);
                        break;
                    }
                }

                addLog("=============end===============")
                // 等待下一个循环
                if (ocrRunning && !isExiting) {
                    sleep(config.wordOcr.mainLoopInterval);
                }

            } catch (e) {
                addLog("OCR错误: " + e.message);
                sleep(1000);
            }
        }

        addLog("OCR工作线程退出");
    });
}

// ==================== 退出清理 ====================
function cleanup() {
    isExiting = true;
    clickerRunning = false;
    clickerPaused = false;
    ocrRunning = false;

    if (clickerThread != null && clickerThread.isAlive()) {
        clickerThread.interrupt();
    }

    if (ocrThread != null && ocrThread.isAlive()) {
        ocrThread.interrupt();
    }

    if (clickerControlWindow != null) {
        try { clickerControlWindow.close(); } catch(e) {}
    }

    if (ocrControlWindow != null) {
        try { ocrControlWindow.close(); } catch(e) {}
    }

    if (logWindow != null) {
        try { logWindow.close(); } catch(e) {}
    }

    addLog("脚本已完全退出");
    toastLog("脚本已完全退出");
}

// ==================== 主程序 ====================
events.on("exit", cleanup);

toast("正在初始化...");
sleep(1000);

// 创建日志窗口
// createLogWindow();
// sleep(500);

// 创建点击器控制按钮（右上角）
createClickerControlWindow();
sleep(500);

// 创建OCR控制按钮（左侧）
createOcrControlWindow();
sleep(500);

addLog("==================");
addLog("综合脚本就绪");
addLog("点击器: 初始待命");
addLog("  - 区域: (" + config.clicker.area.left + "," + config.clicker.area.top + ")");
addLog("  - 间隔: " + config.clicker.time.min + "~" + config.clicker.time.max + "ms");
addLog("  - OCR检测间隔: " + (config.clicker.ocrCheckInterval/1000) + "秒");
if (config.clicker.continuousClick.enabled) {
    addLog("  - 连续点击: " + config.clicker.continuousClick.duration + "秒");
}
addLog("自动加入流程: 已配置");
addLog("  - 聊天框→队伍→难度→空白区域");
addLog("自动召唤流程: 已配置");
addLog("  - 等待准备→召唤英雄" + config.summon.summonClickCount + "次");
addLog("OCR选择器: 初始待命");
addLog("  - 优先词条: " + needWordList.length);
addLog("  - 可选词条: " + allWordList.length);
addLog("  - 间隔: " + (config.wordOcr.mainLoopInterval/1000) + "秒");
addLog("  - 重试: " + config.wordOcr.maxRetryCount + "次");
addLog("==================");
addLog("点击绿色按钮开始对应功能");

toast("初始化完成，可独立控制两个功能");

// 保活
setInterval(function() {}, 60000);