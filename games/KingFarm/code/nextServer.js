"auto";

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
    } else {
        screenWidth = height;
        screenHeight = width;
    }

    console.log("使用屏幕尺寸(横屏): " + screenWidth + " x " + screenHeight);
    return {
        width: screenWidth,
        height: screenHeight
    };
}

// ==================== 可配置参数 ====================
var screenSize = getScreenSize();

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
    serverList: ["0", "1", "2", "3", "4", "5", "6"], // 序号0对应显示"0"

    // ========== 延时配置（毫秒） ==========
    delays: {
        returnToLobby: 500,    // 点击返回后等待时间
        toSettings: 3000,      // 点击确认返回大厅后等待时间
        exitGame: 1000,        // 点击设置后等待时间
        confirmExit: 500,      // 点击退出游戏后等待时间
        toServerSelect: 7000,  // 点击确认退出后等待时间（进入服务器选择界面）
        toNextServer: 500,     // 点击确认换区后等待时间
        toStartGame: 1000,     // 选择服务器后等待时间
        enterVillage: 7000     // 进入农村后等待时间
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
            duration: 1800,     // 移动持续时间（毫秒）
            holdDuration: 2000  // 保持按压时间（毫秒）
        }
    },

    // ========== 自动移动功能配置 ==========
    autoMove: {
        // 轮盘区域 (左, 上, 右, 下) - 设计分辨率坐标（与浇水共用）
        joystick: { left: 300, top: 600, right: 600, bottom: 850 },
        // 移动距离（像素，不缩放）
        distance: 300,
        // 移动持续时间（毫秒）
        moveDuration: 1000,
        // 休眠时间（毫秒）
        sleepDuration: 10000,
        // 方向范围：从3点钟(0°)到9点钟(270°)，顺时针
        minAngle: 0,      // 3点钟方向
        maxAngle: 270     // 9点钟方向（顺时针经过6点钟）
    }
};

// ==================== 全局变量 ====================
var controlWindow = null;
var isSwitching = false;      // 是否正在切换服务器
var isWatering = false;       // 是否正在浇水
var isMoving = false;         // 是否正在自动移动
var isExiting = false;        // 是否正在退出
var clickCount = 0;           // 点击计数器
var waterType = "";           // 记录当前浇水类型: "water1" 或 "water2"
var stopAutoMove = false;     // 停止自动移动标志
var moveThread = null;        // 自动移动线程

// ==================== 坐标转换函数 ====================
function scaleCoordinate(x, y, width, height) {
    var scaleX = config.screenWidth / config.designWidth;
    var scaleY = config.screenHeight / config.designHeight;

    var result = {
        left: Math.round(x * scaleX),
        top: Math.round(y * scaleY),
        right: Math.round(width * scaleX),
        bottom: Math.round(height * scaleY)
    };

    console.log("坐标转换: 设计(" + x + "," + y + "," + width + "," + height + ") -> " +
        "实际(" + result.left + "," + result.top + "," + result.right + "," + result.bottom + ")" +
        " [缩放比: X=" + scaleX.toFixed(3) + ", Y=" + scaleY.toFixed(3) + "]");

    return result;
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

    // 服务器位置映射（设计分辨率坐标）
    var positions = {
        1: { x: 430, y: 240, width: 1230, height: 320 },   // 服务器1位置
        2: { x: 1380, y: 240, width: 2170, height: 320 },  // 服务器2位置
        3: { x: 430, y: 370, width: 1230, height: 450 },   // 服务器3位置
        4: { x: 1380, y: 370, width: 2170, height: 450 },  // 服务器4位置
        5: { x: 430, y: 500, width: 1230, height: 580 },   // 服务器5位置
        6: { x: 1380, y: 500, width: 2170, height: 580 }   // 服务器6位置
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
        config.autoMove.joystick.left,
        config.autoMove.joystick.top,
        config.autoMove.joystick.right,
        config.autoMove.joystick.bottom
    );

    var centerX = Math.round((joystick.left + joystick.right) / 2);
    var centerY = Math.round((joystick.top + joystick.bottom) / 2);

    return { x: centerX, y: centerY };
}

// ==================== 轮盘移动函数（浇水用） ====================
function executeJoystickMove() {
    console.log("开始执行轮盘移动");

    // 计算轮盘中心位置
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

    // 获取移动参数
    var directionX = config.water.moveSettings.directionX;
    var directionY = config.water.moveSettings.directionY;
    var distance = config.water.moveSettings.distance;
    var duration = config.water.moveSettings.duration;
    var holdDuration = config.water.moveSettings.holdDuration;

    // 根据屏幕缩放调整距离
    var scaleX = config.screenWidth / config.designWidth;
    var scaleY = config.screenHeight / config.designHeight;
    var scaledDistance = Math.round(distance * Math.min(scaleX, scaleY));

    // 归一化方向向量
    var len = Math.sqrt(directionX * directionX + directionY * directionY);
    if (len === 0) {
        console.error("方向向量为零");
        return false;
    }
    var normX = directionX / len;
    var normY = directionY / len;

    // 计算目标位置（从中心向指定方向移动）
    var targetX = centerX + Math.round(normX * scaledDistance);
    var targetY = centerY + Math.round(normY * scaledDistance);

    // 确保目标在屏幕范围内
    targetX = Math.max(0, Math.min(targetX, config.screenWidth));
    targetY = Math.max(0, Math.min(targetY, config.screenHeight));

    console.log("移动参数:");
    console.log("  - 方向向量: (" + normX.toFixed(3) + "," + normY.toFixed(3) + ")");
    console.log("  - 移动距离: " + scaledDistance + "px (设计: " + distance + "px)");
    console.log("  - 持续时间: " + duration + "ms");
    console.log("  - 保持时间: " + holdDuration + "ms");
    console.log("  - 起始位置: (" + centerX + "," + centerY + ")");
    console.log("  - 目标位置: (" + targetX + "," + targetY + ")");

    try {
        // 执行滑动操作（从中心向目标方向滑动）
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
    // 从3点钟(0°)到9点钟(270°)，顺时针
    var minAngle = config.autoMove.minAngle;
    var maxAngle = config.autoMove.maxAngle;

    var angle = random(minAngle, maxAngle);
    var radians = angle * Math.PI / 180;

    // 在屏幕坐标系中：x向右为正，y向下为正
    // 3点钟方向: (1, 0)，6点钟方向: (0, 1)，9点钟方向: (-1, 0)
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

    // 重置停止标志
    stopAutoMove = false;
    isMoving = true;
    updateAllUI();

    console.log("========================================");
    console.log("开始自动移动");
    console.log("========================================");

    // 获取轮盘中心
    var center = getJoystickCenter();
    console.log("轮盘中心: (" + center.x + "," + center.y + ")");

    // 在独立线程中执行移动
    moveThread = threads.start(function() {
        var moveCount = 0;
        try {
            while (isMoving && !stopAutoMove && !isExiting) {
                moveCount++;

                console.log("\n--- 移动 #" + moveCount + " ---");

                // 生成随机方向（3点钟到9点钟顺时针）
                var direction = getRandomDirection();
                var distance = config.autoMove.distance;
                var moveDuration = config.autoMove.moveDuration;

                // 计算目标位置
                var targetX = center.x + Math.round(direction.x * distance);
                var targetY = center.y + Math.round(direction.y * distance);

                // 确保目标在屏幕范围内
                targetX = Math.max(0, Math.min(targetX, config.screenWidth));
                targetY = Math.max(0, Math.min(targetY, config.screenHeight));

                console.log("移动参数:");
                console.log("  - 方向角度: " + direction.angle + "°");
                console.log("  - 方向向量: (" + direction.x.toFixed(3) + "," + direction.y.toFixed(3) + ")");
                console.log("  - 移动距离: " + distance + "px");
                console.log("  - 移动持续: " + moveDuration + "ms");
                console.log("  - 起始位置: (" + center.x + "," + center.y + ")");
                console.log("  - 目标位置: (" + targetX + "," + targetY + ")");

                // 执行滑动（从中心到目标）
                try {
                    console.log("执行滑动...");
                    swipe(center.x, center.y, targetX, targetY, moveDuration);
                    console.log("滑动完成");
                } catch (e) {
                    console.error("滑动执行失败: " + e.message);
                }

                // 检查停止标志
                if (stopAutoMove || !isMoving || isExiting) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }

                // 回到中心
                console.log("回到中心...");
                try {
                    swipe(targetX, targetY, center.x, center.y, 200);
                } catch (e) {
                    console.error("回到中心失败: " + e.message);
                }

                // 检查停止标志
                if (stopAutoMove || !isMoving || isExiting) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }

                // 休眠10秒
                console.log("休眠10秒...");
                var sleepStart = Date.now();
                var sleepDuration = config.autoMove.sleepDuration;

                while (Date.now() - sleepStart < sleepDuration) {
                    // 每100ms检查一次停止标志
                    if (stopAutoMove || !isMoving || isExiting) {
                        console.log("检测到停止标志，中断休眠");
                        break;
                    }
                    sleep(100);
                }

                // 检查停止标志
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
            // 确保回到中心
            try {
                var center2 = getJoystickCenter();
                // 轻触中心释放轮盘
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

    // 立即更新UI为"移"状态
    updateAllUI();

    // 注意：线程会在下次检查时自动退出
    // 如果线程在休眠中，会在100ms内检测到停止标志
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

            // ========== 步骤1: 操作轮盘向西北方向移动 ==========
            console.log("\n--- 步骤1: 操作轮盘向西北方向移动 ---");

            if (!executeJoystickMove()) {
                throw new Error("步骤1失败: 轮盘移动操作失败");
            }

            // 额外等待确保操作完成
            sleep(500);

            // ========== 步骤2: 点击浇水按钮 ==========
            console.log("\n--- 步骤2: 点击浇水按钮 ---");
            var waterBtnArea = scaleCoordinate(
                config.water.waterBtn.left,
                config.water.waterBtn.top,
                config.water.waterBtn.right,
                config.water.waterBtn.bottom
            );

            if (!humanClick(waterBtnArea, "浇水按钮")) {
                throw new Error("步骤2失败: 点击浇水按钮");
            }

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

// ==================== 浇水功能2（点击进入农村） ====================
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

            // ========== 步骤1: 点击进入农村按钮 ==========
            console.log("\n--- 步骤1: 点击进入农村按钮 ---");
            var enterVillageArea = scaleCoordinate(
                config.water.enterVillageBtn.left,
                config.water.enterVillageBtn.top,
                config.water.enterVillageBtn.right,
                config.water.enterVillageBtn.bottom
            );

            if (!humanClick(enterVillageArea, "进入农村按钮")) {
                throw new Error("步骤1失败: 点击进入农村按钮");
            }

            // 等待5秒
            console.log("等待5秒进入农村...");
            humanDelay(config.delays.enterVillage);

            // ========== 步骤2: 操作轮盘向西北方向移动 ==========
            console.log("\n--- 步骤2: 操作轮盘向西北方向移动 ---");

            if (!executeJoystickMove()) {
                throw new Error("步骤2失败: 轮盘移动操作失败");
            }

            // 额外等待确保操作完成
            sleep(500);

            // ========== 步骤3: 点击浇水按钮 ==========
            console.log("\n--- 步骤3: 点击浇水按钮 ---");
            var waterBtnArea = scaleCoordinate(
                config.water.waterBtn.left,
                config.water.waterBtn.top,
                config.water.waterBtn.right,
                config.water.waterBtn.bottom
            );

            if (!humanClick(waterBtnArea, "浇水按钮")) {
                throw new Error("步骤3失败: 点击浇水按钮");
            }

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

// ==================== 自动切换服务器逻辑 ====================
function executeServerSwitch() {
    if (isSwitching) {
        console.log("切换被阻止: 已有切换操作在进行中");
        toast("正在切换服务器，请稍候...");
        return;
    }

    if (isWatering) {
        console.log("切换被阻止: 正在浇水");
        toast("正在浇水，无法切换服务器");
        return;
    }

    if (isMoving) {
        console.log("切换被阻止: 正在自动移动");
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

    isSwitching = true;
    updateAllUI();

    var currentIndex = config.currentIndex;
    var nextIndex = currentIndex + 1;

    // 如果当前是0，下一个是1
    if (nextIndex > 6) {
        nextIndex = 1;
    }

    console.log("========================================");
    console.log("开始切换服务器: " + currentIndex + " (" + config.serverList[currentIndex] +
        ") -> " + nextIndex + " (" + config.serverList[nextIndex] + ")");
    console.log("========================================");

    threads.start(function() {
        try {
            // 判断是否从步骤6开始（当前序号为0时）
            var startFromStep6 = (currentIndex === 0);

            if (startFromStep6) {
                console.log("当前序号为0，从步骤6开始执行");

                // ========== 步骤6: 确认换区 ==========
                console.log("\n--- 步骤6: 确认换区 ---");
                var confirmChangeServer = scaleCoordinate(1000, 710, 1450, 740);
                if (!humanClick(confirmChangeServer, "确认换区按钮")) {
                    throw new Error("步骤6失败: 确认换区");
                }
                humanDelay(config.delays.toNextServer);

                // ========== 步骤7: 点击下一个服务器 ==========
                console.log("\n--- 步骤7: 选择服务器 " + nextIndex + " ---");
                var nextServerPos = getServerPosition(nextIndex);
                if (!nextServerPos) {
                    throw new Error("步骤7失败: 获取服务器 " + nextIndex + " 位置");
                }

                if (!humanClick(nextServerPos, "服务器 " + nextIndex + " (" + config.serverList[nextIndex] + ")")) {
                    throw new Error("步骤7失败: 点击服务器 " + nextIndex);
                }

                // 更新当前序号
                config.currentIndex = nextIndex;
                humanDelay(config.delays.toStartGame);

                // ========== 步骤8: 点击开始游戏 ==========
                console.log("\n--- 步骤8: 开始游戏 ---");
                var startGameBtn = scaleCoordinate(1020, 800, 1340, 870);
                if (!humanClick(startGameBtn, "开始游戏按钮")) {
                    throw new Error("步骤8失败: 开始游戏");
                }

            } else {
                // 正常流程：从步骤1开始
                console.log("当前序号为" + currentIndex + "，从步骤1开始执行");

                // 步骤1: 点击返回按钮
                console.log("\n--- 步骤1: 点击返回按钮 ---");
                var backBtn = scaleCoordinate(80, 30, 240, 70);
                if (!humanClick(backBtn, "返回按钮")) {
                    throw new Error("步骤1失败: 点击返回按钮");
                }
                humanDelay(config.delays.returnToLobby);

                // 步骤2: 点击确认返回大厅
                console.log("\n--- 步骤2: 确认返回大厅 ---");
                var confirmLobby = scaleCoordinate(1260, 730, 1500, 780);
                if (!humanClick(confirmLobby, "确认返回大厅")) {
                    throw new Error("步骤2失败: 确认返回大厅");
                }
                humanDelay(config.delays.toSettings);

                // 步骤3: 点击设置
                console.log("\n--- 步骤3: 点击设置 ---");
                var settingsBtn = scaleCoordinate(2100, 30, 2140, 70);
                if (!humanClick(settingsBtn, "设置按钮")) {
                    throw new Error("步骤3失败: 点击设置");
                }
                humanDelay(config.delays.exitGame);

                // 步骤4: 点击退出游戏
                console.log("\n--- 步骤4: 退出游戏 ---");
                var exitGameBtn = scaleCoordinate(1730, 900, 2000, 940);
                if (!humanClick(exitGameBtn, "退出游戏按钮")) {
                    throw new Error("步骤4失败: 退出游戏");
                }
                humanDelay(config.delays.confirmExit);

                // 步骤5: 点击确认退出
                console.log("\n--- 步骤5: 确认退出 ---");
                var confirmExitBtn = scaleCoordinate(1250, 730, 1500, 790);
                if (!humanClick(confirmExitBtn, "确认退出按钮")) {
                    throw new Error("步骤5失败: 确认退出");
                }
                humanDelay(config.delays.toServerSelect);

                // 步骤6: 确认换区
                console.log("\n--- 步骤6: 确认换区 ---");
                var confirmChangeServer = scaleCoordinate(1000, 710, 1450, 740);
                if (!humanClick(confirmChangeServer, "确认换区按钮")) {
                    throw new Error("步骤6失败: 确认换区");
                }
                humanDelay(config.delays.toNextServer);

                // 步骤7: 点击下一个服务器
                console.log("\n--- 步骤7: 选择服务器 " + nextIndex + " ---");
                var nextServerPos = getServerPosition(nextIndex);
                if (!nextServerPos) {
                    throw new Error("步骤7失败: 获取服务器 " + nextIndex + " 位置");
                }

                if (!humanClick(nextServerPos, "服务器 " + nextIndex + " (" + config.serverList[nextIndex] + ")")) {
                    throw new Error("步骤7失败: 点击服务器 " + nextIndex);
                }

                // 更新当前序号
                config.currentIndex = nextIndex;
                humanDelay(config.delays.toStartGame);

                // 步骤8: 点击开始游戏
                console.log("\n--- 步骤8: 开始游戏 ---");
                var startGameBtn = scaleCoordinate(1020, 800, 1340, 870);
                if (!humanClick(startGameBtn, "开始游戏按钮")) {
                    throw new Error("步骤8失败: 开始游戏");
                }
            }

            console.log("\n========================================");
            console.log("服务器切换完成: " + config.serverList[config.currentIndex]);
            console.log("总点击次数: " + clickCount);
            console.log("========================================\n");

            toast("切换完成: " + config.serverList[config.currentIndex]);

        } catch (e) {
            console.error("\n========================================");
            console.error("切换失败: " + e.message);
            console.error("失败时的点击计数: " + clickCount);
            console.error("========================================\n");
            toast("切换失败: " + e.message);
        } finally {
            isSwitching = false;
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
        // 显示服务器列表（包含0选项）
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
                // 更新服务器按钮
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

                // 更新下一个按钮
                if (controlWindow.nextBtn) {
                    if (!isSwitching && !isWatering && !isMoving) {
                        controlWindow.nextBtn.setText("▶");
                        controlWindow.nextBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
                        controlWindow.nextBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.nextBtn.setText(isWatering ? "浇水" : (isMoving ? "移动" : "切换中"));
                        controlWindow.nextBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.nextBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    }
                    controlWindow.nextBtn.setClickable(!isSwitching && !isWatering && !isMoving);
                }

                // 更新浇1按钮
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

                // 更新浇2按钮
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

                // 更新移动按钮 - 关键修复
                if (controlWindow.moveBtn) {
                    if (isMoving) {
                        // 移动中 -> 显示"停"，红色，可点击（点击停止）
                        controlWindow.moveBtn.setText("停");
                        controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#F44336"));
                        controlWindow.moveBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.moveBtn.setClickable(true);  // 可点击停止
                        console.log("移动按钮状态: 停 (可点击)");
                    } else if (!isSwitching && !isWatering) {
                        // 空闲 -> 显示"移"，紫色，可点击
                        controlWindow.moveBtn.setText("移");
                        controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#9C27B0"));
                        controlWindow.moveBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.moveBtn.setClickable(true);
                        console.log("移动按钮状态: 移 (可点击)");
                    } else {
                        // 其他操作中 -> 显示"移"，灰色，不可点击
                        controlWindow.moveBtn.setText("移");
                        controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.moveBtn.setTextColor(colors.parseColor("#666666"));
                        controlWindow.moveBtn.setClickable(false);
                        console.log("移动按钮状态: 移 (不可点击)");
                    }
                }
            } catch (e) {
                console.log("更新UI失败: " + e.message);
            }
        }
    });
}

// ==================== 更新当前服务器显示 ====================
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
                    <!-- 第一行：服务器切换 -->
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
                    <!-- 第二行：浇水1和浇水2 -->
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
                    <!-- 第三行：移动按钮（居中，宽度64px） -->
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

        // 下一个按钮点击事件
        controlWindow.nextBtn.on("click", function() {
            if (!isSwitching && !isWatering && !isMoving) {
                console.log("用户点击下一个按钮");
                executeServerSwitch();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isWatering ? "正在浇水" : "正在自动移动"));
            }
        });

        // 长按重置
        controlWindow.nextBtn.on("long-click", function() {
            if (!isSwitching && !isWatering && !isMoving) {
                console.log("用户长按重置按钮");
                config.currentIndex = 1;
                updateCurrentServerDisplay();
                toast("已重置为服务器 1");
            }
            return true;
        });

        // 浇1按钮点击事件（不点击进入农村）
        controlWindow.water1Btn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving) {
                console.log("用户点击浇1按钮（不进入农村）");
                executeWater1();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isWatering ? "正在浇水" : "正在自动移动"));
            }
        });

        // 浇2按钮点击事件（点击进入农村）
        controlWindow.water2Btn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving) {
                console.log("用户点击浇2按钮（进入农村）");
                executeWater2();
            } else {
                toast(isSwitching ? "正在切换服务器" : (isWatering ? "正在浇水" : "正在自动移动"));
            }
        });

        // 移动按钮点击事件
        controlWindow.moveBtn.on("click", function() {
            console.log("用户点击移动按钮，当前状态: isMoving=" + isMoving +
                ", isSwitching=" + isSwitching + ", isWatering=" + isWatering);

            if (isMoving) {
                // 正在移动，点击停止
                console.log("停止自动移动");
                stopAutoMoveFunction();
            } else if (!isSwitching && !isWatering) {
                // 空闲状态，开始移动
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

    // 停止自动移动
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
console.log("  - 原始屏幕: " + device.width + "x" + device.height);
console.log("  - 使用屏幕(横屏): " + config.screenWidth + "x" + config.screenHeight);
console.log("  - 设计分辨率: " + config.designWidth + "x" + config.designHeight);
console.log("  - 缩放比例: X=" + (config.screenWidth / config.designWidth).toFixed(3) +
    ", Y=" + (config.screenHeight / config.designHeight).toFixed(3));
console.log("  - 当前服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex] + ")");
console.log("  - 特殊说明: 序号0表示从步骤6(确认换区)开始执行");
console.log("  - 浇水配置:");
console.log("    * 浇1: 不进入农村，直接滑动轮盘并点击浇水按钮");
console.log("    * 浇2: 进入农村，等待5秒，滑动轮盘并点击浇水按钮");
console.log("  - 自动移动配置:");
console.log("    * 移动距离: " + config.autoMove.distance + "px");
console.log("    * 移动持续: " + config.autoMove.moveDuration + "ms");
console.log("    * 休眠时间: " + config.autoMove.sleepDuration + "ms");
console.log("    * 方向范围: 3点钟(0°)到9点钟(270°)，顺时针");
console.log("========================================\n");

createControlWindow();

// 保活
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

// 显示提示
setTimeout(function() {
    if (!isExiting) {
        toast("脚本已就绪 - 可切换服务器、浇水和自动移动");
        console.log("用户提示已显示");
    }
}, 1000);