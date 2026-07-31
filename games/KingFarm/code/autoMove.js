// ==================== 功能3 - 自动移动 ====================
var common = require("./common.js");

function getRandomDirection(config) {
    var minAngle = config.autoMove.minAngle;
    var maxAngle = config.autoMove.maxAngle;

    var angle = random(minAngle, maxAngle);
    var radians = angle * Math.PI / 180;

    var dirX = Math.cos(radians);
    var dirY = Math.sin(radians);

    console.log("随机方向: 角度=" + angle + "°, 向量=(" + dirX.toFixed(3) + "," + dirY.toFixed(3) + ")");

    return {
        angle: angle,
        x: dirX,
        y: dirY
    };
}

function executeAutoMove(config, phoneInfo, api) {
    if (api.isMoving && api.isMoving()) {
        toast("正在移动中...");
        return;
    }
    if (api.isSwitching && api.isSwitching()) {
        toast("正在切换服务器，无法移动");
        return;
    }
    if (api.isWatering && api.isWatering()) {
        toast("正在浇水，无法移动");
        return;
    }
    if (api.isSettling && api.isSettling()) {
        toast("正在结算返回，无法移动");
        return;
    }
    if (api.isFarming && api.isFarming()) {
        toast("正在领取农场奖励，无法移动");
        return;
    }
    if (api.isStealing && api.isStealing()) {
        toast("正在偷菜，无法移动");
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

    if (api.setStopAutoMove) {
        api.setStopAutoMove(false);
    }
    api.setMoving(true);
    api.updateUI();

    console.log("========================================");
    console.log("开始自动移动");
    console.log("========================================");

    var center = common.getJoystickCenter(config, phoneInfo);
    console.log("轮盘中心: (" + center.x + "," + center.y + ")");

    var s = api;

    threads.start(function() {
        try {
            while (s.isMoving && s.isMoving()) {
                var shouldStop = false;
                if (s.getStopAutoMove) {
                    shouldStop = s.getStopAutoMove();
                }
                if (shouldStop) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }

                var direction = getRandomDirection(config);
                var distance = config.autoMove.distance;
                var moveDuration = config.autoMove.moveDuration;

                var targetX = center.x + Math.round(direction.x * distance);
                var targetY = center.y + Math.round(direction.y * distance);

                targetX = Math.max(0, Math.min(targetX, config.screenWidth));
                targetY = Math.max(0, Math.min(targetY, config.screenHeight));

                try {
                    swipe(center.x, center.y, targetX, targetY, moveDuration);
                } catch (e) {
                    console.error("滑动执行失败: " + e.message);
                }

                if (s.getStopAutoMove && s.getStopAutoMove()) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }
                if (!s.isMoving || !s.isMoving()) {
                    console.log("移动已停止，退出循环");
                    break;
                }

                var sleepStart = Date.now();
                var sleepDuration = config.autoMove.sleepDuration;

                while (Date.now() - sleepStart < sleepDuration) {
                    if (s.getStopAutoMove && s.getStopAutoMove()) {
                        console.log("检测到停止标志，中断休眠");
                        break;
                    }
                    if (!s.isMoving || !s.isMoving()) {
                        console.log("移动已停止，退出循环");
                        break;
                    }
                    sleep(100);
                }

                if (s.getStopAutoMove && s.getStopAutoMove()) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }
                if (!s.isMoving || !s.isMoving()) {
                    console.log("移动已停止，退出循环");
                    break;
                }
            }

        } catch (e) {
            console.error("自动移动异常: " + e.message);
        } finally {
            try {
                var center2 = common.getJoystickCenter(config, phoneInfo);
                press(center2.x, center2.y, 50);
            } catch(e) {}

            s.setMoving(false);
            if (s.setStopAutoMove) {
                s.setStopAutoMove(false);
            }
            s.updateUI();
        }
    });
}

function stopAutoMoveFunction(api) {
    console.log("请求停止自动移动");
    if (api.setStopAutoMove) {
        api.setStopAutoMove(true);
    }
    api.setMoving(false);
    api.updateUI();
}

module.exports = {
    executeAutoMove: executeAutoMove,
    stopAutoMoveFunction: stopAutoMoveFunction
};