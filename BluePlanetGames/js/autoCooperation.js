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

// ==================== 可配置参数 ====================
var config = {

    // ========== 游戏准备配置 ==========
    gamePrepare: {

        // 楼层配置映射
        levelConfig: {
            "彩虹3层": "plan4",
            "彩虹4层": "plan2",
            "彩虹5层": "plan4",
            "彩虹6层": "plan4",
            "彩虹7层": "plan4",
            "default": "plan4"
        },

        // 停止自动加入判断的识别区域（原OCR配置，当颜色检测关闭时使用）
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

        // 点击间隔基础值（毫秒）
        clickBaseInterval: 100,

        // 点击间隔随机范围（毫秒）
        clickRandomRange: 50,

        // ========== 自动点击停止颜色检测 ==========
        stopColorCheck: {
            enabled: true,            // 启用颜色检测替代OCR
            points: [                 // 检测点坐标 (屏幕坐标)
                { x: 1010, y: 600 },
                { x: 1010, y: 700 },
                { x: 1010, y: 800 },
                { x: 1010, y: 900 },
                { x: 1010, y: 1000 }
            ],
            threshold: 10             // 颜色相似阈值
        }
    },


    // ========== 点击器配置 ==========
    clicker: {
        //点击区域
        area: {
            left: 580, top: 1720, right: 650, bottom: 1780
        },
        gapTime: {
            min: 300, max: 500
        },
        continuousClick: {
            enabled: true,
            duration: 300
        },
        //自动加入按钮偏移位置
        button: {
            x: 200, y: 400
        },
        // OCR检测间隔（毫秒）
        ocrCheckInterval: 5000
    },

    // ========== OCR词条选择配置 ==========
    wordOcr: {
        // 主循环间隔（毫秒）
        mainLoopInterval: 5000,

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
            wordAreaList: [
                { left: 100, top: 1100, right: 300, bottom: 1300 },
                { left: 430, top: 1100, right: 650, bottom: 1300 },
                { left: 770, top: 1100, right: 990, bottom: 1300 }
            ]
        },

        // 开启自动词条按钮位置
        controlButton: {
            x: 200,
            y: 300,
            width: 80,
            height: 80
        },

        // ========== 词条OCR颜色预检 ==========
        colorPreCheck: {
            enabled: true,
            points: [
                { x: 450, y: 816 },
                { x: 480, y: 816 },
                { x: 500, y: 816 },
                { x: 550, y: 816 },
                { x: 600, y: 816 },
                { x: 640, y: 816 }
            ],
            threshold: 30
        },

        // ========== 结算页面检测（返回按钮颜色） ==========
        settlementCheck: {
            enabled: true,
            points: [
                { x: 680, y: 2060 },
                { x: 880, y: 2060 },
                { x: 680, y: 2100 },
                { x: 880, y: 2100 }
            ],
            threshold: 10
        },

        // 宝箱点击区域
        boxArea: { left: 270, top: 1150, right: 290, bottom: 1170 },

        // 结算页面返回按钮区域（与检测点矩形一致）
        settlementBackButtonArea: { left: 680, top: 2060, right: 880, bottom: 2100 },

        // 点击宝箱后等待时间（毫秒）
        waitBeforeBack: 4000
    },


    // ========== 自动加入流程配置 ==========
    autoJoin: {
        // 主页面聊天框位置
        mainChatBoxLocation: { left: 990, top: 1020, right: 1010, bottom: 1040 },

        // 合作模式聊天框位置
        cooperationChatBoxLocation: { left: 990, top: 860, right: 1010, bottom: 880 },

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
        // 准备状态ocr检测区域
        prepareStatusOcrArea: { left: 330, top: 1900, right: 750, bottom: 2020 },

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
var firstWordListRaw = [
    "猴子:化身仗势", "猴子:万化随形", "猴子:应物随心",
    "猴子:大闹天宫",
    "猴子:天地倾", "猴子:江海翻", "猴子:称心如意",
    "猴子:乱点天宫", "猴子:风卷残云", "猴子:翻江倒海", "猴子:乘胜追击",
    "猴子:战意升腾", "猴子:斗战激昂", "猴子:无处遁形", "猴子:无处通形",
    "哥斯拉:高速轰击", "哥斯拉:火球喷发", "哥斯拉:高速火球",
    "哥斯拉:轰击爆发", "哥斯拉:帝皇支援", "哥斯拉:灼烧岩浆", "哥斯拉:岩浆扩散",
    "哥斯拉:万兽之王", "哥斯拉:致命强化", "哥斯拉:核能增幅",
    "天使:神圣契约", "天使:战神化身", "天使:奥术连奏"
];

var secondWordListRaw = [
    "天使:战神化身", "天使:奥术连奏", "天使:圣羽加持",
    "毒液:血肉盛宴"
];

var allWordListRaw = [
    "猴子:化身仗势", "猴子:万化随行", "猴子:应物随心",
    "猴子:大闹天宫",
    "猴子:天地倾", "猴子:江海翻", "猴子:称心如意",
    "猴子:乱点天宫", "猴子:风卷残云", "猴子:翻江倒海", "猴子:乘胜追击",
    "猴子:战意升腾", "猴子:斗战激昂", "猴子:无处遁形", "猴子:无处通形",
    "哥斯拉:高速轰击", "哥斯拉:火球喷发", "哥斯拉:高速火球",
    "哥斯拉:轰击爆发", "哥斯拉:帝皇支援", "哥斯拉:灼烧岩浆", "哥斯拉:岩浆扩散",
    "哥斯拉:万兽之王", "哥斯拉:致命强化", "哥斯拉:核能增幅",
    "天使:神圣契约", "天使:战神化身", "天使:奥术连奏", "天使:圣羽加持",
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

var firstWordList = extractWordNames(firstWordListRaw);
var secondWordList = extractWordNames(secondWordListRaw);

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

//结算页面检测标志
var settlementDetected = false;

// 上次OCR检测时间
var lastOcrCheckTime = 0;

// ==================== 工具函数：颜色比较 ====================
function isSimilar(color1, color2, threshold) {
    let r1 = (color1 >> 16) & 0xff;
    let g1 = (color1 >> 8) & 0xff;
    let b1 = color1 & 0xff;
    let r2 = (color2 >> 16) & 0xff;
    let g2 = (color2 >> 8) & 0xff;
    let b2 = color2 & 0xff;
    let diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    return diff <= threshold * 3;
}

// 判断图像上的一组点是否颜色都相似（均与第一个点比较）
function areAllColorsSimilar(img, points, threshold) {
    if (!points || points.length === 0) return true;
    try {
        var baseColor = images.pixel(img, points[0].x, points[0].y);
        console.log("基准点 (" + points[0].x + "," + points[0].y + ") 颜色: " + colors.toString(baseColor));
        for (var i = 1; i < points.length; i++) {
            var color = images.pixel(img, points[i].x, points[i].y);
            console.log("点 (" + points[i].x + "," + points[i].y + ") 颜色: " + colors.toString(color));
            if (!isSimilar(baseColor, color, threshold)) {
                console.log("  颜色差异过大，不相似");
                return false;
            }
        }
        return true;
    } catch (e) {
        console.log("颜色检测异常: " + e.message);
        return false;
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
            <button id="start" text="点" w="40" h="40" bg="#44ff44" textColor="#000000" textSize="12sp"/>
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

    console.log("点击器控制窗口已创建");
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

    console.log("⏸️ 点击器已暂停");

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
    lastOcrCheckTime = 0;

    ui.run(function() {
        stopBtn.setVisibility(0);
        startBtn.setVisibility(8);
    });

    console.log("▶️ 点击器已启动");
    if (config.clicker.continuousClick.enabled) {
        console.log("⏰ 将连续点击 " + config.clicker.continuousClick.duration + " 秒后自动暂停");
    }

    startClickerThread();
}

// ==================== 自动加入流程 ====================
function executeAutoJoinFlow() {
    console.log("===== 开始自动加入流程 =====");

    console.log("步骤1: 点击主页面聊天框");
    clickArea(config.autoJoin.mainChatBoxLocation);
    sleep(config.autoJoin.stepDelay);

    console.log("步骤1.1: 点击合作模式聊天框");
    clickArea(config.autoJoin.cooperationChatBoxLocation);
    sleep(config.autoJoin.stepDelay);

    console.log("步骤2: 点击队伍");
    clickArea(config.autoJoin.teamButtonLocation);
    sleep(config.autoJoin.stepDelay);

    console.log("步骤3: 点击选择难度");
    clickArea(config.autoJoin.selectDifficultyButtonLocation);
    sleep(config.autoJoin.stepDelay);

    console.log("步骤4: 点击空白区域");
    clickArea(config.autoJoin.teamBlankArea);
    sleep(config.autoJoin.stepDelay);

    console.log("===== 自动加入流程完成 =====");
}

// ==================== 检查准备状态 ====================
function checkPrepareStatus() {
    try {
        var img = captureScreen();
        if (!img) {
            console.log("准备状态检测: 截图失败");
            return false;
        }

        var area = config.summon.prepareStatusOcrArea;
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
                    console.log("准备状态: 检测到【已准备】");
                    return true;
                }
            }
        }

        console.log("准备状态: 未检测到【已准备】");
        return false;

    } catch (e) {
        console.log("准备状态检测异常: " + e.message);
        return false;
    }
}

// ==================== 执行召唤流程 ====================
function executeSummonFlow() {
    console.log("===== 开始召唤流程 =====");

    // 等待准备完成
    console.log("已准备完成，每" + (config.summon.statusCheckInterval/1000) + "秒检测是否开始");
    var isPrepared = true;

    while (isPrepared && !isExiting) {
        isPrepared = checkPrepareStatus()
        if (isPrepared) {
            sleep(config.summon.statusCheckInterval);
        }
    }

    if (isExiting) return;

    console.log("游戏开始，休眠" + (config.summon.waitAfterPrepare/1000) + "秒");
    sleep(config.summon.waitAfterPrepare);

    console.log("=====> 开始召唤英雄, " + config.summon.summonClickCount + "次 <=====");
    for (var i = 0; i < config.summon.summonClickCount && !isExiting; i++) {
        console.log("召唤点击: 第" + (i + 1) + "次");
        clickArea(config.summon.summonButtonArea);
        sleep(config.summon.summonClickInterval);
    }
    console.log("===== 召唤流程完成 =====");
    console.log("=====> 关闭流畅、飘字 <=====");
    clickArea(config.summon.fluentButtonArea);
    randomDelay()
    clickArea(config.summon.floatButtonArea)
}

// ==================== 检测是否进入房间 ====================
function checkJoinRoom() {
    // 如果启用了颜色检测，使用颜色模式
    if (config.gamePrepare.stopColorCheck.enabled) {
        try {
            var img = captureScreen();
            if (!img) {
                console.log("状态: 截图失败（颜色检测）");
                return false;
            }
            console.log("===== 颜色检测：判断是否还在频道 =====");
            // 如果所有点颜色相似（一致），表示还在频道，返回true；如果不一致，表示进入房间，返回false
            var similar = areAllColorsSimilar(img, config.gamePrepare.stopColorCheck.points, config.gamePrepare.stopColorCheck.threshold);
            img.recycle();
            if (similar) {
                console.log("状态: 颜色一致，未进入房间，等待中...");
                return true;
            } else {
                console.log("状态: 颜色不一致，进入房间");
                return false;
            }
        } catch (e) {
            console.log("状态: 颜色检测异常: " + e.message);
            return false;
        }
    } else {
        // 否则使用原来的OCR检测
        try {
            var img = captureScreen();
            if (!img) {
                console.log("状态: 截图失败，无法检测游戏状态");
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
                        console.log("状态: 未进入房间，等待中...");
                        return true;
                    }
                }
            }

            return false;

        } catch (e) {
            console.log("状态: OCR检测异常: " + e.message);
            return false;
        }
    }
}

// ==================== 楼层识别 ====================
function recognizeLevel() {
    try {
        var img = captureScreen();
        if (!img) {
            console.log("楼层识别: 截图失败");
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

        console.log("楼层识别: 未识别到楼层信息");
        return null;

    } catch (e) {
        console.log("楼层识别: OCR异常: " + e.message);
        return null;
    }
}

// ==================== 执行游戏准备流程 ====================
function executeGamePreparation() {
    console.log("===== 开始游戏准备流程 =====");

    // 1. 识别楼层
    var levelText = recognizeLevel();
    var planType = config.gamePrepare.levelConfig["default"];

    if (levelText) {
        if (config.gamePrepare.levelConfig[levelText]) {
            planType = config.gamePrepare.levelConfig[levelText];
        }
        console.log("楼层识别: " + levelText + " → 使用方案" + (planType === "plan4" ? "4" : "2"));
    } else {
        console.log("楼层识别: 失败/为空 → 使用默认方案2");
    }

    // 2. 点击方案主入口按钮
    var planBtn = config.gamePrepare.planButtonLocation;
    console.log("点击方案按钮");
    clickArea(planBtn);
    console.log("点击: 方案入口 → 方案" + (planType === "plan4" ? "4" : "2") + "按钮 → 准备按钮");
    sleep(config.gamePrepare.clickBaseInterval + random(-config.gamePrepare.clickRandomRange, config.gamePrepare.clickRandomRange));

    // 3. 点击对应方案按钮
    var selectedPlanBtn;
    if (planType === "plan4") {
        selectedPlanBtn = config.gamePrepare.plan4ButtonLocation;
    } else {
        selectedPlanBtn = config.gamePrepare.plan2ButtonLocation;
    }
    console.log("点击具体方案:" + planType);
    clickArea(selectedPlanBtn);
    sleep(500);

    var whiteArea = config.gamePrepare.levelOcrArea;
    console.log("点击空白区域(第1次)");
    clickArea(whiteArea);
    sleep(config.gamePrepare.clickBaseInterval + random(-config.gamePrepare.clickRandomRange, config.gamePrepare.clickRandomRange));
    console.log("点击空白区域(第2次)");
    clickArea(whiteArea);
    sleep(config.gamePrepare.clickBaseInterval + random(-config.gamePrepare.clickRandomRange, config.gamePrepare.clickRandomRange));

    // 4. 点击准备按钮
    console.log("点击准备按钮");
    clickArea(config.gamePrepare.prepareButtonLocation);

    console.log("===== 游戏准备流程完成 =====");
}

// ==================== 点击区域辅助函数 ====================
function clickArea(area) {
    var x = random(area.left, area.right);
    var y = random(area.top, area.bottom);
    try {
        console.log("点击(" + x + ", " + y + ")");
        click(x, y);
    } catch (e) {
        console.log("点击失败: " + e.message);
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

        console.log("执行自动加入流程");
        executeAutoJoinFlow();

        console.log("开始自动点击循环");
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

            // OCR/颜色检测是否进入房间
            if (clickerRunning && !clickerPaused) {
                var currentTime = new Date().getTime();
                if (currentTime - lastOcrCheckTime >= config.clicker.ocrCheckInterval) {
                    lastOcrCheckTime = currentTime;

                    if (!checkJoinRoom()) {
                        console.log("状态: 进入房间");

                        // 执行准备流程
                        executeGamePreparation();

                        // 执行召唤流程
                        executeSummonFlow();

                        // 自动暂停点击器
                        console.log("状态: 流程完成，自动暂停点击器");
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
                console.log("📊 已完成 " + localCount + " 次点击 | 已运行 " + elapsed + " 秒");
            }

            sleep(random(config.clicker.gapTime.min, config.clicker.gapTime.max));
        }

        console.log("点击器工作线程已停止");
    });
}

// ==================== OCR功能（带结算检测） ====================
function captureAndOcr() {
    try {
        var img = captureScreen();
        if (!img) {
            console.log("截图失败");
            return [];
        }

        // === 结算页面检测（优先于词条预检） ===
        if (config.wordOcr.settlementCheck.enabled) {
            console.log("===== 结算页面检测 =====");
            if (areAllColorsSimilar(img, config.wordOcr.settlementCheck.points, config.wordOcr.settlementCheck.threshold)) {
                console.log("检测到结算画面，返回按钮颜色一致");
                settlementDetected = true;
                img.recycle();
                return [];
            }
        }

        // === 词条颜色预检 ===
        if (config.wordOcr.colorPreCheck.enabled) {
            console.log("===== 词条颜色预检 =====");
            var points = config.wordOcr.colorPreCheck.points;
            var threshold = config.wordOcr.colorPreCheck.threshold;
            if (!areAllColorsSimilar(img, points, threshold)) {
                img.recycle();
                console.log("词条颜色不一致，跳过OCR");
                return [];
            }
            console.log("词条颜色一致，允许OCR识别");
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

        console.log("OCR耗时: " + (new Date() - start) + "ms, 结果为空");
        return [];

    } catch (e) {
        console.log("OCR异常: " + e.message);
        return [];
    }
}

/**
 * 随机休眠
 */
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
                startOcrWord();
            } else {
                stopWordOcr();
            }
        });
    } catch (e) {
        console.log("创建OCR控制窗口失败: " + e.message);
    }
}

// ==================== OCR识别词条启停控制 ====================
function startOcrWord() {
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

    console.log("OCR脚本已启动");
    toast("OCR脚本已启动");

    startOcrWordThread();
}

function stopWordOcr() {
    ocrRunning = false;

    if (ocrThread && ocrThread.isAlive()) {
        ocrThread.interrupt();
        ocrThread = null;
    }

    ui.run(function() {
        ocrControlWindow.ocrControlBtn.setText("词");
        ocrControlWindow.ocrControlBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
    });

    console.log("OCR脚本已停止");
    toast("OCR脚本已停止");
}

/**
 * 选择词条
 * @param words 词条
 */
function selectWord(words) {
    var selectedIndex = -1;

    //优选词条
    for (var w = 0; w < firstWordList.length; w++) {
        var idx = words.indexOf(firstWordList[w]);
        if (idx >= 0 && idx < 3) {
            selectedIndex = idx;
            console.log("命中优先词条: 【" + firstWordList[w] + "】");
            break;
        }
    }

    if (selectedIndex < 0) {
        //选择次优先级词条
        for (var w = 0; w < secondWordList.length; w++) {
            var idx = words.indexOf(secondWordList[w]);
            if (idx >= 0 && idx < 3) {
                selectedIndex = idx;
                console.log("命中次优先级词条: 【" + secondWordList[w] + "】");
                break;
            }
        }
    }

    if (selectedIndex >= 0) {
        console.log("点击词条:" + (selectedIndex + 1));
        clickArea(config.wordOcr.areas.wordAreaList[selectedIndex]);
    } else {
        // 随机选择词条
        var randomIndex = Math.floor(Math.random() * config.wordOcr.areas.wordAreaList.length);
        clickArea(config.wordOcr.areas.wordAreaList[randomIndex]);
        console.log("无可用词条, 随机选择词条: " + words[randomIndex]);
    }
}

// ==================== OCR词条工作线程（含结算页面处理） ====================
function startOcrWordThread() {
    if (ocrThread && ocrThread.isAlive()) {
        ocrThread.interrupt();
    }

    ocrThread = threads.start(function() {
        console.log("OCR工作线程启动");
        settlementDetected = false;

        while (ocrRunning && !isExiting) {
            try {
                console.log("=============start===============")

                console.log("点击词条")
                clickArea(config.wordOcr.areas.wordButtonArea);
                randomDelay();
                //再次点击，快速点击退出boss箱子页面
                clickArea(config.wordOcr.areas.wordButtonArea);
                sleep(1000);

                // OCR识别（内部包含颜色预检）
                var words = captureAndOcr();
                if (settlementDetected) break;      // 跳出 while 循环

                if (words.length > 0) {
                    console.log("OCR识别: 【" + words.join("】, 【") + "】");
                }

                if (words.length < 3) {
                    console.log("词条数量:" + words.length);
                    sleep(500);
                } else {
                    // 检查是否包含优先词条
                    var hasNeedWord = false;
                    for (var i = 0; i < words.length; i++) {
                        if (firstWordList.indexOf(words[i]) >= 0) {
                            hasNeedWord = true;
                            break;
                        }
                    }

                    // 刷新逻辑
                    if (!hasNeedWord) {
                        console.log("点击刷新词条");
                        clickArea(config.wordOcr.areas.refreshButtonArea);
                        sleep(500);

                        words = captureAndOcr();
                        if (settlementDetected) break;   // 跳出 while

                        if (words.length > 0) {
                            console.log("刷新后: " + words.join(", "));
                        }

                        if (words.length < 3) {
                            console.log("刷新后识别失败");
                        } else {
                            // 刷新后重新选择词条
                            selectWord(words);
                        }
                    } else {
                        // 有优先词条，直接选择
                        selectWord(words);
                    }
                }

                if (settlementDetected) break;   // 跳出 while 循环

                console.log("=============end===============")
                if (ocrRunning && !isExiting) {
                    sleep(config.wordOcr.mainLoopInterval);
                }

            } catch (e) {
                console.log("OCR错误: " + e.message);
                sleep(1000);
            }
        }

        // === 结算处理 ===
        if (settlementDetected) {
            console.log("===== 检测到结算，处理中 =====");
            // 点击宝箱
            console.log("点击宝箱");
            clickArea(config.wordOcr.boxArea);
            sleep(config.wordOcr.waitBeforeBack);
            // 点击返回
            console.log("点击结算返回按钮");
            clickArea(config.wordOcr.settlementBackButtonArea);

            // 关闭词条功能状态
            ocrRunning = false;
            ui.run(function() {
                ocrControlWindow.ocrControlBtn.setText("词");
                ocrControlWindow.ocrControlBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
            });
            console.log("词条功能已自动关闭");

            // 启动自动点击（寻找下一把合作）
            console.log("启动自动点击功能");
            if (!clickerRunning) {
                resumeClicker();
            } else {
                pauseClicker();
                sleep(500);
                resumeClicker();
            }

            settlementDetected = false;
        }

        console.log("OCR工作线程退出");
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

    console.log("脚本已完全退出");
    toastLog("脚本已完全退出");
}

// ==================== 主程序 ====================
events.on("exit", cleanup);

toast("正在初始化...");
sleep(1000);

// 创建点击器控制按钮（右上角）
createClickerControlWindow();
sleep(500);

// 创建OCR控制按钮（左侧）
createOcrControlWindow();
sleep(500);

console.log("==================");
console.log("  - 区域: (" + config.clicker.area.left + "," + config.clicker.area.top + ")");
console.log("  - 间隔: " + config.clicker.gapTime.min + "~" + config.clicker.gapTime.max + "ms");
console.log("  - 停止检测: " + (config.gamePrepare.stopColorCheck.enabled ? "颜色模式" : "OCR模式"));
if (config.gamePrepare.stopColorCheck.enabled) {
    console.log("    检测点数: " + config.gamePrepare.stopColorCheck.points.length);
}
console.log("  - 检测间隔: " + (config.clicker.ocrCheckInterval/1000) + "秒");
if (config.clicker.continuousClick.enabled) {
    console.log("  - 连续点击: " + config.clicker.continuousClick.duration + "秒");
}
console.log("  - 颜色预检: " + (config.wordOcr.colorPreCheck.enabled ? "开启" : "关闭"));
console.log("  - 结算检测: " + (config.wordOcr.settlementCheck.enabled ? "开启" : "关闭"));
console.log("  - 间隔: " + (config.wordOcr.mainLoopInterval/1000) + "秒");
console.log("  - 重试: " + config.wordOcr.maxRetryCount + "次");
console.log("==================");
console.log("点击绿色按钮开始对应功能");

toast("初始化完成，可独立控制两个功能");

// 保活
setInterval(function() {}, 60000);