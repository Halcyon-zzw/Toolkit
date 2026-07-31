"auto";

// ==================== 导入模块 ====================
var configModule = require("./config.js");
var common = require("./common.js");
var ui = require("./ui.js");

// ==================== 获取配置 ====================
var phoneInfo = configModule.phoneInfo;
var screenSize = configModule.screenSize;
var config = configModule.config;

// ==================== 权限请求 ====================
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

// ==================== 全局退出标志 ====================
var isExiting = false;

// ==================== 退出清理 ====================
function cleanup() {
    isExiting = true;
    console.log("\n========================================");
    console.log("脚本退出清理");
    console.log("最终服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex] + ")");
    console.log("========================================");
}

events.on("exit", cleanup);

// ==================== 主程序 ====================
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
var stepDelays = common.getStepDelays(config, phoneInfo);
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

// ==================== 创建UI ====================
ui.createControlWindow(config, phoneInfo);
ui.createToggleWindow();

// ==================== 保活 ====================
setInterval(function() {
    if (!isExiting) {
        var status = "脚本运行中 - 服务器: " + config.currentIndex +
            " (" + config.serverList[config.currentIndex] + ")";
        var states = ui.getStates();
        if (states.isSwitching) status += " [切换中]";
        if (states.isWatering) status += " [浇水中]";
        if (states.isMoving) status += " [移动中]";
        if (states.isSettling) status += " [结算中]";
        if (states.isFarming) status += " [农场领取中]";
        if (states.isStealing) status += " [偷菜中]";
        console.log(status);
    }
}, 60000);

setTimeout(function() {
    if (!isExiting) {
        toast("脚本已就绪 - 可切换服务器、浇水和自动移动");
        console.log("用户提示已显示");
    }
}, 1000);