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
            brand: build.BRAND || "未知",
            model: build.MODEL || "未知",
            manufacturer: build.MANUFACTURER || "未知",
            device: build.DEVICE || "未知",
            product: build.PRODUCT || "未知"
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
    phoneInfo: phoneInfo,
    screenSize: screenSize,
    config: {
        // ========== 屏幕配置 ==========
        designWidth: 2400,
        designHeight: 1080,
        screenWidth: screenSize.width,
        screenHeight: screenSize.height,

        // ========== 当前服务器序号 ==========
        currentIndex: 0,

        // ========== 服务器列表 ==========
        serverList: ["0", "1", "2", "3", "4", "5", "6"],

        // ========== 步骤间隔时间配置（毫秒） ==========
        stepDelays: {
            "default": {
                afterBack: 500,
                afterConfirmLobby: 3000,
                afterSettings: 1000,
                afterExitGame: 500,
                afterConfirmExit: 7000,
                afterChangeServer: 500,
                afterSelectServer: 1000,
                enterFarmWait: 7000
            },
            "23113RKC6C": {
                afterConfirmExit: 5000,
            },
            "HWI-AL00": {
                afterBack: 500,
                afterConfirmLobby: 5000,
                afterSettings: 1200,
                afterExitGame: 500,
                afterConfirmExit: 13000,
                afterChangeServer: 500,
                afterSelectServer: 1000,
                enterFarmWait: 13000
            },
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
        coordFix: {
            "default": {
                farmBackBtn: { left: 80, top: 30, right: 240, bottom: 70 },
                farmReturnLobbyBtn: { left: 1260, top: 730, right: 1500, bottom: 780 },
                settingsBtn: { left: 2100, top: 30, right: 2140, bottom: 70 },
                exitGameBtn: { left: 1730, top: 900, right: 2000, bottom: 940 },
                confirmExitBtn: { left: 1250, top: 730, right: 1500, bottom: 790 },
                changeServer: { left: 1000, top: 710, right: 1450, bottom: 740 },
                startGameBtn: { left: 1020, top: 800, right: 1340, bottom: 870 },
                enterFarmBtn: { left: 640, top: 780, right: 780, bottom: 840 },
                waterBtn: { left: 1490, top: 590, right: 1550, bottom: 640 },
                joystick: { left: 300, top: 600, right: 600, bottom: 850 },
                settleReturnLobbyBtn: { left: 980, top: 950, right: 1100, bottom: 990 },
                settleConfirmReturnBtn: { left: 1250, top: 740, right: 1500, bottom: 790 },
                farmRewardBtn: { left: 1760, top: 30, right: 1810, bottom: 70 },
                claimFarmRewardBtn: { left: 1100, top: 700, right: 1300, bottom: 760 },
                farmRewardBlankArea: { left: 1200, top: 860, right: 1300, bottom: 900 },
                stealBtn: { left: 1930, top: 800, right: 2050, bottom: 900 }
            },
            "23113RKC6C": {},
            "HWI-AL00": {
                farmBackBtn: { left: 30, top: 40, right: 150, bottom: 80 },
                settingsBtn: { left: 1980, top: 40, right: 2020, bottom: 80 },
                exitGameBtn: { left: 1610, top: 900, right: 1860, bottom: 940 }
            },
            "ALP-TL00": {
                settingsBtn: { left: 1740, top: 30, right: 1780, bottom: 70 },
                exitGameBtn: { left: 1500, top: 900, right: 1760, bottom: 940 },
                enterFarmBtn: { left: 350, top: 780, right: 550, bottom: 860 },
                waterBtn: { left: 1240, top: 600, right: 1310, bottom: 650 }
            },
            "JAD-AL00": {}
        },

        moveDurationByDevice: {
            "HWI-AL00": 2000,
            "ALP-TL00": 2500,
            "default": 1800
        },

        water: {
            moveSettings: {
                directionX: -1,
                directionY: -1,
                distance: 250,
                holdDuration: 2000
            }
        },

        autoMove: {
            distance: 300,
            moveDuration: 1000,
            sleepDuration: 10000,
            minAngle: 0,
            maxAngle: 270
        },

        settlement: {
            clickCount: 4,
            firstClickInterval: 5000,
            clickInterval: 3000,
            waitAfterClick: 500
        },

        farmReward: {
            waitAfterEnter: 500,
            waitAfterReward: 500,
            waitAfterClaim: 800,
            waitAfterBlank: 500,
            waitAfterBack: 500
        },

        steal: {
            stepDistance: 100,
            moveDuration: 1500,
            waitAfterMove: 500,
            waitAfterSteal: 1000,
            rightMoveDuration: 1500,
            leftPath: "左左左上上右下右上右下",
            rightPath: "下右上右下右上上左左左"
        }
    }
};