"auto";

// ==================== 权限请求 ====================
// 检查并请求无障碍服务
if (auto.service === null) {
    toastLog('请先开启无障碍服务');
    auto.waitFor();
    sleep(1000);
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

    // ========== 步骤间隔时间配置（毫秒） ==========
    // 不同机型可以配置不同的间隔时间
    stepDelays: {
        // 默认值
        "default": {
            afterBack: 500,         // 点击返回后等待
            afterConfirmLobby: 3000, // 点击确认返回大厅后等待
            afterSettings: 1000,     // 点击设置后等待
            afterExitGame: 500,      // 点击退出游戏后等待
            afterConfirmExit: 7000,  // 点击确认退出后等待（进入服务器选择界面）
            afterChangeServer: 500,  // 点击换区后等待
            afterSelectServer: 1000, // 选择服务器后等待
            enterFarmWait: 7000      // 点击进入农场后等待时间
        },
        //小米 红米k60
        "23113RKC6C": {
            afterConfirmExit: 5000,  // 点击确认退出后等待（进入服务器选择界面）
        },
        // 华为 nova 2s
        "HWI-AL00": {
            afterBack: 500,
            afterConfirmLobby: 5000,
            afterSettings: 1200,
            afterExitGame: 500,
            afterConfirmExit: 13000,
            afterChangeServer: 500,
            afterSelectServer: 1000,
            enterFarmWait: 13000
        },
        // 华为 Mate 10 Pro
        "ALP-TL00": {
            afterBack: 500,
            afterConfirmLobby: 3500,
            afterSettings: 1200,
            afterExitGame: 500,
            afterConfirmExit: 8000,
            afterChangeServer: 500,
            afterSelectServer: 1000,
            enterFarmWait: 10000
        }
    },

    // ========== 坐标修正配置 ==========
    /**
     * backBtn - 返回按钮
     * confirmLobby - 确认返回大厅
     * settingsBtn - 设置按钮（已配置机型修正）
     * exitGameBtn - 退出游戏按钮
     * confirmExitBtn - 确认退出按钮
     * confirmChangeServer - 确认换区按钮
     * startGameBtn - 开始游戏按钮
     * enterFarmBtn - 进入农场按钮
     * waterBtn - 浇水按钮
     */
    coordFix: {
        // 小米 Redmi K60
        "23113RKC6C": {
            // 暂未配置，后续可添加
        },
        // 华为 nova 2s
        "HWI-AL00": {
            backBtn: [30, 40, 150, 80],
            settingsBtn: [1980, 40, 2020, 80],
            exitGameBtn: [1610, 900, 1860, 940]
        },
        // 华为 Mate 10 Pro
        "ALP-TL00": {
            settingsBtn: [1740, 30, 1780, 70],
            exitGameBtn: [1500, 900, 1760, 940],
            enterFarmBtn: [350, 780, 550, 860],
            waterBtn: [1240, 600, 1310, 650]
        },
        // 华为 P50 Pro
        "JAD-AL00": {
            // 暂未配置，后续可添加
        }
    },

    // ========== 移动持续时间机型配置（毫秒） ==========
    moveDurationByDevice: {
        // 华为 nova 2s
        "HWI-AL00": 2000,
        // 华为 Mate 10 Pro
        "ALP-TL00": 2500,
        // 默认值
        "default": 1800
    },

    // ========== 浇水功能配置 ==========
    water: {
        // 进入农场按钮区域 (左, 上, 右, 下) - 设计分辨率坐标
        enterFarmBtn: { left: 640, top: 780, right: 780, bottom: 840 },
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
var toggleWindow = null;        // 独立开关窗口
var toggleBtn = null;           // 开关按钮引用
var isSwitching = false;
var isWatering = false;
var isMoving = false;
var isExiting = false;
var waterType = "";
var stopAutoMove = false;
var moveThread = null;
var switchThread = null;
var stopSwitch = false;
var isHidden = false;           // 主窗口是否隐藏

// ==================== 获取当前机型的步骤间隔时间（支持部分覆盖） ====================
function getStepDelays() {
    var model = phoneInfo.model;

    // 获取默认配置
    var defaultDelays = config.stepDelays["default"];
    if (!defaultDelays) {
        console.error("未找到默认步骤间隔配置");
        return null;
    }

    // 获取机型配置
    var modelDelays = config.stepDelays[model];

    // 如果有机型配置，进行合并（部分覆盖）
    if (modelDelays) {
        console.log("当前机型 [" + model + "] 使用部分覆盖配置:");
        var merged = {};
        // 先复制默认配置
        for (var key in defaultDelays) {
            merged[key] = defaultDelays[key];
        }
        // 再用机型配置覆盖
        for (var key in modelDelays) {
            merged[key] = modelDelays[key];
            console.log("  - " + key + ": " + merged[key] + "ms (覆盖)");
        }
        // 打印未覆盖的配置
        for (var key in defaultDelays) {
            if (!modelDelays[key]) {
                console.log("  - " + key + ": " + merged[key] + "ms (默认)");
            }
        }
        return merged;
    }

    // 没有机型配置，使用默认配置
    console.log("当前机型 [" + model + "] 使用默认步骤间隔配置:");
    for (var key in defaultDelays) {
        console.log("  - " + key + ": " + defaultDelays[key] + "ms");
    }
    return defaultDelays;
}

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
    try {
        var x = random(area.left, area.right);
        var y = random(area.top, area.bottom);
        x += random(-2, 2);
        y += random(-2, 2);
        var pressTime = random(30, 80);

        console.log("点击: " + description);
        console.log("  区域: (" + area.left + "," + area.top + "," +
            area.right + "," + area.bottom + ")");
        console.log("  实际坐标: (" + x + "," + y + ") 按压: " + pressTime + "ms");

        press(x, y, pressTime);
        sleep(random(50, 100));

        console.log("  点击成功: " + description);
        return true;
    } catch (e) {
        console.log("  点击失败: " + description + " - " + e.message);
        try {
            var x2 = random(area.left, area.right);
            var y2 = random(area.top, area.bottom);
            console.log("  备用点击坐标: (" + x2 + "," + y2 + ")");
            click(x2, y2);
            console.log("  备用点击成功: " + description);
            return true;
        } catch (e2) {
            console.log("  备用点击也失败: " + description + " - " + e2.message);
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

// ==================== 浇水功能1（不点击进入农场） ====================
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
    waterType = "农浇";
    updateAllUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始浇水操作（农浇 - 不进入农场）");
            console.log("========================================");

            console.log("\n--- 步骤1: 操作轮盘向西北方向移动 ---");
            if (!executeJoystickMove()) {
                throw new Error("步骤1失败: 轮盘移动操作失败");
            }

            // 移动轮盘后等待800ms再点击浇水按钮
            console.log("等待 800ms 后点击浇水按钮...");
            sleep(800);

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
            console.log("浇水操作完成（农浇）");
            console.log("========================================\n");

            toast("农浇完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("农浇失败: " + e.message);
            console.error("========================================\n");
            toast("农浇失败: " + e.message);
        } finally {
            isWatering = false;
            waterType = "";
            updateAllUI();
        }
    });
}

// ==================== 浇水功能2（点击进入农场 + 固定等待） ====================
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
    waterType = "主浇";
    updateAllUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始浇水操作（主浇 - 进入农场）");
            console.log("========================================");

            // 获取步骤间隔配置（包含enterFarmWait）
            var stepDelays = getStepDelays();

            // ========== 步骤1: 点击进入农场按钮 ==========
            console.log("\n--- 步骤1: 点击进入农场按钮 ---");
            var enterFarmArea = getFixedCoordinate(
                "enterFarmBtn",
                config.water.enterFarmBtn.left,
                config.water.enterFarmBtn.top,
                config.water.enterFarmBtn.right,
                config.water.enterFarmBtn.bottom
            );

            if (!humanClick(enterFarmArea, "进入农场按钮")) {
                throw new Error("步骤1失败: 点击进入农场按钮");
            }

            // ========== 步骤2: 固定等待进入农场 ==========
            console.log("\n--- 步骤2: 等待进入农场 (" + stepDelays.enterFarmWait + "ms) ---");
            humanDelay(stepDelays.enterFarmWait);
            console.log("等待完成，继续执行浇水操作");

            // 等待500ms后再执行移动
            sleep(500);

            // ========== 步骤3: 操作轮盘向西北方向移动 ==========
            console.log("\n--- 步骤3: 操作轮盘向西北方向移动 ---");
            if (!executeJoystickMove()) {
                throw new Error("步骤3失败: 轮盘移动操作失败");
            }

            // 移动轮盘后等待800ms再点击浇水按钮
            console.log("等待 800ms 后点击浇水按钮...");
            sleep(800);

            // ========== 步骤4: 点击浇水按钮（点击两次） ==========
            console.log("\n--- 步骤4: 点击浇水按钮（点击两次） ---");
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
            console.log("浇水操作完成（主浇）");
            console.log("========================================\n");

            toast("主浇完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("主浇失败: " + e.message);
            console.error("========================================\n");
            toast("主浇失败: " + e.message);
        } finally {
            isWatering = false;
            waterType = "";
            updateAllUI();
        }
    });
}

// ==================== 切换服务器逻辑（农切 - 完整流程） ====================
function executeSwitch1() {
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
    console.log("农切 - 完整切换流程");
    console.log("当前序号: " + currentIndex + " (" + config.serverList[currentIndex] +
        ") -> 下一个: " + nextIndex + " (" + config.serverList[nextIndex] + ")");
    console.log("========================================");

    var stepDelays = getStepDelays();

    switchThread = threads.start(function() {
        try {
            // ========== 步骤1: 点击返回按钮 ==========
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
            humanDelay(stepDelays.afterBack);

            // ========== 步骤2: 点击确认返回大厅 ==========
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
            humanDelay(stepDelays.afterConfirmLobby);

            // ========== 步骤3: 点击设置 ==========
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
            humanDelay(stepDelays.afterSettings);

            // ========== 步骤4: 点击退出游戏 ==========
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
            humanDelay(stepDelays.afterExitGame);

            // ========== 步骤5: 点击确认退出 ==========
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
            humanDelay(stepDelays.afterConfirmExit);

            // ========== 步骤6: 确认换区 ==========
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
            humanDelay(stepDelays.afterChangeServer);

            // ========== 步骤7: 点击下一个服务器 ==========
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
            humanDelay(stepDelays.afterSelectServer);

            // ========== 步骤8: 点击开始游戏 ==========
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

            console.log("\n========================================");
            console.log("农切 - 切换完成: " + config.serverList[config.currentIndex]);
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

// ==================== 切换服务器逻辑（主切 - 从步骤3开始） ====================
function executeSwitch2() {
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
    console.log("主切 - 从步骤3开始执行");
    console.log("当前序号: " + currentIndex + " (" + config.serverList[currentIndex] +
        ") -> 下一个: " + nextIndex + " (" + config.serverList[nextIndex] + ")");
    console.log("========================================");

    var stepDelays = getStepDelays();

    switchThread = threads.start(function() {
        try {
            // ========== 步骤3: 点击设置 ==========
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
            humanDelay(stepDelays.afterSettings);

            // ========== 步骤4: 点击退出游戏 ==========
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
            humanDelay(stepDelays.afterExitGame);

            // ========== 步骤5: 点击确认退出 ==========
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
            humanDelay(stepDelays.afterConfirmExit);

            // ========== 步骤6: 确认换区 ==========
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
            humanDelay(stepDelays.afterChangeServer);

            // ========== 步骤7: 点击下一个服务器 ==========
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
            humanDelay(stepDelays.afterSelectServer);

            // ========== 步骤8: 点击开始游戏 ==========
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

            console.log("\n========================================");
            console.log("主切 - 切换完成: " + config.serverList[config.currentIndex]);
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

// ==================== 切换窗口隐藏状态 ====================
function toggleHide() {
    isHidden = !isHidden;

    if (controlWindow) {
        try {
            if (isHidden) {
                // 使用 setVisible 替代 setVisibility
                if (controlWindow.setVisible) {
                    controlWindow.setVisible(false);
                } else {
                    // 备用方案：调整窗口位置到屏幕外
                    controlWindow.setPosition(-1000, -1000);
                }
                if (toggleBtn) {
                    toggleBtn.setText("展");
                }
                console.log("主窗口已隐藏");
            } else {
                if (controlWindow.setVisible) {
                    controlWindow.setVisible(true);
                } else {
                    // 恢复窗口位置
                    controlWindow.setPosition(30, 120);
                }
                if (toggleBtn) {
                    toggleBtn.setText("隐");
                }
                console.log("主窗口已恢复");
            }
        } catch(e) {
            console.log("切换窗口状态失败: " + e.message);
        }
    }
}

// ==================== 创建独立开关窗口 ====================
function createToggleWindow() {
    if (toggleWindow != null) {
        try { toggleWindow.close(); } catch (e) { }
    }

    console.log("创建开关窗口");

    try {
        toggleWindow = floaty.window(
            <button id="btnToggle"
                    text="隐"
                    w="30"
                    h="30"
                    bg="#4CAF50"
                    textColor="#FFFFFF"
                    textSize="10"/>
        );

        // 获取按钮引用并存储到全局变量
        toggleBtn = toggleWindow.btnToggle;

        // 设置位置（右上角）
        var x = 450;
        var y = 120;

        console.log("开关窗口位置: (" + x + ", " + y + ")");
        toggleWindow.setPosition(x, y);

        // 按钮点击事件
        toggleBtn.on("click", function() {
            console.log("用户点击开关按钮，当前状态: " + (isHidden ? "隐藏" : "显示"));
            toggleHide();
        });

        console.log("开关窗口创建成功");

    } catch (e) {
        console.log("创建开关窗口失败: " + e.message);
        toast("创建开关窗口失败: " + e.message);
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

                if (controlWindow.nongQieBtn) {
                    if (isSwitching) {
                        controlWindow.nongQieBtn.setText("切换中");
                        controlWindow.nongQieBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.nongQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.nongQieBtn.setClickable(true);
                    } else if (!isWatering && !isMoving) {
                        controlWindow.nongQieBtn.setText("农切");
                        controlWindow.nongQieBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
                        controlWindow.nongQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.nongQieBtn.setClickable(true);
                    } else {
                        controlWindow.nongQieBtn.setText(isWatering ? "浇水" : "移动");
                        controlWindow.nongQieBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.nongQieBtn.setTextColor(colors.parseColor("#666666"));
                        controlWindow.nongQieBtn.setClickable(false);
                    }
                }

                if (controlWindow.zhuQieBtn) {
                    if (isSwitching) {
                        controlWindow.zhuQieBtn.setText("切换中");
                        controlWindow.zhuQieBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.zhuQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.zhuQieBtn.setClickable(true);
                    } else if (!isWatering && !isMoving) {
                        controlWindow.zhuQieBtn.setText("主切");
                        controlWindow.zhuQieBtn.setBackgroundColor(colors.parseColor("#2196F3"));
                        controlWindow.zhuQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.zhuQieBtn.setClickable(true);
                    } else {
                        controlWindow.zhuQieBtn.setText(isWatering ? "浇水" : "移动");
                        controlWindow.zhuQieBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.zhuQieBtn.setTextColor(colors.parseColor("#666666"));
                        controlWindow.zhuQieBtn.setClickable(false);
                    }
                }

                if (controlWindow.nongJiaoBtn) {
                    if (!isSwitching && !isWatering && !isMoving) {
                        controlWindow.nongJiaoBtn.setText("农浇");
                        controlWindow.nongJiaoBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
                        controlWindow.nongJiaoBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.nongJiaoBtn.setText(isSwitching ? "切换" : (isMoving ? "移动" : "浇水中"));
                        controlWindow.nongJiaoBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.nongJiaoBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    }
                    controlWindow.nongJiaoBtn.setClickable(!isSwitching && !isWatering && !isMoving);
                }

                if (controlWindow.zhuJiaoBtn) {
                    if (!isSwitching && !isWatering && !isMoving) {
                        controlWindow.zhuJiaoBtn.setText("主浇");
                        controlWindow.zhuJiaoBtn.setBackgroundColor(colors.parseColor("#2196F3"));
                        controlWindow.zhuJiaoBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.zhuJiaoBtn.setText(isSwitching ? "切换" : (isMoving ? "移动" : "浇水中"));
                        controlWindow.zhuJiaoBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.zhuJiaoBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    }
                    controlWindow.zhuJiaoBtn.setClickable(!isSwitching && !isWatering && !isMoving);
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
            <vertical bg="#E8F5E9" padding="6" layout_width="wrap_content" layout_height="wrap_content">
                <horizontal>
                    <button id="serverBtn"
                            text="1"
                            w="30"
                            h="30"
                            bg="#FFFFFF"
                            textColor="#1976D2"
                            textSize="8"
                            marginBottom="2"/>
                    <button id="nongQieBtn"
                            text="农切"
                            w="30"
                            h="30"
                            bg="#4CAF50"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                    <button id="zhuQieBtn"
                            text="主切"
                            w="30"
                            h="30"
                            bg="#2196F3"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                </horizontal>
                <horizontal marginTop="2">
                    <button id="nongJiaoBtn"
                            text="农浇"
                            w="30"
                            h="30"
                            bg="#4CAF50"
                            textColor="#FFFFFF"
                            textSize="8"/>
                    <button id="zhuJiaoBtn"
                            text="主浇"
                            w="30"
                            h="30"
                            bg="#2196F3"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                    <button id="moveBtn"
                            text="移"
                            w="30"
                            h="30"
                            bg="#9C27B0"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                </horizontal>
            </vertical>
        );

        // 设置窗口位置（左边）
        var x = 30;
        var y = 120;

        console.log("控制窗口位置: (" + x + ", " + y + ")");
        controlWindow.setPosition(x, y);

        // 服务器按钮点击事件
        controlWindow.serverBtn.on("click", function() {
            console.log("用户点击服务器选择按钮");
            showServerDropdown();
        });

        // 农切按钮 - 完整流程
        controlWindow.nongQieBtn.on("click", function() {
            console.log("用户点击农切按钮");
            if (!isSwitching && !isWatering && !isMoving) {
                console.log("启动农切 - 完整切换流程");
                executeSwitch1();
            } else if (isSwitching) {
                console.log("点击停止切换");
                stopSwitch = true;
                toast("正在停止切换...");
            } else {
                toast(isWatering ? "正在浇水" : "正在自动移动");
            }
        });

        // 农切长按重置
        controlWindow.nongQieBtn.on("long-click", function() {
            if (!isSwitching && !isWatering && !isMoving) {
                console.log("用户长按重置按钮");
                config.currentIndex = 1;
                updateCurrentServerDisplay();
                toast("已重置为服务器 1");
            }
            return true;
        });

        // 主切按钮 - 从步骤3开始
        controlWindow.zhuQieBtn.on("click", function() {
            console.log("用户点击主切按钮");
            if (!isSwitching && !isWatering && !isMoving) {
                console.log("启动主切 - 从步骤3开始");
                executeSwitch2();
            } else if (isSwitching) {
                console.log("点击停止切换");
                stopSwitch = true;
                toast("正在停止切换...");
            } else {
                toast(isWatering ? "正在浇水" : "正在自动移动");
            }
        });

        // 农浇按钮 - 不进入农场
        controlWindow.nongJiaoBtn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving) {
                console.log("用户点击农浇按钮（不进入农场）");
                executeWater1();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isWatering ? "正在浇水" : "正在自动移动"));
            }
        });

        // 主浇按钮 - 进入农场
        controlWindow.zhuJiaoBtn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving) {
                console.log("用户点击主浇按钮（进入农场）");
                executeWater2();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isWatering ? "正在浇水" : "正在自动移动"));
            }
        });

        // 移动按钮
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
    console.log("最终服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex] + ")");
    console.log("========================================");

    if (controlWindow != null) {
        try { controlWindow.close(); } catch (e) { }
    }
    if (toggleWindow != null) {
        try { toggleWindow.close(); } catch (e) { }
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

console.log("  - 步骤间隔配置:");
var stepDelays = getStepDelays();
console.log("    * 点击返回后: " + stepDelays.afterBack + "ms");
console.log("    * 确认返回大厅后: " + stepDelays.afterConfirmLobby + "ms");
console.log("    * 点击设置后: " + stepDelays.afterSettings + "ms");
console.log("    * 退出游戏后: " + stepDelays.afterExitGame + "ms");
console.log("    * 确认退出后: " + stepDelays.afterConfirmExit + "ms");
console.log("    * 换区后: " + stepDelays.afterChangeServer + "ms");
console.log("    * 选择服务器后: " + stepDelays.afterSelectServer + "ms");
console.log("    * 进入农场后等待: " + stepDelays.enterFarmWait + "ms");

console.log("  - 按钮说明:");
console.log("    * 农切: 完整切换流程(从步骤1开始)");
console.log("    * 主切: 从步骤3(点击设置)开始执行");
console.log("    * 农浇: 不进入农场，直接浇水");
console.log("    * 主浇: 进入农场后浇水");
console.log("  - 窗口操作:");
console.log("    * 点击右上角 \"隐\" 按钮隐藏主窗口");
console.log("    * 点击 \"展\" 按钮恢复主窗口");
console.log("========================================\n");

createControlWindow();
createToggleWindow();

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