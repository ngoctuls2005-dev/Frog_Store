import json
from datetime import datetime, timezone

path = ".taskflow/state.json"
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

new_tasks = [
    {
        "id": "TASK-01",
        "title": "Go bo Hero Banner o Trang Chi Tiet (FrogDetailPage)",
        "status": "DOING",
        "accept": [
            "Hero banner chi hien o trang chu",
            "Trang chi tiet hien anh, thong so va nut mua ngay sau navbar"
        ],
        "tests": [
            "python tests/verify_ui_v2_01_detail_hero.py"
        ],
        "manual": [],
        "depends": ["PROD-01"],
        "notes": [],
        "diagnoses": [],
        "verification": None
    },
    {
        "id": "TASK-02",
        "title": "Tinh chinh Khung Chat AI va Xep Dong Cau Hoi Goi Y",
        "status": "TODO",
        "accept": [
            "Cau hoi goi y xep flex-wrap nhieu dong khong tran thanh cuon",
            "Khung chatbox gon gang khong che khuat vung mua hang"
        ],
        "tests": [
            "python tests/verify_ui_v2_02_chatbot_layout.py"
        ],
        "manual": [],
        "depends": ["TASK-01"],
        "notes": [],
        "diagnoses": [],
        "verification": None
    },
    {
        "id": "TASK-03",
        "title": "Cap Nhat Anh That Sac Net 100%, Khac Phuc Trung Anh Dumpy va Snowflake",
        "status": "TODO",
        "accept": [
            "tree-whites-dumpy va tree-blue-snowflake co anh rieng biet",
            "Anh Red-eyed va Pacman Green ro net khong bi mo vo hat"
        ],
        "tests": [
            "python tests/verify_ui_v2_03_distinct_frog_images.py"
        ],
        "manual": [],
        "depends": ["TASK-02"],
        "notes": [],
        "diagnoses": [],
        "verification": None
    },
    {
        "id": "TASK-04",
        "title": "Giam Trung Lap Thong Diep va Chi Gan Noi Bat Cho 4 Loai Bieu Tuong",
        "status": "TODO",
        "accept": [
            "Announcement bar ngan gon 1 dong",
            "The san pham khong lap khau hieu bao hanh",
            "Chi co dung 4 loai dac trung co is_featured = 1"
        ],
        "tests": [
            "python tests/verify_ui_v2_04_badges_and_messages.py"
        ],
        "manual": [],
        "depends": ["TASK-03"],
        "notes": [],
        "diagnoses": [],
        "verification": None
    },
    {
        "id": "TASK-05",
        "title": "Tat Hieu Ung Nut Chat Chay Vo Tan va Them prefers-reduced-motion",
        "status": "TODO",
        "accept": [
            "Bo animation pulse va bounce lien tuc tren FAB",
            "Chi hover/focus moi co hieu ung nhe",
            "Co media query prefers-reduced-motion"
        ],
        "tests": [
            "python tests/verify_ui_v2_05_reduced_motion_chat_fab.py"
        ],
        "manual": [],
        "depends": ["TASK-04"],
        "notes": [],
        "diagnoses": [],
        "verification": None
    },
    {
        "id": "TASK-06",
        "title": "Can Giua Layout Grid va Lam Ro So Dem Danh Muc / Tim Kiem",
        "status": "TODO",
        "accept": [
            "Grid can giua khi co 1-2 san pham khong bi lech trai",
            "Thanh thong bao ket qua tim kiem ro rang",
            "So dem tren danh muc the hien ro tong so loai"
        ],
        "tests": [
            "python tests/verify_ui_v2_06_search_grid_centering.py"
        ],
        "manual": [],
        "depends": ["TASK-05"],
        "notes": [],
        "diagnoses": [],
        "verification": None
    },
    {
        "id": "TASK-07",
        "title": "Minh Bach Hoa Yeu Cau Tai Khoan Khi Dat Mua va Tranh Che Nhau Tren Mobile",
        "status": "TODO",
        "accept": [
            "Hop thong bao ro ly do tai khoan ngay trong gio hang",
            "Nut dat hang ghi ro 'Dang nhap de dat hang' khi chua dang nhap",
            "Tren mobile nut chat gon gang tren thanh sticky bar"
        ],
        "tests": [
            "python tests/verify_ui_v2_07_auth_flow_mobile_layout.py"
        ],
        "manual": [],
        "depends": ["TASK-06"],
        "notes": [],
        "diagnoses": [],
        "verification": None
    },
    {
        "id": "PROD-02",
        "title": "Deploy Cloudflare Production & Push GitHub ngoctuls2005-dev",
        "status": "TODO",
        "accept": [
            "Vite build 0 loi",
            "Deploy Cloudflare live 100% pass",
            "Push commit len GitHub main"
        ],
        "tests": [
            "python tests/verify_ui_v2_08_production_live.py"
        ],
        "manual": [],
        "depends": ["TASK-07"],
        "notes": [],
        "diagnoses": [],
        "verification": None
    }
]

existing_ids = {t["id"] for t in data["tasks"]}
for t in new_tasks:
    if t["id"] not in existing_ids:
        data["tasks"].append(t)

data["updated_at"] = datetime.now(timezone.utc).isoformat()

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Appended 8 new tasks to .taskflow/state.json!")
