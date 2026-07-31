// ==================== 功能2/3：浇水 ====================
var common = require("./common.js");

// ==================== 农浇 - 不进入农场 ====================
function executeWater1(config, phoneInfo, setters) {
    if (setters.isWatering && setters.isWatering()) {
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

    setters.setWatering(true);
    setters.updateUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始浇水操作（农浇 - 不进入农场）");
            console.log("========================================");

            console.log("\n--- 步骤1: 操作轮盘向西北方向移动 ---");
            if (!common.executeJoystickMove(config, phoneInfo)) {
                throw new Error("步骤1失败: 轮盘移动操作失败");
            }
            sleep(800);
            console.log("\n--- 步骤2: 点击浇水按钮 ---");
            var waterBtnArea = common.getFixedCoordinate(config, phoneInfo, "waterBtn");
            common.humanClick(waterBtnArea, "浇水按钮");
            sleep(300);
            common.humanClick(waterBtnArea, "浇水按钮");
            toast("农浇完成");
        } catch (e) {
            console.error("农浇失败: " + e.message);
            toast("农浇失败: " + e.message);
        } finally {
            setters.setWatering(false);
            setters.updateUI();
        }
    });
}

// ==================== 主浇 - 进入农场 ====================
function executeWater2(config, phoneInfo, setters) {
    if (setters.isWatering && setters.isWatering()) {
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

    setters.setWatering(true);
    setters.updateUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始浇水操作（主浇 - 进入农场）");
            console.log("========================================");

            var stepDelays = common.getStepDelays(config, phoneInfo);

            console.log("\n--- 步骤1: 点击进入农场按钮 ---");
            var enterFarmArea = common.getFixedCoordinate(config, phoneInfo, "enterFarmBtn");
            common.humanClick(enterFarmArea, "进入农场按钮");

            console.log("\n--- 步骤2: 等待进入农场 (" + stepDelays.enterFarmWait + "ms) ---");
            common.humanDelay(stepDelays.enterFarmWait);
            console.log("等待完成，继续执行浇水操作");

            sleep(500);

            console.log("\n--- 步骤3: 操作轮盘向西北方向移动 ---");
            if (!common.executeJoystickMove(config, phoneInfo)) {
                throw new Error("步骤3失败: 轮盘移动操作失败");
            }

            console.log("等待 800ms 后点击浇水按钮...");
            sleep(800);

            console.log("\n--- 步骤4: 点击浇水按钮（点击两次） ---");
            var waterBtnArea = common.getFixedCoordinate(config, phoneInfo, "waterBtn");
            common.humanClick(waterBtnArea, "浇水按钮(第1次)");
            sleep(300);
            common.humanClick(waterBtnArea, "浇水按钮(第2次)");

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
            setters.setWatering(false);
            setters.updateUI();
        }
    });
}

module.exports = {
    executeWater1: executeWater1,
    executeWater2: executeWater2
};