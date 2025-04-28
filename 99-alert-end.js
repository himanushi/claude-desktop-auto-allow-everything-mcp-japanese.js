let lastActivityTime = Date.now();
let idleCheckInterval = null;
let isAlreadyAlerted = false;
const IDLE_TIMEOUT_MS = 10000;

// アクティビティが発生したことを記録する関数
function recordActivity() {
  lastActivityTime = Date.now();
  isAlreadyAlerted = false;
  console.log("🔄 アクティビティを記録しました");
}

// ビープ音を再生する関数
function playBeep() {
  console.log("🔊 アイドル状態検出！ビープ音を再生します。");

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
}

// アイドル状態チェックを開始
function startIdleCheck() {
  if (idleCheckInterval) {
    clearInterval(idleCheckInterval);
  }

  console.log(
    "⏱️ アイドル状態監視を開始します (1分間無活動でビープ音が鳴ります)",
  );

  // 初期アクティビティを記録
  recordActivity();

  // 定期的にアイドル状態をチェック
  idleCheckInterval = setInterval(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime;

    // デバッグ用
    // console.log(`最後のアクティビティから ${Math.floor(timeSinceLastActivity / 1000)} 秒経過`);

    if (timeSinceLastActivity >= IDLE_TIMEOUT_MS && !isAlreadyAlerted) {
      // 1分間アクティビティがなかった場合
      playBeep();
      isAlreadyAlerted = true;
    }
  }, 5000); // 5秒ごとにチェック
}

// オリジナルのdisconnect関数を保存
const originalDisconnect = observer.disconnect;

// オブザーバーのdisconnect関数をオーバーライド
observer.disconnect = function () {
  console.log("📢 オブザーバーが停止されました");
  originalDisconnect.call(this);

  // オブザーバー停止時にもアクティビティとして記録
  recordActivity();
};

// アイドル状態チェックを開始
startIdleCheck();

console.log(
  "✅ 全機能のセットアップが完了しました。自動ツール承認とアイドル検出が有効です。",
);
