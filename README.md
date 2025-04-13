# Claude自動アクション・フレームワーク
Claude AIインターフェイス内での操作を自動化するための軽量で拡張可能なフレームワークです。

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
3. 「Developer Tools - https://claude.ai」という名前の開発者ツールウィンドウに移動
4. 「Console」タブに移動
5. 「allow pasting」と入力してEnterキーを押す
6. セットアップスクリプト（1-setup.js）を貼り付ける
7. アクション実装（例：2-action-auto-confirm.js）を貼り付ける

## 簡易コピー/ペースト
これは以下のスクリプトの統合コピー/ペーストバージョンです。

```javascript
(()=>{class BaseAction{constructor(e){if(!e)throw new Error("Action must have a name.");this.name=e}check(){console.warn(`Action "${this.name}" is missing check() implementation.`);return!1}execute(e){console.warn(`Action "${this.name}" is missing execute() implementation.`)}}let t=0,e=2e3;window.autoActionsRegistry=window.autoActionsRegistry||[],window.myMutationObserver&&window.myMutationObserver.disconnect(),console.log("Setting up new Mutation Observer...");let o=new MutationObserver(o=>{let n=Date.now();if(n-t<e)return console.log("🕒 Global cooldown active, skipping mutation check."),void 0;for(let i of window.autoActionsRegistry)try{let o=i.check();if(o){console.log(`✅ [${i.name}] Conditions met. Preparing to execute.`),i.execute(o),t=n,console.log(`⏱️ [${i.name}] Action executed. Cooldown started.`);break}}catch(e){console.error(`Error during action check/execute for "${i.name}":`,e)}});o.observe(document.body,{childList:!0,subtree:!0}),window.myMutationObserver=o,console.log("✅ Observer started. Watching for changes..."),console.log("Registered actions:",window.autoActionsRegistry.map(e=>e.name));class n extends BaseAction{constructor(){super("AutoConfirmTool")}check(){console.log(`[${this.name}] Checking conditions...`);let e=document.querySelector('[role="dialog"]');if(!e)return null;let t=e.querySelector("button div");if(!t)return null;let o=t.textContent;if(!o||!o.includes("Run ")||!o.includes(" from"))return null;let n=o.match(/Run (\S+) from/),r=n?n[1]:"Unknown Tool";console.log(`[${this.name}] Found potential tool request dialog for: ${r}`);let a=Array.from(e.querySelectorAll("button")).find(e=>e.textContent.toLowerCase().includes("allow for this chat"));return a?(console.log(`[${this.name}] Found 'Allow' button.`),{button:a,toolName:r}):null}execute(e){if(!e||!e.button)return void console.error(`[${this.name}] Execute called without valid data.`);console.log(`🚀 [${this.name}] Auto-approving tool: ${e.toolName}`),e.button.click()}}window.autoActionsRegistry.some(e=>"AutoConfirmTool"===e.name)||(window.autoActionsRegistry.push(new n),console.log("🤖 Added AutoConfirmToolAction to registry."))})();
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

## クレジット
作成者: @rvanbaalen

@RafalWilinskiのオリジナルの自動承認スクリプトにインスパイアされました