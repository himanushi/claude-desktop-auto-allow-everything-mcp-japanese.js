# Claude自動アクション・フレームワーク
Claude AIインターフェイス内での操作を自動化するための軽量で拡張可能なフレームワークです。

> **参考**: このプロジェクトは[Rafal Wilinskiのオリジナルスクリプト](https://gist.github.com/RafalWilinski/3416a497f94ee2a0c589a8d930304950)にインスパイアされています。

## 概要
このフレームワークでは、特定の条件が満たされたときに実行されるカスタム「アクション」を定義することで、Claude UIでの繰り返しの操作を自動化できます。DOM変更を監視するためのMutation Observerを使用し、定義したアクションを自動的にトリガーします。

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
以下のスクリプトは1-setup.jsと2-action-auto-confirm.jsを統合した一括コピー/ペーストバージョンです。セットアップとアクション実装を1回で完了できます。

```javascript
(()=>{class BaseAction{constructor(e){if(!e)throw new Error("アクションには名前が必要です。");this.name=e}check(){console.warn(`アクション "${this.name}" にcheck()の実装がありません。`);return!1}execute(e){console.warn(`アクション "${this.name}" にexecute()の実装がありません。`)}}let t=0,e=2e3;window.autoActionsRegistry=window.autoActionsRegistry||[],window.myMutationObserver&&window.myMutationObserver.disconnect(),console.log("新しいMutation Observerをセットアップ中...");let o=new MutationObserver(o=>{let n=Date.now();if(n-t<e)return console.log("🕒 グローバルクールダウンが有効です。変更チェックをスキップします。"),void 0;for(let i of window.autoActionsRegistry)try{let o=i.check();if(o){console.log(`✅ [${i.name}] 条件が満たされました。実行準備中。`),i.execute(o),t=n,console.log(`⏱️ [${i.name}] アクション実行完了。クールダウン開始。`);break}}catch(e){console.error(`"${i.name}" のアクションcheck/executeでエラーが発生:`,e)}});o.observe(document.body,{childList:!0,subtree:!0}),window.myMutationObserver=o,console.log("✅ オブザーバーが開始されました。変更を監視中..."),console.log("登録されたアクション:",window.autoActionsRegistry.map(e=>e.name));class n extends BaseAction{constructor(){super("自動ツール許可")}check(){console.log(`[${this.name}] 条件をチェック中...`);let e=document.querySelector('[role="dialog"]');if(!e)return null;let t=e.querySelector("button div");if(!t)return null;let o=t.textContent;if(o&&o.includes("Run ")&&o.includes(" from")){let t=o.match(/Run (\S+) from/),n=t?t[1]:"不明なツール";console.log(`[${this.name}] ツールリクエストダイアログを発見: ${n}`);let i=Array.from(e.querySelectorAll("button")).find(e=>e.textContent.toLowerCase().includes("allow for this chat"));if(i)return console.log(`[${this.name}] '許可'ボタンを発見しました。`),{button:i,toolName:n}}else if(o&&o.includes("を実行")){let t=o.match(/(.+)を実行/),n=t?t[1]:"不明なツール";console.log(`[${this.name}] ツールリクエストダイアログを発見: ${n}`);let i=Array.from(e.querySelectorAll("button")).find(e=>e.textContent.includes("このチャットで許可する"));if(i)return console.log(`[${this.name}] '許可'ボタンを発見しました。`),{button:i,toolName:n}}return null}execute(e){if(!e||!e.button)return void console.error(`[${this.name}] 有効なデータなしで実行が呼び出されました。`);console.log(`🚀 [${this.name}] ツールを自動承認中: ${e.toolName}`),e.button.click()}}window.autoActionsRegistry.some(e=>"自動ツール許可"===e.name)||(window.autoActionsRegistry.push(new n),console.log("🤖 自動ツール許可アクションをレジストリに追加しました。"))})();
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

