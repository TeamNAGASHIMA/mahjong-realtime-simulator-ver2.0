# mahjong-realtime-simulator-ver2.0

# requirements.txtのインストール
pip install requirements.txt

# アプリ起動方法

## 1. 通常起動
- cdで "\mahjong-realtime-simulator-ver2.0\mahjong_realtime_simulator\" フォルダに移動。
- .\start_both.batを起動する。

## 2. 開発後(フロントエンドファイル編集後)起動
- cdで "\mahjong-realtime-simulator-ver2.0\mahjong_realtime_simulator\frontend\" フォルダに移動。
- npm run buildを実行する。
- ターミナル上に "build\static\js\main.xxxxxxxx.js"(xxxxxxxxは8桁のハッシュ値) と出力されている行を探す。（無い場合はソースコードに問題がありビルドできていないので、ソースコードの修正を行う。）
- 8桁のハッシュ値をコピーし、"\mahjong-realtime-simulator-ver2.0\mahjong_realtime_simulator\app\main.html" の21行目にあるscriptタグの "src="{% static 'js/main.xxxxxxxx.js' %}" の "xxxxxxxx" の部分に張り付けする。
- cdで "\mahjong-realtime-simulator-ver2.0\mahjong_realtime_simulator\" フォルダに移動。
- .\start_both.batを起動する。