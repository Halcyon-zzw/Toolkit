// ==================== 获取屏幕尺寸 ====================
function getScreenSize() {
    var width = device.width;
    var height = device.height;

    console.log("原始屏幕尺寸: " + width + " x " + height);

    var screenWidth, screenHeight;
    if (width > height) {
        screenWidth = width;
        screenHeight = height;
        console.log("当前为横屏模式");
    } else {
        screenWidth = height;
        screenHeight = width;
        console.log("当前为竖屏模式，自动转换为横屏坐标");
    }

    console.log("使用屏幕尺寸(横屏): " + screenWidth + " x " + screenHeight);
    return {
        width: screenWidth,
        height: screenHeight
    };
}

// ==================== 获取手机信息 ====================
function getPhoneInfo() {
    try {
        var build = android.os.Build;
        return {
            brand: build.BRAND || "未知",          // 手机品牌
            model: build.MODEL || "未知",           // 手机型号
            manufacturer: build.MANUFACTURER || "未知", // 制造商
            device: build.DEVICE || "未知",         // 设备代号
            product: build.PRODUCT || "未知"        // 产品名称
        };
    } catch (e) {
        console.error("获取手机信息失败: " + e.message);
        return {
            brand: "未知",
            model: "未知",
            manufacturer: "未知",
            device: "未知",
            product: "未知"
        };
    }
}

var screenSize = getScreenSize();
var phoneInfo = getPhoneInfo();

// ==================== 导出配置 ====================
module.exports = {
    phoneInfo: phoneInfo,   // 手机信息
    screenSize: screenSize, // 屏幕尺寸
    config: {
        // ========== 屏幕配置 ==========
        designWidth: 2400,          // 设计分辨率宽度（横屏，用于坐标缩放基准）
        designHeight: 1080,         // 设计分辨率高度（横屏，用于坐标缩放基准）
        screenWidth: screenSize.width,   // 实际屏幕宽度（自动获取）
        screenHeight: screenSize.height, // 实际屏幕高度（自动获取）

        // ========== 当前服务器序号 ==========
        // 0: 特殊值，表示从步骤6（确认换区）开始执行，然后切换到序号1
        // 1-6: 对应服务器1-6
        currentIndex: 0,

        // ========== 服务器列表 ==========
        serverList: ["0", "1", "2", "3", "4", "5", "6"],

        // ========== 步骤间隔时间配置（毫秒） ==========
        // 不同机型可以配置不同的间隔时间，支持部分覆盖（只配置需要修改的项）
        stepDelays: {

            // ----- 默认配置 -----
            "default": {
                leastDelays: 500,   // 最小延迟，用于点击后几乎无延迟的地方。
                afterBack: 500,             // 点击返回按钮后等待时间（毫秒）
                afterConfirmLobby: 3000,    // 点击确认返回大厅后等待时间（毫秒）
                afterSettings: 1000,        // 点击设置按钮后等待时间（毫秒）
                afterExitGame: 500,         // 点击退出游戏后等待时间（毫秒）
                afterConfirmExit: 7000,     // 点击确认退出后等待时间（进入服务器选择界面）（毫秒）
                afterChangeServer: 500,     // 点击换区后等待时间（毫秒）
                afterSelectServer: 1000,    // 选择服务器后等待时间（毫秒）
                enterFarmWait: 7000,        // 点击进入农场后等待时间（毫秒）

                // ----- 功能7：送金币相关延时 -----
                afterMailboxBtn: 3000,      // 点击邮箱按钮后等待时间（毫秒）
                afterMailboxReceive: 4000,  // 点击快速领取后等待时间（毫秒）
                afterMailboxGive: 2000      // 点击快速赠送后等待时间（毫秒）
            },
            // ----- 小米 Redmi K60 -----
            "23113RKC6C": {
                afterConfirmExit: 5000      // 点击确认退出后等待时间（进入服务器选择界面）（毫秒）
            },
            // ----- 华为 nova 2s -----
            "HWI-AL00": {
                afterBack: 500,
                afterConfirmLobby: 5000,
                afterSettings: 1200,
                afterExitGame: 500,
                afterConfirmExit: 13000,
                afterChangeServer: 500,
                afterSelectServer: 1000,
                enterFarmWait: 13000,
                afterMailboxReceive: 7000   // 点击快速领取后等待时间（毫秒）
            },
            // ----- 华为 Mate 10 Pro -----
            "ALP-TL00": {
                afterBack: 500,
                afterConfirmLobby: 3500,
                afterSettings: 1200,
                afterExitGame: 500,
                afterConfirmExit: 8000,
                afterChangeServer: 500,
                afterSelectServer: 1000,
                enterFarmWait: 10000
            }
        },

        // ========== 坐标修正配置 ==========
        // 所有坐标配置均在此定义，支持按机型覆盖
        // 坐标格式：{ left: x1, top: y1, right: x2, bottom: y2 }
        // 设计分辨率 2400x1080，实际坐标会自动缩放
        coordFix: {
            // ----- 默认坐标配置（设计分辨率 2400x1080） -----
            "default": {
                // ===== 功能1：切换服务器相关坐标 =====
                farmBackBtn: { left: 180, top: 30, right: 270, bottom: 70 },              // 返回按钮（农场界面）
                farmReturnLobbyBtn: { left: 1260, top: 730, right: 1500, bottom: 780 },   // 农场确认返回大厅按钮
                settingsBtn: { left: 2100, top: 30, right: 2140, bottom: 70 },           // 设置按钮
                exitGameBtn: { left: 1730, top: 900, right: 2000, bottom: 940 },         // 退出游戏按钮
                confirmExitBtn: { left: 1250, top: 730, right: 1500, bottom: 790 },      // 确认退出按钮
                changeServer: { left: 1000, top: 710, right: 1450, bottom: 740 },        // 确认换区按钮
                startGameBtn: { left: 1020, top: 800, right: 1340, bottom: 870 },        // 开始游戏按钮

                // ===== 功能2/3：浇水相关坐标 =====
                enterFarmBtn: { left: 640, top: 780, right: 780, bottom: 840 },          // 进入农场按钮
                waterBtn: { left: 1490, top: 590, right: 1550, bottom: 640 },            // 浇水按钮
                joystick: { left: 300, top: 600, right: 600, bottom: 850 },              // 轮盘区域

                // ===== 功能4：结算返回相关坐标 =====
                settleReturnLobbyBtn: { left: 980, top: 950, right: 1100, bottom: 990 }, // 游戏结算返回大厅按钮
                settleConfirmReturnBtn: { left: 1250, top: 740, right: 1500, bottom: 790 }, // 游戏结算确认返回按钮

                // ===== 功能5：领取农场奖励相关坐标 =====
                farmRewardBtn: { left: 1760, top: 30, right: 1810, bottom: 70 },         // 农场奖励按钮
                claimFarmRewardBtn: { left: 1100, top: 700, right: 1300, bottom: 760 },  // 领取奖励按钮
                claimFarmRewardBtn1: { left: 660, top: 700, right: 930, bottom: 760 },   // 领取奖励按钮1（周末模式）
                claimFarmRewardBtn2: { left: 1500, top: 700, right: 1700, bottom: 760 }, // 领取奖励按钮2（周末模式）
                farmRewardBlankArea: { left: 1200, top: 860, right: 1300, bottom: 900 }, // 农场奖励空白区域点击

                // ===== 功能6：偷菜相关坐标 =====
                stealBtn: { left: 1930, top: 800, right: 2050, bottom: 900 },            // 偷菜按钮

                // ===== 功能7：关闭广告相关坐标 =====
                adNotPopBtn: { left: 1760, top: 940, right: 1780, bottom: 960 },         // 不再弹出按钮
                closeAdBtn: { left: 2015, top: 142, right: 2025, bottom: 158 },          // 关闭广告按钮

                // ===== 功能8：领取商城相关坐标 =====
                mallBtn: { left: 2000, top: 150, right: 2200, bottom: 240 },             // 商城按钮
                mallGiftBtn: { left: 830, top: 40, right: 880, bottom: 80 },             // 商城礼包按钮
                mallGiftReceiveBtn: { left: 1150, top: 720, right: 1390, bottom: 770 }, // 商城礼包领取按钮
                blankMidBottomArea: { left: 1150, top: 950, right: 1250, bottom: 970 },  // 中底部空白区域

                // ===== 功能9：送金币相关坐标 =====
                mailboxBtn: { left: 2000, top: 40, right: 2040, bottom: 80 },            // 邮箱按钮
                mailboxReceiveBtn: { left: 1950, top: 960, right: 2170, bottom: 1000 }   // 快速领取/赠送按钮
            },

            // ===== 机型修正配置（覆盖默认坐标） =====
            // 小米 Redmi K60（暂未配置修正）
            "23113RKC6C": {},
            // 华为 nova 2s
            "HWI-AL00": {
                farmBackBtn: { left: 60, top: 40, right: 150, bottom: 80 },
                settingsBtn: { left: 1980, top: 40, right: 2020, bottom: 80 },
                exitGameBtn: { left: 1610, top: 900, right: 1860, bottom: 940 },

                // ===== 功能2/3：浇水相关坐标 =====
                enterFarmBtn: { left: 470, top: 780, right: 680, bottom: 840 },

                // ===== 功能5：领取农场奖励相关坐标 =====
                farmRewardBtn: { left: 1650, top: 30, right: 1700, bottom: 70 },         // 农场奖励按钮
                claimFarmRewardBtn1: { left: 560, top: 710, right: 790, bottom: 760 },   // 领取奖励按钮1（周末模式）
                claimFarmRewardBtn2: { left: 1390, top: 710, right: 1600, bottom: 760 }, // 领取奖励按钮2（周末模式）

                // ===== 功能7：关闭广告相关坐标 =====
                adNotPopBtn: { left: 1640, top: 940, right: 1670, bottom: 960 },         // 不再弹出按钮
                closeAdBtn: { left: 1895, top: 140, right: 1910, bottom: 160 },          // 关闭广告按钮

                // ===== 功能8：领取商城相关坐标 =====
                mallGiftBtn: { left: 710, top: 40, right: 750, bottom: 80 },             // 商城礼包按钮
                mallGiftReceiveBtn: { left: 1040, top: 720, right: 1260, bottom: 770 }, // 商城礼包领取按钮

                // ===== 功能9：送金币相关坐标 =====
                mailboxBtn: { left: 1880, top: 40, right: 1920, bottom: 80 }             // 邮箱按钮
            },
            // 华为 Mate 10 Pro
            "ALP-TL00": {
                farmBackBtn: { left: 60, top: 30, right: 150, bottom: 70 },
                settingsBtn: { left: 1740, top: 30, right: 1780, bottom: 70 },
                exitGameBtn: { left: 1500, top: 900, right: 1760, bottom: 940 },
                enterFarmBtn: { left: 350, top: 780, right: 550, bottom: 860 },
                waterBtn: { left: 1240, top: 600, right: 1310, bottom: 650 },

                // ===== 功能5：领取农场奖励相关坐标 =====
                claimFarmRewardBtn1: { left: 400, top: 710, right: 660, bottom: 760 },   // 领取奖励按钮1（周末模式）
                claimFarmRewardBtn2: { left: 1260, top: 710, right: 1500, bottom: 760 }, // 领取奖励按钮2（周末模式）

                // ===== 功能7：关闭广告相关坐标 =====
                adNotPopBtn: { left: 1520, top: 940, right: 1540, bottom: 960 },         // 不再弹出按钮
                closeAdBtn: { left: 1775, top: 145, right: 1780, bottom: 155 },          // 关闭广告按钮

                // ===== 功能8：领取商城相关坐标 =====
                mallGiftBtn: { left: 710, top: 40, right: 750, bottom: 80 },             // 商城礼包按钮

                // ===== 功能9：送金币相关坐标 =====
                mailboxBtn: { left: 1640, top: 40, right: 1680, bottom: 80 }             // 邮箱按钮
            },
            // 华为 P50 Pro
            "JAD-AL00": {
                farmBackBtn: { left: 200, top: 40, right: 300, bottom: 80 },

                // ===== 功能7：关闭广告相关坐标 =====
                adNotPopBtn: { left: 1980, top: 1060, right: 2020, bottom: 1100 },        // 不再弹出按钮
                closeAdBtn: { left: 2280, top: 165, right: 2290, bottom: 175 },          // 关闭广告按钮

                // ===== 功能8：领取商城相关坐标 =====
                mallGiftBtn: { left: 930, top: 40, right: 980, bottom: 80 },             // 商城礼包按钮
                mallGiftReceiveBtn: { left: 1280, top: 810, right: 1580, bottom: 880 }, // 商城礼包领取按钮

                // ===== 功能9：送金币相关坐标 =====
                mailboxBtn: { left: 2260, top: 40, right: 2300, bottom: 80 }             // 邮箱按钮
            }
        },

        // ========== 移动持续时间机型配置（毫秒） ==========
        // 轮盘滑动移动的持续时间，不同机型可配置不同值
        moveDurationByDevice: {
            "HWI-AL00": 2000,    // 华为 nova 2s
            "ALP-TL00": 2500,    // 华为 Mate 10 Pro
            "default": 1800      // 默认值
        },

        // ========== 浇水功能配置 ==========
        water: {
            // 移动参数
            moveSettings: {
                directionX: -1,      // 方向向量X分量（-1表示向左）
                directionY: -1,      // 方向向量Y分量（-1表示向上），(-1,-1)即西北方向
                distance: 250,       // 移动距离（从中心向外拖拽的距离，设计分辨率像素）
                holdDuration: 2000   // 保持按压时间（毫秒）
            }
        },

        // ========== 自动移动功能配置 ==========
        autoMove: {
            distance: 300,           // 每次移动距离（像素，不缩放）
            moveDuration: 1000,      // 每次移动持续时间（毫秒）
            sleepDuration: 10000,    // 两次移动间休眠时间（毫秒）
            minAngle: 0,             // 最小角度：3点钟方向（0°）
            maxAngle: 270            // 最大角度：9点钟方向（270°，顺时针经过6点钟）
        },

        // ========== 功能4 - 结算返回配置 ==========
        settlement: {
            clickCount: 4,           // 返回大厅按钮点击次数
            firstClickInterval: 5000, // 第一次点击后等待时间（毫秒）
            clickInterval: 3000,     // 后续点击间隔（毫秒）
            waitAfterClick: 500      // 所有点击完成后等待时间（毫秒）
        },

        // ========== 功能5 - 领取农场奖励配置 ==========
        farmReward: {
            waitAfterEnter: 500,     // 进入农场后等待时间（毫秒）
            waitAfterReward: 500,    // 点击奖励按钮后等待时间（毫秒）
            waitAfterClaim: 800,     // 点击领取奖励后等待时间（毫秒）
            waitAfterBlank: 500,     // 点击空白区域后等待时间（毫秒）
            waitAfterBack: 500       // 点击返回后等待时间（毫秒）
        },

        // ========== 功能6 - 偷菜配置 ==========
        steal: {
            stepDistance: 100,           // 每次移动步长（像素）
            moveDuration: 1500,          // 每次移动持续时间（毫秒）
            waitAfterMove: 500,          // 移动后等待时间（毫秒）
            waitAfterSteal: 1200,        // 偷菜后等待时间（毫秒）
            rightMoveDuration: 1500,     // 向右移动到右半区的持续时间（毫秒）
            leftPath: "左左左上上右下右上右下",  // 左半区移动路径（每个字符代表一个方向：上、下、左、右）
            rightPath: "下右上右下右上上左左左"   // 右半区移动路径（每个字符代表一个方向：上、下、左、右）


        }
    }
};