// ==================== 功能1：切换服务器 ====================
var common = require("./common.js");

// ==================== 农切 - 完整流程 ====================
function executeSwitch1(config, phoneInfo, setters) {
    if (setters.isSwitching && setters.isSwitching()) {
        console.log("用户点击停止切换");
        setters.setStopSwitch(true);
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

    setters.setStopSwitch(false);
    setters.setSwitching(true);
    setters.updateUI();

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

    var stepDelays = common.getStepDelays(config, phoneInfo);

    threads.start(function() {
        try {
            console.log("\n--- 步骤1: 点击返回按钮 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var backArea = common.getFixedCoordinate(config, phoneInfo, "farmBackBtn");
            common.humanClick(backArea, "返回按钮");
            common.humanDelay(stepDelays.afterBack);

            console.log("\n--- 步骤2: 确认返回大厅 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var farmReturnLobbyArea = common.getFixedCoordinate(config, phoneInfo, "farmReturnLobbyBtn");
            common.humanClick(farmReturnLobbyArea, "确认返回大厅");
            common.humanDelay(stepDelays.afterConfirmLobby);

            console.log("\n--- 步骤3: 点击设置 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var settingsArea = common.getFixedCoordinate(config, phoneInfo, "settingsBtn");
            common.humanClick(settingsArea, "设置按钮");
            common.humanDelay(stepDelays.afterSettings);

            console.log("\n--- 步骤4: 退出游戏 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var exitGameArea = common.getFixedCoordinate(config, phoneInfo, "exitGameBtn");
            common.humanClick(exitGameArea, "退出游戏按钮");
            common.humanDelay(stepDelays.afterExitGame);

            console.log("\n--- 步骤5: 确认退出 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var confirmExitArea = common.getFixedCoordinate(config, phoneInfo, "confirmExitBtn");
            common.humanClick(confirmExitArea, "确认退出按钮");
            common.humanDelay(stepDelays.afterConfirmExit);

            console.log("\n--- 步骤6: 确认换区 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var confirmChangeArea = common.getFixedCoordinate(config, phoneInfo, "changeServer");
            common.humanClick(confirmChangeArea, "确认换区按钮");
            common.humanDelay(stepDelays.afterChangeServer);

            console.log("\n--- 步骤7: 选择服务器 " + nextIndex + " ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var nextServerPos = common.getServerPosition(config, nextIndex);
            common.humanClick(nextServerPos, "服务器 " + nextIndex + " (" + config.serverList[nextIndex] + ")");

            config.currentIndex = nextIndex;
            common.humanDelay(stepDelays.afterSelectServer);

            console.log("\n--- 步骤8: 开始游戏 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var startGameArea = common.getFixedCoordinate(config, phoneInfo, "startGameBtn");
            common.humanClick(startGameArea, "开始游戏按钮");

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
            setters.setSwitching(false);
            setters.setStopSwitch(false);
            setters.updateUI();
        }
    });
}

// ==================== 主切 - 从步骤3开始 ====================
function executeSwitch2(config, phoneInfo, setters) {
    if (setters.isSwitching && setters.isSwitching()) {
        console.log("用户点击停止切换");
        setters.setStopSwitch(true);
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

    setters.setStopSwitch(false);
    setters.setSwitching(true);
    setters.updateUI();

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

    var stepDelays = common.getStepDelays(config, phoneInfo);

    threads.start(function() {
        try {
            console.log("\n--- 步骤3: 点击设置 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var settingsArea = common.getFixedCoordinate(config, phoneInfo, "settingsBtn");
            common.humanClick(settingsArea, "设置按钮");
            common.humanDelay(stepDelays.afterSettings);

            console.log("\n--- 步骤4: 退出游戏 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var exitGameArea = common.getFixedCoordinate(config, phoneInfo, "exitGameBtn");
            common.humanClick(exitGameArea, "退出游戏按钮");
            common.humanDelay(stepDelays.afterExitGame);

            console.log("\n--- 步骤5: 确认退出 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var confirmExitArea = common.getFixedCoordinate(config, phoneInfo, "confirmExitBtn");
            common.humanClick(confirmExitArea, "确认退出按钮");
            common.humanDelay(stepDelays.afterConfirmExit);

            console.log("\n--- 步骤6: 确认换区 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var confirmChangeArea = common.getFixedCoordinate(config, phoneInfo, "changeServer");
            common.humanClick(confirmChangeArea, "确认换区按钮");
            common.humanDelay(stepDelays.afterChangeServer);

            console.log("\n--- 步骤7: 选择服务器 " + nextIndex + " ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var nextServerPos = common.getServerPosition(config, nextIndex);
            common.humanClick(nextServerPos, "服务器 " + nextIndex + " (" + config.serverList[nextIndex] + ")");

            config.currentIndex = nextIndex;
            common.humanDelay(stepDelays.afterSelectServer);

            console.log("\n--- 步骤8: 开始游戏 ---");
            if (setters.getStopSwitch && setters.getStopSwitch()) {
                throw new Error("切换被用户中断");
            }
            var startGameArea = common.getFixedCoordinate(config, phoneInfo, "startGameBtn");
            common.humanClick(startGameArea, "开始游戏按钮");

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
            setters.setSwitching(false);
            setters.setStopSwitch(false);
            setters.updateUI();
        }
    });
}

module.exports = {
    executeSwitch1: executeSwitch1,
    executeSwitch2: executeSwitch2
};