// ==================== UI模块 ====================
var common = require("./common.js");
var changeServer = require("./changeServer.js");
var water = require("./water.js");
var settlement = require("./settlement.js");
var farmReward = require("./farmReward.js");
var steal = require("./steal.js");
var autoMove = require("./autoMove.js");

var controlWindow = null;
var toggleWindow = null;
var toggleBtn = null;
var isSwitching = false;
var isWatering = false;
var isMoving = false;
var isSettling = false;
var isFarming = false;
var isStealing = false;
var isHidden = false;
var stopSwitch = false;
var stopSteal = false;
var config = null;
var phoneInfo = null;

// ==================== 设置引用 ====================
function setReferences(cfg, info) {
    config = cfg;
    phoneInfo = info;
}

// ==================== 获取状态 ====================
function getStates() {
    return {
        isSwitching: isSwitching,
        isWatering: isWatering,
        isMoving: isMoving,
        isSettling: isSettling,
        isFarming: isFarming,
        isStealing: isStealing,
        stopSwitch: stopSwitch,
        stopSteal: stopSteal
    };
}

function setState(key, value) {
    switch(key) {
        case 'isSwitching': isSwitching = value; break;
        case 'isWatering': isWatering = value; break;
        case 'isMoving': isMoving = value; break;
        case 'isSettling': isSettling = value; break;
        case 'isFarming': isFarming = value; break;
        case 'isStealing': isStealing = value; break;
        case 'stopSwitch': stopSwitch = value; break;
        case 'stopSteal': stopSteal = value; break;
    }
}

function setStopSwitch(value) {
    stopSwitch = value;
}

function setStopSteal(value) {
    stopSteal = value;
}

// ==================== 切换窗口隐藏状态 ====================
function toggleHide() {
    isHidden = !isHidden;

    if (controlWindow) {
        try {
            if (isHidden) {
                if (controlWindow.setVisible) {
                    controlWindow.setVisible(false);
                } else {
                    controlWindow.setPosition(-1000, -1000);
                }
                if (toggleBtn) {
                    toggleBtn.setText("展");
                }
                console.log("主窗口已隐藏");
            } else {
                if (controlWindow.setVisible) {
                    controlWindow.setVisible(true);
                } else {
                    controlWindow.setPosition(30, 120);
                }
                if (toggleBtn) {
                    toggleBtn.setText("隐");
                }
                console.log("主窗口已恢复");
            }
        } catch(e) {
            console.log("切换窗口状态失败: " + e.message);
        }
    }
}

// ==================== 创建独立开关窗口 ====================
function createToggleWindow() {
    if (toggleWindow != null) {
        try { toggleWindow.close(); } catch (e) { }
    }

    console.log("创建开关窗口");

    try {
        toggleWindow = floaty.window(
            <button id="btnToggle"
                    text="隐"
                    w="30"
                    h="30"
                    bg="#4CAF50"
                    textColor="#FFFFFF"
                    textSize="10"/>
        );

        toggleBtn = toggleWindow.btnToggle;

        var x = 450;
        var y = 120;

        console.log("开关窗口位置: (" + x + ", " + y + ")");
        toggleWindow.setPosition(x, y);

        toggleBtn.on("click", function() {
            console.log("用户点击开关按钮，当前状态: " + (isHidden ? "隐藏" : "显示"));
            toggleHide();
        });

        console.log("开关窗口创建成功");

    } catch (e) {
        console.log("创建开关窗口失败: " + e.message);
        toast("创建开关窗口失败: " + e.message);
    }
}

// ==================== 统一更新所有UI ====================
function updateAllUI() {
    ui.run(function() {
        if (controlWindow) {
            try {
                var isAnyBusy = isSwitching || isWatering || isMoving || isSettling || isFarming || isStealing;

                if (controlWindow.serverBtn) {
                    if (!isAnyBusy) {
                        controlWindow.serverBtn.setText(config.serverList[config.currentIndex]);
                        controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFFFFF"));
                        controlWindow.serverBtn.setTextColor(colors.parseColor("#1976D2"));
                        controlWindow.serverBtn.setClickable(true);
                    } else {
                        controlWindow.serverBtn.setText("...");
                        controlWindow.serverBtn.setBackgroundColor(colors.parseColor("#FFE0B2"));
                        controlWindow.serverBtn.setTextColor(colors.parseColor("#E65100"));
                        controlWindow.serverBtn.setClickable(false);
                    }
                }

                var isClickable = !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing;

                // 农切按钮
                if (controlWindow.nongQieBtn) {
                    if (isSwitching) {
                        controlWindow.nongQieBtn.setText("切换中");
                        controlWindow.nongQieBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.nongQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.nongQieBtn.setClickable(true);
                    } else {
                        controlWindow.nongQieBtn.setText("农切");
                        if (isClickable) {
                            controlWindow.nongQieBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
                            controlWindow.nongQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        } else {
                            controlWindow.nongQieBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                            controlWindow.nongQieBtn.setTextColor(colors.parseColor("#666666"));
                        }
                        controlWindow.nongQieBtn.setClickable(isClickable);
                    }
                }

                // 主切按钮
                if (controlWindow.zhuQieBtn) {
                    if (isSwitching) {
                        controlWindow.zhuQieBtn.setText("切换中");
                        controlWindow.zhuQieBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.zhuQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.zhuQieBtn.setClickable(true);
                    } else {
                        controlWindow.zhuQieBtn.setText("主切");
                        if (isClickable) {
                            controlWindow.zhuQieBtn.setBackgroundColor(colors.parseColor("#2196F3"));
                            controlWindow.zhuQieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        } else {
                            controlWindow.zhuQieBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                            controlWindow.zhuQieBtn.setTextColor(colors.parseColor("#666666"));
                        }
                        controlWindow.zhuQieBtn.setClickable(isClickable);
                    }
                }

                // 农浇按钮
                if (controlWindow.nongJiaoBtn) {
                    controlWindow.nongJiaoBtn.setText(isWatering ? "浇水中" : "农浇");
                    if (isClickable) {
                        controlWindow.nongJiaoBtn.setBackgroundColor(colors.parseColor("#4CAF50"));
                        controlWindow.nongJiaoBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.nongJiaoBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.nongJiaoBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.nongJiaoBtn.setClickable(isClickable);
                }

                // 主浇按钮
                if (controlWindow.zhuJiaoBtn) {
                    controlWindow.zhuJiaoBtn.setText(isWatering ? "浇水中" : "主浇");
                    if (isClickable) {
                        controlWindow.zhuJiaoBtn.setBackgroundColor(colors.parseColor("#2196F3"));
                        controlWindow.zhuJiaoBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.zhuJiaoBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.zhuJiaoBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.zhuJiaoBtn.setClickable(isClickable);
                }

                // 农领按钮
                if (controlWindow.nongLingBtn) {
                    controlWindow.nongLingBtn.setText(isFarming ? "农场中" : "农领");
                    if (isClickable) {
                        controlWindow.nongLingBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.nongLingBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.nongLingBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.nongLingBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.nongLingBtn.setClickable(isClickable);
                }

                // 偷按钮
                if (controlWindow.stealBtn) {
                    if (isStealing) {
                        controlWindow.stealBtn.setText("停");
                        controlWindow.stealBtn.setBackgroundColor(colors.parseColor("#F44336"));
                        controlWindow.stealBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.stealBtn.setClickable(true);
                    } else {
                        controlWindow.stealBtn.setText("偷");
                        if (isClickable) {
                            controlWindow.stealBtn.setBackgroundColor(colors.parseColor("#8BC34A"));
                            controlWindow.stealBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        } else {
                            controlWindow.stealBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                            controlWindow.stealBtn.setTextColor(colors.parseColor("#666666"));
                        }
                        controlWindow.stealBtn.setClickable(isClickable);
                    }
                }

                // 移按钮
                if (controlWindow.moveBtn) {
                    if (isMoving) {
                        controlWindow.moveBtn.setText("停");
                        controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#F44336"));
                        controlWindow.moveBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.moveBtn.setClickable(true);
                    } else {
                        controlWindow.moveBtn.setText("移");
                        var isMoveClickable = !isSwitching && !isWatering && !isSettling && !isFarming && !isStealing;
                        if (isMoveClickable) {
                            controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#9C27B0"));
                            controlWindow.moveBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        } else {
                            controlWindow.moveBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                            controlWindow.moveBtn.setTextColor(colors.parseColor("#666666"));
                        }
                        controlWindow.moveBtn.setClickable(isMoveClickable);
                    }
                }

                // 结按钮
                if (controlWindow.jieBtn) {
                    controlWindow.jieBtn.setText(isSettling ? "结算中" : "结");
                    if (isClickable) {
                        controlWindow.jieBtn.setBackgroundColor(colors.parseColor("#F44336"));
                        controlWindow.jieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.jieBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.jieBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.jieBtn.setClickable(isClickable);
                }
            } catch (e) {
                console.log("更新UI失败: " + e.message);
            }
        }
    });
}

function updateCurrentServerDisplay() {
    ui.run(function() {
        if (controlWindow && controlWindow.serverBtn) {
            try {
                if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing) {
                    controlWindow.serverBtn.setText(config.serverList[config.currentIndex]);
                }
            } catch (e) {
                console.log("更新显示失败: " + e.message);
            }
        }
    });
}

// ==================== 创建控制窗口 ====================
function createControlWindow(cfg, info) {
    config = cfg;
    phoneInfo = info;

    if (controlWindow != null) {
        try { controlWindow.close(); } catch (e) { }
    }

    console.log("创建控制窗口，屏幕尺寸: " + config.screenWidth + "x" + config.screenHeight);

    // 导入功能模块
    var changeServerMod = require("./changeServer.js");
    var waterMod = require("./water.js");
    var settlementMod = require("./settlement.js");
    var farmRewardMod = require("./farmReward.js");
    var stealMod = require("./steal.js");
    var autoMoveMod = require("./autoMove.js");

    try {
        controlWindow = floaty.window(
            <vertical bg="#E8F5E9" padding="6" layout_width="wrap_content" layout_height="wrap_content">
                <horizontal>
                    <button id="serverBtn"
                            text="1"
                            w="30"
                            h="30"
                            bg="#FFFFFF"
                            textColor="#1976D2"
                            textSize="8"
                            marginBottom="2"/>
                    <button id="nongQieBtn"
                            text="农切"
                            w="30"
                            h="30"
                            bg="#4CAF50"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                    <button id="zhuQieBtn"
                            text="主切"
                            w="30"
                            h="30"
                            bg="#2196F3"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                </horizontal>
                <horizontal marginTop="2">
                    <button id="nongJiaoBtn"
                            text="农浇"
                            w="30"
                            h="30"
                            bg="#4CAF50"
                            textColor="#FFFFFF"
                            textSize="8"/>
                    <button id="zhuJiaoBtn"
                            text="主浇"
                            w="30"
                            h="30"
                            bg="#2196F3"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                    <button id="nongLingBtn"
                            text="农领"
                            w="30"
                            h="30"
                            bg="#FF9800"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                    <button id="stealBtn"
                            text="偷"
                            w="30"
                            h="30"
                            bg="#8BC34A"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                </horizontal>
                <horizontal marginTop="2">
                    <button id="moveBtn"
                            text="移"
                            w="30"
                            h="30"
                            bg="#9C27B0"
                            textColor="#FFFFFF"
                            textSize="8"/>
                    <button id="jieBtn"
                            text="结"
                            w="30"
                            h="30"
                            bg="#F44336"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="2"/>
                </horizontal>
            </vertical>
        );

        var x = 30;
        var y = 120;

        console.log("控制窗口位置: (" + x + ", " + y + ")");
        controlWindow.setPosition(x, y);

        var states = {
            isSwitching: function() { return isSwitching; },
            isWatering: function() { return isWatering; },
            isMoving: function() { return isMoving; },
            isSettling: function() { return isSettling; },
            isFarming: function() { return isFarming; },
            isStealing: function() { return isStealing; }
        };

        var setters = {
            setSwitching: function(v) { isSwitching = v; },
            setWatering: function(v) { isWatering = v; },
            setMoving: function(v) { isMoving = v; },
            setSettling: function(v) { isSettling = v; },
            setFarming: function(v) { isFarming = v; },
            setStealing: function(v) { isStealing = v; },
            setStopSwitch: function(v) { stopSwitch = v; },
            setStopSteal: function(v) { stopSteal = v; },
            updateUI: updateAllUI
        };

        // 服务器按钮
        controlWindow.serverBtn.on("click", function() {
            console.log("用户点击服务器选择按钮");
            showServerDropdown();
        });

        // 农切按钮
        controlWindow.nongQieBtn.on("click", function() {
            console.log("用户点击农切按钮");
            if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing) {
                changeServerMod.executeSwitch1(config, phoneInfo, setters);
            } else if (isSwitching) {
                console.log("点击停止切换");
                stopSwitch = true;
                setters.setStopSwitch(true);
                toast("正在停止切换...");
            } else {
                toast(isWatering ? "正在浇水" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : "正在偷菜"))));
            }
        });

        controlWindow.nongQieBtn.on("long-click", function() {
            if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing) {
                console.log("用户长按重置按钮");
                config.currentIndex = 1;
                updateCurrentServerDisplay();
                toast("已重置为服务器 1");
            }
            return true;
        });

        // 主切按钮
        controlWindow.zhuQieBtn.on("click", function() {
            console.log("用户点击主切按钮");
            if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing) {
                changeServerMod.executeSwitch2(config, phoneInfo, setters);
            } else if (isSwitching) {
                console.log("点击停止切换");
                stopSwitch = true;
                setters.setStopSwitch(true);
                toast("正在停止切换...");
            } else {
                toast(isWatering ? "正在浇水" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : "正在偷菜"))));
            }
        });

        // 农浇按钮
        controlWindow.nongJiaoBtn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving && !isSettling && !isFarming && !isStealing) {
                console.log("用户点击农浇按钮（不进入农场）");
                waterMod.executeWater1(config, phoneInfo, setters);
            } else {
                toast(isSwitching ? "正在切换服务器" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : (isStealing ? "正在偷菜" : "正在浇水")))));
            }
        });

        // 主浇按钮
        controlWindow.zhuJiaoBtn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving && !isSettling && !isFarming && !isStealing) {
                console.log("用户点击主浇按钮（进入农场）");
                waterMod.executeWater2(config, phoneInfo, setters);
            } else {
                toast(isSwitching ? "正在切换服务器" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : (isStealing ? "正在偷菜" : "正在浇水")))));
            }
        });

        // 农领按钮
        controlWindow.nongLingBtn.on("click", function() {
            if (!isFarming && !isSwitching && !isWatering && !isMoving && !isSettling && !isStealing) {
                console.log("用户点击农领按钮（领取农场奖励）");
                farmRewardMod.executeFarmReward(config, phoneInfo, setters);
            } else {
                toast(isSwitching ? "正在切换服务器" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isWatering ? "正在浇水" : (isStealing ? "正在偷菜" : "正在领取农场奖励")))));
            }
        });

        // 偷按钮
        controlWindow.stealBtn.on("click", function() {
            console.log("用户点击偷按钮");
            if (isStealing) {
                console.log("停止偷菜");
                stopSteal = true;
                setters.setStopSteal(true);
                toast("正在停止偷菜...");
            } else if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming) {
                console.log("启动偷菜");
                stealMod.executeSteal(config, phoneInfo, setters);
            } else {
                toast(isSwitching ? "正在切换服务器" : (isMoving ? "正在移动" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : "正在浇水"))));
            }
        });

        // 移动按钮
        controlWindow.moveBtn.on("click", function() {
            console.log("用户点击移动按钮");

            if (isMoving) {
                console.log("停止自动移动");
                autoMoveMod.stopAutoMoveFunction(setters);
            } else if (!isSwitching && !isWatering && !isSettling && !isFarming && !isStealing) {
                console.log("启动自动移动");
                autoMoveMod.executeAutoMove(config, phoneInfo, setters);
            } else {
                toast(isSwitching ? "正在切换服务器" : (isWatering ? "正在浇水" : (isSettling ? "正在结算" : (isFarming ? "正在领取农场奖励" : "正在偷菜"))));
            }
        });

        // 结按钮
        controlWindow.jieBtn.on("click", function() {
            console.log("用户点击结按钮");
            if (!isSettling && !isSwitching && !isWatering && !isMoving && !isFarming && !isStealing) {
                settlementMod.executeSettlement(config, phoneInfo, setters);
            } else {
                toast(isSwitching ? "正在切换服务器" : (isMoving ? "正在移动" : (isWatering ? "正在浇水" : (isFarming ? "正在领取农场奖励" : (isStealing ? "正在偷菜" : "正在结算")))));
            }
        });

        console.log("控制窗口创建成功");

    } catch (e) {
        console.log("创建控制窗口失败: " + e.message);
        toast("创建控制窗口失败: " + e.message);
    }
}

// ==================== 显示服务器选择下拉列表 ====================
function showServerDropdown() {
    console.log("打开服务器选择列表，当前: " + config.currentIndex);

    try {
        var displayList = ["0", "1", "2", "3", "4", "5", "6"];
        dialogs.select("选择服务器", displayList, function(index) {
            if (index >= 0 && index < displayList.length) {
                var oldIndex = config.currentIndex;
                config.currentIndex = index;
                updateCurrentServerDisplay();
                console.log("手动选择服务器: " + oldIndex + " -> " + config.currentIndex +
                    " (" + displayList[index] + ")");
                toast("已选择: " + displayList[index]);
            }
        });
    } catch (e) {
        console.log("选择对话框失败: " + e.message);
        toast("无法打开选择器");
    }
}

// ==================== 导出 ====================
module.exports = {
    setReferences: setReferences,
    getStates: getStates,
    setState: setState,
    setStopSwitch: setStopSwitch,
    setStopSteal: setStopSteal,
    toggleHide: toggleHide,
    createToggleWindow: createToggleWindow,
    updateAllUI: updateAllUI,
    updateCurrentServerDisplay: updateCurrentServerDisplay,
    createControlWindow: createControlWindow,
    showServerDropdown: showServerDropdown
};