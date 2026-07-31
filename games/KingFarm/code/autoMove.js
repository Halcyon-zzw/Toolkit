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

function executeAutoMove(config, phoneInfo, setters) {
    if (setters.isMoving && setters.isMoving()) {
        toast("正在移动中...");
        return;
    }
    if (setters.isSwitching && setters.isSwitching()) {
        toast("正在切换服务器，无法移动");
        return;
    }
    if (setters.isWatering && setters.isWatering()) {
        toast("正在浇水，无法移动");
        return;
    }
    if (setters.isSettling && setters.isSettling()) {
        toast("正在结算返回，无法移动");
        return;
    }
    if (setters.isFarming && setters.isFarming()) {
        toast("正在领取农场奖励，无法移动");
        return;
    }
    if (setters.isStealing && setters.isStealing()) {
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

    setters.setStopAutoMove(false);
    setters.setMoving(true);
    setters.updateUI();

    console.log("========================================");
    console.log("开始自动移动");
    console.log("========================================");

    var center = common.getJoystickCenter(config, phoneInfo);
    console.log("轮盘中心: (" + center.x + "," + center.y + ")");

    threads.start(function() {
        try {
            while (setters.isMoving && setters.isMoving() && !setters.getStopAutoMove && !setters.getStopAutoMove()) {
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

                if (setters.getStopAutoMove && setters.getStopAutoMove()) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }

                var sleepStart = Date.now();
                var sleepDuration = config.autoMove.sleepDuration;

                while (Date.now() - sleepStart < sleepDuration) {
                    if (setters.getStopAutoMove && setters.getStopAutoMove()) {
                        console.log("检测到停止标志，中断休眠");
                        break;
                    }
                    if (!setters.isMoving || !setters.isMoving()) {
                        console.log("移动已停止，退出循环");
                        break;
                    }
                    sleep(100);
                }
                if (setters.getStopAutoMove && setters.getStopAutoMove()) {
                    console.log("检测到停止标志，退出移动循环");
                    break;
                }
                if (!setters.isMoving || !setters.isMoving()) {
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

            setters.setMoving(false);
            setters.updateUI();
        }
    });
}

function stopAutoMoveFunction(setters) {
    console.log("请求停止自动移动");
    setters.setStopAutoMove(true);
    setters.setMoving(false);
    setters.updateUI();
}

module.exports = {
    executeAutoMove: executeAutoMove,
    stopAutoMoveFunction: stopAutoMoveFunction
};