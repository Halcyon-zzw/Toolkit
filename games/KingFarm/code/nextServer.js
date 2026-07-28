// ==================== 防止重复运行 ====================
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
        // 已经是横屏
        screenWidth = width;
        screenHeight = height;
        console.log("当前为横屏模式");
    } else {
        // 竖屏模式，交换宽高
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
    // 设计分辨率（横屏：2400 * 1080）
    designWidth: 2400,
    designHeight: 1080,

    // ========== 实际屏幕像素（自动获取） ==========
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
        toStartGame: 1000
    }
};

// ==================== 全局变量 ====================
var controlWindow = null;
var isSwitching = false;
var isExiting = false;
var clickCount = 0; // 点击计数器

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

// ==================== 自动切换服务器逻辑 ====================
function executeServerSwitch() {
    if (isSwitching) {
        console.log("切换被阻止: 已有切换操作在进行中");
        toast("正在切换服务器，请稍候...");
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
        }
    });
}

// ==================== 显示服务器选择下拉列表 ====================
function showServerDropdown() {
    if (isSwitching) {
        toast("正在切换服务器，无法选择");
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
                    if (enabled) {
                        controlWindow.serverBtn.setText(config.serverList[config.currentIndex - 1]);
                        controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFFFFF"));
                        controlWindow.serverBtn.setTextColor(colors.parseColor("#1976D2"));
                        console.log("UI更新: 服务器显示 - " + config.serverList[config.currentIndex - 1]);
                    } else {
                        controlWindow.serverBtn.setText("...");
                        controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFE0B2"));
                        controlWindow.serverBtn.setTextColor(colors.parseColor("#E65100"));
                        console.log("UI更新: 显示切换中状态");
                    }
                }

                if (controlWindow.nextBtn) {
                    if (enabled) {
                        controlWindow.nextBtn.setText("▶");
                        controlWindow.nextBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
                        controlWindow.nextBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.nextBtn.setText("切换中");
                        controlWindow.nextBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.nextBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    }
                    controlWindow.nextBtn.setClickable(enabled);
                    console.log("UI更新: 按钮状态 - " + (enabled ? "可用" : "禁用"));
                }
            } catch(e) {
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
            } catch(e) {
                console.log("更新显示失败: " + e.message);
            }
        }
    });
}

// ==================== 创建控制窗口 ====================
function createControlWindow() {
    if (controlWindow != null) {
        try { controlWindow.close(); } catch(e) {}
    }

    console.log("创建控制窗口，屏幕尺寸: " + config.screenWidth + "x" + config.screenHeight);

    try {
        controlWindow = floaty.window(
            <frame>
                <horizontal bg="#E8F5E9" padding="8">
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
                            textSize="12"/>
                </horizontal>
            </frame>
        );

        // 设置窗口位置（左边中部）
        var x = 30;
        // var y = Math.round(config.screenHeight / 2 - 60);
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
            if (!isSwitching) {
                console.log("用户点击下一个按钮");
                executeServerSwitch();
            }
        });

        // 长按重置
        controlWindow.nextBtn.on("long-click", function() {
            if (!isSwitching) {
                console.log("用户长按重置按钮");
                config.currentIndex = 1;
                updateCurrentServerDisplay();
                toast("已重置为服务器 1");
            }
            return true;
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

    console.log("\n========================================");
    console.log("脚本退出清理");
    console.log("总点击次数: " + clickCount);
    console.log("最终服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex - 1] + ")");
    console.log("========================================");

    if (controlWindow != null) {
        try { controlWindow.close(); } catch(e) {}
    }
}

// ==================== 主程序 ====================
events.on("exit", cleanup);

console.log("========================================");
console.log("自动切换服务器脚本启动");
console.log("设备信息:");
console.log("  - 原始屏幕: " + device.width + "x" + device.height);
console.log("  - 使用屏幕(横屏): " + config.screenWidth + "x" + config.screenHeight);
console.log("  - 设计分辨率: " + config.designWidth + "x" + config.designHeight);
console.log("  - 缩放比例: X=" + (config.screenWidth/config.designWidth).toFixed(3) +
    ", Y=" + (config.screenHeight/config.designHeight).toFixed(3));
console.log("  - 当前服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex - 1] + ")");
console.log("========================================\n");

createControlWindow();

// 保活
setInterval(function() {
    // 每60秒输出一次状态
    if (!isExiting && !isSwitching) {
        console.log("脚本运行中 - 当前服务器: " + config.currentIndex +
            " (" + config.serverList[config.currentIndex - 1] + ")");
    }
}, 60000);

// 显示提示
setTimeout(function() {
    if (!isExiting) {
        toast("脚本已就绪 - 左边中部");
        console.log("用户提示已显示");
    }
}, 1000);