chatbot_path = 'apps/web/src/FrogAiChatbot.tsx'
with open(chatbot_path, 'r', encoding='utf-8') as f:
    chat_code = f.read()

# Replace absolute statements in FrogAiChatbot
old_dart_reply = """      } else if (qLower.includes('phi tiêu') || qLower.includes('độc') || qLower.includes('nguy hiểm')) {
        reply = '💎 Về Ếch Phi Tiêu Độc (Dendrobatidae):\\n' +
          '• Trong tự nhiên chúng tích độc do ăn kiến rừng chứa alkaloid.\\n' +
          '• TUY NHIÊN, 100% ếch tại Frog Store là dòng sinh sản nhân tạo (Captive Bred - CB) nhiều đời, thức ăn là ruồi giấm nuôi nên HOÀN TOÀN KHÔNG CÓ ĐỘC TỐ, vô hại tuyệt đối đối với con người và thú cưng!\\n' +
          '• Ếch hoạt bát ban ngày, màu sắc rực rỡ và tiếng kêu líu lo như chim hót rất vui tai.'
        matchSlug = 'dart-azureus'
        matchName = 'Ếch Phi Tiêu Xanh Azureus'"""

new_dart_reply = """      } else if (qLower.includes('phi tiêu') || qLower.includes('độc') || qLower.includes('nguy hiểm')) {
        reply = '💎 Về Độc Tính Sinh Học & Pháp Lý Ếch Phi Tiêu (Dendrobatidae / Phyllobates):\\n' +
          '• Cơ chế độc tính: Theo nghiên cứu sinh học lưỡng cư (L.A. Zoo), ếch phi tiêu ngoài tự nhiên tích tụ độc tố alkaloid qua khẩu phần kiến rừng và bọ cánh cứng bản địa. Khi nuôi sinh sản nhân tạo (Captive-Bred - CB), do thức ăn chỉ là ruồi giấm nuôi và dế mèn không chứa alkaloid, cá thể không tự tổng hợp được độc tố.\\n' +
          '• Nguồn gốc & CITES: Các loài thuộc chi Dendrobates, Phyllobates được kiểm soát theo CITES Phụ lục II. 100% cá thể tại Frog Store có nguồn gốc trại nuôi nhân tạo CB hợp pháp, có giấy tờ kiểm dịch và tuân thủ quy định pháp luật.\\n' +
          '• An toàn tiếp xúc: Dù lượng độc tố được triệt tiêu ở môi trường nuôi nhốt, bạn vẫn cần đeo găng hoặc rửa tay sạch trước và sau khi chăm sóc, tránh chạm vào niêm mạc mắt/miệng để bảo vệ cả bản thân lẫn màng da thẩm thấu của ếch.'
        matchSlug = 'dart-azureus'
        matchName = 'Ếch Phi Tiêu Xanh Azureus'"""

if old_dart_reply in chat_code:
    chat_code = chat_code.replace(old_dart_reply, new_dart_reply)
    with open(chatbot_path, 'w', encoding='utf-8') as f:
        f.write(chat_code)
    print("FrogAiChatbot.tsx updated with scientific accuracy & CITES compliance!")
else:
    print("WARNING: old_dart_reply not found in FrogAiChatbot.tsx")

# Update FrogDetailPage.tsx
detail_path = 'apps/web/src/FrogDetailPage.tsx'
with open(detail_path, 'r', encoding='utf-8') as f:
    detail_code = f.read()

old_detail_toxicity = """<h5>🧪 Cảnh Báo Độc Tính Da</h5>
                  <p>{d?.toxicity_warning || 'Hoàn toàn không có độc tố ở cá thể sinh sản nhân tạo'}</p>"""

new_detail_toxicity = """<h5>🧪 Độc Tính Da &amp; Pháp Lý CITES (Dòng CB)</h5>
                  <p>{d?.toxicity_warning || 'Dòng sinh sản nhân tạo (CB) nuôi bằng mồi sạch không chứa alkaloid nên không tích tụ độc tố tự nhiên; tuân thủ CITES Phụ lục II. Cần rửa tay sạch trước và sau khi tiếp xúc để bảo vệ màng da thẩm thấu của lưỡng cư.'}</p>"""

if old_detail_toxicity in detail_code:
    detail_code = detail_code.replace(old_detail_toxicity, new_detail_toxicity)
    with open(detail_path, 'w', encoding='utf-8') as f:
        f.write(detail_code)
    print("FrogDetailPage.tsx updated with scientific accuracy & CITES compliance!")
else:
    print("WARNING: old_detail_toxicity not found in FrogDetailPage.tsx")

