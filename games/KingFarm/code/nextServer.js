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

// ==================== 可配置参数 ====================
var screenSize = getScreenSize();

var config = {
    // ========== 屏幕配置 ==========
    designWidth: 2400,
    designHeight: 1080,
    screenWidth: screenSize.width,
    screenHeight: screenSize.height,

    // ========== 当前服务器序号 ==========
    currentIndex: 1,

    // ========== 服务器列表 ==========
    serverList: ["1", "2", "3", "4", "5", "6"],

    // ========== 延时配置（毫秒） ==========
    delays: {
        returnToLobby: 500,
        toSettings: 3000,
        exitGame: 1000,
        confirmExit: 500,
        toServerSelect: 7000,
        toNextServer: 500,
        toStartGame: 1000,
        enterVillage: 5000
    },

    // ========== 浇水功能配置 ==========
    water: {
        // 进入农村按钮 (左, 上, 右, 下)
        enterVillageBtn: { left: 640, top: 780, right: 780, bottom: 840 },
        // 轮盘区域 (左, 上, 右, 下)
        joystick: { left: 300, top: 600, right: 600, bottom: 850 },
        // 浇水按钮区域
        waterBtn: { left: 1490, top: 590, right: 1550, bottom: 640 },
        // 移动参数
        moveSettings: {
            // 方向偏移（西北方向：向左上）
            directionX: -1,
            directionY: -1,
            // 移动距离（从中心向外拖拽的距离）
            distance: 250,
            // 移动持续时间（毫秒）
            duration: 2000,
            // 保持按压时间（毫秒）
            holdDuration: 2000
        }
    }
};

// ==================== 全局变量 ====================
var controlWindow = null;
var isSwitching = false;
var isWatering = false;
var isExiting = false;
var clickCount = 0;
var waterType = ""; // 记录当前浇水类型: "water1" 或 "water2"

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

// ==================== 轮盘移动函数 ====================
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

        // 保持按压
        console.log("保持按压 " + holdDuration + "ms...");
        var holdStart = Date.now();
        while (Date.now() - holdStart < holdDuration) {
            press(targetX, targetY, 50);
            sleep(50);
        }
        console.log("保持按压完成");

        // 释放（回到中心）
        console.log("释放轮盘，回到中心...");
        swipe(targetX, targetY, centerX, centerY, 200);
        console.log("释放完成");

        return true;

    } catch (e) {
        console.error("轮盘移动失败: " + e.message);
        return false;
    }
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
    updateWaterUIState(false);
    updateUIState(false);

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
            updateWaterUIState(true);
            updateUIState(true);
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
    updateWaterUIState(false);
    updateUIState(false);

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
            updateWaterUIState(true);
            updateUIState(true);
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
    updateUIState(false);
    updateWaterUIState(false);

    var currentIndex = config.currentIndex;
    var nextIndex = currentIndex + 1;
    if (nextIndex > 6) {
        nextIndex = 1;
    }

    console.log("========================================");
    console.log("开始切换服务器: " + currentIndex + " (" + config.serverList[currentIndex - 1] +
        ") -> " + nextIndex + " (" + config.serverList[nextIndex - 1] + ")");
    console.log("========================================");

    threads.start(function() {
        try {
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

            if (!humanClick(nextServerPos, "服务器 " + nextIndex + " (" + config.serverList[nextIndex - 1] + ")")) {
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

            console.log("\n========================================");
            console.log("服务器切换完成: " + config.serverList[config.currentIndex - 1]);
            console.log("总点击次数: " + clickCount);
            console.log("========================================\n");

            toast("切换完成: " + config.serverList[config.currentIndex - 1]);

        } catch (e) {
            console.error("\n========================================");
            console.error("切换失败: " + e.message);
            console.error("失败时的点击计数: " + clickCount);
            console.error("========================================\n");
            toast("切换失败: " + e.message);
        } finally {
            isSwitching = false;
            updateUIState(true);
            updateWaterUIState(true);
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

    console.log("打开服务器选择列表，当前: " + config.currentIndex);

    try {
        dialogs.select("选择服务器", config.serverList, function(index) {
            if (index >= 0 && index < config.serverList.length) {
                var oldIndex = config.currentIndex;
                config.currentIndex = index + 1;
                updateCurrentServerDisplay();
                console.log("手动选择服务器: " + oldIndex + " -> " + config.currentIndex +
                    " (" + config.serverList[index] + ")");
                toast("已选择: " + config.serverList[index]);
            }
        });
    } catch (e) {
        console.log("选择对话框失败: " + e.message);
        toast("无法打开选择器");
    }
}

// ==================== 更新UI状态 ====================
function updateUIState(enabled) {
    ui.run(function() {
        if (controlWindow) {
            try {
                if (controlWindow.serverBtn) {
                    if (enabled && !isWatering) {
                        controlWindow.serverBtn.setText(config.serverList[config.currentIndex - 1]);
                        controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFFFFF"));
                        controlWindow.serverBtn.setTextColor(colors.parseColor("#1976D2"));
                    } else if (isSwitching || isWatering) {
                        controlWindow.serverBtn.setText("...");
                        controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFE0B2"));
                        controlWindow.serverBtn.setTextColor(colors.parseColor("#E65100"));
                    }
                }

                if (controlWindow.nextBtn) {
                    if (enabled && !isWatering) {
                        controlWindow.nextBtn.setText("▶");
                        controlWindow.nextBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
                        controlWindow.nextBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.nextBtn.setText(isWatering ? "浇水" : "切换中");
                        controlWindow.nextBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.nextBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    }
                    controlWindow.nextBtn.setClickable(enabled && !isWatering);
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
                controlWindow.serverBtn.setText(config.serverList[config.currentIndex - 1]);
                controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFFFFF"));
                controlWindow.serverBtn.setTextColor(colors.parseColor("#1976D2"));
            } catch (e) {
                console.log("更新显示失败: " + e.message);
            }
        }
    });
}

// ==================== 更新浇水UI状态 ====================
function updateWaterUIState(enabled) {
    ui.run(function() {
        if (controlWindow) {
            try {
                // 更新浇1按钮
                if (controlWindow.water1Btn) {
                    if (enabled && !isSwitching) {
                        controlWindow.water1Btn.setText("浇1");
                        controlWindow.water1Btn.setBackgroundColor(colors.parseColor("#4CAF50"));
                        controlWindow.water1Btn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.water1Btn.setText(isSwitching ? "切换" : "浇水中");
                        controlWindow.water1Btn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.water1Btn.setTextColor(colors.parseColor("#FFFFFF"));
                    }
                    controlWindow.water1Btn.setClickable(enabled && !isSwitching);
                }

                // 更新浇2按钮
                if (controlWindow.water2Btn) {
                    if (enabled && !isSwitching) {
                        controlWindow.water2Btn.setText("浇2");
                        controlWindow.water2Btn.setBackgroundColor(colors.parseColor("#2196F3"));
                        controlWindow.water2Btn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.water2Btn.setText(isSwitching ? "切换" : "浇水中");
                        controlWindow.water2Btn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.water2Btn.setTextColor(colors.parseColor("#FFFFFF"));
                    }
                    controlWindow.water2Btn.setClickable(enabled && !isSwitching);
                }
            } catch (e) {
                console.log("更新浇水UI失败: " + e.message);
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
                </vertical>
            </frame>
        );

        // 设置窗口位置（左边）
        var x = 30;
        var y = 100;

        console.log("控制窗口位置: (" + x + ", " + y + ")");
        controlWindow.setPosition(x, y);

        // 服务器按钮点击事件
        controlWindow.serverBtn.on("click", function() {
            console.log("用户点击服务器选择按钮");
            showServerDropdown();
        });

        // 下一个按钮点击事件
        controlWindow.nextBtn.on("click", function() {
            if (!isSwitching && !isWatering) {
                console.log("用户点击下一个按钮");
                executeServerSwitch();
            } else {
                toast(isSwitching ? "正在切换服务器" : "正在浇水");
            }
        });

        // 长按重置
        controlWindow.nextBtn.on("long-click", function() {
            if (!isSwitching && !isWatering) {
                console.log("用户长按重置按钮");
                config.currentIndex = 1;
                updateCurrentServerDisplay();
                toast("已重置为服务器 1");
            }
            return true;
        });

        // 浇1按钮点击事件（不点击进入农村）
        controlWindow.water1Btn.on("click", function() {
            if (!isWatering && !isSwitching) {
                console.log("用户点击浇1按钮（不进入农村）");
                executeWater1();
            } else {
                toast(isSwitching ? "正在切换服务器" : "正在浇水");
            }
        });

        // 浇2按钮点击事件（点击进入农村）
        controlWindow.water2Btn.on("click", function() {
            if (!isWatering && !isSwitching) {
                console.log("用户点击浇2按钮（进入农村）");
                executeWater2();
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

    console.log("\n========================================");
    console.log("脚本退出清理");
    console.log("总点击次数: " + clickCount);
    console.log("最终服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex - 1] + ")");
    console.log("========================================");

    if (controlWindow != null) {
        try { controlWindow.close(); } catch (e) { }
    }
}

// ==================== 主程序 ====================
events.on("exit", cleanup);

console.log("========================================");
console.log("自动切换服务器 + 自动浇水脚本启动");
console.log("设备信息:");
console.log("  - 原始屏幕: " + device.width + "x" + device.height);
console.log("  - 使用屏幕(横屏): " + config.screenWidth + "x" + config.screenHeight);
console.log("  - 设计分辨率: " + config.designWidth + "x" + config.designHeight);
console.log("  - 缩放比例: X=" + (config.screenWidth / config.designWidth).toFixed(3) +
    ", Y=" + (config.screenHeight / config.designHeight).toFixed(3));
console.log("  - 当前服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex - 1] + ")");
console.log("  - 浇水配置:");
console.log("    * 浇1: 不进入农村，直接滑动轮盘并点击浇水按钮");
console.log("    * 浇2: 进入农村，等待5秒，滑动轮盘并点击浇水按钮");
console.log("    * 进入农村按钮: (" + config.water.enterVillageBtn.left + "," + config.water.enterVillageBtn.top +
    "," + config.water.enterVillageBtn.right + "," + config.water.enterVillageBtn.bottom + ")");
console.log("    * 轮盘中心: (" +
    Math.round((config.water.joystick.left + config.water.joystick.right) / 2) + "," +
    Math.round((config.water.joystick.top + config.water.joystick.bottom) / 2) + ")");
console.log("    * 方向: 西北 (向量: " + config.water.moveSettings.directionX + ", " + config.water.moveSettings.directionY + ")");
console.log("    * 移动距离: " + config.water.moveSettings.distance + "px");
console.log("    * 移动持续: " + config.water.moveSettings.duration + "ms");
console.log("========================================\n");

createControlWindow();

// 保活
setInterval(function() {
    if (!isExiting) {
        var status = "脚本运行中 - 服务器: " + config.currentIndex +
            " (" + config.serverList[config.currentIndex - 1] + ")";
        if (isSwitching) status += " [切换中]";
        if (isWatering) status += " [浇水中:" + waterType + "]";
        console.log(status);
    }
}, 60000);

// 显示提示
setTimeout(function() {
    if (!isExiting) {
        toast("脚本已就绪 - 可切换服务器和浇水");
        console.log("用户提示已显示");
    }
}, 1000);