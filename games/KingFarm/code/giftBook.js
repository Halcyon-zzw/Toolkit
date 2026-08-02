// ==================== 功能10 - 领取礼册 ====================
var common = require("./common.js");

function executeGiftBook(config, phoneInfo, setters) {
    if (setters.isGiftBooking && setters.isGiftBooking()) {
        toast("正在领取礼册，请稍候...");
        return;
    }

    if (setters.isSwitching && setters.isSwitching()) {
        toast("正在切换服务器，无法领取礼册");
        return;
    }

    if (setters.isWatering && setters.isWatering()) {
        toast("正在浇水，无法领取礼册");
        return;
    }

    if (setters.isMoving && setters.isMoving()) {
        toast("正在自动移动，无法领取礼册");
        return;
    }

    if (setters.isSettling && setters.isSettling()) {
        toast("正在结算返回，无法领取礼册");
        return;
    }

    if (setters.isFarming && setters.isFarming()) {
        toast("正在领取农场奖励，无法领取礼册");
        return;
    }

    if (setters.isStealing && setters.isStealing()) {
        toast("正在偷菜，无法领取礼册");
        return;
    }

    if (setters.isClosingAd && setters.isClosingAd()) {
        toast("正在关闭广告，无法领取礼册");
        return;
    }

    if (setters.isSendingCoin && setters.isSendingCoin()) {
        toast("正在送金币，无法领取礼册");
        return;
    }

    if (setters.isMallReward && setters.isMallReward()) {
        toast("正在领取商城，无法领取礼册");
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

    setters.setGiftBooking(true);
    setters.updateUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始领取礼册");
            console.log("========================================");

            var stepDelays = common.getStepDelays(config, phoneInfo);

            // ========== 步骤1: 点击礼册按钮 ==========
            console.log("\n--- 步骤1: 点击礼册按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var giftBookArea = common.getFixedCoordinate(config, phoneInfo, "giftBookBtn");
            common.humanClick(giftBookArea, "礼册按钮");
            common.humanDelay(stepDelays.leastDelays);

            // ========== 步骤2: 点击领取礼册按钮 ==========
            console.log("\n--- 步骤2: 点击领取礼册按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var receiveGiftBookArea = common.getFixedCoordinate(config, phoneInfo, "receiveGiftBookBtn");
            common.humanClick(receiveGiftBookArea, "领取礼册按钮");
            common.humanDelay(stepDelays.leastDelays);

            // ========== 步骤3: 点击空白区域_中底部 ==========
            console.log("\n--- 步骤3: 点击空白区域_中底部 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var blankArea = common.getFixedCoordinate(config, phoneInfo, "blankMidBottomArea");
            common.humanClick(blankArea, "空白区域_中底部");
            common.humanDelay(stepDelays.leastDelays);

            // ========== 步骤4: 点击返回按钮 ==========
            console.log("\n--- 步骤4: 点击返回按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var backArea = common.getFixedCoordinate(config, phoneInfo, "farmBackBtn");
            common.humanClick(backArea, "返回按钮");

            console.log("\n========================================");
            console.log("领取礼册完成");
            console.log("========================================\n");

            toast("领取礼册完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("领取礼册失败: " + e.message);
            console.error("========================================\n");
            toast("领取礼册失败: " + e.message);
        } finally {
            setters.setGiftBooking(false);
            setters.updateUI();
        }
    });
}

module.exports = {
    executeGiftBook: executeGiftBook
};