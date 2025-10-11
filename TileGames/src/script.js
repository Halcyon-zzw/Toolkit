document.addEventListener('DOMContentLoaded', function() {
    // 初始化玩家名称编辑功能
    initPlayerNameEditing();

    // 初始化按钮选择功能
    initButtonSelection();

    // 初始化计数器按钮功能
    initCounterButtons();
});

// 初始化玩家名称编辑功能
function initPlayerNameEditing() {
    const playerNames = document.querySelectorAll('.player-name');

    playerNames.forEach(nameElement => {
        // 限制输入长度为10个字符
        nameElement.addEventListener('input', function() {
            if (this.textContent.length > 10) {
                this.textContent = this.textContent.substring(0, 10);
                // 将光标移到末尾
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(this);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });

        // 失去焦点时，如果为空，则设置默认名称
        nameElement.addEventListener('blur', function() {
            if (!this.textContent.trim()) {
                this.textContent = '玩家';
            }
        });

        // 按下回车键时，失去焦点
        nameElement.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
}

// 初始化按钮选择功能
function initButtonSelection() {
    const allButtons = document.querySelectorAll('.hu-btn, .gang-btn, .fangpao-btn');

    allButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonType = this.getAttribute('data-type');
            const playerPosition = getPlayerPosition(this);

            // 处理放炮按钮逻辑
            if (buttonType === 'fangpao') {
                handleFangPaoSelection(this, playerPosition);
            }
            // 处理胡牌按钮逻辑
            else if (this.classList.contains('hu-btn')) {
                handleHuButtonSelection(this, playerPosition);
            }
            // 处理杠按钮逻辑
            else if (this.classList.contains('gang-btn')) {
                handleGangButtonSelection(this, playerPosition);
            }
        });
    });
}

// 处理放炮按钮选择
function handleFangPaoSelection(button, playerPosition) {
    // 检查是否有其他玩家已选择放炮
    const allFangPaoButtons = document.querySelectorAll('.fangpao-btn');
    const otherActiveFangPao = Array.from(allFangPaoButtons).find(btn =>
        btn !== button && btn.classList.contains('active')
    );

    // 如果有其他玩家已选择放炮，则取消其选择
    if (otherActiveFangPao) {
        otherActiveFangPao.classList.remove('active');
        // 启用该玩家的胡牌按钮
        enablePlayerHuButtons(otherActiveFangPao.closest('.player'));
    }

    // 切换当前放炮按钮的状态
    button.classList.toggle('active');

    // 获取当前玩家的所有按钮容器
    const currentPlayer = button.closest(`.player.${playerPosition}`);

    if (button.classList.contains('active')) {
        // 禁用该玩家的所有胡牌按钮
        disablePlayerHuButtons(currentPlayer);
    } else {
        // 启用该玩家的所有胡牌按钮
        enablePlayerHuButtons(currentPlayer);
    }
}

// 禁用玩家的胡牌按钮
function disablePlayerHuButtons(playerElement) {
    const playerHuButtons = playerElement.querySelectorAll('.hu-btn');
    playerHuButtons.forEach(huBtn => {
        huBtn.classList.add('disabled');
        huBtn.disabled = true;

        // 移除按钮内的计数器显示元素
        const counterDisplay = huBtn.querySelector('.counter-display');
        if (counterDisplay) {
            counterDisplay.remove();
        }

        // 隐藏计数器容器
        if (huBtn.getAttribute('data-type') === 'dahu' || huBtn.getAttribute('data-type') === 'bao') {
            const playerPosition = getPlayerPosition(huBtn);
            const counterId = `${huBtn.getAttribute('data-type')}-counter-${playerPosition}`;
            const counter = document.getElementById(counterId);
            if (counter) {
                counter.style.display = 'none';
            }
        }
    });
}

// 启用玩家的胡牌按钮
function enablePlayerHuButtons(playerElement) {
    const playerHuButtons = playerElement.querySelectorAll('.hu-btn');
    playerHuButtons.forEach(huBtn => {
        huBtn.classList.remove('disabled');
        huBtn.disabled = false;
    });
}

// 处理胡牌按钮选择
function handleHuButtonSelection(button, playerPosition) {
    // 检查按钮是否被禁用
    if (button.classList.contains('disabled')) {
        return;
    }

    // 检查该玩家的放炮按钮是否已选中
    const fangPaoButton = document.querySelector(`.player.${playerPosition} .fangpao-btn`);
    if (fangPaoButton && fangPaoButton.classList.contains('active')) {
        return; // 如果放炮按钮已选中，则不允许选择胡牌按钮
    }

    // 切换当前胡牌按钮的状态
    button.classList.toggle('active');

    // 处理大胡和宝按钮的计数器显示
    const buttonType = button.getAttribute('data-type');
    if (buttonType === 'dahu' || buttonType === 'bao') {
        const counterId = `${buttonType}-counter-${playerPosition}`;
        const counter = document.getElementById(counterId);

        if (counter) {
            if (button.classList.contains('active')) {
                // 添加计数器显示元素到按钮内
                if (!button.querySelector('.counter-display')) {
                    const counterDisplay = document.createElement('span');
                    counterDisplay.className = 'counter-display';
                    counterDisplay.textContent = '*1';
                    button.appendChild(counterDisplay);
                }
                counter.style.display = 'block';
            } else {
                // 移除按钮内的计数器显示元素
                const counterDisplay = button.querySelector('.counter-display');
                if (counterDisplay) {
                    counterDisplay.remove();
                }
                counter.style.display = 'none';
            }
        }
    }
}

// 处理杠按钮选择
function handleGangButtonSelection(button, playerPosition) {
    // 切换当前杠按钮的状态
    button.classList.toggle('active');

    // 处理内杠按钮的计数器显示
    const buttonType = button.getAttribute('data-type');
    if (buttonType === 'neigang') {
        const counterId = `${buttonType}-counter-${playerPosition}`;
        const counter = document.getElementById(counterId);

        if (counter) {
            if (button.classList.contains('active')) {
                // 添加计数器显示元素到按钮内
                if (!button.querySelector('.counter-display')) {
                    const counterDisplay = document.createElement('span');
                    counterDisplay.className = 'counter-display';
                    counterDisplay.textContent = '*1';
                    button.appendChild(counterDisplay);
                }
                counter.style.display = 'block';
            } else {
                // 移除按钮内的计数器显示元素
                const counterDisplay = button.querySelector('.counter-display');
                if (counterDisplay) {
                    counterDisplay.remove();
                }
                counter.style.display = 'none';
            }
        }
    }
}

// 初始化计数器按钮功能
function initCounterButtons() {
    const counterButtons = document.querySelectorAll('.counter-btn');

    counterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡到父按钮
            const parentContainer = this.parentElement;
            const mainButton = parentContainer.parentElement.querySelector('.btn');

            // 获取当前计数
            const counterDisplay = mainButton.querySelector('.counter-display');
            if (counterDisplay) {
                const currentCount = parseInt(counterDisplay.textContent.replace('*', '')) || 1;
                const newCount = currentCount + 1;
                counterDisplay.textContent = `*${newCount}`;
            }
        });
    });
}

// 获取玩家位置（top, right, bottom, left）
function getPlayerPosition(element) {
    const playerElement = element.closest('.player');
    if (playerElement.classList.contains('top')) return 'top';
    if (playerElement.classList.contains('right')) return 'right';
    if (playerElement.classList.contains('bottom')) return 'bottom';
    if (playerElement.classList.contains('left')) return 'left';
    return '';
}
