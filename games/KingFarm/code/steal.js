// ==================== 功能6 - 偷菜 ====================
var common = require("./common.js");

// ==================== 解析方向 ====================
function parseDirection(dir) {
    switch(dir) {
        case '上': return { dx: 0, dy: -1 };
        case '下': return { dx: 0, dy: 1 };
        case '左': return { dx: -1, dy: 0 };
        case '右': return { dx: 1, dy: 0 };
        default: return { dx: 0, dy: 0 };
    }
}

// ==================== 执行偷菜路径 ====================
function executeStealPath(config, startX, startY, path, stepDistance, moveDuration, waitAfterMove, waitAfterSteal, stealArea, setters) {
    var currentX = startX;
    var currentY = startY;

    for (var i = 0; i < path.length; i++) {
        if (setters.getStopSteal && setters.getStopSteal()) {
            console.log("偷菜被中断");
            return false;
        }
        if (setters.isExiting && setters.isExiting()) {
            console.log("脚本退出中");
            return false;
        }

        var dir = path.charAt(i);
        var direction = parseDirection(dir);

        var targetX = currentX + direction.dx * stepDistance;
        var targetY = currentY + direction.dy * stepDistance;

        targetX = Math.max(0, Math.min(targetX, config.screenWidth));
        targetY = Math.max(0, Math.min(targetY, config.screenHeight));

        console.log("  移动 " + dir + ": (" + currentX + "," + currentY + ") -> (" + targetX + "," + targetY + ")");

        try {
            swipe(currentX, currentY, targetX, targetY, moveDuration);
        } catch (e) {
            console.error("滑动失败: " + e.message);
            return false;
        }

        currentX = targetX;
        currentY = targetY;

        if (setters.getStopSteal && setters.getStopSteal()) {
            console.log("偷菜被中断");
            return false;
        }

        if (waitAfterMove > 0) {
            sleep(waitAfterMove);
        }

        if (setters.getStopSteal && setters.getStopSteal()) {
            console.log("偷菜被中断");
            return false;
        }

        if (stealArea) {
            common.humanClick(stealArea, "偷菜按钮");
            if (waitAfterSteal > 0) {
                sleep(waitAfterSteal);
            }
        }

        if (setters.getStopSteal && setters.getStopSteal()) {
            console.log("偷菜被中断");
            return false;
        }
    }

    return true;
}

// ==================== 执行偷菜 ====================
function executeSteal(config, phoneInfo, setters) {
    if (setters.isStealing && setters.isStealing()) {
        console.log("用户点击停止偷菜");
        setters.setStopSteal(true);
        toast("正在停止偷菜...");
        return;
    }

    if (setters.isSwitching && setters.isSwitching()) {
        toast("正在切换服务器，无法偷菜");
        return;
    }

    if (setters.isWatering && setters.isWatering()) {
        toast("正在浇水，无法偷菜");
        return;
    }

    if (setters.isMoving && setters.isMoving()) {
        toast("正在自动移动，无法偷菜");
        return;
    }

    if (setters.isSettling && setters.isSettling()) {
        toast("正在结算返回，无法偷菜");
        return;
    }

    if (setters.isFarming && setters.isFarming()) {
        toast("正在领取农场奖励，无法偷菜");
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

    setters.setStopSteal(false);
    setters.setStealing(true);
    setters.updateUI();

    console.log("========================================");
    console.log("开始偷菜操作");
    console.log("========================================");

    var stealConfig = config.steal;
    var stealArea = common.getFixedCoordinate(config, phoneInfo, "stealBtn");
    var joystick = common.getJoystickCenter(config, phoneInfo);
    var startX = joystick.x;
    var startY = joystick.y;

    console.log("轮盘中心: (" + startX + "," + startY + ")");
    console.log("左半区路径: " + stealConfig.leftPath);
    console.log("右半区路径: " + stealConfig.rightPath);

    threads.start(function() {
        try {
            console.log("\n--- 步骤1: 偷左半区 ---");
            if (setters.getStopSteal && setters.getStopSteal()) {
                throw new Error("操作被用户中断");
            }

            var leftPath = stealConfig.leftPath;
            var result = executeStealPath(
                config,
                startX, startY,
                leftPath,
                stealConfig.stepDistance,
                stealConfig.moveDuration,
                stealConfig.waitAfterMove,
                stealConfig.waitAfterSteal,
                stealArea,
                setters
            );

            if (!result) {
                throw new Error("左半区偷菜失败或被中断");
            }

            if (setters.getStopSteal && setters.getStopSteal()) {
                throw new Error("操作被用户中断");
            }

            console.log("\n--- 步骤2: 移动到右半区 ---");
            var targetX = Math.min(config.screenWidth, startX + 300);
            console.log("  向右移动: (" + startX + "," + startY + ") -> (" + targetX + "," + startY + ")");
            try {
                swipe(startX, startY, targetX, startY, stealConfig.rightMoveDuration);
            } catch (e) {
                console.error("右移失败: " + e.message);
                throw new Error("移动到右半区失败");
            }

            if (setters.getStopSteal && setters.getStopSteal()) {
                throw new Error("操作被用户中断");
            }

            sleep(stealConfig.waitAfterMove);

            if (setters.getStopSteal && setters.getStopSteal()) {
                throw new Error("操作被用户中断");
            }

            console.log("\n--- 步骤3: 偷右半区 ---");
            var currentPos = common.getJoystickCenter(config, phoneInfo);
            var rightStartX = currentPos.x;
            var rightStartY = currentPos.y;

            var rightPath = stealConfig.rightPath;
            var result2 = executeStealPath(
                config,
                rightStartX, rightStartY,
                rightPath,
                stealConfig.stepDistance,
                stealConfig.moveDuration,
                stealConfig.waitAfterMove,
                stealConfig.waitAfterSteal,
                stealArea,
                setters
            );

            if (!result2) {
                throw new Error("右半区偷菜失败或被中断");
            }

            console.log("\n========================================");
            console.log("偷菜操作完成");
            console.log("========================================\n");

            toast("偷菜完成");

        } catch (e) {
            if (e.message && e.message.indexOf("被用户中断") >= 0) {
                console.log("\n========================================");
                console.log("偷菜被用户中断");
                console.log("========================================\n");
                toast("偷菜已停止");
            } else {
                console.error("\n========================================");
                console.error("偷菜失败: " + e.message);
                console.error("========================================\n");
                toast("偷菜失败: " + e.message);
            }
        } finally {
            setters.setStealing(false);
            setters.setStopSteal(false);
            setters.updateUI();
        }
    });
}

module.exports = {
    executeSteal: executeSteal
};