// ==================== 功能5 - 领取农场奖励 ====================
var common = require("./common.js");

// ==================== 判断是否为周末模式（周五18:00 - 周日24:00） ====================
function isWeekendMode() {
    var now = new Date();
    var day = now.getDay();     // 0=周日, 1=周一, 2=周二, 3=周三, 4=周四, 5=周五, 6=周六
    var hour = now.getHours();
    var minutes = now.getMinutes();

    console.log("当前时间: 周" + ["日","一","二","三","四","五","六"][day] + " " + hour + ":" + minutes);

    // 周五 18:00 开始
    if (day === 5) {
        if (hour > 18 || (hour === 18 && minutes >= 0)) {
            console.log("进入周末模式（周五18:00后）");
            return true;
        }
        return false;
    }
    // 周六整天
    if (day === 6) {
        console.log("进入周末模式（周六）");
        return true;
    }
    // 周日 24:00 结束（即周一 00:00）
    if (day === 0) {
        if (hour < 24) {
            console.log("进入周末模式（周日）");
            return true;
        }
        return false;
    }
    // 其他时间（周一至周五18:00前）
    console.log("非周末模式");
    return false;
}

// ==================== 执行周末模式领取流程 ====================
function executeWeekendMode(config, phoneInfo, stepDelays, farmReward, setters) {
    console.log("===== 执行周末模式领取流程 =====");

    // ========== 步骤: 点击领取奖励1 ==========
    console.log("\n--- 点击领取奖励1 ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    var claimArea1 = common.getFixedCoordinate(config, phoneInfo, "claimFarmRewardBtn1");
    common.humanClick(claimArea1, "领取奖励按钮1");
    common.humanDelay(stepDelays.leastDelays);

    // ========== 步骤: 点击空白区域 ==========
    console.log("\n--- 点击空白区域 ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    var blankArea = common.getFixedCoordinate(config, phoneInfo, "farmRewardBlankArea");
    common.humanClick(blankArea, "空白区域");
    common.humanDelay(stepDelays.leastDelays);

    // ========== 步骤: 点击空白区域 ==========
    console.log("\n--- 点击空白区域 ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    common.humanClick(blankArea, "空白区域");
    common.humanDelay(stepDelays.leastDelays);

    // ========== 步骤: 点击领取奖励2 ==========
    console.log("\n--- 点击领取奖励2 ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    var claimArea2 = common.getFixedCoordinate(config, phoneInfo, "claimFarmRewardBtn2");
    common.humanClick(claimArea2, "领取奖励按钮2");
    common.humanDelay(stepDelays.leastDelays);

    // ========== 步骤: 点击空白区域 ==========
    console.log("\n--- 点击空白区域 ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    common.humanClick(blankArea, "空白区域");
    common.humanDelay(stepDelays.leastDelays);

    console.log("===== 周末模式领取流程完成 =====");
}

// ==================== 执行普通模式领取流程（老逻辑） ====================
function executeNormalMode(config, phoneInfo, farmReward, setters) {
    console.log("===== 执行普通模式领取流程（老逻辑） =====");

    // ========== 步骤: 点击领取奖励 ==========
    console.log("\n--- 点击领取奖励 ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    var claimArea = common.getFixedCoordinate(config, phoneInfo, "claimFarmRewardBtn");
    common.humanClick(claimArea, "领取奖励按钮");
    common.humanDelay(farmReward.waitAfterClaim);

    // ========== 步骤: 点击空白区域（第1次） ==========
    console.log("\n--- 点击空白区域（第1次） ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    var blankArea = common.getFixedCoordinate(config, phoneInfo, "farmRewardBlankArea");
    common.humanClick(blankArea, "空白区域(第1次)");
    common.humanDelay(farmReward.waitAfterBlank);

    // ========== 步骤: 点击空白区域（第2次） ==========
    console.log("\n--- 点击空白区域（第2次） ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    common.humanClick(blankArea, "空白区域(第2次)");
    common.humanDelay(farmReward.waitAfterBlank);

    console.log("===== 普通模式领取流程完成 =====");
}

// ==================== 执行返回流程 ====================
function executeBackFlow(config, phoneInfo, farmReward, setters) {
    console.log("===== 执行返回流程 =====");

    // ========== 步骤: 点击返回（第1次） ==========
    console.log("\n--- 点击返回（第1次） ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    var backArea = common.getFixedCoordinate(config, phoneInfo, "farmBackBtn");
    common.humanClick(backArea, "返回按钮(第1次)");
    common.humanDelay(farmReward.waitAfterBack);

    // ========== 步骤: 点击返回（第2次） ==========
    console.log("\n--- 点击返回（第2次） ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    common.humanClick(backArea, "返回按钮(第2次)");
    common.humanDelay(farmReward.waitAfterBack);

    // ========== 步骤: 点击返回大厅 ==========
    console.log("\n--- 点击返回大厅 ---");
    if (setters.isExiting && setters.isExiting()) {
        throw new Error("操作被用户中断");
    }
    var farmReturnLobbyArea = common.getFixedCoordinate(config, phoneInfo, "farmReturnLobbyBtn");
    common.humanClick(farmReturnLobbyArea, "返回大厅按钮");

    console.log("===== 返回流程完成 =====");
}

// ==================== 主函数：领取农场奖励 ====================
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

    // 判断是否为周末模式
    var isWeekend = isWeekendMode();
    console.log("当前模式: " + (isWeekend ? "周末模式" : "普通模式"));

    setters.setFarming(true);
    setters.updateUI();

    threads.start(function() {
        try {
            console.log("========================================");
            console.log("开始领取农场奖励");
            console.log("========================================");

            var stepDelays = common.getStepDelays(config, phoneInfo);
            var farmReward = config.farmReward;

            // ========== 步骤1: 点击进入农场按钮 ==========
            console.log("\n--- 步骤1: 点击进入农场按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var enterFarmArea = common.getFixedCoordinate(config, phoneInfo, "enterFarmBtn");
            common.humanClick(enterFarmArea, "进入农场按钮");

            // ========== 步骤2: 等待进入农场 ==========
            common.humanDelay(stepDelays.enterFarmWait);
            console.log("等待完成，继续执行");

            // ========== 步骤3: 点击奖励按钮 ==========
            console.log("\n--- 步骤3: 点击奖励按钮 ---");
            if (setters.isExiting && setters.isExiting()) {
                throw new Error("操作被用户中断");
            }
            var rewardArea = common.getFixedCoordinate(config, phoneInfo, "farmRewardBtn");
            common.humanClick(rewardArea, "奖励按钮");
            common.humanDelay(farmReward.waitAfterReward);

            // ========== 步骤4: 根据模式执行不同的领取逻辑 ==========
            if (isWeekend) {
                // 周末模式
                executeWeekendMode(config, phoneInfo, stepDelays, farmReward, setters);
            } else {
                // 普通模式（老逻辑）
                executeNormalMode(config, phoneInfo, farmReward, setters);
            }

            // ========== 步骤5: 执行返回流程 ==========
            executeBackFlow(config, phoneInfo, farmReward, setters);

            console.log("\n========================================");
            console.log("领取农场奖励完成");
            console.log("========================================\n");

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