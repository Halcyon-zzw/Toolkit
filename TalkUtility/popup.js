// popup.js
document.addEventListener('DOMContentLoaded', function() {
  // 功能切换逻辑
  document.getElementById('featureOneBtn').addEventListener('click', function() {
    switchFeature('features/feature1/popup_feature1.html', 'featureOneBtn', ['featureTwoBtn', 'featureThreeBtn', 'featureFourBtn']);
  });

  document.getElementById('featureTwoBtn').addEventListener('click', function() {
    switchFeature('features/feature2/popup_feature2.html', 'featureTwoBtn', ['featureOneBtn', 'featureThreeBtn', 'featureFourBtn']);
  });

  document.getElementById('featureThreeBtn').addEventListener('click', function() {
    switchFeature('features/feature3/popup_feature3.html', 'featureThreeBtn', ['featureOneBtn', 'featureTwoBtn', 'featureFourBtn']);
  });

  document.getElementById('featureFourBtn').addEventListener('click', function() {
    switchFeature('features/feature4/popup_feature4.html', 'featureFourBtn', ['featureOneBtn', 'featureTwoBtn', 'featureThreeBtn']);
  });

  function switchFeature(src, activeBtnId, inactiveBtnIds) {
    // 更新按钮状态
    document.getElementById(activeBtnId).classList.add('active');
    inactiveBtnIds.forEach(id => {
      document.getElementById(id).classList.remove('active');
    });

    // 更新iframe源
    const frame = document.getElementById('featureFrame');
    frame.src = src;

    // 添加加载完成监听器
    frame.onload = function() {
      console.log('Frame loaded:', src);
    };
  }
});