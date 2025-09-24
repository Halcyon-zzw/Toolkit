// popup.js
document.addEventListener('DOMContentLoaded', function() {
  // 功能切换逻辑
  document.getElementById('featureOneBtn').addEventListener('click', function() {
    switchFeature('popup_feature1.html', 'featureOneBtn', 'featureTwoBtn');
  });

  document.getElementById('featureTwoBtn').addEventListener('click', function() {
    switchFeature('popup_feature2.html', 'featureTwoBtn', 'featureOneBtn');
  });

  function switchFeature(src, activeBtnId, inactiveBtnId) {
    // 更新按钮状态
    document.getElementById(activeBtnId).classList.add('active');
    document.getElementById(inactiveBtnId).classList.remove('active');

    // 更新iframe源
    const frame = document.getElementById('featureFrame');
    frame.src = src;

    // 添加加载完成监听器
    frame.onload = function() {
      console.log('Frame loaded:', src);
    };
  }
});
