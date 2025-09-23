window.addEventListener('load', function() {
  chrome.storage.sync.get(['username', 'password'], function(result) {
    if (result.username && result.password) {
      // 等待 Vue 实例加载完成
      const fillForm = () => {
        // 查找输入框元素
        const loginIdInput = document.querySelector('input[autocomplete="on"]');
        const passwordInput = document.querySelector('input[type="password"]');

        if (loginIdInput && passwordInput) {
          // 设置值
          loginIdInput.value = result.username;
          passwordInput.value = result.password;

          // 触发 Vue 的数据更新事件
          loginIdInput.dispatchEvent(new Event('input', { bubbles: true }));
          passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

          // 同时更新 Vue 实例中的数据
          const vueApp = document.querySelector('#login').__vue__;
          if (vueApp && vueApp.ruleForm) {
            vueApp.ruleForm.loginId = result.username;
            vueApp.ruleForm.password = result.password;
          }
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