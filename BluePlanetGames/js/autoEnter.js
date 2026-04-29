// ==================== 可配置参数 ====================
var config = {
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
    button: {
        x: 200, y: 200
    }
};

// ==================== 全局变量 ====================
var isRunning = true;
var isPaused = false;
var clickStartTime = 0;
var count = 0;
var controlWindow = null;
var stopBtn = null;
var startBtn = null;
var workThread = null;  // 工作线程
var isExiting = false;  // 退出标志

// ==================== 创建悬浮控制窗口（使用事件监听，避免轮询） ====================
function createControlWindow() {
    if (controlWindow != null) {
        try { controlWindow.close(); } catch(e) {}
    }

    controlWindow = floaty.window(
        <vertical layout_width="wrap_content" layout_height="wrap_content">
            <button id="stop" text="停" w="40" h="40" bg="#ff4444" textColor="#ffffff" textSize="12sp"/>
            <button id="start" text="始" w="40" h="40" bg="#44ff44" textColor="#000000" textSize="12sp" visibility="gone"/>
        </vertical>
    );

    var screenWidth = device.width;
    var targetX = screenWidth - config.button.x - 40;
    var targetY = config.button.y;
    controlWindow.setPosition(targetX, targetY);

    stopBtn = controlWindow.stop;
    startBtn = controlWindow.start;

    // 使用事件监听，避免轮询
    stopBtn.on("click", function() {
        if (!isPaused && isRunning) {
            pauseWork();
        }
    });

    startBtn.on("click", function() {
        if (isPaused) {
            resumeWork();
        }
    });

    console.log("控制窗口已创建");
}

// ==================== 暂停工作 ====================
function pauseWork() {
    isPaused = true;
    isRunning = false;
    clickStartTime = 0;

    ui.run(function() {
        stopBtn.setVisibility(8);
        startBtn.setVisibility(0);
    });

    toastLog("⏸️ 脚本已暂停，进入休眠");
    console.log("========== 已暂停 ==========");

    // 等待工作线程结束
    if (workThread != null && workThread.isAlive()) {
        workThread.interrupt();
        workThread = null;
    }
}

// ==================== 恢复工作 ====================
function resumeWork() {
    isPaused = false;
    isRunning = true;
    clickStartTime = new Date().getTime();

    ui.run(function() {
        stopBtn.setVisibility(0);
        startBtn.setVisibility(8);
    });

    toastLog("▶️ 唤醒休眠，脚本继续运行");
    console.log("========== 已唤醒 ==========");
    if (config.continuousClick.enabled) {
        console.log("⏰ 将连续点击 " + config.continuousClick.duration + " 秒后自动暂停");
    }

    // 启动新的工作线程
    startWorkThread();
}

// ==================== 启动工作线程 ====================
function startWorkThread() {
    if (workThread != null && workThread.isAlive()) {
        workThread.interrupt();
    }

    workThread = threads.start(function() {
        var localCount = count;  // 保持计数连续性

        while (!isPaused && isRunning && !isExiting) {
            // 检查是否超时
            if (config.continuousClick.enabled) {
                var now = new Date().getTime();
                if (clickStartTime > 0) {
                    var elapsedSeconds = (now - clickStartTime) / 1000;

                    // 每10秒打印一次剩余时间（降低输出频率）
                    if (Math.floor(elapsedSeconds) % 10 === 0 && elapsedSeconds > 0) {
                        var remaining = Math.max(0, config.continuousClick.duration - elapsedSeconds);
                        console.log("⏰ 剩余点击时间: " + remaining.toFixed(0) + " 秒");
                    }

                    if (elapsedSeconds >= config.continuousClick.duration) {
                        // 超时自动暂停
                        ui.run(function() {
                            pauseWork();
                        });
                        break;
                    }
                }
            }

            // 执行点击
            localCount++;
            count = localCount;

            var x = random(config.area.left, config.area.right) + random(-5, 5);
            var y = random(config.area.top, config.area.bottom) + random(-5, 5);

            click(x, y);

            // 降低输出频率
            if (localCount % 50 === 0) {
                var elapsed = clickStartTime > 0 ? ((new Date().getTime() - clickStartTime) / 1000).toFixed(0) : 0;
                console.log("📊 已完成 " + localCount + " 次点击 | 已运行 " + elapsed + " 秒");
            }

            // 随机延迟
            sleep(random(config.time.min, config.time.max));
        }

        console.log("工作线程已停止");
    });
}

// ==================== 退出清理 ====================
function cleanup() {
    isExiting = true;
    isRunning = false;
    isPaused = false;

    if (workThread != null && workThread.isAlive()) {
        workThread.interrupt();
    }

    if (controlWindow != null) {
        try { controlWindow.close(); } catch(e) {}
    }

    console.log("脚本已完全退出");
}

// ==================== 主程序 ====================
auto.waitFor();
console.show();

// 注册退出处理
events.on("exit", cleanup);

// 创建控制按钮
createControlWindow();

toastLog("═══════════════════════════");
toastLog("自动点击脚本已启动（省电优化版）");
toastLog("点击区域: (" + config.area.left + "," + config.area.top + ")");
toastLog("间隔: " + config.time.min + "~" + config.time.max + "ms");
if (config.continuousClick.enabled) {
    toastLog("⏰ 连续点击: " + config.continuousClick.duration + " 秒");
}
toastLog("═══════════════════════════");

// 启动工作线程
startWorkThread();

// 主线程只需等待，降低CPU占用
setInterval(function() {
    // 保活，实际无需做任何事
}, 60000);  // 每分钟唤醒一次，极低功耗