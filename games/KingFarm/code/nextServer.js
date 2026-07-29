"auto";

// ==================== 权限请求 ====================
// 检查并请求无障碍服务
if (auto.service === null) {
    toastLog('请先开启无障碍服务');
    auto.waitFor();
    sleep(1000);
}

// 请求屏幕截图权限
if (!requestScreenCapture()) {
    toastLog('请求截图权限失败');
    exit();
}

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

// ==================== 自动获取屏幕尺寸 ====================
function getScreenSize() {
    var width = device.width;
    var height = device.height;

    console.log("原始屏幕尺寸: " + width + " x " + height);

    // 确保横屏状态（宽 > 高）
    var screenWidth, screenHeight;
    if (width > height) {
        screenWidth = width;
        screenHeight = height;
        console.log("当前为横屏模式");
    } else {
        screenWidth = height;
        screenHeight = width;
        console.log("当前为竖屏模式，自动转换为横屏坐标");
    }

    console.log("使用屏幕尺寸(横屏): " + screenWidth + " x " + screenHeight);
    return {
        width: screenWidth,
        height: screenHeight
    };
}

// ==================== 获取手机信息 ====================
function getPhoneInfo() {
    try {
        var build = android.os.Build;
        return {
            brand: build.BRAND || "未知",
            model: build.MODEL || "未知",
            manufacturer: build.MANUFACTURER || "未知",
            device: build.DEVICE || "未知",
            product: build.PRODUCT || "未知"
        };
    } catch (e) {
        console.error("获取手机信息失败: " + e.message);
        return {
            brand: "未知",
            model: "未知",
            manufacturer: "未知",
            device: "未知",
            product: "未知"
        };
    }
}

// ==================== 可配置参数 ====================
var screenSize = getScreenSize();
var phoneInfo = getPhoneInfo();

var config = {
    // ========== 屏幕配置 ==========
    designWidth: 2400,        // 设计分辨率宽度（横屏）
    designHeight: 1080,       // 设计分辨率高度（横屏）
    screenWidth: screenSize.width,   // 实际屏幕宽度（自动获取）
    screenHeight: screenSize.height, // 实际屏幕高度（自动获取）

    // ========== 当前服务器序号 ==========
    // 0: 特殊值，表示从步骤6（确认换区）开始执行，然后切换到序号1
    // 1-6: 对应服务器1-6
    currentIndex: 0,

    // ========== 服务器列表 ==========
    serverList: ["0", "1", "2", "3", "4", "5", "6"],

    // ========== 延时配置（毫秒） ==========
    delays: {
        returnToLobby: 500,    // 点击返回后等待时间
        toSettings: 3000,      // 点击确认返回大厅后等待时间（已改为检测，此值作为超时时间）
        exitGame: 1000,        // 点击设置后等待时间
        confirmExit: 500,      // 点击退出游戏后等待时间
        toServerSelect: 7000,  // 点击确认退出后等待时间（已改为检测，此值作为超时时间）
        toNextServer: 500,     // 点击确认换区后等待时间
        toStartGame: 1000,     // 选择服务器后等待时间
        enterVillage: 7000,    // 进入农村后等待时间（已废弃，改用OCR检测）
        detectInterval: 1000,  // 检测间隔（毫秒）
        detectTimeout: 10000,  // 检测超时时间（毫秒）
        waterClickDelay: 800   // 移动轮盘后点击浇水按钮的间隔（毫秒）
    },

    // ========== 坐标修正配置 ==========
    coordFix: {
        // 小米 Redmi K60
        "23113RKC6C": {
            // 暂未配置，后续可添加
        },
        // 华为 nova 2s
        "HWI-AL00": {
            backBtn: [30, 40, 150, 80],
            settingsBtn: [1980, 40, 2020, 80],
            exitGameBtn: [1500, 900, 1760, 940]
        },
        // 华为 Mate 10 Pro
        "ALP-TL00": {
            settingsBtn: [1740, 30, 1780, 70],
            exitGameBtn: [1500, 900, 1760, 940]
        },
        // 华为 P50 Pro
        "JAD-AL00": {
            // 暂未配置，后续可添加
        }
    },

    // ========== 检测区域配置 ==========
    detectAreas: {
        // 主界面检测区域_背包 (左, 上, 右, 下) - 设计分辨率坐标
        mainScreen: { left: 1670, top: 930, right: 2070, bottom: 1070 },
        // 开始游戏区域 (左, 上, 右, 下) - 设计分辨率坐标
        startGame: { left: 990, top: 790, right: 1390, bottom: 900 },
        // 农场名称区域 (左, 上, 右, 下) - 设计分辨率坐标
        farmName: { left: 400, top: 10, right: 750, bottom: 80 }
    },

    // ========== 移动持续时间机型配置（毫秒） ==========
    moveDurationByDevice: {
        // 华为 nova 2s
        "HWI-AL00": 2000,
        // 华为 Mate 10 Pro
        "ALP-TL00": 2000,
        // 默认值
        "default": 1800
    },

    // ========== 浇水功能配置 ==========
    water: {
        // 进入农村按钮区域 (左, 上, 右, 下) - 设计分辨率坐标
        enterVillageBtn: { left: 640, top: 780, right: 780, bottom: 840 },
        // 轮盘区域 (左, 上, 右, 下) - 设计分辨率坐标
        joystick: { left: 300, top: 600, right: 600, bottom: 850 },
        // 浇水按钮区域 (左, 上, 右, 下) - 设计分辨率坐标
        waterBtn: { left: 1490, top: 590, right: 1550, bottom: 640 },
        // 移动参数
        moveSettings: {
            directionX: -1,     // 方向向量X分量（-1表示向左）
            directionY: -1,     // 方向向量Y分量（-1表示向上），(-1,-1)即西北方向
            distance: 250,      // 移动距离（从中心向外拖拽的距离，设计分辨率像素）
            holdDuration: 2000  // 保持按压时间（毫秒）
        }
    },

    // ========== 自动移动功能配置 ==========
    autoMove: {
        joystick: { left: 300, top: 600, right: 600, bottom: 850 },
        distance: 300,
        moveDuration: 1000,
        sleepDuration: 10000,
        minAngle: 0,
        maxAngle: 270
    }
};

// ==================== 全局变量 ====================
var controlWindow = null;
var isSwitching = false;
var isWatering = false;
var isMoving = false;
var isExiting = false;
var clickCount = 0;
var waterType = "";
var stopAutoMove = false;
var moveThread = null;
var switchThread = null;
var stopSwitch = false;

// ==================== 坐标转换函数（支持机型修正） ====================
function getFixedCoordinate(coordName, defaultLeft, defaultTop, defaultRight, defaultBottom) {
    var model = phoneInfo.model;
    var coordFix = config.coordFix;

    if (coordFix[model] && coordFix[model][coordName] !== undefined) {
        var fixed = coordFix[model][coordName];
        console.log("使用机型修正坐标 [" + model + "][" + coordName + "]: " +
            "(" + fixed[0] + "," + fixed[1] + "," + fixed[2] + "," + fixed[3] + ")");
        return {
            left: fixed[0],
            top: fixed[1],
            right: fixed[2],
            bottom: fixed[3],
            isFixed: true
        };
    }

    console.log("使用默认缩放坐标 [" + coordName + "]: " +
        "设计(" + defaultLeft + "," + defaultTop + "," + defaultRight + "," + defaultBottom + ")");
    return scaleCoordinate(defaultLeft, defaultTop, defaultRight, defaultBottom);
}

function scaleCoordinate(x, y, width, height) {
    var scaleX = config.screenWidth / config.designWidth;
    var scaleY = config.screenHeight / config.designHeight;

    var result = {
        left: Math.round(x * scaleX),
        top: Math.round(y * scaleY),
        right: Math.round(width * scaleX),
        bottom: Math.round(height * scaleY),
        isFixed: false
    };

    console.log("坐标转换: 设计(" + x + "," + y + "," + width + "," + height + ") -> " +
        "实际(" + result.left + "," + result.top + "," + result.right + "," + result.bottom + ")" +
        " [缩放比: X=" + scaleX.toFixed(3) + ", Y=" + scaleY.toFixed(3) + "]");

    return result;
}

// ==================== 检测区域函数（OCR版本） ====================
function getDetectArea(areaName) {
    var area = config.detectAreas[areaName];
    if (!area) {
        console.error("未知的检测区域: " + areaName);
        return null;
    }
    return getFixedCoordinate(
        "detect_" + areaName,
        area.left, area.top, area.right, area.bottom
    );
}

// ==================== waitForText - OCR检测（使用paddle） ====================
function waitForText(areaName, targetText, timeout) {
    timeout = timeout || config.delays.detectTimeout;
    var interval = config.delays.detectInterval;
    var elapsed = 0;

    var area = getDetectArea(areaName);
    if (!area) {
        console.error("无法获取检测区域: " + areaName);
        return false;
    }

    console.log("开始检测 [" + areaName + "] 是否包含文字: \"" + targetText + "\"");
    console.log("检测区域: (" + area.left + "," + area.top + "," + area.right + "," + area.bottom + ")");
    console.log("超时时间: " + timeout + "ms");

    while (elapsed < timeout) {
        // 检查是否被中断
        if (stopSwitch || isExiting) {
            console.log("检测被中断");
            return false;
        }

        try {
            // 截取屏幕
            var img = captureScreen();
            if (!img) {
                console.log("截图失败，重试...");
                sleep(interval);
                elapsed += interval;
                continue;
            }

            // 裁剪检测区域
            var region = images.clip(img, area.left, area.top,
                area.right - area.left, area.bottom - area.top);
            if (!region) {
                console.log("裁剪区域失败，重试...");
                sleep(interval);
                elapsed += interval;
                continue;
            }

            // 使用 paddle.ocr 进行文字识别
            var result = paddle.ocr(region);

            // 处理OCR结果
            if (result && result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    // 兼容不同的返回格式
                    var text = result[i].words || result[i].text || "";
                    text = text.replace(/[\s\n\r\t]+/g, "").trim();

                    if (text.indexOf(targetText) >= 0) {
                        console.log("检测成功: 在 [" + areaName + "] 中找到 \"" + targetText + "\" (识别到: " + text + ")");
                        return true;
                    }
                }
            }

            console.log("未找到 \"" + targetText + "\"，继续检测... (已用 " + elapsed + "ms)");

        } catch (e) {
            console.log("检测异常: " + e.message);
        }

        sleep(interval);
        elapsed += interval;

        // 检查停止标志
        if (stopSwitch || isExiting) {
            console.log("检测被中断");
            return false;
        }
    }

    console.log("检测超时: " + timeout + "ms 内未找到 \"" + targetText + "\"");
    return false;
}

// ==================== 获取当前机型的移动持续时间 ====================
function getMoveDuration() {
    var model = phoneInfo.model;
    var duration = config.moveDurationByDevice[model];
    if (duration === undefined) {
        duration = config.moveDurationByDevice["default"];
    }
    console.log("当前机型 [" + model + "] 移动持续时间: " + duration + "ms");
    return duration;
}

// ==================== 人类行为模拟函数 ====================
function humanDelay(baseDelay) {
    var delay = baseDelay + random(-200, 200);
    delay = Math.max(100, delay);
    console.log("延时 " + delay + "ms (基础: " + baseDelay + "ms)");
    sleep(delay);
}

function humanClick(area, description) {
    clickCount++;
    var clickId = clickCount;

    try {
        var x = random(area.left, area.right);
        var y = random(area.top, area.bottom);
        x += random(-2, 2);
        y += random(-2, 2);
        var pressTime = random(30, 80);

        console.log("[" + clickId + "] 点击: " + description);
        console.log("[" + clickId + "] 区域: (" + area.left + "," + area.top + "," +
            area.right + "," + area.bottom + ")");
        console.log("[" + clickId + "] 实际坐标: (" + x + "," + y + ") 按压: " + pressTime + "ms");

        press(x, y, pressTime);
        sleep(random(50, 100));

        console.log("[" + clickId + "] 点击成功: " + description);
        return true;
    } catch (e) {
        console.log("[" + clickId + "] 点击失败: " + description + " - " + e.message);
        try {
            var x2 = random(area.left, area.right);
            var y2 = random(area.top, area.bottom);
            console.log("[" + clickId + "] 备用点击坐标: (" + x2 + "," + y2 + ")");
            click(x2, y2);
            console.log("[" + clickId + "] 备用点击成功: " + description);
            return true;
        } catch (e2) {
            console.log("[" + clickId + "] 备用点击也失败: " + description + " - " + e2.message);
            return false;
        }
    }
}

// ==================== 获取服务器位置 ====================
function getServerPosition(index) {
    console.log("获取服务器 " + index + " 的位置");

    var positions = {
        1: { x: 430, y: 240, width: 1230, height: 320 },
        2: { x: 1380, y: 240, width: 2170, height: 320 },
        3: { x: 430, y: 370, width: 1230, height: 450 },
        4: { x: 1380, y: 370, width: 2170, height: 450 },
        5: { x: 430, y: 500, width: 1230, height: 580 },
        6: { x: 1380, y: 500, width: 2170, height: 580 }
    };

    var pos = positions[index];
    if (!pos) {
        console.error("无效的服务器序号: " + index);
        return null;
    }

    var scaledPos = scaleCoordinate(pos.x, pos.y, pos.width, pos.height);
    console.log("服务器 " + index + " 最终位置: ", JSON.stringify(scaledPos));

    return scaledPos;
}

// ==================== 获取轮盘中心 ====================
function getJoystickCenter() {
    var joystick = scaleCoordinate(
        config.water.joystick.left,
        config.water.joystick.top,
        config.water.joystick.right,
        config.water.joystick.bottom
    );

    var centerX = Math.round((joystick.left + joystick.right) / 2);
    var centerY = Math.round((joystick.top + joystick.bottom) / 2);

    return { x: centerX, y: centerY };
}

// ==================== 轮盘移动函数（浇水用，支持机型配置持续时间） ====================
function executeJoystickMove() {
    console.log("开始执行轮盘移动");

    var joystick = scaleCoordinate(
        config.water.joystick.left,
        config.water.joystick.top,
        config.water.joystick.right,
        config.water.joystick.bottom
    );

    var centerX = Math.round((joystick.left + joystick.right) / 2);
    var centerY = Math.round((joystick.top + joystick.bottom) / 2);

    console.log("轮盘区域: (" + joystick.left + "," + joystick.top + "," +
        joystick.right + "," + joystick.bottom + ")");
    console.log("轮盘中心: (" + centerX + "," + centerY + ")");

    var directionX = config.water.moveSettings.directionX;
    var directionY = config.water.moveSettings.directionY;
    var distance = config.water.moveSettings.distance;
    // 从机型配置获取移动持续时间
    var duration = getMoveDuration();

    var scaleX = config.screenWidth / config.designWidth;
    var scaleY = config.screenHeight / config.designHeight;
    var scaledDistance = Math.round(distance * Math.min(scaleX, scaleY));

    var len = Math.sqrt(directionX * directionX + directionY * directionY);
    if (len === 0) {
        console.error("方向向量为零");
        return false;
    }
    var normX = directionX / len;
    var normY = directionY / len;

    var targetX = centerX + Math.round(normX * scaledDistance);
    var targetY = centerY + Math.round(normY * scaledDistance);

    targetX = Math.max(0, Math.min(targetX, config.screenWidth));
    targetY = Math.max(0, Math.min(targetY, config.screenHeight));

    console.log("移动参数:");
    console.log("  - 方向向量: (" + normX.toFixed(3) + "," + normY.toFixed(3) + ")");
    console.log("  - 移动距离: " + scaledDistance + "px");
    console.log("  - 持续时间: " + duration + "ms");
    console.log("  - 起始位置: (" + centerX + "," + centerY + ")");
    console.log("  - 目标位置: (" + targetX + "," + targetY + ")");

    try {
        console.log("执行滑动操作...");
        swipe(centerX, centerY, targetX, targetY, duration);
        console.log("滑动操作完成");
        return true;
    } catch (e) {
        console.error("轮盘移动失败: " + e.message);
        return false;
    }
}

// ==================== 自动移动功能 ====================
function getRandomDirection() {
    var minAngle = config.autoMove.minAngle;
    var maxAngle = config.autoMove.maxAngle;

    var angle = random(minAngle, maxAngle);
    var radians = angle * Math.PI / 180;

    var dirX = Math.cos(radians);
    var dirY = Math.sin(radians);

    console.log("随机方向: 角度=" + angle + "°, 向量=(" + dirX.toFixed(3) + "," + dirY.toFixed(3) + ")");

    return {
        angle: angle,
        x: dirX,
        y: dirY
    };
}

function executeAutoMove() {
    if (isMoving) {
        toast("正在移动中...");
        return;
    }

    if (isSwitching) {
        toast("正在切换服务器，无法移动");
        return;
    }

    if (isWatering) {
        toast("正在浇水，无法移动");
        return;
    }

    if (auto.service === null) {
        console.log("无障碍服务未开启，尝试启动...");
        toast("无障碍服务未开启，请先开启");
        auto.waitFor();
        sleep(1000);
        if (auto.service === null) {
            console.error("无法开启无障碍服务");
            toast("无法开启无障碍服务");
            return;
        }
    }

    stopAutoMove = false;
    isMoving = true;
    updateAllUI();

    console.log("========================================");
    console.log("开始自动移动");
    console.log("========================================");

    var center = getJoystickCenter();
    console.log("轮盘中心: (" + center.x + "," + center.y + ")");

    moveThread = threads.start(function() {
        var moveCount = 0;
        try {
            while (isMoving && !stopAutoMove && !isExiting) {
                moveCount++;

                console.log("\n--- 移动 #" + moveCount + " ---");

                var direction = getRandomDirection();
                var distance = config.autoMove.distance;
                var moveDuration = config.autoMove.moveDuration;

                var targetX = center.x + Math.round(direction.x * distance);
                var targetY = center.y + Math.round(direction.y * distance);

                targetX = Math.max(0, Math.min(targetX, config.screenWidth));
                targetY = Math.max(0, Math.min(targetY, config.screenHeight));

                console.log("移动参数:");
                console.log("  - 方向角度: " + direction.angle + "°");
                console.log("  - 移动距离: " + distance + "px");
                console.log("  - 移动持续: " + moveDuration + "ms");
                console.log("  - 目标位置: (" + targetX + "," + targetY + ")");

                try {
                    console.log("执行滑动...");
                    swipe(center.x, center.y, targetX, targetY, moveDuration);
                    console.log("滑动完成");
                } catch (e) {
                    console.error("滑动执行失败: " + e.message);
                }

                if (stopAutoMove || !isMoving || isExiting) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }

                console.log("回到中心...");
                try {
                    swipe(targetX, targetY, center.x, center.y, 200);
                } catch (e) {
                    console.error("回到中心失败: " + e.message);
                }

                if (stopAutoMove || !isMoving || isExiting) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }

                console.log("休眠10秒...");
                var sleepStart = Date.now();
                var sleepDuration = config.autoMove.sleepDuration;

                while (Date.now() - sleepStart < sleepDuration) {
                    if (stopAutoMove || !isMoving || isExiting) {
                        console.log("检测到停止标志，中断休眠");
                        break;
                    }
                    sleep(100);
                }

                if (stopAutoMove || !isMoving || isExiting) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }

                console.log("休眠结束，准备下一次移动");
            }

            console.log("\n========================================");
            console.log("自动移动结束，总移动次数: " + moveCount);
            console.log("========================================");

        } catch (e) {
            console.error("自动移动异常: " + e.message);
        } finally {
            try {
                var center2 = getJoystickCenter();
                press(center2.x, center2.y, 50);
            } catch(e) {}

            isMoving = false;
            updateAllUI();
            toast("自动移动已停止，共移动 " + moveCount + " 次");
        }
    });
}

function stopAutoMoveFunction() {
    console.log("请求停止自动移动");
    stopAutoMove = true;
    isMoving = false;
    updateAllUI();
}

// ==================== 浇水功能1（不点击进入农村） ====================
function executeWater1() {
    if (isWatering) {
        toast("正在浇水，请稍候...");
        return;
    }

    if (isSwitching) {
        toast("正在切换服务器，无法浇水");
        return;
    }

    if (isMoving) {
        toast("正在自动移动，无法浇水");
        return;
    }

    if (auto.service === null) {
        console.log("无障碍服务未开启，尝试启动...");
        toast("无障碍服务未开启，请先开启");
        auto.waitFor();
        sleep(1000);
        if (auto.service === null) {
            console.error("无法开启无障碍服务");
            toast("无法开启无障碍服务");
            return;
        }
    }

    isWatering = true;
    waterType = "water1";
    updateAllUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始浇水操作（浇1 - 不进入农村）");
            console.log("========================================");

            console.log("\n--- 步骤1: 操作轮盘向西北方向移动 ---");
            if (!executeJoystickMove()) {
                throw new Error("步骤1失败: 轮盘移动操作失败");
            }

            // 移动轮盘后等待800ms再点击浇水按钮
            console.log("等待 " + config.delays.waterClickDelay + "ms 后点击浇水按钮...");
            sleep(config.delays.waterClickDelay);

            console.log("\n--- 步骤2: 点击浇水按钮 ---");
            var waterBtnArea = getFixedCoordinate(
                "waterBtn",
                config.water.waterBtn.left,
                config.water.waterBtn.top,
                config.water.waterBtn.right,
                config.water.waterBtn.bottom
            );

            humanClick(waterBtnArea, "浇水按钮");
            sleep(300);
            humanClick(waterBtnArea, "浇水按钮");

            console.log("\n========================================");
            console.log("浇水操作完成（浇1）");
            console.log("总点击次数: " + clickCount);
            console.log("========================================\n");

            toast("浇水1完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("浇水1失败: " + e.message);
            console.error("失败时的点击计数: " + clickCount);
            console.error("========================================\n");
            toast("浇水1失败: " + e.message);
        } finally {
            isWatering = false;
            waterType = "";
            updateAllUI();
        }
    });
}

// ==================== 浇水功能2（点击进入农村 + OCR检测农场） ====================
function executeWater2() {
    if (isWatering) {
        toast("正在浇水，请稍候...");
        return;
    }

    if (isSwitching) {
        toast("正在切换服务器，无法浇水");
        return;
    }

    if (isMoving) {
        toast("正在自动移动，无法浇水");
        return;
    }

    if (auto.service === null) {
        console.log("无障碍服务未开启，尝试启动...");
        toast("无障碍服务未开启，请先开启");
        auto.waitFor();
        sleep(1000);
        if (auto.service === null) {
            console.error("无法开启无障碍服务");
            toast("无法开启无障碍服务");
            return;
        }
    }

    isWatering = true;
    waterType = "water2";
    updateAllUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始浇水操作（浇2 - 进入农村）");
            console.log("========================================");

            // ========== 步骤1: 先检测农场名称区域是否包含"农场" ==========
            console.log("\n--- 步骤1: 检测农场名称区域是否包含\"农场\"文字 ---");
            if (stopSwitch || isExiting) {
                throw new Error("操作被用户中断");
            }

            //不等待
            var isInFarm = waitForText("farmName", "农场", 500);

            if (isInFarm) {
                // 已经在农场内，直接执行移动和浇水
                console.log("已在农场内，直接执行移动和浇水操作");
            } else {
                // 不在农场内，执行进入农村流程
                console.log("不在农场内，执行进入农村流程");

                // ========== 步骤2: 点击进入农村按钮 ==========
                console.log("\n--- 步骤2: 点击进入农村按钮 ---");
                var enterVillageArea = getFixedCoordinate(
                    "enterVillageBtn",
                    config.water.enterVillageBtn.left,
                    config.water.enterVillageBtn.top,
                    config.water.enterVillageBtn.right,
                    config.water.enterVillageBtn.bottom
                );

                if (!humanClick(enterVillageArea, "进入农村按钮")) {
                    throw new Error("步骤2失败: 点击进入农村按钮");
                }

                // ========== 步骤3: 检测农场名称区域是否包含"农场"文字 ==========
                console.log("\n--- 步骤3: 检测农场名称区域是否包含\"农场\"文字 ---");
                if (stopSwitch || isExiting) {
                    throw new Error("操作被用户中断");
                }

                var farmDetected = waitForText("farmName", "农场", config.delays.detectTimeout);
                if (!farmDetected) {
                    throw new Error("步骤3超时: 未检测到农场名称");
                }
                console.log("已进入农场，继续执行浇水操作");
            }

            // ========== 步骤4: 操作轮盘向西北方向移动 ==========
            console.log("\n--- 步骤4: 操作轮盘向西北方向移动 ---");
            if (!executeJoystickMove()) {
                throw new Error("步骤4失败: 轮盘移动操作失败");
            }

            // 移动轮盘后等待800ms再点击浇水按钮
            console.log("等待 " + config.delays.waterClickDelay + "ms 后点击浇水按钮...");
            sleep(config.delays.waterClickDelay);

            // ========== 步骤5: 点击浇水按钮（点击两次） ==========
            console.log("\n--- 步骤5: 点击浇水按钮（点击两次） ---");
            var waterBtnArea = getFixedCoordinate(
                "waterBtn",
                config.water.waterBtn.left,
                config.water.waterBtn.top,
                config.water.waterBtn.right,
                config.water.waterBtn.bottom
            );

            // 第一次点击
            humanClick(waterBtnArea, "浇水按钮(第1次)");
            // 间隔300ms后第二次点击
            sleep(300);
            // 第二次点击
            humanClick(waterBtnArea, "浇水按钮(第2次)");

            console.log("\n========================================");
            console.log("浇水操作完成（浇2）");
            console.log("总点击次数: " + clickCount);
            console.log("========================================\n");

            toast("浇水2完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("浇水2失败: " + e.message);
            console.error("失败时的点击计数: " + clickCount);
            console.error("========================================\n");
            toast("浇水2失败: " + e.message);
        } finally {
            isWatering = false;
            waterType = "";
            updateAllUI();
        }
    });
}

// ==================== 自动切换服务器逻辑（支持中断 + OCR检测） ====================
function executeServerSwitch() {
    if (isSwitching) {
        console.log("用户点击停止切换");
        stopSwitch = true;
        toast("正在停止切换...");
        return;
    }

    if (isWatering) {
        toast("正在浇水，无法切换服务器");
        return;
    }

    if (isMoving) {
        toast("正在自动移动，无法切换服务器");
        return;
    }

    if (auto.service === null) {
        console.log("无障碍服务未开启，尝试启动...");
        toast("无障碍服务未开启，请先开启");
        auto.waitFor();
        sleep(1000);
        if (auto.service === null) {
            console.error("无法开启无障碍服务");
            toast("无法开启无障碍服务");
            return;
        }
    }

    stopSwitch = false;
    isSwitching = true;
    updateAllUI();

    var currentIndex = config.currentIndex;
    var nextIndex = currentIndex + 1;

    if (nextIndex > 6) {
        nextIndex = 1;
    }

    console.log("========================================");
    console.log("开始切换服务器: " + currentIndex + " (" + config.serverList[currentIndex] +
        ") -> " + nextIndex + " (" + config.serverList[nextIndex] + ")");
    console.log("========================================");

    switchThread = threads.start(function() {
        try {
            var startFromStep6 = (currentIndex === 0);

            if (startFromStep6) {
                console.log("当前序号为0，从步骤6开始执行");

                console.log("\n--- 步骤6: 确认换区 ---");
                if (stopSwitch || isExiting) {
                    throw new Error("切换被用户中断");
                }
                var confirmChangeServer = getFixedCoordinate(
                    "confirmChangeServer",
                    1000, 710, 1450, 740
                );
                if (!humanClick(confirmChangeServer, "确认换区按钮")) {
                    throw new Error("步骤6失败: 确认换区");
                }
                humanDelay(config.delays.toNextServer);

                console.log("\n--- 步骤7: 选择服务器 " + nextIndex + " ---");
                if (stopSwitch || isExiting) {
                    throw new Error("切换被用户中断");
                }
                var nextServerPos = getServerPosition(nextIndex);
                if (!nextServerPos) {
                    throw new Error("步骤7失败: 获取服务器 " + nextIndex + " 位置");
                }

                if (!humanClick(nextServerPos, "服务器 " + nextIndex + " (" + config.serverList[nextIndex] + ")")) {
                    throw new Error("步骤7失败: 点击服务器 " + nextIndex);
                }

                config.currentIndex = nextIndex;
                humanDelay(config.delays.toStartGame);

                console.log("\n--- 步骤8: 开始游戏 ---");
                if (stopSwitch || isExiting) {
                    throw new Error("切换被用户中断");
                }
                var startGameBtn = getFixedCoordinate(
                    "startGameBtn",
                    1020, 800, 1340, 870
                );
                if (!humanClick(startGameBtn, "开始游戏按钮")) {
                    throw new Error("步骤8失败: 开始游戏");
                }

            } else {
                // ============================================================
                // 先检测主界面是否已经显示（检测"背包"文字）
                // ============================================================
                console.log("检测主界面状态（检测\"背包\"文字）...");
                if (stopSwitch || isExiting) {
                    throw new Error("切换被用户中断");
                }

                var isMainScreenVisible = waitForText("mainScreen", "背包", 500);

                if (isMainScreenVisible) {
                    // 主界面已显示，直接从步骤3开始
                    console.log("主界面已显示，直接从步骤3开始执行");

                    console.log("\n--- 步骤3: 点击设置 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var settingsBtn = getFixedCoordinate(
                        "settingsBtn",
                        2100, 30, 2140, 70
                    );
                    if (!humanClick(settingsBtn, "设置按钮")) {
                        throw new Error("步骤3失败: 点击设置");
                    }
                    humanDelay(config.delays.exitGame);

                    console.log("\n--- 步骤4: 退出游戏 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var exitGameBtn = getFixedCoordinate(
                        "exitGameBtn",
                        1730, 900, 2000, 940
                    );
                    if (!humanClick(exitGameBtn, "退出游戏按钮")) {
                        throw new Error("步骤4失败: 退出游戏");
                    }
                    humanDelay(config.delays.confirmExit);

                    console.log("\n--- 步骤5: 确认退出 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var confirmExitBtn = getFixedCoordinate(
                        "confirmExitBtn",
                        1250, 730, 1500, 790
                    );
                    if (!humanClick(confirmExitBtn, "确认退出按钮")) {
                        throw new Error("步骤5失败: 确认退出");
                    }

                    // 使用OCR检测服务器选择界面（检测"开始游戏"文字）
                    console.log("等待服务器选择界面加载（检测\"开始游戏\"文字）...");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var detectedStart = waitForText("startGame", "开始游戏", config.delays.detectTimeout);
                    if (!detectedStart) {
                        throw new Error("步骤5超时: 未检测到开始游戏按钮");
                    }

                    console.log("\n--- 步骤6: 确认换区 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var confirmChangeServer = getFixedCoordinate(
                        "confirmChangeServer",
                        1000, 710, 1450, 740
                    );
                    if (!humanClick(confirmChangeServer, "确认换区按钮")) {
                        throw new Error("步骤6失败: 确认换区");
                    }
                    humanDelay(config.delays.toNextServer);

                    console.log("\n--- 步骤7: 选择服务器 " + nextIndex + " ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var nextServerPos = getServerPosition(nextIndex);
                    if (!nextServerPos) {
                        throw new Error("步骤7失败: 获取服务器 " + nextIndex + " 位置");
                    }

                    if (!humanClick(nextServerPos, "服务器 " + nextIndex + " (" + config.serverList[nextIndex] + ")")) {
                        throw new Error("步骤7失败: 点击服务器 " + nextIndex);
                    }

                    config.currentIndex = nextIndex;
                    humanDelay(config.delays.toStartGame);

                    console.log("\n--- 步骤8: 开始游戏 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var startGameBtn = getFixedCoordinate(
                        "startGameBtn",
                        1020, 800, 1340, 870
                    );
                    if (!humanClick(startGameBtn, "开始游戏按钮")) {
                        throw new Error("步骤8失败: 开始游戏");
                    }

                } else {
                    // 主界面未显示，从步骤1开始
                    console.log("主界面未显示，从步骤1开始执行");

                    console.log("\n--- 步骤1: 点击返回按钮 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var backBtn = getFixedCoordinate(
                        "backBtn",
                        80, 30, 240, 70
                    );
                    if (!humanClick(backBtn, "返回按钮")) {
                        throw new Error("步骤1失败: 点击返回按钮");
                    }
                    humanDelay(config.delays.returnToLobby);

                    console.log("\n--- 步骤2: 确认返回大厅 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var confirmLobby = getFixedCoordinate(
                        "confirmLobby",
                        1260, 730, 1500, 780
                    );
                    if (!humanClick(confirmLobby, "确认返回大厅")) {
                        throw new Error("步骤2失败: 确认返回大厅");
                    }

                    // 使用OCR检测主界面（检测"背包"文字）
                    console.log("等待主界面加载（检测\"背包\"文字）...");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var detected = waitForText("mainScreen", "背包", config.delays.detectTimeout);
                    if (!detected) {
                        throw new Error("步骤2超时: 未检测到主界面");
                    }

                    console.log("\n--- 步骤3: 点击设置 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var settingsBtn = getFixedCoordinate(
                        "settingsBtn",
                        2100, 30, 2140, 70
                    );
                    if (!humanClick(settingsBtn, "设置按钮")) {
                        throw new Error("步骤3失败: 点击设置");
                    }
                    humanDelay(config.delays.exitGame);

                    console.log("\n--- 步骤4: 退出游戏 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var exitGameBtn = getFixedCoordinate(
                        "exitGameBtn",
                        1730, 900, 2000, 940
                    );
                    if (!humanClick(exitGameBtn, "退出游戏按钮")) {
                        throw new Error("步骤4失败: 退出游戏");
                    }
                    humanDelay(config.delays.confirmExit);

                    console.log("\n--- 步骤5: 确认退出 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var confirmExitBtn = getFixedCoordinate(
                        "confirmExitBtn",
                        1250, 730, 1500, 790
                    );
                    if (!humanClick(confirmExitBtn, "确认退出按钮")) {
                        throw new Error("步骤5失败: 确认退出");
                    }

                    // 使用OCR检测服务器选择界面（检测"开始游戏"文字）
                    console.log("等待服务器选择界面加载（检测\"开始游戏\"文字）...");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var detectedStart = waitForText("startGame", "开始游戏", config.delays.detectTimeout);
                    if (!detectedStart) {
                        throw new Error("步骤5超时: 未检测到开始游戏按钮");
                    }

                    console.log("\n--- 步骤6: 确认换区 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var confirmChangeServer = getFixedCoordinate(
                        "confirmChangeServer",
                        1000, 710, 1450, 740
                    );
                    if (!humanClick(confirmChangeServer, "确认换区按钮")) {
                        throw new Error("步骤6失败: 确认换区");
                    }
                    humanDelay(config.delays.toNextServer);

                    console.log("\n--- 步骤7: 选择服务器 " + nextIndex + " ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var nextServerPos = getServerPosition(nextIndex);
                    if (!nextServerPos) {
                        throw new Error("步骤7失败: 获取服务器 " + nextIndex + " 位置");
                    }

                    if (!humanClick(nextServerPos, "服务器 " + nextIndex + " (" + config.serverList[nextIndex] + ")")) {
                        throw new Error("步骤7失败: 点击服务器 " + nextIndex);
                    }

                    config.currentIndex = nextIndex;
                    humanDelay(config.delays.toStartGame);

                    console.log("\n--- 步骤8: 开始游戏 ---");
                    if (stopSwitch || isExiting) {
                        throw new Error("切换被用户中断");
                    }
                    var startGameBtn = getFixedCoordinate(
                        "startGameBtn",
                        1020, 800, 1340, 870
                    );
                    if (!humanClick(startGameBtn, "开始游戏按钮")) {
                        throw new Error("步骤8失败: 开始游戏");
                    }
                }
            }

            console.log("\n========================================");
            console.log("服务器切换完成: " + config.serverList[config.currentIndex]);
            console.log("总点击次数: " + clickCount);
            console.log("========================================\n");

            toast("切换完成: " + config.serverList[config.currentIndex]);

        } catch (e) {
            if (e.message && e.message.indexOf("被用户中断") >= 0) {
                console.log("\n========================================");
                console.log("切换被用户中断");
                console.log("========================================\n");
                toast("切换已停止");
            } else {
                console.error("\n========================================");
                console.error("切换失败: " + e.message);
                console.error("失败时的点击计数: " + clickCount);
                console.error("========================================\n");
                toast("切换失败: " + e.message);
            }
        } finally {
            isSwitching = false;
            stopSwitch = false;
            updateAllUI();
        }
    });
}

// ==================== 显示服务器选择下拉列表 ====================
function showServerDropdown() {
    if (isSwitching) {
        toast("正在切换服务器，无法选择");
        return;
    }

    if (isWatering) {
        toast("正在浇水，无法选择");
        return;
    }

    if (isMoving) {
        toast("正在自动移动，无法选择");
        return;
    }

    console.log("打开服务器选择列表，当前: " + config.currentIndex);

    try {
        var displayList = ["0", "1", "2", "3", "4", "5", "6"];
        dialogs.select("选择服务器", displayList, function(index) {
            if (index >= 0 && index < displayList.length) {
                var oldIndex = config.currentIndex;
                config.currentIndex = index;
                updateCurrentServerDisplay();
                console.log("手动选择服务器: " + oldIndex + " -> " + config.currentIndex +
                    " (" + displayList[index] + ")");
                toast("已选择: " + displayList[index]);
            }
        });
    } catch (e) {
        console.log("选择对话框失败: " + e.message);
        toast("无法打开选择器");
    }
}

// ==================== 统一更新所有UI ====================
function updateAllUI() {
    ui.run(function() {
        if (controlWindow) {
            try {
                if (controlWindow.serverBtn) {
                    if (!isSwitching && !isWatering && !isMoving) {
                        controlWindow.serverBtn.setText(config.serverList[config.currentIndex]);
                        controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFFFFF"));
                        controlWindow.serverBtn.setTextColor(colors.parseColor("#1976D2"));
                    } else {
                        controlWindow.serverBtn.setText("...");
                        controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFE0B2"));
                        controlWindow.serverBtn.setTextColor(colors.parseColor("#E65100"));
                    }
                }

                if (controlWindow.nextBtn) {
                    if (isSwitching) {
                        controlWindow.nextBtn.setText("切换中");
                        controlWindow.nextBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.nextBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.nextBtn.setClickable(true);
                    } else if (!isWatering && !isMoving) {
                        controlWindow.nextBtn.setText("▶");
                        controlWindow.nextBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
                        controlWindow.nextBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.nextBtn.setClickable(true);
                    } else {
                        controlWindow.nextBtn.setText(isWatering ? "浇水" : "移动");
                        controlWindow.nextBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.nextBtn.setTextColor(colors.parseColor("#666666"));
                        controlWindow.nextBtn.setClickable(false);
                    }
                }

                if (controlWindow.water1Btn) {
                    if (!isSwitching && !isWatering && !isMoving) {
                        controlWindow.water1Btn.setText("浇1");
                        controlWindow.water1Btn.setBackgroundColor(colors.parseColor("#4CAF50"));
                        controlWindow.water1Btn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.water1Btn.setText(isSwitching ? "切换" : (isMoving ? "移动" : "浇水中"));
                        controlWindow.water1Btn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.water1Btn.setTextColor(colors.parseColor("#FFFFFF"));
                    }
                    controlWindow.water1Btn.setClickable(!isSwitching && !isWatering && !isMoving);
                }

                if (controlWindow.water2Btn) {
                    if (!isSwitching && !isWatering && !isMoving) {
                        controlWindow.water2Btn.setText("浇2");
                        controlWindow.water2Btn.setBackgroundColor(colors.parseColor("#2196F3"));
                        controlWindow.water2Btn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.water2Btn.setText(isSwitching ? "切换" : (isMoving ? "移动" : "浇水中"));
                        controlWindow.water2Btn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.water2Btn.setTextColor(colors.parseColor("#FFFFFF"));
                    }
                    controlWindow.water2Btn.setClickable(!isSwitching && !isWatering && !isMoving);
                }

                if (controlWindow.moveBtn) {
                    if (isMoving) {
                        controlWindow.moveBtn.setText("停");
                        controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#F44336"));
                        controlWindow.moveBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.moveBtn.setClickable(true);
                    } else if (!isSwitching && !isWatering) {
                        controlWindow.moveBtn.setText("移");
                        controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#9C27B0"));
                        controlWindow.moveBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.moveBtn.setClickable(true);
                    } else {
                        controlWindow.moveBtn.setText("移");
                        controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.moveBtn.setTextColor(colors.parseColor("#666666"));
                        controlWindow.moveBtn.setClickable(false);
                    }
                }
            } catch (e) {
                console.log("更新UI失败: " + e.message);
            }
        }
    });
}

function updateCurrentServerDisplay() {
    ui.run(function() {
        if (controlWindow && controlWindow.serverBtn) {
            try {
                if (!isSwitching && !isWatering && !isMoving) {
                    controlWindow.serverBtn.setText(config.serverList[config.currentIndex]);
                }
            } catch (e) {
                console.log("更新显示失败: " + e.message);
            }
        }
    });
}

// ==================== 创建控制窗口 ====================
function createControlWindow() {
    if (controlWindow != null) {
        try { controlWindow.close(); } catch (e) { }
    }

    console.log("创建控制窗口，屏幕尺寸: " + config.screenWidth + "x" + config.screenHeight);

    try {
        controlWindow = floaty.window(
            <frame>
                <vertical bg="#E8F5E9" padding="8">
                    <horizontal>
                        <button id="serverBtn"
                                text="1"
                                w="30"
                                h="32"
                                bg="#FFFFFF"
                                textColor="#1976D2"
                                textSize="12"
                                marginBottom="4"/>
                        <button id="nextBtn"
                                text="▶"
                                w="30"
                                h="32"
                                bg="#4CAF50"
                                textColor="#FFFFFF"
                                textSize="12"
                                marginLeft="4"/>
                    </horizontal>
                    <horizontal marginTop="3">
                        <button id="water1Btn"
                                text="浇1"
                                w="30"
                                h="32"
                                bg="#4CAF50"
                                textColor="#FFFFFF"
                                textSize="12"/>
                        <button id="water2Btn"
                                text="浇2"
                                w="30"
                                h="32"
                                bg="#2196F3"
                                textColor="#FFFFFF"
                                textSize="12"
                                marginLeft="3"/>
                    </horizontal>
                    <horizontal marginTop="3" gravity="center">
                        <button id="moveBtn"
                                text="移"
                                w="64"
                                h="32"
                                bg="#9C27B0"
                                textColor="#FFFFFF"
                                textSize="12"/>
                    </horizontal>
                </vertical>
            </frame>
        );

        var x = 30;
        var y = 120;

        console.log("控制窗口位置: (" + x + ", " + y + ")");
        controlWindow.setPosition(x, y);

        controlWindow.serverBtn.on("click", function() {
            console.log("用户点击服务器选择按钮");
            showServerDropdown();
        });

        controlWindow.nextBtn.on("click", function() {
            console.log("用户点击下一个按钮，当前状态: isSwitching=" + isSwitching);
            if (!isSwitching && !isWatering && !isMoving) {
                console.log("启动切换服务器");
                executeServerSwitch();
            } else if (isSwitching) {
                console.log("点击停止切换");
                stopSwitch = true;
                toast("正在停止切换...");
            } else {
                toast(isWatering ? "正在浇水" : "正在自动移动");
            }
        });

        controlWindow.nextBtn.on("long-click", function() {
            if (!isSwitching && !isWatering && !isMoving) {
                console.log("用户长按重置按钮");
                config.currentIndex = 1;
                updateCurrentServerDisplay();
                toast("已重置为服务器 1");
            }
            return true;
        });

        controlWindow.water1Btn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving) {
                console.log("用户点击浇1按钮（不进入农村）");
                executeWater1();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isWatering ? "正在浇水" : "正在自动移动"));
            }
        });

        controlWindow.water2Btn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving) {
                console.log("用户点击浇2按钮（进入农村）");
                executeWater2();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isWatering ? "正在浇水" : "正在自动移动"));
            }
        });

        controlWindow.moveBtn.on("click", function() {
            console.log("用户点击移动按钮，当前状态: isMoving=" + isMoving +
                ", isSwitching=" + isSwitching + ", isWatering=" + isWatering);

            if (isMoving) {
                console.log("停止自动移动");
                stopAutoMoveFunction();
            } else if (!isSwitching && !isWatering) {
                console.log("启动自动移动");
                executeAutoMove();
            } else {
                toast(isSwitching ? "正在切换服务器" : "正在浇水");
            }
        });

        console.log("控制窗口创建成功");

    } catch (e) {
        console.log("创建控制窗口失败: " + e.message);
        toast("创建控制窗口失败: " + e.message);
    }
}

// ==================== 退出清理 ====================
function cleanup() {
    isExiting = true;
    isSwitching = false;
    isWatering = false;
    stopSwitch = true;

    if (isMoving) {
        stopAutoMove = true;
        isMoving = false;
        if (moveThread && moveThread.isAlive()) {
            try {
                moveThread.interrupt();
            } catch(e) {}
        }
    }

    console.log("\n========================================");
    console.log("脚本退出清理");
    console.log("总点击次数: " + clickCount);
    console.log("最终服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex] + ")");
    console.log("========================================");

    if (controlWindow != null) {
        try { controlWindow.close(); } catch (e) { }
    }
}

// ==================== 主程序 ====================
events.on("exit", cleanup);

console.log("========================================");
console.log("自动切换服务器 + 自动浇水 + 自动移动脚本启动");
console.log("设备信息:");
console.log("  - 品牌: " + phoneInfo.brand);
console.log("  - 型号: " + phoneInfo.model);
console.log("  - 制造商: " + phoneInfo.manufacturer);
console.log("  - 设备名称: " + phoneInfo.device);
console.log("  - 原始屏幕: " + device.width + "x" + device.height);
console.log("  - 使用屏幕(横屏): " + config.screenWidth + "x" + config.screenHeight);
console.log("  - 设计分辨率: " + config.designWidth + "x" + config.designHeight);
console.log("  - 缩放比例: X=" + (config.screenWidth / config.designWidth).toFixed(3) +
    ", Y=" + (config.screenHeight / config.designHeight).toFixed(3));
console.log("  - 当前服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex] + ")");

if (config.coordFix[phoneInfo.model]) {
    console.log("  - 坐标修正: 已配置 [" + phoneInfo.model + "]");
    var fixedCoords = config.coordFix[phoneInfo.model];
    var coordNames = Object.keys(fixedCoords);
    for (var i = 0; i < coordNames.length; i++) {
        var name = coordNames[i];
        console.log("    * " + name + ": " + fixedCoords[name]);
    }
} else {
    console.log("  - 坐标修正: 未配置，使用默认缩放");
}

console.log("  - 检测区域 (OCR):");
console.log("    * 主界面(背包): (" + config.detectAreas.mainScreen.left + "," +
    config.detectAreas.mainScreen.top + "," + config.detectAreas.mainScreen.right + "," +
    config.detectAreas.mainScreen.bottom + ")");
console.log("    * 开始游戏: (" + config.detectAreas.startGame.left + "," +
    config.detectAreas.startGame.top + "," + config.detectAreas.startGame.right + "," +
    config.detectAreas.startGame.bottom + ")");
console.log("    * 农场名称: (" + config.detectAreas.farmName.left + "," +
    config.detectAreas.farmName.top + "," + config.detectAreas.farmName.right + "," +
    config.detectAreas.farmName.bottom + ")");
console.log("  - 移动持续时间机型配置:");
for (var key in config.moveDurationByDevice) {
    console.log("    * " + key + ": " + config.moveDurationByDevice[key] + "ms");
}
console.log("  - 特殊说明: 序号0表示从步骤6(确认换区)开始执行");
console.log("========================================\n");

createControlWindow();

setInterval(function() {
    if (!isExiting) {
        var status = "脚本运行中 - 服务器: " + config.currentIndex +
            " (" + config.serverList[config.currentIndex] + ")";
        if (isSwitching) status += " [切换中]";
        if (isWatering) status += " [浇水中:" + waterType + "]";
        if (isMoving) status += " [移动中]";
        console.log(status);
    }
}, 60000);

setTimeout(function() {
    if (!isExiting) {
        toast("脚本已就绪 - 可切换服务器、浇水和自动移动");
        console.log("用户提示已显示");
    }
}, 1000);