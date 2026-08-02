"auto";

// ==================== 导入模块 ====================
var configModule = require("./config.js");
var common = require("./common.js");
var changeServer = require("./changeServer.js");
var water = require("./water.js");
var settlement = require("./settlement.js");
var farmReward = require("./farmReward.js");
var steal = require("./steal.js");
var autoMove = require("./autoMove.js");
var closeAd = require("./closeAd.js");
var sendCoin = require("./sendCoin.js");
var mallReward = require("./mallReward.js");
var giftBook = require("./giftBook.js");

// ==================== 获取配置 ====================
var phoneInfo = configModule.phoneInfo;
var screenSize = configModule.screenSize;
var config = configModule.config;

// ==================== UI 相关全局变量 ====================
var controlWindow = null;
var toggleWindow = null;
var toggleBtn = null;
var isSwitching = false;
var isWatering = false;
var isMoving = false;
var isSettling = false;
var isFarming = false;
var isStealing = false;
var isClosingAd = false;
var isSendingCoin = false;
var isMallReward = false;
var isGiftBooking = false;
var isExiting = false;
var isHidden = false;
var stopSwitch = false;
var stopSteal = false;
var stopAutoMove = false;
var moveThread = null;
var stealThread = null;

// ==================== 权限请求 ====================
if (auto.service === null) {
    toastLog('请先开启无障碍服务');
    auto.waitFor();
    sleep(1000);
}

let currentEngine = engines.myEngine();
let runningEngines = engines.all();
let currentSource = currentEngine.getSource() + '';
if (runningEngines.length > 1) {
    runningEngines.forEach(compareEngine => {
        let compareSource = compareEngine.getSource() + '';
        if (currentEngine.id !== compareEngine.id && compareSource === currentSource) {
            compareEngine.forceStop();
        }
    });
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

        var x = 490; // 原450 + 40px
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

// ==================== 统一更新所有UI（使用 setTimeout 替代 ui.run） ====================
function updateAllUI() {
    setTimeout(function() {
        if (controlWindow) {
            try {
                var isAnyBusy = isSwitching || isWatering || isMoving || isSettling || isFarming || isStealing || isClosingAd || isSendingCoin || isMallReward || isGiftBooking;

                // 服务器按钮
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

                var isClickable = !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking;

                // 农切按钮（第一行）
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

                // 农浇按钮（第一行）
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

                // 偷按钮（第一行）
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

                // 主切按钮（第二行）
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

                // 主浇按钮（第二行）
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

                // 送币按钮（第二行）
                if (controlWindow.sendCoinBtn) {
                    controlWindow.sendCoinBtn.setText(isSendingCoin ? "送币中" : "送币");
                    if (isClickable) {
                        controlWindow.sendCoinBtn.setBackgroundColor(colors.parseColor("#FF5722"));
                        controlWindow.sendCoinBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.sendCoinBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.sendCoinBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.sendCoinBtn.setClickable(isClickable);
                }

                // 领商按钮（第二行）
                if (controlWindow.mallRewardBtn) {
                    controlWindow.mallRewardBtn.setText(isMallReward ? "领商中" : "领商");
                    if (isClickable) {
                        controlWindow.mallRewardBtn.setBackgroundColor(colors.parseColor("#3F51B5"));
                        controlWindow.mallRewardBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.mallRewardBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.mallRewardBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.mallRewardBtn.setClickable(isClickable);
                }

                // 自移按钮（第三行）
                if (controlWindow.autoMoveBtn) {
                    if (isMoving) {
                        controlWindow.autoMoveBtn.setText("停");
                        controlWindow.autoMoveBtn.setBackgroundColor(colors.parseColor("#F44336"));
                        controlWindow.autoMoveBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        controlWindow.autoMoveBtn.setClickable(true);
                    } else {
                        controlWindow.autoMoveBtn.setText("自移");
                        var isMoveClickable = !isSwitching && !isWatering && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking;
                        if (isMoveClickable) {
                            controlWindow.autoMoveBtn.setBackgroundColor(colors.parseColor("#9C27B0"));
                            controlWindow.autoMoveBtn.setTextColor(colors.parseColor("#FFFFFF"));
                        } else {
                            controlWindow.autoMoveBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                            controlWindow.autoMoveBtn.setTextColor(colors.parseColor("#666666"));
                        }
                        controlWindow.autoMoveBtn.setClickable(isMoveClickable);
                    }
                }

                // 结算按钮（第三行）
                if (controlWindow.jieBtn) {
                    controlWindow.jieBtn.setText(isSettling ? "结算中" : "结算");
                    if (isClickable) {
                        controlWindow.jieBtn.setBackgroundColor(colors.parseColor("#F44336"));
                        controlWindow.jieBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.jieBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.jieBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.jieBtn.setClickable(isClickable);
                }

                // 领农按钮（第三行）
                if (controlWindow.lingNongBtn) {
                    controlWindow.lingNongBtn.setText(isFarming ? "农场中" : "领农");
                    if (isClickable) {
                        controlWindow.lingNongBtn.setBackgroundColor(colors.parseColor("#FF9800"));
                        controlWindow.lingNongBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.lingNongBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.lingNongBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.lingNongBtn.setClickable(isClickable);
                }

                // 领册按钮（第三行）
                if (controlWindow.giftBookBtn) {
                    controlWindow.giftBookBtn.setText(isGiftBooking ? "领册中" : "领册");
                    if (isClickable) {
                        controlWindow.giftBookBtn.setBackgroundColor(colors.parseColor("#00BCD4"));
                        controlWindow.giftBookBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.giftBookBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.giftBookBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.giftBookBtn.setClickable(isClickable);
                }

                // 关广按钮（第四行）
                if (controlWindow.closeAdBtn) {
                    controlWindow.closeAdBtn.setText(isClosingAd ? "关闭中" : "关广");
                    if (isClickable) {
                        controlWindow.closeAdBtn.setBackgroundColor(colors.parseColor("#795548"));
                        controlWindow.closeAdBtn.setTextColor(colors.parseColor("#FFFFFF"));
                    } else {
                        controlWindow.closeAdBtn.setBackgroundColor(colors.parseColor("#CCCCCC"));
                        controlWindow.closeAdBtn.setTextColor(colors.parseColor("#666666"));
                    }
                    controlWindow.closeAdBtn.setClickable(isClickable);
                }
            } catch (e) {
                console.log("更新UI失败: " + e.message);
            }
        }
    }, 0);
}

function updateCurrentServerDisplay() {
    setTimeout(function() {
        if (controlWindow && controlWindow.serverBtn) {
            try {
                if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking) {
                    controlWindow.serverBtn.setText(config.serverList[config.currentIndex]);
                }
            } catch (e) {
                console.log("更新显示失败: " + e.message);
            }
        }
    }, 0);
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

// ==================== 创建API对象（供功能模块使用） ====================
function createApi() {
    return {
        // setters
        setSwitching: function(v) { isSwitching = v; },
        setWatering: function(v) { isWatering = v; },
        setMoving: function(v) { isMoving = v; },
        setSettling: function(v) { isSettling = v; },
        setFarming: function(v) { isFarming = v; },
        setStealing: function(v) { isStealing = v; },
        setClosingAd: function(v) { isClosingAd = v; },
        setSendingCoin: function(v) { isSendingCoin = v; },
        setMallReward: function(v) { isMallReward = v; },
        setGiftBooking: function(v) { isGiftBooking = v; },
        setStopSwitch: function(v) { stopSwitch = v; },
        setStopSteal: function(v) { stopSteal = v; },
        setStopAutoMove: function(v) { stopAutoMove = v; },
        updateUI: updateAllUI,
        // getters
        isSwitching: function() { return isSwitching; },
        isWatering: function() { return isWatering; },
        isMoving: function() { return isMoving; },
        isSettling: function() { return isSettling; },
        isFarming: function() { return isFarming; },
        isStealing: function() { return isStealing; },
        isClosingAd: function() { return isClosingAd; },
        isSendingCoin: function() { return isSendingCoin; },
        isMallReward: function() { return isMallReward; },
        isGiftBooking: function() { return isGiftBooking; },
        getStopSwitch: function() { return stopSwitch; },
        getStopSteal: function() { return stopSteal; },
        getStopAutoMove: function() { return stopAutoMove; },
        isExiting: function() { return isExiting; }
    };
}

// ==================== 创建控制窗口 ====================
function createControlWindow() {
    if (controlWindow != null) {
        try { controlWindow.close(); } catch (e) { }
    }

    console.log("创建控制窗口，屏幕尺寸: " + config.screenWidth + "x" + config.screenHeight);

    try {
        controlWindow = floaty.window(
            <vertical bg="#E8F5E9" padding="6" layout_width="wrap_content" layout_height="wrap_content">
                <!-- 第一行：下拉框 | 农切 | 农浇 | 偷 -->
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
                            marginLeft="4"/>
                    <button id="nongJiaoBtn"
                            text="农浇"
                            w="30"
                            h="30"
                            bg="#4CAF50"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="4"/>
                    <button id="stealBtn"
                            text="偷"
                            w="30"
                            h="30"
                            bg="#8BC34A"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="4"/>
                </horizontal>
                <!-- 第二行：主切 | 主浇 | 送币 | 领商 -->
                <horizontal marginTop="4">
                    <button id="zhuQieBtn"
                            text="主切"
                            w="30"
                            h="30"
                            bg="#2196F3"
                            textColor="#FFFFFF"
                            textSize="8"/>
                    <button id="zhuJiaoBtn"
                            text="主浇"
                            w="30"
                            h="30"
                            bg="#2196F3"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="4"/>
                    <button id="sendCoinBtn"
                            text="送币"
                            w="30"
                            h="30"
                            bg="#FF5722"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="4"/>
                    <button id="mallRewardBtn"
                            text="领商"
                            w="30"
                            h="30"
                            bg="#3F51B5"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="4"/>
                </horizontal>
                <!-- 第三行：自移 | 结算 | 领农 | 领册 -->
                <horizontal marginTop="4">
                    <button id="autoMoveBtn"
                            text="自移"
                            w="30"
                            h="30"
                            bg="#9C27B0"
                            textColor="#FFFFFF"
                            textSize="8"/>
                    <button id="jieBtn"
                            text="结算"
                            w="30"
                            h="30"
                            bg="#F44336"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="4"/>
                    <button id="lingNongBtn"
                            text="领农"
                            w="30"
                            h="30"
                            bg="#FF9800"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="4"/>
                    <button id="giftBookBtn"
                            text="领册"
                            w="30"
                            h="30"
                            bg="#00BCD4"
                            textColor="#FFFFFF"
                            textSize="8"
                            marginLeft="4"/>
                </horizontal>
                <!-- 第四行：关广（靠左） -->
                <horizontal marginTop="4" gravity="left">
                    <button id="closeAdBtn"
                            text="关广"
                            w="30"
                            h="30"
                            bg="#795548"
                            textColor="#FFFFFF"
                            textSize="8"/>
                </horizontal>
            </vertical>
        );

        var x = 30;
        var y = 120;

        console.log("控制窗口位置: (" + x + ", " + y + ")");
        controlWindow.setPosition(x, y);

        var api = createApi();

        // ==================== 服务器按钮 ====================
        controlWindow.serverBtn.on("click", function() {
            console.log("用户点击服务器选择按钮");
            showServerDropdown();
        });

        // ==================== 农切按钮 ====================
        controlWindow.nongQieBtn.on("click", function() {
            console.log("用户点击农切按钮");
            if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking) {
                console.log("启动农切 - 完整切换流程");
                changeServer.executeSwitch1(config, phoneInfo, api);
            } else if (isSwitching) {
                console.log("点击停止切换");
                stopSwitch = true;
                toast("正在停止切换...");
            } else {
                toast(getBusyMessage());
            }
        });

        controlWindow.nongQieBtn.on("long-click", function() {
            if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking) {
                console.log("用户长按重置按钮");
                config.currentIndex = 1;
                updateCurrentServerDisplay();
                toast("已重置为服务器 1");
            }
            return true;
        });

        // ==================== 农浇按钮 ====================
        controlWindow.nongJiaoBtn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking) {
                console.log("用户点击农浇按钮（不进入农场）");
                water.executeWater1(config, phoneInfo, api);
            } else {
                toast(getBusyMessage());
            }
        });

        // ==================== 偷按钮 ====================
        controlWindow.stealBtn.on("click", function() {
            console.log("用户点击偷按钮");
            if (isStealing) {
                console.log("停止偷菜");
                stopSteal = true;
                toast("正在停止偷菜...");
            } else if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking) {
                console.log("启动偷菜");
                steal.executeSteal(config, phoneInfo, api);
            } else {
                toast(getBusyMessage());
            }
        });

        // ==================== 主切按钮 ====================
        controlWindow.zhuQieBtn.on("click", function() {
            console.log("用户点击主切按钮");
            if (!isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking) {
                console.log("启动主切 - 从步骤3开始");
                changeServer.executeSwitch2(config, phoneInfo, api);
            } else if (isSwitching) {
                console.log("点击停止切换");
                stopSwitch = true;
                toast("正在停止切换...");
            } else {
                toast(getBusyMessage());
            }
        });

        // ==================== 主浇按钮 ====================
        controlWindow.zhuJiaoBtn.on("click", function() {
            if (!isWatering && !isSwitching && !isMoving && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking) {
                console.log("用户点击主浇按钮（进入农场）");
                water.executeWater2(config, phoneInfo, api);
            } else {
                toast(getBusyMessage());
            }
        });

        // ==================== 送币按钮 ====================
        controlWindow.sendCoinBtn.on("click", function() {
            if (!isSendingCoin && !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing && !isClosingAd && !isMallReward && !isGiftBooking) {
                console.log("用户点击送币按钮");
                sendCoin.executeSendCoin(config, phoneInfo, api);
            } else {
                toast(getBusyMessage());
            }
        });

        // ==================== 领商按钮 ====================
        controlWindow.mallRewardBtn.on("click", function() {
            if (!isMallReward && !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isGiftBooking) {
                console.log("用户点击领商按钮");
                mallReward.executeMallReward(config, phoneInfo, api);
            } else {
                toast(getBusyMessage());
            }
        });

        // ==================== 自移按钮 ====================
        controlWindow.autoMoveBtn.on("click", function() {
            console.log("用户点击自移按钮");

            if (isMoving) {
                console.log("停止自动移动");
                autoMove.stopAutoMoveFunction(api);
            } else if (!isSwitching && !isWatering && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking) {
                console.log("启动自动移动");
                autoMove.executeAutoMove(config, phoneInfo, api);
            } else {
                toast(getBusyMessage());
            }
        });

        // ==================== 结算按钮 ====================
        controlWindow.jieBtn.on("click", function() {
            console.log("用户点击结算按钮");
            if (!isSettling && !isSwitching && !isWatering && !isMoving && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking) {
                console.log("启动结算返回");
                settlement.executeSettlement(config, phoneInfo, api);
            } else {
                toast(getBusyMessage());
            }
        });

        // ==================== 领农按钮 ====================
        controlWindow.lingNongBtn.on("click", function() {
            if (!isFarming && !isSwitching && !isWatering && !isMoving && !isSettling && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward && !isGiftBooking) {
                console.log("用户点击领农按钮（领取农场奖励）");
                farmReward.executeFarmReward(config, phoneInfo, api);
            } else {
                toast(getBusyMessage());
            }
        });

        // ==================== 领册按钮 ====================
        controlWindow.giftBookBtn.on("click", function() {
            if (!isGiftBooking && !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing && !isClosingAd && !isSendingCoin && !isMallReward) {
                console.log("用户点击领册按钮");
                giftBook.executeGiftBook(config, phoneInfo, api);
            } else {
                toast(getBusyMessage());
            }
        });

        // ==================== 关广按钮 ====================
        controlWindow.closeAdBtn.on("click", function() {
            if (!isClosingAd && !isSwitching && !isWatering && !isMoving && !isSettling && !isFarming && !isStealing && !isSendingCoin && !isMallReward && !isGiftBooking) {
                console.log("用户点击关广按钮");
                closeAd.executeCloseAd(config, phoneInfo, api);
            } else {
                toast(getBusyMessage());
            }
        });

        console.log("控制窗口创建成功");

    } catch (e) {
        console.log("创建控制窗口失败: " + e.message);
        toast("创建控制窗口失败: " + e.message);
    }
}

// ==================== 获取忙碌状态消息 ====================
function getBusyMessage() {
    if (isSwitching) return "正在切换服务器";
    if (isWatering) return "正在浇水";
    if (isMoving) return "正在移动";
    if (isSettling) return "正在结算";
    if (isFarming) return "正在领取农场奖励";
    if (isStealing) return "正在偷菜";
    if (isClosingAd) return "正在关闭广告";
    if (isSendingCoin) return "正在送金币";
    if (isMallReward) return "正在领取商城";
    if (isGiftBooking) return "正在领取礼册";
    return "操作中";
}

// ==================== 退出清理 ====================
function cleanup() {
    isExiting = true;
    isSwitching = false;
    isWatering = false;
    isMoving = false;
    isSettling = false;
    isFarming = false;
    isStealing = false;
    isClosingAd = false;
    isSendingCoin = false;
    isMallReward = false;
    isGiftBooking = false;
    stopSwitch = true;
    stopSteal = true;
    stopAutoMove = true;

    if (isMoving) {
        stopAutoMove = true;
        isMoving = false;
        if (moveThread && moveThread.isAlive()) {
            try {
                moveThread.interrupt();
            } catch(e) {}
        }
    }

    if (isStealing) {
        stopSteal = true;
        isStealing = false;
        if (stealThread && stealThread.isAlive()) {
            try {
                stealThread.interrupt();
            } catch(e) {}
        }
    }

    console.log("\n========================================");
    console.log("脚本退出清理");
    console.log("最终服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex] + ")");
    console.log("========================================");

    if (controlWindow != null) {
        try { controlWindow.close(); } catch (e) { }
    }
    if (toggleWindow != null) {
        try { toggleWindow.close(); } catch (e) { }
    }
}

events.on("exit", cleanup);

// ==================== 主程序 ====================
console.log("========================================");
console.log("自动切换服务器 + 自动浇水 + 自动移动脚本启动");
console.log("设备信息:");
console.log("  - 品牌: " + phoneInfo.brand);
console.log("  - 型号: " + phoneInfo.model);
console.log("  - 制造商: " + phoneInfo.manufacturer);
console.log("  - 设备名称: " + phoneInfo.device);
console.log("  - 原始屏幕: " + device.width + "x" + device.height);
console.log("  - 使用屏幕(横屏): " + config.screenWidth + "x" + config.screenHeight);
console.log("  - 设计分辨率: " + config.designWidth + "x" + config.designHeight);
console.log("  - 缩放比例: X=" + (config.screenWidth / config.designWidth).toFixed(3) +
    ", Y=" + (config.screenHeight / config.designHeight).toFixed(3));
console.log("  - 当前服务器: " + config.currentIndex + " (" + config.serverList[config.currentIndex] + ")");

if (config.coordFix[phoneInfo.model]) {
    console.log("  - 坐标修正: 已配置 [" + phoneInfo.model + "]");
    var fixedCoords = config.coordFix[phoneInfo.model];
    var coordNames = Object.keys(fixedCoords);
    for (var i = 0; i < coordNames.length; i++) {
        var name = coordNames[i];
        console.log("    * " + name + ": (" + fixedCoords[name].left + "," + fixedCoords[name].top + "," +
            fixedCoords[name].right + "," + fixedCoords[name].bottom + ")");
    }
} else {
    console.log("  - 坐标修正: 未配置，使用默认缩放");
}

console.log("  - 步骤间隔配置:");
var stepDelays = common.getStepDelays(config, phoneInfo);
console.log("    * 点击返回后: " + stepDelays.afterBack + "ms");
console.log("    * 确认返回大厅后: " + stepDelays.afterConfirmLobby + "ms");
console.log("    * 点击设置后: " + stepDelays.afterSettings + "ms");
console.log("    * 退出游戏后: " + stepDelays.afterExitGame + "ms");
console.log("    * 确认退出后: " + stepDelays.afterConfirmExit + "ms");
console.log("    * 换区后: " + stepDelays.afterChangeServer + "ms");
console.log("    * 选择服务器后: " + stepDelays.afterSelectServer + "ms");
console.log("    * 进入农场后等待: " + stepDelays.enterFarmWait + "ms");

console.log("  - 按钮说明:");
console.log("    * 农切: 完整切换流程(从步骤1开始)");
console.log("    * 主切: 从步骤3(点击设置)开始执行");
console.log("    * 农浇: 不进入农场，直接浇水");
console.log("    * 主浇: 进入农场后浇水");
console.log("    * 领农: 领取农场奖励");
console.log("    * 偷: 偷菜");
console.log("    * 自移: 自动移动");
console.log("    * 结算: 结算返回");
console.log("    * 关广: 关闭广告");
console.log("    * 送币: 送金币");
console.log("    * 领商: 领取商城");
console.log("    * 领册: 领取礼册");
console.log("  - 窗口操作:");
console.log("    * 点击右上角 \"隐\" 按钮隐藏主窗口");
console.log("    * 点击 \"展\" 按钮恢复主窗口");
console.log("========================================\n");

// ==================== 创建UI ====================
createControlWindow();
createToggleWindow();

// ==================== 保活 ====================
var lastStatus = "";

setInterval(function() {
    if (!isExiting) {
        var status = "脚本运行中 - 服务器: " + config.currentIndex;
        if (isSwitching) status += " [切换中]";
        if (isWatering) status += " [浇水中]";
        if (isMoving) status += " [移动中]";
        if (isSettling) status += " [结算中]";
        if (isFarming) status += " [农场领取中]";
        if (isStealing) status += " [偷菜中]";
        if (isClosingAd) status += " [关闭广告中]";
        if (isSendingCoin) status += " [送币中]";
        if (isMallReward) status += " [领商中]";
        if (isGiftBooking) status += " [领册中]";

        // 只有状态变化时才打印日志
        if (status !== lastStatus) {
            console.log(status);
            lastStatus = status;
        }
    }
}, 60000);

setTimeout(function() {
    if (!isExiting) {
        toast("脚本已就绪 - 可切换服务器、浇水和自动移动");
        console.log("用户提示已显示");
    }
}, 1000);