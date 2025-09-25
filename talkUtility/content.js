// 修改 content.js 文件
window.addEventListener('load', function() {
  chrome.storage.sync.get(['username', 'password'], function(result) {
    if (result.username && result.password) {
      // 等待 Vue 实例加载完成
      const fillForm = () => {
        // 查找输入框元素
        const loginIdInput = document.querySelector('input[autocomplete="on"]');
        const passwordInput = document.querySelector('input[type="password"]');

        if (loginIdInput && passwordInput) {
          // 完全禁用自动填充
          loginIdInput.setAttribute('autocomplete', 'new-password');
          passwordInput.setAttribute('autocomplete', 'new-password');
          loginIdInput.setAttribute('autocapitalize', 'off');
          passwordInput.setAttribute('autocapitalize', 'off');
          loginIdInput.setAttribute('autocorrect', 'off');
          passwordInput.setAttribute('autocorrect', 'off');

          // 清除可能存在的旧值
          loginIdInput.value = '';
          passwordInput.value = '';

          // 触发事件让Vue知道值已更改
          loginIdInput.dispatchEvent(new Event('input', { bubbles: true }));
          passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

          // 使用防抖动方式多次设置值，确保覆盖浏览器自动填充
          const setValueWithRetry = (element, value, times = 5) => {
            let count = 0;
            const interval = setInterval(() => {
              element.value = value;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));

              count++;
              if (count >= times) {
                clearInterval(interval);
              }
            }, 100);

            // 立即执行一次
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
          };

          // 设置用户名和密码
          setValueWithRetry(loginIdInput, result.username);
          setValueWithRetry(passwordInput, result.password);

          // 同时更新 Vue 实例中的数据
          setTimeout(() => {
            const vueApp = document.querySelector('#login')?.__vue__;
            if (vueApp && vueApp.ruleForm) {
              vueApp.ruleForm.loginId = result.username;
              vueApp.ruleForm.password = result.password;

              // 强制更新Vue组件
              if (vueApp.$forceUpdate) {
                vueApp.$forceUpdate();
              }
            }
          }, 200);

          // 最后再做一次确认，防止浏览器自动填充覆盖
          setTimeout(() => {
            if (loginIdInput.value !== result.username) {
              loginIdInput.value = result.username;
              loginIdInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (passwordInput.value !== result.password) {
              passwordInput.value = result.password;
              passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }, 1000);
        } else {
          // 如果元素还没加载，等待后重试
          setTimeout(fillForm, 500);
        }
      };

      // 开始尝试填充表单
      fillForm();
    }
  });
});

// 监听DOM变化，防止动态加载的表单元素
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      chrome.storage.sync.get(['username', 'password'], function(result) {
        if (result.username && result.password) {
          const loginIdInput = document.querySelector('input[autocomplete="on"]');
          const passwordInput = document.querySelector('input[type="password"]');

          if (loginIdInput && passwordInput &&
              (loginIdInput.value !== result.username || passwordInput.value !== result.password)) {
            // 如果发现表单元素且值不匹配，则重新填充
            setTimeout(() => {
              loginIdInput.value = result.username;
              passwordInput.value = result.password;

              loginIdInput.dispatchEvent(new Event('input', { bubbles: true }));
              passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
              loginIdInput.dispatchEvent(new Event('change', { bubbles: true }));
              passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
            }, 100);
          }
        }
      });
    }
  });
});

// 开始观察DOM变化
observer.observe(document.body, {
  childList: true,
  subtree: true
});
