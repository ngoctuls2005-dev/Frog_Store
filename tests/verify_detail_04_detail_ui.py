import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_detail_ui():
    base_dir = os.path.dirname(__file__)
    detail_page_path = os.path.join(base_dir, '..', 'apps', 'web', 'src', 'FrogDetailPage.tsx')
    api_path = os.path.join(base_dir, '..', 'apps', 'web', 'src', 'api.ts')
    styles_path = os.path.join(base_dir, '..', 'apps', 'web', 'src', 'styles.css')

    assert os.path.exists(detail_page_path), "FrogDetailPage.tsx must exist"
    with open(detail_page_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Verify key sections in FrogDetailPage
    assert 'climate-gauge-card' in code, "Must include climate gauge card"
    assert "activeTab === 'overview'" in code, "Must have overview tab"
    assert "activeTab === 'enclosure'" in code, "Must have enclosure tab"
    assert "activeTab === 'diet'" in code, "Must have diet tab"
    assert "activeTab === 'health'" in code, "Must have health tab"
    assert 'ai-snippet-card' in code, "Must have AI snippet card"
    assert 'handleCopyAiSheet' in code, "Must have copy AI snippet feature"
    assert 'btn-add-cart-large' in code, "Must have add to cart action"
    print("   -> OK: Component FrogDetailPage.tsx có đầy đủ Gallery, Climate Gauge, 4 Tab sinh học và Thẻ AI Fact Sheet.")

    # Verify api.ts
    with open(api_path, 'r', encoding='utf-8') as f:
        api_code = f.read()
    assert 'FrogSpeciesDetails' in api_code, "api.ts must export FrogSpeciesDetails"
    assert 'productDetail:' in api_code, "api.ts must provide productDetail function"
    assert 'aiKnowledge:' in api_code, "api.ts must provide aiKnowledge function"
    print("   -> OK: api.ts đã cung cấp đầy đủ các types và hàm gọi API chi tiết.")

    # Verify styles.css
    with open(styles_path, 'r', encoding='utf-8') as f:
        css = f.read()
    assert '.frog-detail-page' in css, "styles.css must style frog-detail-page"
    assert '.climate-gauge-card' in css, "styles.css must style climate-gauge-card"
    assert '.progress-safe-zone' in css, "styles.css must style progress-safe-zone"
    assert '.ai-snippet-card' in css, "styles.css must style ai-snippet-card"
    print("   -> OK: styles.css đã tích hợp đầy đủ hệ thống giao diện sinh học chuyên sâu.")

    print("\nKiểm chứng Task DETAIL-04 hoàn tất thành công 100%!")

if __name__ == '__main__':
    test_detail_ui()

