# Claude Desktop MCP 自動許可スクリプト
Claude Desktop で MCP（ツール）を使用する際の許可ダイアログを自動的に承認するための軽量で拡張可能なスクリプトです。

> **参考**: このプロジェクトは[Rafal Wilinskiのオリジナルスクリプト](https://gist.github.com/RafalWilinski/3416a497f94ee2a0c589a8d930304950)にインスパイアされています。

## 概要
このフレームワークでは、特定の条件が満たされたときに実行されるカスタム「アクション」を定義することで、Claude UIでの繰り返しの操作を自動化できます。DOM変更を監視するためのMutation Observerを使用し、定義したアクションを自動的にトリガーします。

> **⚠️ 注意**: このスクリプトは自己責任で使用してください。Claude UIの仕様変更により動作しなくなる可能性があります。また、非公式ツールのため、Anthropicのポリシーに違反する可能性があることをご了承ください。

## 特徴
- **レジストリシステム**: 複数の自動化アクションを一元管理
- **標準化されたアクションパターン**: アクション間で一貫したcheck/execute実装
- **グローバルクールダウン**: 設定可能なタイムアウトによるアクションの氾濫を防止
- **エラー処理**: 個々のアクションに対する堅牢なエラー管理

## インストール方法
1. Claude Desktopを開く
2. ヘルプ -> 開発者モードを有効にする
3. 開発者ツールを開く：
   - Windows: Ctrl + Shift + Alt + I
   - Mac: Cmd + Shift + Option + I
   - または「Developer Tools - https://claude.ai」という名前の開発者ツールウィンドウを手動で開く
4. 「Console」タブに移動
5. 「allow pasting」と入力してEnterキーを押す
6. 以下のいずれかを実行：
   - 個別のスクリプトを貼り付ける：
     a. セットアップスクリプト（1-setup.js）を貼り付ける
     b. アクション実装（例：2-action-auto-confirm.js）を貼り付ける
   - または、次のセクションにある簡易コピー/ペーストのコードを一括で貼り付ける（推奨）

## 簡易コピー/ペースト
以下のスクリプトは 1-setup.js と 2-action-auto-confirm.js と 3-action-auto-continue.js を統合した一括コピー/ペーストバージョンです。セットアップとアクション実装を1回で完了できます。

```javascript
let lastActionTime=0;const GLOBAL_COOLDOWN_MS=2000;window.autoActionsRegistry=window.autoActionsRegistry||[];class BaseAction{constructor(name){if(!name)throw new Error("アクションには名前が必要です。");this.name=name} check(){console.warn(`アクション "${this.name}" には check() 実装がありません。`);return!1} execute(data){console.warn(`アクション "${this.name}" には execute() 実装がありません。`)}} if(window.myMutationObserver){console.log("以前のオブザーバーを切断中...");window.myMutationObserver.disconnect()} console.log("新しいMutation Observerをセットアップ中...");const observer=new MutationObserver((mutations)=>{const now=Date.now();if(now-lastActionTime<GLOBAL_COOLDOWN_MS){console.log("🕒 グローバルクールダウンが有効です。変更チェックをスキップします。");return} for(const actionInstance of window.autoActionsRegistry){try{const actionData=actionInstance.check();if(actionData){console.log(`✅ [${actionInstance.name}] 条件が満たされました。実行準備中。`);actionInstance.execute(actionData);lastActionTime=now;console.log(`⏱️ [${actionInstance.name}] アクション実行完了。クールダウン開始。`);break}else{}}catch(error){console.error(`"${actionInstance.name}" のアクションcheck/executeでエラーが発生:`,error)}}});observer.observe(document.body,{childList:!0,subtree:!0,});window.myMutationObserver=observer;console.log("✅ オブザーバーが開始されました。変更を監視中...");console.log("登録されたアクション:",window.autoActionsRegistry.map(a=>a.name));class AutoConfirmToolAction extends BaseAction{constructor(){super("自動ツール許可")} check(){const dialog=document.querySelector('[role="dialog"]');if(!dialog)return null;const allowButton=[...dialog.querySelectorAll("button")].find(button=>button.innerText==="このチャットで許可する");if(!allowButton)return null;console.log(`[${this.name}] 'このチャットで許可する'ボタンを発見しました。`);return{button:allowButton,toolName:"自動ツール許可"}} execute(data){if(!data||!data.button){console.error(`[${this.name}] 有効なデータなしで実行が呼び出されました。`);return} console.log(`🚀 [${this.name}] ツールを自動承認中: ${data.toolName}`);data.button.click()}} if(!window.autoActionsRegistry.some(action=>action.name==="自動ツール許可")){window.autoActionsRegistry.push(new AutoConfirmToolAction());console.log("🤖 自動ツール許可アクションをレジストリに追加しました。")} class AutoContinueToolAction extends BaseAction{constructor(){super("自動続行")} check(){const buttons=document.querySelectorAll('[data-testid="message-warning"] button');if(!buttons.length)return null;const continueButton=[...buttons].find(button=>button.innerText==="続ける");if(!continueButton)return null;console.log(`[${this.name}] '続ける'ボタンを発見しました。`);return{button:continueButton,toolName:"自動続行"}} execute(data){if(!data||!data.button){console.error(`[${this.name}] 有効なデータなしで実行が呼び出されました。`);return} console.log(`🚀 [${this.name}] ツールを自動承認中: ${data.toolName}`);data.button.click()}} if(!window.autoActionsRegistry.some(action=>action.name==="自動続行")){window.autoActionsRegistry.push(new AutoContinueToolAction());console.log("🤖 自動続行アクションをレジストリに追加しました。")}
```

## 含まれるアクション
### 自動ツール承認
Claude がツールを実行するための許可を求めるときに「このチャットに許可」を自動的にクリックします - 開発およびテスト中の繰り返しの承認を不要にします。

## カスタムアクションの作成
フレームワークを拡張するには、以下を実装する新しいアクションクラスを作成します：

- `check()` - アクションを実行する条件が満たされているかを判定
- `execute()` - 実際のDOM操作を実行

その後、フレームワークに登録します：

```javascript
window.autoActionsRegistry.push(new YourCustomAction());
```
