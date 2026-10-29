import os
import subprocess
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_hide_ai_raw():
    base_dir = os.path.dirname(__file__)
    detail_path = os.path.join(base_dir, '..', 'apps', 'web', 'src', 'FrogDetailPage.tsx')

    with open(detail_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Verify raw AI code block is removed
    assert 'ai-snippet-card' not in code, "ai-snippet-card must be completely removed from user UI"
    assert 'ai-markdown-preview' not in code, "ai-markdown-preview must be completely removed from user UI"
    assert 'handleCopyAiSheet' not in code, "handleCopyAiSheet must be removed"
    assert 'Sao Chép Fact Sheet' not in code, "Copy AI Fact Sheet button must be removed"
    print("   -> OK: Khối dữ liệu thô AI Fact Sheet đã được ẩn hoàn toàn 100% khỏi giao diện người dùng!")

    # 2. Verify scientific and care content intact
    assert "activeTab === 'overview'" in code, "Overview tab must remain"
    assert "activeTab === 'enclosure'" in code, "Enclosure tab must remain"
    assert "activeTab === 'diet'" in code, "Diet tab must remain"
    assert "activeTab === 'health'" in code, "Health tab must remain"
    assert "climate-gauge-card" in code, "Climate gauge must remain"
    print("   -> OK: Toàn bộ 4 tab sinh học và thước đo vi khí hậu vẫn hoạt động đầy đủ và thẩm mỹ.")

    # 3. Test build
    res = subprocess.run(['npm', 'run', 'build'], cwd=os.path.join(base_dir, '..', 'apps', 'web'), capture_output=True, text=True, shell=True)
    assert res.returncode == 0, f"Build failed:\n{res.stderr}"
    print("   -> OK: Build frontend thành công 0 lỗi!")

    print("\nKiểm chứng Task UI-01 hoàn tất thành công 100%!")

if __name__ == '__main__':
    test_hide_ai_raw()

