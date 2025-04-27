// ⚠️ このスクリプトを貼り付ける前に、必ずセットアップスクリプトを貼り付けてください！

class AutoContinueToolAction extends BaseAction {
  constructor() {
    super("自動続行");
  }

  check() {
    const buttons = document.querySelectorAll('[data-testid="message-warning"] button');
    if (!buttons.length) return null; // 条件不一致

    // ツールリクエストテキストを探してダイアログを特定
    const continueButton = [...buttons].find(
      button => button.innerText === "続ける"
    );
    if (!continueButton) return null; // 正しいダイアログ構造ではない

    console.log(`[${this.name}] '続ける'ボタンを発見しました。`);
    return { button: continueButton, toolName: "自動続行" };
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
