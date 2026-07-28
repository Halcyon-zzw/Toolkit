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

// ==================== 可配置参数 ====================
var config = {
    // ========== 屏幕配置 ==========
    // 设计分辨率（横屏：2400 * 1080）
    designWidth: 2400,
    designHeight: 1080,

    // ========== 实际屏幕像素 ==========
    // 注意：这里填写您手机的实际像素（长边在前，短边在后）
    screenWidth: 2400,   // 修改为您的手机长边像素
    screenHeight: 1080,  // 修改为您的手机短边像素

    // ========== 当前服务器序号 ==========
    currentIndex: 1,

    // ========== 服务器列表 ==========
    serverList: ["服务器 1", "服务器 2", "服务器 3", "服务器 4", "服务器 5", "服务器 6"],

    // ========== 延时配置（毫秒） ==========
    delays: {
        returnToLobby: 500,      // 返回大厅确认延时
        toSettings: 3000,        // 到设置界面延时
        exitGame: 1000,          // 退出游戏延时
        confirmExit: 500,        // 确认退出延时
        toServerSelect: 7000,    // 到选服界面延时
        toNextServer: 500,       // 选择下一个服务器延时
        toStartGame: 1000        // 开始游戏延时
    }
};

// ==================== 全局变量 ====================
var controlWindow = null;
var isSwitching = false;
var isExiting = false;
var spinnerDialog = null;

// ==================== 坐标转换函数 ====================
function scaleCoordinate(x, y, width, height) {
    var scaleX = config.screenWidth / config.designWidth;
    var scaleY = config.screenHeight / config.designHeight;

    return {
        left: Math.round(x * scaleX),
        top: Math.round(y * scaleY),
        right: Math.round(width * scaleX),
        bottom: Math.round(height * scaleY)
    };
}

// ==================== 人类行为模拟函数 ====================

// 随机延时（模拟人类思考时间）
function humanDelay(baseDelay) {
    var delay = baseDelay + random(-200, 200);
    delay = Math.max(100, delay);
    sleep(delay);
}

// 模拟人类点击（带随机位置的按压）
function humanClick(area) {
    try {
        // 在区域内随机选择坐标
        var x = random(area.left, area.right);
        var y = random(area.top, area.bottom);

        // 添加微小偏移（模拟手指的自然抖动）
        x += random(-2, 2);
        y += random(-2, 2);

        // 随机按压时间
        var pressTime = random(30, 80);

        console.log("人类点击坐标(" + x + ", " + y + "), 按压" + pressTime + "ms");

        // 使用随机按压时间
        press(x, y, pressTime);

        // 点击后随机停顿
        sleep(random(50, 100));

        return true;
    } catch (e) {
        console.log("点击失败: " + e.message);
        try {
            var x = random(area.left, area.right);
            var y = random(area.top, area.bottom);
            click(x, y);
            return true;
        } catch (e2) {
            console.log("备用点击也失败: " + e2.message);
            return false;
        }
    }
}

// ==================== 获取服务器位置 ====================
function getServerPosition(index) {
    // 设计分辨率下的服务器位置
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

    return scaleCoordinate(pos.x, pos.y, pos.width, pos.height);
}

// ==================== 自动切换服务器逻辑 ====================
function executeServerSwitch() {
    if (isSwitching) {
        toast("正在切换服务器，请稍候...");
        return;
    }

    // 检查无障碍服务
    if (auto.service === null) {
        toast("无障碍服务未开启，请先开启");
        auto.waitFor();
        sleep(1000);
        if (auto.service === null) {
            toast("无法开启无障碍服务");
            return;
        }
    }

    isSwitching = true;
    updateButtonStatus("切换中...", "#FF9800", false);

    var currentIndex = config.currentIndex;

    // 计算下一个序号（1-6循环）
    var nextIndex = currentIndex + 1;
    if (nextIndex > 6) {
        nextIndex = 1;
    }

    console.log("===== 开始切换服务器 " + currentIndex + " -> " + nextIndex + " =====");
    toast("切换服务器: " + config.serverList[currentIndex - 1] + " -> " + config.serverList[nextIndex - 1]);

    // 在新线程中执行
    threads.start(function() {
        try {
            // 步骤1: 点击返回按钮
            console.log("步骤1: 点击返回按钮");
            var backBtn = scaleCoordinate(80, 30, 240, 70);
            if (!humanClick(backBtn)) {
                throw new Error("点击返回按钮失败");
            }
            humanDelay(config.delays.returnToLobby);

            // 步骤2: 点击确认返回大厅
            console.log("步骤2: 点击确认返回大厅");
            var confirmLobby = scaleCoordinate(1260, 730, 1500, 780);
            if (!humanClick(confirmLobby)) {
                throw new Error("点击确认返回大厅失败");
            }
            humanDelay(config.delays.toSettings);

            // 步骤3: 点击设置
            console.log("步骤3: 点击设置");
            var settingsBtn = scaleCoordinate(2100, 30, 2140, 70);
            if (!humanClick(settingsBtn)) {
                throw new Error("点击设置失败");
            }
            humanDelay(config.delays.exitGame);

            // 步骤4: 点击退出游戏
            console.log("步骤4: 点击退出游戏");
            var exitGameBtn = scaleCoordinate(1730, 900, 2000, 940);
            if (!humanClick(exitGameBtn)) {
                throw new Error("点击退出游戏失败");
            }
            humanDelay(config.delays.confirmExit);

            // 步骤5: 点击确认退出
            console.log("步骤5: 点击确认退出");
            var confirmExitBtn = scaleCoordinate(1250, 730, 1500, 790);
            if (!humanClick(confirmExitBtn)) {
                throw new Error("点击确认退出失败");
            }
            humanDelay(config.delays.toServerSelect);

            // 步骤6: 确认换区
            console.log("步骤6: 确认换区");
            var confirmChangeServer = scaleCoordinate(1000, 710, 1450, 740);
            if (!humanClick(confirmChangeServer)) {
                throw new Error("点击确认换区失败");
            }
            humanDelay(config.delays.toNextServer);

            // 步骤7: 点击下一个服务器
            console.log("步骤7: 点击下一个服务器 (序号: " + nextIndex + ")");
            var nextServerPos = getServerPosition(nextIndex);
            if (!nextServerPos) {
                throw new Error("获取服务器位置失败");
            }

            console.log("服务器位置: ", JSON.stringify(nextServerPos));
            if (!humanClick(nextServerPos)) {
                throw new Error("点击下一个服务器失败");
            }

            // 更新当前序号
            config.currentIndex = nextIndex;
            humanDelay(config.delays.toStartGame);

            // 步骤8: 点击开始游戏
            console.log("步骤8: 点击开始游戏");
            var startGameBtn = scaleCoordinate(1020, 800, 1340, 870);
            if (!humanClick(startGameBtn)) {
                throw new Error("点击开始游戏失败");
            }

            console.log("===== 服务器切换完成，当前服务器: " + config.serverList[config.currentIndex - 1] + " =====");
            toast("切换完成！当前: " + config.serverList[config.currentIndex - 1]);

            // 更新显示
            updateCurrentServerDisplay();

        } catch (e) {
            console.log("切换服务器失败: " + e.message);
            toast("切换失败: " + e.message);
        } finally {
            isSwitching = false;
            updateButtonStatus("下一个", "#4CAF50", true);
        }
    });
}

// ==================== 显示服务器选择对话框 ====================
function showServerSelector() {
    if (isSwitching) {
        toast("正在切换服务器，无法选择");
        return;
    }

    try {
        // 关闭之前的对话框
        if (spinnerDialog) {
            try { spinnerDialog.dismiss(); } catch(e) {}
            spinnerDialog = null;
        }

        // 创建选择对话框
        let dialog = dialogs.build({
            title: "选择服务器",
            content: "请选择要切换的服务器:",
            positive: "确认切换",
            negative: "取消",
            neutral: "重置为1",
            checkBoxPrompt: "切换后自动开始游戏",
            checkBoxChecked: true,
            inputHint: "或输入序号(1-6)"
        });

        // 创建选择器
        let selectedIndex = config.currentIndex - 1;

        // 添加服务器列表
        let listView = ui.inflate(
            <vertical>
                <list id="serverList" layout_weight="1">
                    <text text="{{this}}"
                          textSize="16sp"
                          padding="15dp"
                          gravity="center"/>
                </list>
            </vertical>
        );

        // 设置数据
        listView.serverList.setDataSource(config.serverList);

        // 默认选中当前服务器
        listView.serverList.setSelection(selectedIndex);

        // 监听选择
        listView.serverList.on("item_click", function(item, position) {
            selectedIndex = position;
        });

        // 设置自定义视图
        dialog.customView = listView;

        // 显示对话框
        dialog.on("positive", function() {
            // 确认切换
            if (selectedIndex >= 0 && selectedIndex < config.serverList.length) {
                var targetIndex = selectedIndex + 1;
                if (targetIndex !== config.currentIndex) {
                    config.currentIndex = targetIndex;
                    updateCurrentServerDisplay();
                    toast("已选择: " + config.serverList[selectedIndex]);

                    // 如果勾选了自动开始游戏
                    if (dialog.getCheckBoxChecked()) {
                        executeServerSwitch();
                    }
                } else {
                    toast("与当前服务器相同，无需切换");
                }
            }
        });

        dialog.on("neutral", function() {
            // 重置为1
            config.currentIndex = 1;
            updateCurrentServerDisplay();
            toast("已重置为服务器 1");
        });

        dialog.on("negative", function() {
            // 取消
            toast("已取消选择");
        });

        dialog.show();

    } catch (e) {
        console.log("显示选择器失败: " + e.message);
        // 备用方案：使用简单的输入对话框
        showSimpleServerInput();
    }
}

// ==================== 备用输入方案 ====================
function showSimpleServerInput() {
    dialogs.input("请输入服务器序号(1-6)", "" + config.currentIndex, function(input) {
        if (input) {
            var num = parseInt(input);
            if (num >= 1 && num <= 6) {
                config.currentIndex = num;
                updateCurrentServerDisplay();
                toast("已切换到: " + config.serverList[num - 1]);
            } else {
                toast("请输入1-6之间的数字");
            }
        }
    });
}

// ==================== 更新UI显示 ====================
function updateButtonStatus(text, color, clickable) {
    ui.run(function() {
        if (controlWindow && controlWindow.nextBtn) {
            try {
                controlWindow.nextBtn.setText(text);
                controlWindow.nextBtn.setBackgroundColor(colors.parseColor(color));
                controlWindow.nextBtn.setClickable(clickable);
            } catch(e) {
                console.log("更新按钮状态失败: " + e.message);
            }
        }
    });
}

function updateCurrentServerDisplay() {
    ui.run(function() {
        if (controlWindow && controlWindow.serverSpinner) {
            try {
                controlWindow.serverSpinner.setText(config.serverList[config.currentIndex - 1]);
            } catch(e) {
                console.log("更新服务器显示失败: " + e.message);
            }
        }
    });
}

// ==================== 创建控制窗口 ====================
function createControlWindow() {
    if (controlWindow != null) {
        try { controlWindow.close(); } catch(e) {}
    }

    try {
        controlWindow = floaty.window(
            <frame gravity="center">
                <vertical gravity="center" padding="15dp"
                          bg="#80000000">
                    <!-- 标题 -->
                    <text text="服务器切换"
                          textSize="14sp"
                          textColor="#CCCCCC"
                          gravity="center"
                          marginBottom="8dp"/>

                    <!-- 服务器选择区域 -->
                    <horizontal gravity="center" marginBottom="8dp">
                        <text text="当前:"
                              textSize="15sp"
                              textColor="#CCCCCC"
                              marginRight="8dp"/>

                        <!-- 下拉按钮（模拟spinner） -->
                        <button id="serverSpinner"
                                text="{{config.serverList[config.currentIndex - 1]}}"
                                w="160dp"
                                h="45dp"
                                bg="#2196F3"
                                textColor="#ffffff"
                                textSize="16sp"
                                gravity="center"
                                padding="10dp"/>

                        <button id="dropdownArrow"
                                text="▼"
                                w="40dp"
                                h="45dp"
                                bg="#1976D2"
                                textColor="#ffffff"
                                textSize="14sp"/>
                    </horizontal>

                    <!-- 操作按钮 -->
                    <horizontal gravity="center">
                        <button id="nextBtn"
                                text="下一个"
                                w="100dp"
                                h="50dp"
                                bg="#4CAF50"
                                textColor="#ffffff"
                                textSize="16sp"
                                marginRight="10dp"
                                style="Widget.AppCompat.Button.Colored"/>

                        <button id="resetBtn"
                                text="重置"
                                w="80dp"
                                h="50dp"
                                bg="#FF5722"
                                textColor="#ffffff"
                                textSize="14sp"
                                style="Widget.AppCompat.Button.Colored"/>
                    </horizontal>
                </vertical>
            </frame>
        );

        // 设置窗口位置（屏幕顶部居中）
        controlWindow.setPosition(
            Math.round(config.screenWidth / 2 - 200),
            30
        );

        // 下拉按钮点击事件 - 显示选择器
        controlWindow.serverSpinner.on("click", function() {
            showServerSelector();
        });

        controlWindow.dropdownArrow.on("click", function() {
            showServerSelector();
        });

        // 下一个按钮点击事件
        controlWindow.nextBtn.on("click", function() {
            if (!isSwitching) {
                executeServerSwitch();
            }
        });

        // 重置按钮点击事件
        controlWindow.resetBtn.on("click", function() {
            config.currentIndex = 1;
            updateCurrentServerDisplay();
            toast("已重置为服务器 1");
        });

        // 长按重置序号
        controlWindow.nextBtn.on("long-click", function() {
            config.currentIndex = 1;
            updateCurrentServerDisplay();
            toast("服务器序号已重置为1");
            return true;
        });

        console.log("控制窗口已创建");
        toast("服务器切换脚本已就绪");

    } catch (e) {
        console.log("创建控制窗口失败: " + e.message);
        toast("创建控制窗口失败，使用简化版");
        createSimpleControlWindow();
    }
}

// ==================== 简化版控制窗口（备用方案） ====================
function createSimpleControlWindow() {
    try {
        controlWindow = floaty.window(
            <frame gravity="center">
                <vertical gravity="center" padding="10dp">
                    <button id="serverInfo"
                            text="当前: 服务器 1 (点击选择)"
                            w="200dp"
                            h="45dp"
                            bg="#2196F3"
                            textColor="#ffffff"
                            textSize="14sp"
                            marginBottom="5dp"/>
                    <button id="nextBtn"
                            text="下一个"
                            w="120dp"
                            h="50dp"
                            bg="#4CAF50"
                            textColor="#ffffff"
                            textSize="16sp"
                            style="Widget.AppCompat.Button.Colored"/>
                </vertical>
            </frame>
        );

        controlWindow.setPosition(
            Math.round(config.screenWidth / 2 - 200),
            30
        );

        controlWindow.serverInfo.on("click", function() {
            showSimpleServerInput();
        });

        controlWindow.nextBtn.on("click", function() {
            if (!isSwitching) {
                executeServerSwitch();
            }
        });

        controlWindow.nextBtn.on("long-click", function() {
            config.currentIndex = 1;
            toast("已重置");
            return true;
        });

    } catch (e) {
        console.log("创建简化窗口失败: " + e.message);
        toast("无法创建控制窗口");
    }
}

// ==================== 退出清理 ====================
function cleanup() {
    isExiting = true;
    isSwitching = false;

    // 关闭对话框
    if (spinnerDialog) {
        try { spinnerDialog.dismiss(); } catch(e) {}
        spinnerDialog = null;
    }

    if (controlWindow != null) {
        try { controlWindow.close(); } catch(e) {}
    }

    console.log("脚本已退出");
    toastLog("脚本已退出");
}

// ==================== 主程序 ====================
events.on("exit", cleanup);

// 显示屏幕信息
console.log("实际屏幕尺寸: " + config.screenWidth + " x " + config.screenHeight);
console.log("设计分辨率: " + config.designWidth + " x " + config.designHeight);
console.log("缩放比例: X=" + (config.screenWidth/config.designWidth).toFixed(3) +
    ", Y=" + (config.screenHeight/config.designHeight).toFixed(3));

// 创建控制窗口
createControlWindow();

console.log("========= 自动切换服务器脚本已启动 =========");
console.log("  - 当前服务器: " + config.serverList[config.currentIndex - 1]);
console.log("  - 点击服务器名称选择目标服务器");
console.log("  - 点击'下一个'自动切换");
console.log("  - 点击'重置'回到服务器1");
console.log("==========================================");

// 保活
setInterval(function() {}, 60000);

// 显示使用提示
setTimeout(function() {
    if (!isExiting) {
        toast("选择服务器或点击'下一个'开始切换");
    }
}, 1000);