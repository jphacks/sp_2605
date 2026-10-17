"""このPCでアプリを動かせるかを確認する（読むだけで、何も変更しない）。

    py tools/check_env.py

結果の [OK] / [NG] / [--] を見て、NG があれば docs/SETUP.md の手順で直す。
"""
import importlib
import shutil
import socket
import sys

ok = True


def show(mark, text):
    print(f"[{mark}] {text}")


# 1. Python
if sys.version_info >= (3, 10):
    show("OK", f"Python {sys.version.split()[0]}")
else:
    ok = False
    show("NG", f"Python {sys.version.split()[0]} は古い。3.10 以上を入れる")

# 2. パッケージ
for mod, pkg in [("serial", "pyserial"), ("websockets", "websockets")]:
    try:
        m = importlib.import_module(mod)
        show("OK", f"{pkg} {getattr(m, '__version__', getattr(m, 'VERSION', ''))}")
    except ImportError:
        ok = False
        show("NG", f"{pkg} が入っていない → py -m pip install -r requirements.txt")

# 3. ボード（つながっていなくてもアプリは動く。キーボードで代用できる）
try:
    sys.path.insert(0, "app/server")
    from serial_io import find_port
    from serial.tools import list_ports

    for name, label in [("dps", "DPS368 2GO（息）"), ("touch", "PSOC 4100T Plus（指穴）")]:
        port = find_port(name)
        show("OK" if port else "--", f"{label}：{port or '見つからない（USB を挿すと自動でつながる）'}")
    others = [f"{p.device}（{p.description}）" for p in list_ports.comports()]
    print("     このPCの COM ポート：" + (", ".join(others) or "なし"))
except Exception as e:  # パッケージが無いときなど
    show("--", f"ボードの確認はスキップ（{e}）")

# 4. ポート 8000 が空いているか
s = socket.socket()
try:
    s.bind(("localhost", 8000))
    show("OK", "ポート 8000 は空いている")
except OSError:
    show("--", "ポート 8000 は使用中（アプリがもう動いているか、別のものが使っている。--port 8010 などで変えられる）")
finally:
    s.close()

# 5. ブラウザ
found = [b for b in ("chrome", "msedge") if shutil.which(b)]
show("--", "ブラウザ：Chrome か Edge で http://localhost:8000/ を開く" + (f"（見つかった：{', '.join(found)}）" if found else ""))

print()
print("→ 準備OK。`start.bat` をダブルクリック、または `py app/server/main.py` で起動" if ok else "→ NG の項目を直してから、もう一度実行")
sys.exit(0 if ok else 1)
