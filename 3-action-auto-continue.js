// ⚠️ このスクリプトを貼り付ける前に、必ずセットアップスクリプトを貼り付けてください！

class AutoContinueToolAction extends BaseAction {
  constructor() {
    super("自動続行");
  }

  check() {
    console.log(`[${this.name}] 条件をチェック中...`);
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return null; // 条件不一致

    // ツールリクエストテキストを探してダイアログを特定
    const allowButton = [...dialog.querySelectorAll("button")].find(
      button => button.innerText === "このチャットで許可する"
    );
    if (!allowButton) return null; // 正しいダイアログ構造ではない

    console.log(`[${this.name}] '許可'ボタンを発見しました。`);
    return { button: allowButton, toolName: "自動ツール許可" };
  }

  execute(data) {
    if (!data || !data.button) {
      console.error(`[${this.name}] 有効なデータなしで実行が呼び出されました。`);
      return;
    }
    console.log(`🚀 [${this.name}] ツールを自動承認中: ${data.toolName}`);
    data.button.click();
  }
}

// レジストリにアクションインスタンスを追加
// 一度だけ追加されることを確認するか、追加を慎重に管理する
if (!window.autoActionsRegistry.some(action => action.name === "自動続行")) {
    window.autoActionsRegistry.push(new AutoContinueToolAction());
    console.log("🤖 自動続行アクションをレジストリに追加しました。");
}