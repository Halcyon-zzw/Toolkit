// ==================== 功能4 - 结算返回 ====================
var common = require("./common.js");

function executeSettlement(config, phoneInfo, setters) {
    if (setters.isSettling && setters.isSettling()) {
        toast("正在结算返回，请稍候...");
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

    setters.setSettling(true);
    setters.updateUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始结算返回操作");
            console.log("========================================");

            var settlement = config.settlement;

            console.log("\n--- 步骤1: 点击返回大厅按钮 (点击" + settlement.clickCount + "次, 间隔" + settlement.clickInterval + "ms) ---");
            var returnLobbyArea = common.getFixedCoordinate(config, phoneInfo, "settleReturnLobbyBtn");

            common.humanClick(returnLobbyArea, "第一次点击");
            sleep(settlement.firstClickInterval);

            for (var i = 0; i < settlement.clickCount; i++) {
                if (setters.isExiting && setters.isExiting()) {
                    throw new Error("操作被用户中断");
                }
                console.log("  第" + (i + 1) + "次点击");
                common.humanClick(returnLobbyArea, "返回大厅按钮(第" + (i + 1) + "次)");
                if (i < settlement.clickCount - 1) {
                    sleep(settlement.clickInterval);
                }
            }

            common.humanDelay(settlement.waitAfterClick);

            console.log("\n--- 步骤3: 点击确认返回 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var confirmReturnArea = common.getFixedCoordinate(config, phoneInfo, "settleConfirmReturnBtn");
            common.humanClick(confirmReturnArea, "确认返回按钮");
            toast("结算返回完成");

        } catch (e) {
            console.error("\n========================================");
            console.error("结算返回失败: " + e.message);
            console.error("========================================\n");
            toast("结算返回失败: " + e.message);
        } finally {
            setters.setSettling(false);
            setters.updateUI();
        }
    });
}

module.exports = {
    executeSettlement: executeSettlement
};