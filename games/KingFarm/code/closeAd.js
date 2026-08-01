// ==================== 功能7 - 关闭广告 ====================
var common = require("./common.js");

function executeCloseAd(config, phoneInfo, setters) {
    if (setters.isClosingAd && setters.isClosingAd()) {
        toast("正在关闭广告，请稍候...");
        return;
    }

    if (setters.isSwitching && setters.isSwitching()) {
        toast("正在切换服务器，无法关闭广告");
        return;
    }

    if (setters.isWatering && setters.isWatering()) {
        toast("正在浇水，无法关闭广告");
        return;
    }

    if (setters.isMoving && setters.isMoving()) {
        toast("正在自动移动，无法关闭广告");
        return;
    }

    if (setters.isSettling && setters.isSettling()) {
        toast("正在结算返回，无法关闭广告");
        return;
    }

    if (setters.isFarming && setters.isFarming()) {
        toast("正在领取农场奖励，无法关闭广告");
        return;
    }

    if (setters.isStealing && setters.isStealing()) {
        toast("正在偷菜，无法关闭广告");
        return;
    }

    if (setters.isSendingCoin && setters.isSendingCoin()) {
        toast("正在送金币，无法关闭广告");
        return;
    }

    if (setters.isMallReward && setters.isMallReward()) {
        toast("正在领取商城，无法关闭广告");
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

    setters.setClosingAd(true);
    setters.updateUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始关闭广告");
            console.log("========================================");

            var stepDelays = common.getStepDelays(config, phoneInfo);

            // ========== 步骤1: 点击不再弹出按钮 ==========
            console.log("\n--- 步骤1: 点击不再弹出按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var adNotPopArea = common.getFixedCoordinate(config, phoneInfo, "adNotPopBtn");
            common.humanClick(adNotPopArea, "不再弹出按钮");
            common.humanDelay(stepDelays.leastDelays);

            // ========== 步骤2: 点击关闭广告按钮 ==========
            console.log("\n--- 步骤2: 点击关闭广告按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var closeAdArea = common.getFixedCoordinate(config, phoneInfo, "closeAdBtn");
            common.humanClick(closeAdArea, "关闭广告按钮");

            console.log("\n========================================");
            console.log("关闭广告完成");
            console.log("========================================\n");

            toast("关闭广告完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("关闭广告失败: " + e.message);
            console.error("========================================\n");
            toast("关闭广告失败: " + e.message);
        } finally {
            setters.setClosingAd(false);
            setters.updateUI();
        }
    });
}

module.exports = {
    executeCloseAd: executeCloseAd
};