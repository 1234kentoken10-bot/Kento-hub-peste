const express = require('express');
const app = express();

// JSONデータを受け取れるようにする
app.use(express.json({ limit: '10mb' }));

// データを保存する場所（メモリ）
const storage = {};

// --- トップページ ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Kento Hub</title>
            <style>
                body { background: #0a0a0a; color: #fff; font-family: Arial; padding: 40px; }
                h1 { color: #ff8c00; }
                textarea { width: 100%; max-width: 600px; height: 300px; background: #1a1a1a; color: #ff8c00; border: 2px solid #ff8c00; padding: 10px; font-size: 14px; font-family: Consolas, monospace; }
                button { background: #ff8c00; color: #000; border: none; padding: 12px 30px; font-size: 16px; font-weight: bold; cursor: pointer; border-radius: 8px; }
                button:hover { background: #ffa500; }
                .result { margin-top: 20px; padding: 15px; background: #1a1a1a; border-radius: 8px; }
                .raw-link { color: #00cc00; word-break: break-all; }
                code { background: #0a0a0a; padding: 2px 8px; border-radius: 4px; }
                .status { margin-top: 10px; padding: 10px; border-radius: 6px; }
                .success { background: #004400; color: #00cc00; }
                .error { background: #440000; color: #ff4444; }
            </style>
        </head>
        <body>
            <h1>🔥 Kento Hub</h1>
            <p>Luaコードを貼り付けて「保存」を押すと、Rawリンクが生成されます</p>
            <textarea id="codeInput" placeholder="ここにLuaコードを貼り付けてください..."></textarea><br><br>
            <button onclick="saveCode()">💾 保存してRawリンクを生成</button>
            <div id="status" class="status"></div>
            <div id="result" class="result" style="display:none;"></div>
            <script>
            async function saveCode() {
                const code = document.getElementById('codeInput').value;
                const status = document.getElementById('status');
                const result = document.getElementById('result');

                if (!code) {
                    status.className = 'status error';
                    status.textContent = '⚠️ コードを入力してください！';
                    return;
                }

                status.className = 'status';
                status.textContent = '⏳ 保存中...';

                try {
                    // POSTリクエスト（長いコードでもOK！）
                    const res = await fetch('/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: code })
                    });

                    const url = await res.text();

                    if (res.ok) {
                        status.className = 'status success';
                        status.textContent = '✅ 保存成功！';
                        result.style.display = 'block';
                        result.innerHTML = 
                            '<strong>📋 Rawリンク（実行用）</strong><br>' +
                            '<span class="raw-link">' + url + '</span><br><br>' +
                            '💡 Robloxで実行する方法:<br>' +
                            '<code>loadstring(game:HttpGet("' + url + '"))()</code><br><br>' +
                            '🔗 <a href="' + url + '" target="_blank">Rawリンクを開く</a>';
                    } else {
                        status.className = 'status error';
                        status.textContent = '❌ ' + url;
                    }
                } catch (e) {
                    status.className = 'status error';
                    status.textContent = '❌ エラー: ' + e.message;
                }
            }
            </script>
        </body>
        </html>
    `);
});

// --- 保存用API（POST対応！長いコードでもOK） ---
app.post('/save', (req, res) => {
    const code = req.body.code;
    if (!code) return res.status(400).send('エラー: コードが空です');

    const id = 'kento_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    storage[id] = code;

    const rawUrl = `https://${req.get('host')}/raw/${id}`;
    res.send(rawUrl);
});

// --- Rawで取得 ---
app.get('/raw/:id', (req, res) => {
    const code = storage[req.params.id];
    if (code) {
        res.setHeader('Content-Type', 'text/plain');
        res.send(code);
    } else {
        res.status(404).send('-- コードが見つかりませんでした --');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('🔥 Kento Hub 起動！');
});
