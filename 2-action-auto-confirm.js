// ⚠️ このスクリプトを貼り付ける前に、必ずセットアップスクリプトを貼り付けてください！

class AutoConfirmToolAction extends BaseAction {
  constructor() {
    super("自動ツール許可");
  }

  check() {
    console.log(`[${this.name}] 条件をチェック中...`);
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return null; // 条件不一致

    // ツールリクエストテキストを探してダイアログを特定
    const buttonWithDiv = dialog.querySelector("button div");
    if (!buttonWithDiv) return null; // 正しいダイアログ構造ではない

    const toolText = buttonWithDiv.textContent;
    // 英語版UI
    if (toolText && toolText.includes("Run ") && toolText.includes(" from")) {
      const toolNameMatch = toolText.match(/Run (\S+) from/);
      const toolName = toolNameMatch ? toolNameMatch[1] : "不明なツール";
      console.log(`[${this.name}] ツールリクエストダイアログを発見: ${toolName}`);

      // 確認ボタンを探す
      const allowButton = Array.from(dialog.querySelectorAll("button")).find(
        (button) => button.textContent.toLowerCase().includes("allow for this chat")
      );

      if (allowButton) {
        console.log(`[${this.name}] '許可'ボタンを発見しました。`);
        // 実行に必要なデータを返す: ボタンとログ用のツール名
        return { button: allowButton, toolName: toolName };
      }
    }
    // 日本語版UI
    else if (toolText && toolText.includes("を実行")) {
      const toolNameMatch = toolText.match(/(.+)を実行/);
      const toolName = toolNameMatch ? toolNameMatch[1] : "不明なツール";
      console.log(`[${this.name}] ツールリクエストダイアログを発見: ${toolName}`);

      // 確認ボタンを探す（日本語版）
      const allowButton = Array.from(dialog.querySelectorAll("button")).find(
        (button) => button.textContent.includes("このチャットで許可する")
      );

      if (allowButton) {
        console.log(`[${this.name}] '許可'ボタンを発見しました。`);
        // 実行に必要なデータを返す: ボタンとログ用のツール名
        return { button: allowButton, toolName: toolName };
      }
    }

    return null; // 条件不一致
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
if (!window.autoActionsRegistry.some(action => action.name === "自動ツール許可")) {
    window.autoActionsRegistry.push(new AutoConfirmToolAction());
    console.log("🤖 自動ツール許可アクションをレジストリに追加しました。");
}