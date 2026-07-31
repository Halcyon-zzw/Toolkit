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
    // 投递按钮在屏幕上的位置（右上角）
    deliverButton: {
        x: device.width - 150,
        y: 150,
        width: 120,
        height: 120
    },

    // 沟通按钮位置（扩大点击区域模拟手指点击）
    communicateBtn: {
        left: 540, top: 2190, right: 570, bottom: 2230
    },

    // 常用语按钮位置（扩大点击区域）
    commonPhraseBtn: {
        left: 65, top: 2265, right: 95, bottom: 2295
    },

    // 发送按钮位置（扩大点击区域）
    sendBtn: {
        left: 955, top: 1715, right: 985, bottom: 1745
    },

    // 返回按钮位置（扩大点击区域）
    backBtn: {
        left: 65, top: 155, right: 95, bottom: 185
    },

    // 步骤间延时范围（毫秒）- 模拟人类操作的不规律性
    stepDelay: {
        min: 800,
        max: 2000
    },

    // 点击按压时间范围（毫秒）- 模拟手指接触时间
    pressDuration: {
        min: 30,
        max: 120
    },

    // 投递冷却时间范围（毫秒）
    cooldownTime: {
        min: 3000,
        max: 6000
    },

    // 是否添加随机滑动（模拟浏览行为）
    enableRandomSwipe: true,

    // 失败重试次数
    maxRetryCount: 3
};

// ==================== 全局变量 ====================
var deliverControlWindow = null;
var isDelivering = false;
var isExiting = false;
var lastDeliverTime = 0;
var deliverThread = null;
var totalDeliverCount = 0;

// ==================== 人类行为模拟函数 ====================

// 随机延时（模拟人类思考时间）
function humanDelay(baseMin, baseMax) {
    var delay = random(baseMin || 500, baseMax || 2000);
    // 添加微小的随机波动
    delay += random(-100, 100);
    // 确保延时不为负
    delay = Math.max(200, delay);
    sleep(delay);
}

// 模拟人类点击（带随机位置的按压）
function humanClick(area) {
    try {
        // 在区域内随机选择坐标
        var x = random(area.left, area.right);
        var y = random(area.top, area.bottom);

        // 添加微小偏移（模拟手指的自然抖动）
        x += random(-3, 3);
        y += random(-3, 3);

        // 随机按压时间
        var pressTime = random(config.pressDuration.min, config.pressDuration.max);

        console.log("人类点击坐标(" + x + ", " + y + "), 按压" + pressTime + "ms");

        // 使用随机按压时间
        press(x, y, pressTime);

        // 点击后随机停顿（模拟手指离开后的短暂停留）
        sleep(random(50, 150));

        return true;
    } catch (e) {
        console.log("点击失败: " + e.message);
        // 备用方法
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

// 模拟页面浏览滚动
function simulateBrowsing() {
    if (!config.enableRandomSwipe) return;

    try {
        // 随机决定是否滑动
        if (random(0, 10) > 7) { // 30%概率添加滑动行为
            var startX = random(300, 700);
            var startY = random(800, 1200);
            var endX = startX + random(-100, 100);
            var endY = startY + random(-200, -100);
            var duration = random(200, 500);

            console.log("模拟浏览滑动");
            swipe(startX, startY, endX, endY, duration);
            sleep(random(300, 800));
        }
    } catch (e) {
        console.log("滑动模拟失败: " + e.message);
    }
}

// 页面加载等待（模拟页面加载的随机等待）
function waitForPageLoad() {
    var baseWait = random(config.stepDelay.min, config.stepDelay.max);
    // 有时候会多等一会（模拟分心）
    if (random(0, 10) > 8) {
        baseWait += random(500, 1500);
    }
    sleep(baseWait);
}

// ==================== 自动投递逻辑 ====================
function executeAutoDeliver() {
    // 检查冷却时间
    var currentTime = new Date().getTime();
    var cooldownPeriod = random(config.cooldownTime.min, config.cooldownTime.max);

    if (currentTime - lastDeliverTime < cooldownPeriod) {
        var waitTime = Math.ceil((cooldownPeriod - (currentTime - lastDeliverTime)) / 1000);
        toast("请等待" + waitTime + "秒后再投递");
        return;
    }

    // 检查是否正在投递
    if (isDelivering) {
        toast("投递正在进行中...");
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

    // 清理之前的线程
    if (deliverThread && deliverThread.isAlive()) {
        try {
            deliverThread.interrupt();
        } catch(e) {}
        sleep(200);
    }

    isDelivering = true;
    lastDeliverTime = currentTime;

    // 更新按钮状态
    updateButtonStatus("投递中...", "#FF9800", false);

    toast("开始自动投递简历");
    console.log("===== 第" + (totalDeliverCount + 1) + "次投递开始 =====");

    // 在新线程中执行
    deliverThread = threads.start(function() {
        var retryCount = 0;
        var success = false;

        while (retryCount < config.maxRetryCount && !success && !isExiting) {
            try {
                if (retryCount > 0) {
                    console.log("第" + retryCount + "次重试...");
                    toast("重试第" + retryCount + "次...");
                    sleep(random(1000, 2000));

                    // 重试前先尝试返回操作
                    try {
                        humanClick(config.backBtn);
                        sleep(500);
                        humanClick(config.backBtn);
                        sleep(500);
                    } catch(e) {}
                }

                // 模拟浏览行为
                simulateBrowsing();

                // 步骤1: 点击"沟通"按钮
                console.log("步骤1: 点击沟通按钮");
                if (!humanClick(config.communicateBtn)) {
                    throw new Error("点击沟通按钮失败");
                }
                waitForPageLoad();

                // 步骤2: 点击"常用语"按钮
                console.log("步骤2: 点击常用语按钮");
                if (!humanClick(config.commonPhraseBtn)) {
                    throw new Error("点击常用语按钮失败");
                }
                waitForPageLoad();

                // 添加微小延时（模拟查看常用语内容）
                humanDelay(300, 800);

                // 步骤3: 点击发送按钮
                console.log("步骤3: 点击发送按钮");
                if (!humanClick(config.sendBtn)) {
                    throw new Error("点击发送按钮失败");
                }
                waitForPageLoad();

                // 等待发送完成（模拟等待对方阅读）
                humanDelay(1000, 2000);

                // 步骤4: 点击两次返回按钮
                console.log("步骤4: 点击返回按钮（第1次）");
                humanClick(config.backBtn);
                humanDelay(300, 600);

                console.log("步骤4: 点击返回按钮（第2次）");
                humanClick(config.backBtn);
                waitForPageLoad();

                success = true;
                totalDeliverCount++;
                console.log("===== 第" + totalDeliverCount + "次投递完成 =====");
                toast("投递完成（第" + totalDeliverCount + "次）");

            } catch (e) {
                console.log("投递失败: " + e.message);
                retryCount++;

                if (retryCount >= config.maxRetryCount) {
                    toast("投递失败，已重试" + config.maxRetryCount + "次");
                }
            }
        }

        // 恢复状态
        isDelivering = false;
        updateButtonStatus("投递(" + totalDeliverCount + ")", "#4CAF50", true);
    });
}

// ==================== 更新按钮状态 ====================
function updateButtonStatus(text, color, clickable) {
    ui.run(function() {
        if (deliverControlWindow && deliverControlWindow.deliverBtn) {
            try {
                deliverControlWindow.deliverBtn.setText(text);
                deliverControlWindow.deliverBtn.setBackgroundColor(colors.parseColor(color));
                deliverControlWindow.deliverBtn.setClickable(clickable);
            } catch(e) {
                console.log("更新按钮状态失败: " + e.message);
            }
        }
    });
}

// ==================== 创建投递控制窗口 ====================
function createDeliverControlWindow() {
    if (deliverControlWindow != null) {
        try { deliverControlWindow.close(); } catch(e) {}
    }

    try {
        deliverControlWindow = floaty.window(
            <frame>
                <button id="deliverBtn" text="投递"
                        w="{{config.deliverButton.width}}px"
                        h="{{config.deliverButton.height}}px"
                        bg="#4CAF50" textColor="#ffffff"
                        textSize="16sp"
                        style="Widget.AppCompat.Button.Colored"/>
            </frame>
        );

        deliverControlWindow.setPosition(config.deliverButton.x, config.deliverButton.y);

        deliverControlWindow.deliverBtn.on("click", function() {
            executeAutoDeliver();
        });

        // 添加长按功能，用于手动重置计数
        deliverControlWindow.deliverBtn.on("long-click", function() {
            totalDeliverCount = 0;
            updateButtonStatus("投递", "#4CAF50", true);
            toast("投递计数已重置");
            return true;
        });

        console.log("投递控制窗口已创建");
        toast("投递按钮已就绪，长按可重置计数");

    } catch (e) {
        console.log("创建投递控制窗口失败: " + e.message);
        toast("创建控制按钮失败");
    }
}

// ==================== 退出清理 ====================
function cleanup() {
    isExiting = true;
    isDelivering = false;

    if (deliverThread && deliverThread.isAlive()) {
        try {
            deliverThread.interrupt();
        } catch(e) {}
    }

    if (deliverControlWindow != null) {
        try { deliverControlWindow.close(); } catch(e) {}
    }

    console.log("脚本已退出，共投递" + totalDeliverCount + "次");
    toastLog("脚本已退出，共投递" + totalDeliverCount + "次");
}

// ==================== 主程序 ====================
events.on("exit", cleanup);

// 创建投递控制按钮
createDeliverControlWindow();

console.log("=========智能投递脚本已启动=========");
console.log("  - 人类行为模拟已启用");
console.log("  - 随机延时范围: " + config.stepDelay.min + "-" + config.stepDelay.max + "ms");
console.log("  - 随机按压时间: " + config.pressDuration.min + "-" + config.pressDuration.max + "ms");
console.log("  - 随机浏览滑动: " + (config.enableRandomSwipe ? "开启" : "关闭"));
console.log("  - 失败重试次数: " + config.maxRetryCount);
console.log("=====================================");

// 保活
setInterval(function() {}, 60000);

// 显示使用提示
setTimeout(function() {
    if (!isExiting) {
        toast("点击按钮投递，长按重置计数");
    }
}, 1000);