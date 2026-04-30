### 一、新增逻辑
1. 在自动点击循环中过程中，每5s（可配置）通过OCR识别joinOCRArea区域，如果不为“加入”，则跳出循环点击。并切换按钮状态。
2. 注意，手动点击按钮停止的循环不需要执行该步骤。识别顶部区域levelOcrArea，根据不同的层数选择不同的阵容，可配置，依次点击区域：planButtonLocation、$configLocation、levelOcrArea、levelOcrArea, 每次点击间隔100ms（加上随机数）
   配置如下
3. 点击准备区域prepareButtonLocation
4. 结束

```
彩虹3层：plan4ButtonLocation
彩虹4层：plan4ButtonLocation
彩虹5层：plan2ButtonLocation
其他楼层默认plan2ButtonLocation
```



### 二、坐标区域配置

```python
# ========== OCR识别区域 ==========
# 加入按钮识别区域（检测游戏是否就绪）
joinOcrArea = (580, 1710, 730, 1770)

# 当前楼层识别区域
levelOcrArea = (420, 280, 650, 360)

# ========== 按钮点击区域 ==========
# 方案主入口按钮
planButtonLocation = (880, 1950, 940, 1990)

# 方案2按钮（用于彩虹5层）
plan2ButtonLocation = (480, 720, 500, 740)

# 方案4按钮（用于彩虹3-4层）
plan4ButtonLocation = (830, 720, 850, 740)

# 准备按钮
prepareButtonLocation = (500, 1930, 600, 2000)
```

### 三、异常处理说明

| 异常场景 | 处理方式        |
|----------|-------------|
| OCR识别“加入”失败 | 等待下次检测      |
| 楼层识别失败/为空 | 使用默认方案，记录日志 |

### 四、日志输出规范

```
[时间] 状态: 检测到游戏未就绪，等待中...
[时间] 状态: 游戏就绪
[时间] 楼层识别: 彩虹4层 → 使用方案4
[时间] 点击: 方案入口 → 方案4按钮 → 准备按钮
```

---
