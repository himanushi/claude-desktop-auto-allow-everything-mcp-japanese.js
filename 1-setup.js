/**
 * 🏗️ 使用方法
 * 1. Claude Desktopを開く
 * 2. ヘルプ -> 開発者モードを有効にする
 * 3. 「Developer Tools - https://claude.ai」という名前の開発者ツールウィンドウに移動
 * 4. 「Console」タブに移動
 * 5. 「allow pasting」と入力してEnterキーを押す
 * 6. このスニペットを貼り付けてEnterキーを押す
 * 
 * 作成者: @rvanbaalen
 * @RafalWilinskiのオリジナルの自動承認スクリプトにインスパイア: 
 * https://gist.github.com/RafalWilinski/3416a497f94ee2a0c589a8d930304950
 */

// --- 設定 & レジストリ ---

// グローバルクールダウンの追跡
let lastActionTime = 0;
const GLOBAL_COOLDOWN_MS = 2000; // 2秒クールダウン

// レジストリがない場合はwindowオブジェクトに初期化
window.autoActionsRegistry = window.autoActionsRegistry || [];

// --- アクションクラス定義 ---

// （オプション）構造のためのベースクラス - 型ヒントや共有ロジックに便利
class BaseAction {
  constructor(name) {
    if (!name) throw new Error("アクションには名前が必要です。");
    this.name = name;
  }

  // 条件が満たされているかチェック。execute()に必要なデータを返すか、条件が満たされない場合はfalsyを返す
  check() {
    console.warn(`アクション "${this.name}" には check() 実装がありません。`);
    return false;
  }

  // check()からのデータを使用してアクションを実行
  execute(data) {
    console.warn(`アクション "${this.name}" には execute() 実装がありません。`);
  }
}

if (window.myMutationObserver) {
  console.log("以前のオブザーバーを切断中...");
  window.myMutationObserver.disconnect();
}

console.log("新しいMutation Observerをセットアップ中...");

const observer = new MutationObserver((mutations) => {
  const now = Date.now();
  // グローバルクールダウンをチェック
  if (now - lastActionTime < GLOBAL_COOLDOWN_MS) {
    console.log("🕒 グローバルクールダウンが有効です。変更チェックをスキップします。");
    return;
  }

  // 登録済みアクションを反復処理
  for (const actionInstance of window.autoActionsRegistry) {
    try {
      // アクションの条件が満たされているかチェック
      const actionData = actionInstance.check();

      if (actionData) {
        console.log(`✅ [${actionInstance.name}] 条件が満たされました。実行準備中。`);
        // 条件が満たされた場合、アクションを実行
        actionInstance.execute(actionData);

        // グローバルクールダウンを設定
        lastActionTime = now;
        console.log(`⏱️ [${actionInstance.name}] アクション実行完了。クールダウン開始。`);

        // 重要: この変更バッチに対する他のアクションのチェックを停止
        // 同じ変更に対して複数のアクションが発火するのを防ぎ、クールダウンを尊重
        break;
      } else {
         // console.log(`- [${actionInstance.name}] 条件が満たされていません。`); // ノイズになる可能性
      }
    } catch (error) {
      console.error(`"${actionInstance.name}" のアクションcheck/executeでエラーが発生:`, error);
      // オプションで次のアクションに続行するか、望ましい堅牢性に応じて中断
      // continue;
    }
  }
});

// 子ツリーと子リストの変更についてドキュメントボディの観察を開始
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// 後で管理するためにwindowにobserverインスタンスを格納（例：切断）
window.myMutationObserver = observer;

console.log("✅ オブザーバーが開始されました。変更を監視中...");
console.log("登録されたアクション:", window.autoActionsRegistry.map(a => a.name));