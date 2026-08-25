const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

// 脆弱性 1: コマンドインジェクション (Command Injection)
// クエリパラメータ `cmd` を検証せずにシェルコマンドとして実行している
app.get('/run', (req, res) => {
  const cmd = req.query.cmd;

  // 安全ではない：ユーザー入力がそのままコマンド実行に使われている
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(`Error: ${error.message}`);
      return;
    }
    res.send(stdout);
  });
});

// 脆弱性 2: コードインジェクション (Code Injection)
// クエリパラメータ `code` を検証せずに eval に渡して実行している
app.get('/eval', (req, res) => {
  const code = req.query.code;

  // 安全ではない：eval は任意の JS コードを実行できてしまう
  try {
    const result = eval(code);
    res.send(`Result: ${result}`);
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`);
  }
});

// 脆弱性 3: ハードコードされた認証情報 (Hardcoded Secrets / Tokens)
// API キーなどのシークレット情報がプレーンテキストでハードコードされている
const SLACK_BOT_TOKEN = "xoxb-123456789012-345678901234-abcdefghijklmnopqrstuvwx";

app.get('/', (req, res) => {
  res.send('CodeQL Vulnerability Test Server is running.');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
