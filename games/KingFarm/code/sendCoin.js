// ==================== 功能8 - 送金币 ====================
var common = require("./common.js");

function executeSendCoin(config, phoneInfo, setters) {
    if (setters.isSendingCoin && setters.isSendingCoin()) {
        toast("正在送金币，请稍候...");
        return;
    }

    if (setters.isSwitching && setters.isSwitching()) {
        toast("正在切换服务器，无法送金币");
        return;
    }

    if (setters.isWatering && setters.isWatering()) {
        toast("正在浇水，无法送金币");
        return;
    }

    if (setters.isMoving && setters.isMoving()) {
        toast("正在自动移动，无法送金币");
        return;
    }

    if (setters.isSettling && setters.isSettling()) {
        toast("正在结算返回，无法送金币");
        return;
    }

    if (setters.isFarming && setters.isFarming()) {
        toast("正在领取农场奖励，无法送金币");
        return;
    }

    if (setters.isStealing && setters.isStealing()) {
        toast("正在偷菜，无法送金币");
        return;
    }

    if (setters.isClosingAd && setters.isClosingAd()) {
        toast("正在关闭广告，无法送金币");
        return;
    }

    if (setters.isMallReward && setters.isMallReward()) {
        toast("正在领取商城，无法送金币");
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

    setters.setSendingCoin(true);
    setters.updateUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始送金币");
            console.log("========================================");

            var stepDelays = common.getStepDelays(config, phoneInfo);

            // ========== 步骤1: 点击邮箱按钮 ==========
            console.log("\n--- 步骤1: 点击邮箱按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var mailboxArea = common.getFixedCoordinate(config, phoneInfo, "mailboxBtn");
            common.humanClick(mailboxArea, "邮箱按钮");
            common.humanDelay(stepDelays.afterMailboxBtn);

            // ========== 步骤2: 点击快速领取 ==========
            console.log("\n--- 步骤2: 点击快速领取 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var mailboxReceiveArea = common.getFixedCoordinate(config, phoneInfo, "mailboxReceiveBtn");
            common.humanClick(mailboxReceiveArea, "快速领取按钮");
            common.humanDelay(stepDelays.afterMailboxReceive);

            // ========== 步骤3: 点击空白区域_中底部 ==========
            console.log("\n--- 步骤3: 点击空白区域_中底部 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var blankArea = common.getFixedCoordinate(config, phoneInfo, "blankMidBottomArea");
            common.humanClick(blankArea, "空白区域_中底部");
            common.humanDelay(stepDelays.leastDelays);

            // ========== 步骤4: 点击快速赠送（复用快速领取坐标） ==========
            console.log("\n--- 步骤4: 点击快速赠送 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            // 复用 mailboxReceiveBtn 坐标
            common.humanClick(mailboxReceiveArea, "快速赠送按钮");
            common.humanDelay(stepDelays.afterMailboxGive);

            // ========== 步骤5: 点击空白区域_中底部 ==========
            console.log("\n--- 步骤5: 点击空白区域_中底部 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            common.humanClick(blankArea, "空白区域_中底部");
            common.humanDelay(stepDelays.leastDelays);

            // ========== 步骤6: 点击返回按钮 ==========
            console.log("\n--- 步骤6: 点击返回按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var backArea = common.getFixedCoordinate(config, phoneInfo, "farmBackBtn");
            common.humanClick(backArea, "返回按钮");

            console.log("\n========================================");
            console.log("送金币完成");
            console.log("========================================\n");

            toast("送金币完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("送金币失败: " + e.message);
            console.error("========================================\n");
            toast("送金币失败: " + e.message);
        } finally {
            setters.setSendingCoin(false);
            setters.updateUI();
        }
    });
}

module.exports = {
    executeSendCoin: executeSendCoin
};