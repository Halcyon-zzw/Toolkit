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
        // 小米 红米k60
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
    // 所有坐标配置均在此定义，支持按机型覆盖
    coordFix: {
        // ========== 默认坐标配置（设计分辨率 2400x1080） ==========
        "default": {
            // ----- 功能1：切换服务器相关坐标 -----
            farmBackBtn: { left: 80, top: 30, right: 240, bottom: 70 },           // 返回按钮
            farmReturnLobbyBtn: { left: 1260, top: 730, right: 1500, bottom: 780 }, // 农场确认返回大厅
            settingsBtn: { left: 2100, top: 30, right: 2140, bottom: 70 },    // 设置按钮
            exitGameBtn: { left: 1730, top: 900, right: 2000, bottom: 940 },  // 退出游戏按钮
            confirmExitBtn: { left: 1250, top: 730, right: 1500, bottom: 790 }, // 确认退出按钮
            changeServer: { left: 1000, top: 710, right: 1450, bottom: 740 }, // 确认换区按钮
            startGameBtn: { left: 1020, top: 800, right: 1340, bottom: 870 }, // 开始游戏按钮

            // ----- 功能2/3：浇水相关坐标 -----
            enterFarmBtn: { left: 640, top: 780, right: 780, bottom: 840 },   // 进入农场按钮
            waterBtn: { left: 1490, top: 590, right: 1550, bottom: 640 },     // 浇水按钮
            joystick: { left: 300, top: 600, right: 600, bottom: 850 },       // 轮盘区域

            // ----- 功能4：结算返回相关坐标 -----
            settleReturnLobbyBtn: { left: 980, top: 950, right: 1100, bottom: 990 }, // 游戏结算返回大厅按钮
            settleConfirmReturnBtn: { left: 1250, top: 740, right: 1500, bottom: 790 }, // 游戏结算确认返回按钮

            // ----- 功能5：领取农场奖励相关坐标 -----
            farmRewardBtn: { left: 1760, top: 30, right: 1810, bottom: 70 },      // 奖励按钮
            claimFarmRewardBtn: { left: 1100, top: 700, right: 1300, bottom: 760 },     // 领取奖励按钮
            farmRewardBlankArea: { left: 1200, top: 860, right: 1300, bottom: 900 },     // 农场奖励空白区域点击

            // ----- 功能6：偷菜相关坐标 -----
            stealBtn: { left: 1930, top: 800, right: 2050, bottom: 900 }     // 偷菜按钮
        },

        // ========== 机型修正配置 ==========
        // 小米 Redmi K60
        "23113RKC6C": {
            // 暂未配置，后续可添加
        },
        // 华为 nova 2s
        "HWI-AL00": {
            farmBackBtn: { left: 30, top: 40, right: 150, bottom: 80 },
            settingsBtn: { left: 1980, top: 40, right: 2020, bottom: 80 },
            exitGameBtn: { left: 1610, top: 900, right: 1860, bottom: 940 }
        },
        // 华为 Mate 10 Pro
        "ALP-TL00": {
            settingsBtn: { left: 1740, top: 30, right: 1780, bottom: 70 },
            exitGameBtn: { left: 1500, top: 900, right: 1760, bottom: 940 },
            enterFarmBtn: { left: 350, top: 780, right: 550, bottom: 860 },
            waterBtn: { left: 1240, top: 600, right: 1310, bottom: 650 }
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
        distance: 300,          // 移动距离（像素，不缩放）
        moveDuration: 1000,     // 移动持续时间（毫秒）
        sleepDuration: 10000,   // 休眠时间（毫秒）
        minAngle: 0,            // 最小角度：3点钟方向
        maxAngle: 270           // 最大角度：9点钟方向（顺时针经过6点钟）
    },

    // ========== 功能4 - 结算返回配置 ==========
    settlement: {
        clickCount: 4,          // 返回大厅按钮点击次数
        clickInterval: 3000,    // 点击间隔（毫秒）
        waitAfterClick: 500     // 点击完成后等待时间（毫秒）
    },

    // ========== 功能5 - 领取农场奖励配置 ==========
    farmReward: {
        waitAfterEnter: 500,    // 进入农场后等待时间（毫秒）
        waitAfterReward: 500,   // 点击奖励后等待时间（毫秒）
        waitAfterClaim: 800,    // 点击领取后等待时间（毫秒）
        waitAfterBlank: 500,    // 点击空白后等待时间（毫秒）
        waitAfterBack: 500      // 点击返回后等待时间（毫秒）
    },

    // ========== 功能6 - 偷菜配置 ==========
    steal: {
        stepDistance: 100,           // 移动步长（像素）
        moveDuration: 1500,          // 每次移动持续时间（毫秒）
        waitAfterMove: 500,          // 移动后等待时间（毫秒）
        waitAfterSteal: 1000,        // 偷菜后等待时间（毫秒）
        rightMoveDuration: 1500,     // 右移动持续时间（毫秒）
        leftPath: "左左左上上右下右上右下",  // 左半区移动路径
        rightPath: "下右上右下右上上左左左"   // 右半区移动路径
    }
};

// ==================== 全局变量 ====================
var controlWindow = null;
var toggleWindow = null;
var toggleBtn = null;
var isSwitching = false;        // 是否正在切换服务器
var isWatering = false;         // 是否正在浇水
var isMoving = false;           // 是否正在自动移动
var isSettling = false;         // 是否正在结算返回
var isFarming = false;          // 是否正在领取农场奖励
var isStealing = false;         // 是否正在偷菜
var isExiting = false;          // 是否正在退出
var waterType = "";             // 当前浇水类型
var stopAutoMove = false;       // 停止自动移动标志
var stopSteal = false;          // 停止偷菜标志
var moveThread = null;          // 自动移动线程
var switchThread = null;        // 切换服务器线程
var stealThread = null;         // 偷菜线程
var stopSwitch = false;         // 停止切换标志
var isHidden = false;           // 主窗口是否隐藏

// ==================== 获取当前机型的步骤间隔时间（支持部分覆盖） ====================
function getStepDelays() {
    var model = phoneInfo.model;
    var defaultDelays = config.stepDelays["default"];
    if (!defaultDelays) {
        console.error("未找到默认步骤间隔配置");
        return null;
    }
    var modelDelays = config.stepDelays[model];
    if (modelDelays) {
        console.log("当前机型 [" + model + "] 使用部分覆盖配置:");
        var merged = {};
        for (var key in defaultDelays) {
            merged[key] = defaultDelays[key];
        }
        for (var key in modelDelays) {
            merged[key] = modelDelays[key];
            console.log("  - " + key + ": " + merged[key] + "ms (覆盖)");
        }
        for (var key in defaultDelays) {
            if (!modelDelays[key]) {
                console.log("  - " + key + ": " + merged[key] + "ms (默认)");
            }
        }
        return merged;
    }
    console.log("当前机型 [" + model + "] 使用默认步骤间隔配置:");
    for (var key in defaultDelays) {
        console.log("  - " + key + ": " + defaultDelays[key] + "ms");
    }
    return defaultDelays;
}

// ==================== 获取默认坐标 ====================
function getDefaultCoordinate(coordName) {
    var defaultCoords = config.coordFix["default"];
    if (!defaultCoords || defaultCoords[coordName] === undefined) {
        console.error("未找到默认坐标配置: " + coordName);
        return null;
    }
    return defaultCoords[coordName];
}

// ==================== 坐标转换函数（支持机型修正） ====================
function getFixedCoordinate(coordName) {
    var model = phoneInfo.model;
    var coordFix = config.coordFix;

    // 检查是否有当前机型的坐标修正配置
    if (coordFix[model] && coordFix[model][coordName] !== undefined) {
        var fixed = coordFix[model][coordName];
        console.log("使用机型修正坐标 [" + model + "][" + coordName + "]: " +
            "(" + fixed.left + "," + fixed.top + "," + fixed.right + "," + fixed.bottom + ")");
        return {
            left: fixed.left,
            top: fixed.top,
            right: fixed.right,
            bottom: fixed.bottom,
            isFixed: true
        };
    }

    // 使用默认坐标
    var defaultCoord = getDefaultCoordinate(coordName);
    if (!defaultCoord) {
        console.error("未找到坐标配置: " + coordName);
        return null;
    }
    console.log("使用默认坐标 [" + coordName + "]: " +
        "设计(" + defaultCoord.left + "," + defaultCoord.top + "," + defaultCoord.right + "," + defaultCoord.bottom + ")");
    return scaleCoordinate(defaultCoord.left, defaultCoord.top, defaultCoord.right, defaultCoord.bottom);
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

// ==================== 获取轮盘中心 ====================
function getJoystickCenter() {
    var joystick = getFixedCoordinate("joystick");
    var centerX = Math.round((joystick.left + joystick.right) / 2);
    var centerY = Math.round((joystick.top + joystick.bottom) / 2);
    return { x: centerX, y: centerY };
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

        return true;
    } catch (e) {
        console.log("  点击失败: " + description + " - " + e.message);
        return false;
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

// ==================== 轮盘移动函数（浇水用，支持机型配置持续时间） ====================
function executeJoystickMove() {
    console.log("开始执行轮盘移动");

    var joystick = getFixedCoordinate("joystick");

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
        swipe(centerX, centerY, targetX, targetY, duration);
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
        try {
            while (isMoving && !stopAutoMove && !isExiting) {
                var direction = getRandomDirection();
                var distance = config.autoMove.distance;
                var moveDuration = config.autoMove.moveDuration;

                var targetX = center.x + Math.round(direction.x * distance);
                var targetY = center.y + Math.round(direction.y * distance);

                targetX = Math.max(0, Math.min(targetX, config.screenWidth));
                targetY = Math.max(0, Math.min(targetY, config.screenHeight));

                try {
                    swipe(center.x, center.y, targetX, targetY, moveDuration);
                } catch (e) {
                    console.error("滑动执行失败: " + e.message);
                }

                if (stopAutoMove || !isMoving || isExiting) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }

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
            }

        } catch (e) {
            console.error("自动移动异常: " + e.message);
        } finally {
            try {
                var center2 = getJoystickCenter();
                press(center2.x, center2.y, 50);
            } catch(e) {}

            isMoving = false;
            updateAllUI();
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
            sleep(800);
            console.log("\n--- 步骤2: 点击浇水按钮 ---");
            var waterBtnArea = getFixedCoordinate("waterBtn");
            humanClick(waterBtnArea, "浇水按钮");
            sleep(300);
            humanClick(waterBtnArea, "浇水按钮");
            toast("农浇完成");
        } catch (e) {
            console.error("农浇失败: " + e.message);
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

            var stepDelays = getStepDelays();

            console.log("\n--- 步骤1: 点击进入农场按钮 ---");
            var enterFarmArea = getFixedCoordinate("enterFarmBtn");
            humanClick(enterFarmArea, "进入农场按钮");

            console.log("\n--- 步骤2: 等待进入农场 (" + stepDelays.enterFarmWait + "ms) ---");
            humanDelay(stepDelays.enterFarmWait);
            console.log("等待完成，继续执行浇水操作");

            sleep(500);

            console.log("\n--- 步骤3: 操作轮盘向西北方向移动 ---");
            if (!executeJoystickMove()) {
                throw new Error("步骤3失败: 轮盘移动操作失败");
            }

            console.log("等待 800ms 后点击浇水按钮...");
            sleep(800);

            console.log("\n--- 步骤4: 点击浇水按钮（点击两次） ---");
            var waterBtnArea = getFixedCoordinate("waterBtn");
            humanClick(waterBtnArea, "浇水按钮(第1次)");
            sleep(300);
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

// ==================== 功能4 - 结算返回 ====================
function executeSettlement() {
    if (isSettling) {
        toast("正在结算返回，请稍候...");
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

    isSettling = true;
    updateAllUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始结算返回操作");
            console.log("========================================");

            var settlement = config.settlement;

            console.log("\n--- 步骤1: 点击返回大厅按钮 (点击" + settlement.clickCount + "次, 间隔" + settlement.clickInterval + "ms) ---");
            var returnLobbyArea = getFixedCoordinate("settleReturnLobbyBtn");

            for (var i = 0; i < settlement.clickCount; i++) {
                if (isExiting || stopSwitch) {
                    throw new Error("操作被用户中断");
                }
                console.log("  第" + (i + 1) + "次点击");
                humanClick(returnLobbyArea, "返回大厅按钮(第" + (i + 1) + "次)");
                if (i < settlement.clickCount - 1) {
                    sleep(settlement.clickInterval);
                }
            }

            humanDelay(settlement.waitAfterClick);

            console.log("\n--- 步骤3: 点击确认返回 ---");
            if (isExiting || stopSwitch) {
                throw new Error("操作被用户中断");
            }
            var confirmReturnArea = getFixedCoordinate("settleConfirmReturnBtn");
            humanClick(confirmReturnArea, "确认返回按钮");
            toast("结算返回完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("结算返回失败: " + e.message);
            console.error("========================================\n");
            toast("结算返回失败: " + e.message);
        } finally {
            isSettling = false;
            updateAllUI();
        }
    });
}

// ==================== 功能5 - 领取农场奖励 ====================
function executeFarmReward() {
    if (isFarming) {
        toast("正在领取农场奖励，请稍候...");
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

    isFarming = true;
    updateAllUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始领取农场奖励");
            console.log("========================================");

            var stepDelays = getStepDelays();
            var farmReward = config.farmReward;

            console.log("\n--- 步骤1: 点击进入农场按钮 ---");
            if (isExiting || stopSwitch) {
                throw new Error("操作被用户中断");
            }
            var enterFarmArea = getFixedCoordinate("enterFarmBtn");
            humanClick(enterFarmArea, "进入农场按钮");

            humanDelay(stepDelays.enterFarmWait);
            console.log("等待完成，继续执行");

            console.log("\n--- 步骤3: 点击奖励按钮 ---");
            if (isExiting || stopSwitch) {
                throw new Error("操作被用户中断");
            }
            var rewardArea = getFixedCoordinate("farmRewardBtn");
            humanClick(rewardArea, "奖励按钮");

            humanDelay(farmReward.waitAfterReward);

            console.log("\n--- 步骤5: 点击领取奖励 ---");
            if (isExiting || stopSwitch) {
                throw new Error("操作被用户中断");
            }
            var claimArea = getFixedCoordinate("claimFarmRewardBtn");
            humanClick(claimArea, "领取奖励按钮");

            humanDelay(farmReward.waitAfterClaim);

            console.log("\n--- 步骤7: 点击空白区域（第1次） ---");
            if (isExiting || stopSwitch) {
                throw new Error("操作被用户中断");
            }
            var farmRewardBlankArea = getFixedCoordinate("farmRewardBlankArea");
            humanClick(farmRewardBlankArea, "空白区域(第1次)");

            humanDelay(farmReward.waitAfterBlank);

            console.log("\n--- 步骤9: 点击空白区域（第2次） ---");
            if (isExiting || stopSwitch) {
                throw new Error("操作被用户中断");
            }
            humanClick(farmRewardBlankArea, "空白区域(第2次)");

            humanDelay(farmReward.waitAfterBlank);

            console.log("\n--- 步骤11: 点击返回（第1次） ---");
            if (isExiting || stopSwitch) {
                throw new Error("操作被用户中断");
            }
            var backArea = getFixedCoordinate("farmBackBtn");
            humanClick(backArea, "返回按钮(第1次)");

            humanDelay(farmReward.waitAfterBack);

            console.log("\n--- 步骤13: 点击返回（第2次） ---");
            if (isExiting || stopSwitch) {
                throw new Error("操作被用户中断");
            }
            humanClick(backArea, "返回按钮(第2次)");

            humanDelay(farmReward.waitAfterBack);

            console.log("\n--- 步骤15: 点击返回大厅 ---");
            if (isExiting || stopSwitch) {
                throw new Error("操作被用户中断");
            }
            var farmReturnLobbyArea = getFixedCoordinate("farmReturnLobbyBtn");
            humanClick(farmReturnLobbyArea, "返回大厅按钮");
            toast("农场奖励领取完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("领取农场奖励失败: " + e.message);
            console.error("========================================\n");
            toast("领取农场奖励失败: " + e.message);
        } finally {
            isFarming = false;
            updateAllUI();
        }
    });
}

// ==================== 功能6 - 偷菜 ====================
function parseDirection(dir) {
    // 方向映射：上=减小y，下=增大y，左=减小x，右=增大x
    switch(dir) {
        case '上': return { dx: 0, dy: -1 };
        case '下': return { dx: 0, dy: 1 };
        case '左': return { dx: -1, dy: 0 };
        case '右': return { dx: 1, dy: 0 };
        default: return { dx: 0, dy: 0 };
    }
}

function executeStealPath(startX, startY, path, stepDistance, moveDuration, waitAfterMove, waitAfterSteal, stealArea) {
    var currentX = startX;
    var currentY = startY;

    for (var i = 0; i < path.length; i++) {
        // 检查停止标志
        if (stopSteal || isExiting) {
            console.log("偷菜被中断");
            return false;
        }

        var dir = path.charAt(i);
        var direction = parseDirection(dir);

        // 计算目标位置
        var targetX = currentX + direction.dx * stepDistance;
        var targetY = currentY + direction.dy * stepDistance;

        // 确保目标在屏幕范围内
        targetX = Math.max(0, Math.min(targetX, config.screenWidth));
        targetY = Math.max(0, Math.min(targetY, config.screenHeight));

        console.log("  移动 " + dir + ": (" + currentX + "," + currentY + ") -> (" + targetX + "," + targetY + ")");

        // 执行滑动（从当前位置到目标位置）
        try {
            swipe(currentX, currentY, targetX, targetY, moveDuration);
        } catch (e) {
            console.error("滑动失败: " + e.message);
            return false;
        }

        // 更新当前位置
        currentX = targetX;
        currentY = targetY;

        // 检查停止标志
        if (stopSteal || isExiting) {
            console.log("偷菜被中断");
            return false;
        }

        // 移动后等待
        if (waitAfterMove > 0) {
            sleep(waitAfterMove);
        }

        // 检查停止标志
        if (stopSteal || isExiting) {
            console.log("偷菜被中断");
            return false;
        }

        // 点击偷菜按钮
        if (stealArea) {
            humanClick(stealArea, "偷菜按钮");
            // 偷菜后等待
            if (waitAfterSteal > 0) {
                sleep(waitAfterSteal);
            }
        }

        // 检查停止标志
        if (stopSteal || isExiting) {
            console.log("偷菜被中断");
            return false;
        }
    }

    return true;
}

function executeSteal() {
    if (isStealing) {
        // 如果正在偷菜，点击停止
        console.log("用户点击停止偷菜");
        stopSteal = true;
        toast("正在停止偷菜...");
        return;
    }

    if (isSwitching) {
        toast("正在切换服务器，无法偷菜");
        return;
    }

    if (isWatering) {
        toast("正在浇水，无法偷菜");
        return;
    }

    if (isMoving) {
        toast("正在自动移动，无法偷菜");
        return;
    }

    if (isSettling) {
        toast("正在结算返回，无法偷菜");
        return;
    }

    if (isFarming) {
        toast("正在领取农场奖励，无法偷菜");
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

    stopSteal = false;
    isStealing = true;
    updateAllUI();

    console.log("========================================");
    console.log("开始偷菜操作");
    console.log("========================================");

    var stealConfig = config.steal;
    var stealArea = getFixedCoordinate("stealBtn");
    var joystick = getJoystickCenter();
    var startX = joystick.x;
    var startY = joystick.y;

    console.log("轮盘中心: (" + startX + "," + startY + ")");
    console.log("左半区路径: " + stealConfig.leftPath);
    console.log("右半区路径: " + stealConfig.rightPath);

    stealThread = threads.start(function() {
        try {
            // ========== 步骤1: 偷左半区 ==========
            console.log("\n--- 步骤1: 偷左半区 ---");
            if (stopSteal || isExiting) {
                throw new Error("操作被用户中断");
            }

            // 解析左半区路径
            var leftPath = stealConfig.leftPath;
            var result = executeStealPath(
                startX, startY,
                leftPath,
                stealConfig.stepDistance,
                stealConfig.moveDuration,
                stealConfig.waitAfterMove,
                stealConfig.waitAfterSteal,
                stealArea
            );

            if (!result) {
                throw new Error("左半区偷菜失败或被中断");
            }

            // 检查停止标志
            if (stopSteal || isExiting) {
                throw new Error("操作被用户中断");
            }

            // ========== 步骤2: 移动到右半区 ==========
            console.log("\n--- 步骤2: 移动到右半区 ---");
            // 向右移动2秒
            var targetX = Math.min(config.screenWidth, startX + 300);
            console.log("  向右移动: (" + startX + "," + startY + ") -> (" + targetX + "," + startY + ")");
            try {
                swipe(startX, startY, targetX, startY, stealConfig.rightMoveDuration);
            } catch (e) {
                console.error("右移失败: " + e.message);
                throw new Error("移动到右半区失败");
            }

            // 检查停止标志
            if (stopSteal || isExiting) {
                throw new Error("操作被用户中断");
            }

            // 等待0.5s
            sleep(stealConfig.waitAfterMove);

            // 检查停止标志
            if (stopSteal || isExiting) {
                throw new Error("操作被用户中断");
            }

            // ========== 步骤3: 偷右半区 ==========
            console.log("\n--- 步骤3: 偷右半区 ---");
            // 右半区从当前位置开始
            var currentPos = getJoystickCenter();
            var rightStartX = currentPos.x;
            var rightStartY = currentPos.y;

            var rightPath = stealConfig.rightPath;
            var result2 = executeStealPath(
                rightStartX, rightStartY,
                rightPath,
                stealConfig.stepDistance,
                stealConfig.moveDuration,
                stealConfig.waitAfterMove,
                stealConfig.waitAfterSteal,
                stealArea
            );

            if (!result2) {
                throw new Error("右半区偷菜失败或被中断");
            }

            console.log("\n========================================");
            console.log("偷菜操作完成");
            console.log("========================================\n");

            toast("偷菜完成");

        } catch (e) {
            if (e.message && e.message.indexOf("被用户中断") >= 0) {
                console.log("\n========================================");
                console.log("偷菜被用户中断");
                console.log("========================================\n");
                toast("偷菜已停止");
            } else {
                console.error("\n========================================");
                console.error("偷菜失败: " + e.message);
                console.error("========================================\n");
                toast("偷菜失败: " + e.message);
            }
        } finally {
            isStealing = false;
            stopSteal = false;
            updateAllUI();
        }
    });
}

function stopStealFunction() {
    console.log("请求停止偷菜");
    stopSteal = true;
    isStealing = false;
    updateAllUI();
}

// ==================== 切换服务器逻辑（农切 - 完整流程） ====================
function executeSwitch1() {
    if (isSwitching) {
        console.log("用户点击停止切换");
        stopSwitch = true;
        toast("正在停止切换...");
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
            console.log("\n--- 步骤1: 点击返回按钮 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var backArea = getFixedCoordinate("farmBackBtn");
            humanClick(backArea, "返回按钮");
            humanDelay(stepDelays.afterBack);

            console.log("\n--- 步骤2: 确认返回大厅 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var farmReturnLobbyArea = getFixedCoordinate("farmReturnLobbyBtn");
            humanClick(farmReturnLobbyArea, "确认返回大厅");
            humanDelay(stepDelays.afterConfirmLobby);

            console.log("\n--- 步骤3: 点击设置 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var settingsArea = getFixedCoordinate("settingsBtn");
            humanClick(settingsArea, "设置按钮");
            humanDelay(stepDelays.afterSettings);

            console.log("\n--- 步骤4: 退出游戏 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var exitGameArea = getFixedCoordinate("exitGameBtn");
            humanClick(exitGameArea, "退出游戏按钮");
            humanDelay(stepDelays.afterExitGame);

            console.log("\n--- 步骤5: 确认退出 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var confirmExitArea = getFixedCoordinate("confirmExitBtn");
            humanClick(confirmExitArea, "确认退出按钮");
            humanDelay(stepDelays.afterConfirmExit);

            console.log("\n--- 步骤6: 确认换区 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var confirmChangeArea = getFixedCoordinate("changeServer");
            humanClick(confirmChangeArea, "确认换区按钮");
            humanDelay(stepDelays.afterChangeServer);

            console.log("\n--- 步骤7: 选择服务器 " + nextIndex + " ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var nextServerPos = getServerPosition(nextIndex);
            humanClick(nextServerPos, "服务器 " + nextIndex + " (" + config.serverList[nextIndex] + ")");

            config.currentIndex = nextIndex;
            humanDelay(stepDelays.afterSelectServer);

            console.log("\n--- 步骤8: 开始游戏 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var startGameArea = getFixedCoordinate("startGameBtn");
            humanClick(startGameArea, "开始游戏按钮");

            console.log("\n========================================");
            console.log("农切 - 切换完成: " + config.serverList[config.currentIndex]);
            console.log("========================================\n");

            toast("切换完成: " + config.serverList[config.currentIndex]);

        } catch (e) {
            if (e.message && e.message.indexOf("被用户中断") >= 0) {
                console.log("切换被用户中断");
                toast("切换已停止");
            } else {
                console.error("切换失败: " + e.message);
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
            console.log("\n--- 步骤3: 点击设置 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var settingsArea = getFixedCoordinate("settingsBtn");
            humanClick(settingsArea, "设置按钮");
            humanDelay(stepDelays.afterSettings);

            console.log("\n--- 步骤4: 退出游戏 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var exitGameArea = getFixedCoordinate("exitGameBtn");
            humanClick(exitGameArea, "退出游戏按钮");
            humanDelay(stepDelays.afterExitGame);

            console.log("\n--- 步骤5: 确认退出 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var confirmExitArea = getFixedCoordinate("confirmExitBtn");
            humanClick(confirmExitArea, "确认退出按钮");
            humanDelay(stepDelays.afterConfirmExit);

            console.log("\n--- 步骤6: 确认换区 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var confirmChangeArea = getFixedCoordinate("changeServer");
            humanClick(confirmChangeArea, "确认换区按钮");
            humanDelay(stepDelays.afterChangeServer);

            console.log("\n--- 步骤7: 选择服务器 " + nextIndex + " ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var nextServerPos = getServerPosition(nextIndex);
            humanClick(nextServerPos, "服务器 " + nextIndex + " (" + config.serverList[nextIndex] + ")");

            config.currentIndex = nextIndex;
            humanDelay(stepDelays.afterSelectServer);

            console.log("\n--- 步骤8: 开始游戏 ---");
            if (stopSwitch || isExiting) {
                throw new Error("切换被用户中断");
            }
            var startGameArea = getFixedCoordinate("startGameBtn");
            humanClick(startGameArea, "开始游戏按钮");

            console.log("\n========================================");
            console.log("主切 - 切换完成: " + config.serverList[config.currentIndex]);
            console.log("========================================\n");

            toast("切换完成: " + config.serverList[config.currentIndex]);

        } catch (e) {
            if (e.message && e.message.indexOf("被用户中断") >= 0) {
                console.log("切换被用户中断");
                toast("切换已停止");
            } else {
                console.error("切换失败: " + e.message);
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
                if (controlWindow.setVisible) {
                    controlWindow.setVisible(false);
                } else {
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

        toggleBtn = toggleWindow.btnToggle;

        var x = 450;
        var y = 120;

        console.log("开关窗口位置: (" + x + ", " + y + ")");
        toggleWindow.setPosition(x, y);

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
                var isAnyBusy = isSwitching || isWatering || isMoving || isSettling || isFarming || isStealing;

                // 服务器按钮
                if (controlWindow.serverBtn) {
                    if (!isAnyBusy) {
                        controlWindow.serverBtn.setText(config.serverList[config.currentIndex]);
                        controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFFFFF"));
                        controlWindow.serverBtn.setTextColor(colors.parseColor("#1976D2"));
                        controlWindow.serverBtn.setClickable(true);
                    } else {
                        controlWindow.serverBtn.setText("...");
                        controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFE0B2"));
                        controlWindow.serverBtn.setTextColor(colors.parseColor("#E65100"));
                        controlWindow.serverBtn.setClickable(false);
                    }
                }

                // 农切按钮
                if (controlWindow.nongQieBtn) {
                    if (isSwitching) {
                        controlWindow.nongQieBtn.setText("切换中");
                        controlWindow.nongQieBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.nongQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.nongQieBtn.setClickable(true);
                    } else {
                        controlWindow.nongQieBtn.setText("农切");
                        var isClickable = !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing;
                        if (isClickable) {
                            controlWindow.nongQieBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
                            controlWindow.nongQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        } else {
                            controlWindow.nongQieBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                            controlWindow.nongQieBtn.setTextColor(colors.parseColor("#666666"));
                        }
                        controlWindow.nongQieBtn.setClickable(isClickable);
                    }
                }

                // 主切按钮
                if (controlWindow.zhuQieBtn) {
                    if (isSwitching) {
                        controlWindow.zhuQieBtn.setText("切换中");
                        controlWindow.zhuQieBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.zhuQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.zhuQieBtn.setClickable(true);
                    } else {
                        controlWindow.zhuQieBtn.setText("主切");
                        var isClickable = !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing;
                        if (isClickable) {
                            controlWindow.zhuQieBtn.setBackgroundColor(colors.parseColor("#2196F3"));
                            controlWindow.zhuQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        } else {
                            controlWindow.zhuQieBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                            controlWindow.zhuQieBtn.setTextColor(colors.parseColor("#666666"));
                        }
                        controlWindow.zhuQieBtn.setClickable(isClickable);
                    }
                }

                // 农浇按钮
                if (controlWindow.nongJiaoBtn) {
                    controlWindow.nongJiaoBtn.setText(isWatering && waterType === "农浇" ? "浇水中" : "农浇");
                    var isClickable = !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing;
                    if (isClickable) {
                        controlWindow.nongJiaoBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
                        controlWindow.nongJiaoBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.nongJiaoBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.nongJiaoBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.nongJiaoBtn.setClickable(isClickable);
                }

                // 主浇按钮
                if (controlWindow.zhuJiaoBtn) {
                    controlWindow.zhuJiaoBtn.setText(isWatering && waterType === "主浇" ? "浇水中" : "主浇");
                    var isClickable = !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing;
                    if (isClickable) {
                        controlWindow.zhuJiaoBtn.setBackgroundColor(colors.parseColor("#2196F3"));
                        controlWindow.zhuJiaoBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.zhuJiaoBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.zhuJiaoBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.zhuJiaoBtn.setClickable(isClickable);
                }

                // 农领按钮
                if (controlWindow.nongLingBtn) {
                    controlWindow.nongLingBtn.setText(isFarming ? "农场中" : "农领");
                    var isClickable = !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing;
                    if (isClickable) {
                        controlWindow.nongLingBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.nongLingBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.nongLingBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.nongLingBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.nongLingBtn.setClickable(isClickable);
                }

                // 偷按钮
                if (controlWindow.stealBtn) {
                    if (isStealing) {
                        controlWindow.stealBtn.setText("停");
                        controlWindow.stealBtn.setBackgroundColor(colors.parseColor("#F44336"));
                        controlWindow.stealBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.stealBtn.setClickable(true);
                    } else {
                        controlWindow.stealBtn.setText("偷");
                        var isClickable = !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing;
                        if (isClickable) {
                            controlWindow.stealBtn.setBackgroundColor(colors.parseColor("#8BC34A"));
                            controlWindow.stealBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        } else {
                            controlWindow.stealBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                            controlWindow.stealBtn.setTextColor(colors.parseColor("#666666"));
                        }
                        controlWindow.stealBtn.setClickable(isClickable);
                    }
                }

                // 移按钮
                if (controlWindow.moveBtn) {
                    if (isMoving) {
                        controlWindow.moveBtn.setText("停");
                        controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#F44336"));
                        controlWindow.moveBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.moveBtn.setClickable(true);
                    } else {
                        controlWindow.moveBtn.setText("移");
                        var isClickable = !isSwitching && !isWatering && !isSettling && !isFarming && !isStealing;
                        if (isClickable) {
                            controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#9C27B0"));
                            controlWindow.moveBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        } else {
                            controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                            controlWindow.moveBtn.setTextColor(colors.parseColor("#666666"));
                        }
                        controlWindow.moveBtn.setClickable(isClickable);
                    }
                }

                // 结按钮
                if (controlWindow.jieBtn) {
                    controlWindow.jieBtn.setText(isSettling ? "结算中" : "结");
                    var isClickable = !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing;
                    if (isClickable) {
                        controlWindow.jieBtn.setBackgroundColor(colors.parseColor("#F44336"));
                        controlWindow.jieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.jieBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.jieBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.jieBtn.setClickable(isClickable);
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
                if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing) {
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
                <!-- 第一行：服务器下拉框 | 农切 | 主切 -->
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
                <!-- 第二行：农浇 | 主浇 | 农领 | 偷 -->
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
                    <button id="nongLingBtn"
                            text="农领"
                            w="30"
                            h="30"
                            bg="#FF9800"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                    <button id="stealBtn"
                            text="偷"
                            w="30"
                            h="30"
                            bg="#8BC34A"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                </horizontal>
                <!-- 第三行：移 | 结 -->
                <horizontal marginTop="2">
                    <button id="moveBtn"
                            text="移"
                            w="30"
                            h="30"
                            bg="#9C27B0"
                            textColor="#FFFFFF"
                            textSize="8"/>
                    <button id="jieBtn"
                            text="结"
                            w="30"
                            h="30"
                            bg="#F44336"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                </horizontal>
            </vertical>
        );

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
            if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing) {
                console.log("启动农切 - 完整切换流程");
                executeSwitch1();
            } else if (isSwitching) {
                console.log("点击停止切换");
                stopSwitch = true;
                toast("正在停止切换...");
            } else {
                toast(isWatering ? "正在浇水" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : "正在偷菜"))));
            }
        });

        // 农切长按重置
        controlWindow.nongQieBtn.on("long-click", function() {
            if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing) {
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
            if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing) {
                console.log("启动主切 - 从步骤3开始");
                executeSwitch2();
            } else if (isSwitching) {
                console.log("点击停止切换");
                stopSwitch = true;
                toast("正在停止切换...");
            } else {
                toast(isWatering ? "正在浇水" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : "正在偷菜"))));
            }
        });

        // 农浇按钮 - 不进入农场
        controlWindow.nongJiaoBtn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving && !isSettling && !isFarming && !isStealing) {
                console.log("用户点击农浇按钮（不进入农场）");
                executeWater1();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : (isStealing ? "正在偷菜" : "正在浇水")))));
            }
        });

        // 主浇按钮 - 进入农场
        controlWindow.zhuJiaoBtn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving && !isSettling && !isFarming && !isStealing) {
                console.log("用户点击主浇按钮（进入农场）");
                executeWater2();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : (isStealing ? "正在偷菜" : "正在浇水")))));
            }
        });

        // 农领按钮 - 领取农场奖励
        controlWindow.nongLingBtn.on("click", function() {
            if (!isFarming && !isSwitching && !isWatering && !isMoving && !isSettling && !isStealing) {
                console.log("用户点击农领按钮（领取农场奖励）");
                executeFarmReward();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isWatering ? "正在浇水" : (isStealing ? "正在偷菜" : "正在领取农场奖励")))));
            }
        });

        // 偷按钮 - 偷菜
        controlWindow.stealBtn.on("click", function() {
            console.log("用户点击偷按钮");
            if (isStealing) {
                console.log("停止偷菜");
                stopSteal = true;
                toast("正在停止偷菜...");
            } else if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming) {
                console.log("启动偷菜");
                executeSteal();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : "正在浇水"))));
            }
        });

        // 移动按钮
        controlWindow.moveBtn.on("click", function() {
            console.log("用户点击移动按钮，当前状态: isMoving=" + isMoving +
                ", isSwitching=" + isSwitching + ", isWatering=" + isWatering +
                ", isSettling=" + isSettling + ", isFarming=" + isFarming +
                ", isStealing=" + isStealing);

            if (isMoving) {
                console.log("停止自动移动");
                stopAutoMoveFunction();
            } else if (!isSwitching && !isWatering && !isSettling && !isFarming && !isStealing) {
                console.log("启动自动移动");
                executeAutoMove();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isWatering ? "正在浇水" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : "正在偷菜"))));
            }
        });

        // 结按钮 - 结算返回
        controlWindow.jieBtn.on("click", function() {
            console.log("用户点击结按钮");
            if (!isSettling && !isSwitching && !isWatering && !isMoving && !isFarming && !isStealing) {
                console.log("启动结算返回");
                executeSettlement();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isMoving ? "正在移动" : (isWatering ? "正在浇水" : (isFarming ? "正在领取农场奖励" : (isStealing ? "正在偷菜" : "正在结算")))));
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
    isMoving = false;
    isSettling = false;
    isFarming = false;
    isStealing = false;
    stopSwitch = true;
    stopSteal = true;

    if (isMoving) {
        stopAutoMove = true;
        isMoving = false;
        if (moveThread && moveThread.isAlive()) {
            try {
                moveThread.interrupt();
            } catch(e) {}
        }
    }

    if (isStealing) {
        stopSteal = true;
        isStealing = false;
        if (stealThread && stealThread.isAlive()) {
            try {
                stealThread.interrupt();
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
        console.log("    * " + name + ": (" + fixedCoords[name].left + "," + fixedCoords[name].top + "," +
            fixedCoords[name].right + "," + fixedCoords[name].bottom + ")");
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
console.log("    * 农领: 领取农场奖励");
console.log("    * 偷: 偷菜");
console.log("    * 移: 自动移动");
console.log("    * 结: 结算返回");
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
        if (isSettling) status += " [结算中]";
        if (isFarming) status += " [农场领取中]";
        if (isStealing) status += " [偷菜中]";
        console.log(status);
    }
}, 60000);

setTimeout(function() {
    if (!isExiting) {
        toast("脚本已就绪 - 可切换服务器、浇水和自动移动");
        console.log("用户提示已显示");
    }
}, 1000);