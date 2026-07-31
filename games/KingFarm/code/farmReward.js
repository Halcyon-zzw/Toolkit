// ==================== 功能5 - 领取农场奖励 ====================
var common = require("./common.js");

function executeFarmReward(config, phoneInfo, setters) {
    if (setters.isFarming && setters.isFarming()) {
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

    setters.setFarming(true);
    setters.updateUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始领取农场奖励");
            console.log("========================================");

            var stepDelays = common.getStepDelays(config, phoneInfo);
            var farmReward = config.farmReward;

            console.log("\n--- 步骤1: 点击进入农场按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var enterFarmArea = common.getFixedCoordinate(config, phoneInfo, "enterFarmBtn");
            common.humanClick(enterFarmArea, "进入农场按钮");

            common.humanDelay(stepDelays.enterFarmWait);
            console.log("等待完成，继续执行");

            console.log("\n--- 步骤3: 点击奖励按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var rewardArea = common.getFixedCoordinate(config, phoneInfo, "farmRewardBtn");
            common.humanClick(rewardArea, "奖励按钮");

            common.humanDelay(farmReward.waitAfterReward);

            console.log("\n--- 步骤5: 点击领取奖励 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var claimArea = common.getFixedCoordinate(config, phoneInfo, "claimFarmRewardBtn");
            common.humanClick(claimArea, "领取奖励按钮");

            common.humanDelay(farmReward.waitAfterClaim);

            console.log("\n--- 步骤7: 点击空白区域（第1次） ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var farmRewardBlankArea = common.getFixedCoordinate(config, phoneInfo, "farmRewardBlankArea");
            common.humanClick(farmRewardBlankArea, "空白区域(第1次)");

            common.humanDelay(farmReward.waitAfterBlank);

            console.log("\n--- 步骤9: 点击空白区域（第2次） ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            common.humanClick(farmRewardBlankArea, "空白区域(第2次)");

            common.humanDelay(farmReward.waitAfterBlank);

            console.log("\n--- 步骤11: 点击返回（第1次） ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var backArea = common.getFixedCoordinate(config, phoneInfo, "farmBackBtn");
            common.humanClick(backArea, "返回按钮(第1次)");

            common.humanDelay(farmReward.waitAfterBack);

            console.log("\n--- 步骤13: 点击返回（第2次） ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            common.humanClick(backArea, "返回按钮(第2次)");

            common.humanDelay(farmReward.waitAfterBack);

            console.log("\n--- 步骤15: 点击返回大厅 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var farmReturnLobbyArea = common.getFixedCoordinate(config, phoneInfo, "farmReturnLobbyBtn");
            common.humanClick(farmReturnLobbyArea, "返回大厅按钮");
            toast("农场奖励领取完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("领取农场奖励失败: " + e.message);
            console.error("========================================\n");
            toast("领取农场奖励失败: " + e.message);
        } finally {
            setters.setFarming(false);
            setters.updateUI();
        }
    });
}

module.exports = {
    executeFarmReward: executeFarmReward
};