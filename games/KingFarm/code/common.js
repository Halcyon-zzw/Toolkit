// ==================== 公共方法 ====================

// ==================== 获取当前机型的步骤间隔时间（支持部分覆盖） ====================
function getStepDelays(config, phoneInfo) {
    var model = phoneInfo.model;
    var defaultDelays = config.stepDelays["default"];
    if (!defaultDelays) {
        console.error("未找到默认步骤间隔配置");
        return null;
    }
    var modelDelays = config.stepDelays[model];
    if (modelDelays) {
        console.log("当前机型 [" + model + "] 使用部分覆盖配置:");
        var merged = {};
        for (var key in defaultDelays) {
            merged[key] = defaultDelays[key];
        }
        for (var key in modelDelays) {
            merged[key] = modelDelays[key];
            console.log("  - " + key + ": " + merged[key] + "ms (覆盖)");
        }
        for (var key in defaultDelays) {
            if (!modelDelays[key]) {
                console.log("  - " + key + ": " + merged[key] + "ms (默认)");
            }
        }
        return merged;
    }
    console.log("当前机型 [" + model + "] 使用默认步骤间隔配置:");
    for (var key in defaultDelays) {
        console.log("  - " + key + ": " + defaultDelays[key] + "ms");
    }
    return defaultDelays;
}

// ==================== 获取默认坐标 ====================
function getDefaultCoordinate(config, coordName) {
    var defaultCoords = config.coordFix["default"];
    if (!defaultCoords || defaultCoords[coordName] === undefined) {
        console.error("未找到默认坐标配置: " + coordName);
        return null;
    }
    return defaultCoords[coordName];
}

// ==================== 坐标转换函数（支持机型修正） ====================
function getFixedCoordinate(config, phoneInfo, coordName) {
    var model = phoneInfo.model;
    var coordFix = config.coordFix;

    if (coordFix[model] && coordFix[model][coordName] !== undefined) {
        var fixed = coordFix[model][coordName];
        console.log("使用机型修正坐标 [" + model + "][" + coordName + "]: " +
            "(" + fixed.left + "," + fixed.top + "," + fixed.right + "," + fixed.bottom + ")");
        return {
            left: fixed.left,
            top: fixed.top,
            right: fixed.right,
            bottom: fixed.bottom,
            isFixed: true
        };
    }

    var defaultCoord = getDefaultCoordinate(config, coordName);
    if (!defaultCoord) {
        console.error("未找到坐标配置: " + coordName);
        return null;
    }
    console.log("使用默认坐标 [" + coordName + "]: " +
        "设计(" + defaultCoord.left + "," + defaultCoord.top + "," + defaultCoord.right + "," + defaultCoord.bottom + ")");
    return scaleCoordinate(config, defaultCoord.left, defaultCoord.top, defaultCoord.right, defaultCoord.bottom);
}

function scaleCoordinate(config, x, y, width, height) {
    var scaleX = config.screenWidth / config.designWidth;
    var scaleY = config.screenHeight / config.designHeight;

    var result = {
        left: Math.round(x * scaleX),
        top: Math.round(y * scaleY),
        right: Math.round(width * scaleX),
        bottom: Math.round(height * scaleY),
        isFixed: false
    };

    console.log("坐标转换: 设计(" + x + "," + y + "," + width + "," + height + ") -> " +
        "实际(" + result.left + "," + result.top + "," + result.right + "," + result.bottom + ")" +
        " [缩放比: X=" + scaleX.toFixed(3) + ", Y=" + scaleY.toFixed(3) + "]");

    return result;
}

// ==================== 获取当前机型的移动持续时间 ====================
function getMoveDuration(config, phoneInfo) {
    var model = phoneInfo.model;
    var duration = config.moveDurationByDevice[model];
    if (duration === undefined) {
        duration = config.moveDurationByDevice["default"];
    }
    console.log("当前机型 [" + model + "] 移动持续时间: " + duration + "ms");
    return duration;
}

// ==================== 获取轮盘中心 ====================
function getJoystickCenter(config, phoneInfo) {
    var joystick = getFixedCoordinate(config, phoneInfo, "joystick");
    var centerX = Math.round((joystick.left + joystick.right) / 2);
    var centerY = Math.round((joystick.top + joystick.bottom) / 2);
    return { x: centerX, y: centerY };
}

// ==================== 人类行为模拟函数 ====================
function humanDelay(baseDelay) {
    var delay = baseDelay + random(-200, 200);
    delay = Math.max(100, delay);
    console.log("延时 " + delay + "ms (基础: " + baseDelay + "ms)");
    sleep(delay);
}

function humanClick(area, description) {
    try {
        var x = random(area.left, area.right);
        var y = random(area.top, area.bottom);
        x += random(-2, 2);
        y += random(-2, 2);
        var pressTime = random(30, 80);

        console.log("点击: " + description);
        console.log("  区域: (" + area.left + "," + area.top + "," +
            area.right + "," + area.bottom + ")");
        console.log("  实际坐标: (" + x + "," + y + ") 按压: " + pressTime + "ms");

        press(x, y, pressTime);
        sleep(random(50, 100));

        return true;
    } catch (e) {
        console.log("  点击失败: " + description + " - " + e.message);
        return false;
    }
}

// ==================== 获取服务器位置 ====================
function getServerPosition(config, index) {
    console.log("获取服务器 " + index + " 的位置");

    var positions = {
        1: { x: 800, y: 240, width: 1230, height: 320 },
        2: { x: 1380, y: 240, width: 2170, height: 320 },
        3: { x: 800, y: 370, width: 1230, height: 450 },
        4: { x: 1380, y: 370, width: 2170, height: 450 },
        5: { x: 800, y: 500, width: 1230, height: 580 },
        6: { x: 1380, y: 500, width: 2170, height: 580 }
    };

    var pos = positions[index];
    if (!pos) {
        console.error("无效的服务器序号: " + index);
        return null;
    }

    var scaledPos = scaleCoordinate(config, pos.x, pos.y, pos.width, pos.height);
    console.log("服务器 " + index + " 最终位置: ", JSON.stringify(scaledPos));

    return scaledPos;
}

// ==================== 轮盘移动函数（浇水用） ====================
function executeJoystickMove(config, phoneInfo) {
    console.log("开始执行轮盘移动");

    var joystick = getFixedCoordinate(config, phoneInfo, "joystick");

    var centerX = Math.round((joystick.left + joystick.right) / 2);
    var centerY = Math.round((joystick.top + joystick.bottom) / 2);

    console.log("轮盘区域: (" + joystick.left + "," + joystick.top + "," +
        joystick.right + "," + joystick.bottom + ")");
    console.log("轮盘中心: (" + centerX + "," + centerY + ")");

    var directionX = config.water.moveSettings.directionX;
    var directionY = config.water.moveSettings.directionY;
    var distance = config.water.moveSettings.distance;
    var duration = getMoveDuration(config, phoneInfo);

    var scaleX = config.screenWidth / config.designWidth;
    var scaleY = config.screenHeight / config.designHeight;
    var scaledDistance = Math.round(distance * Math.min(scaleX, scaleY));

    var len = Math.sqrt(directionX * directionX + directionY * directionY);
    if (len === 0) {
        console.error("方向向量为零");
        return false;
    }
    var normX = directionX / len;
    var normY = directionY / len;

    var targetX = centerX + Math.round(normX * scaledDistance);
    var targetY = centerY + Math.round(normY * scaledDistance);

    targetX = Math.max(0, Math.min(targetX, config.screenWidth));
    targetY = Math.max(0, Math.min(targetY, config.screenHeight));

    console.log("移动参数:");
    console.log("  - 方向向量: (" + normX.toFixed(3) + "," + normY.toFixed(3) + ")");
    console.log("  - 移动距离: " + scaledDistance + "px");
    console.log("  - 持续时间: " + duration + "ms");
    console.log("  - 起始位置: (" + centerX + "," + centerY + ")");
    console.log("  - 目标位置: (" + targetX + "," + targetY + ")");

    try {
        swipe(centerX, centerY, targetX, targetY, duration);
        return true;
    } catch (e) {
        console.error("轮盘移动失败: " + e.message);
        return false;
    }
}

module.exports = {
    getStepDelays: getStepDelays,
    getDefaultCoordinate: getDefaultCoordinate,
    getFixedCoordinate: getFixedCoordinate,
    scaleCoordinate: scaleCoordinate,
    getMoveDuration: getMoveDuration,
    getJoystickCenter: getJoystickCenter,
    humanDelay: humanDelay,
    humanClick: humanClick,
    getServerPosition: getServerPosition,
    executeJoystickMove: executeJoystickMove
};