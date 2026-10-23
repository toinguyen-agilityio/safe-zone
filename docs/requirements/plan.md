# Bo Hải Châu — Requirements & Plan

Game battle royale chạy trên trình duyệt (three.js). Người chơi nhảy dù xuống bản đồ phỏng theo trung tâm Đà Nẵng (quận Hải Châu), nhặt đồ, đấu súng, chạy bo. Bo ở đây là **nước ngập**: đứng ngoài vùng khô là bị nước dâng trừ máu. Người cuối cùng sống sót "ăn mì Quảng".

Tài liệu này ưu tiên **MVP**. Các giai đoạn sau chỉ ghi ở mức gạch đầu dòng, chi tiết sẽ viết khi tới lúc làm.

---

## 1. Mục tiêu MVP

Một trận chơi **offline, 1 người chơi + 19 bot**, chạy trọn vẹn trên trình duyệt desktop. Một trận dài khoảng 5–7 phút. Deploy được lên GitHub Pages để gửi link cho bạn bè chơi thử.

**Tiêu chí MVP xong:**
- Chơi được từ màn hình bắt đầu → nhảy dù → đánh nhau → thắng hoặc thua → chơi lại.
- Người chơi nhận ra được Đà Nẵng: sông Hàn, Cầu Rồng và ít nhất 3 landmark.
- Đạt 60 FPS trên laptop tầm trung (GPU tích hợp), Chrome bản mới.
- Có prototype một file HTML làm tham chiếu (bản đang có); MVP là bản chuyển sang repo có cấu trúc, có test và CI.

**Ngoài phạm vi MVP:** multiplayer, mobile/touch, xe cộ, dữ liệu bản đồ thật từ OpenStreetMap, nhiều loại súng, tài khoản/bảng xếp hạng, âm thanh thu sẵn.

---

## 2. Tech stack MVP

| Hạng mục | Lựa chọn | Ghi chú |
|---|---|---|
| Build | Vite + TypeScript | Dev server nhanh, build tĩnh |
| 3D | three.js (pin 1 version cố định) | Dùng `InstancedMesh` cho nhà, cây |
| Va chạm | Tự viết: AABB 2D + spatial grid | Đủ cho nhà hình hộp; chưa cần Rapier |
| UI/HUD | HTML + CSS thuần | Không dùng framework UI |
| Âm thanh | Web Audio API, âm tổng hợp | Không cần file âm thanh |
| Test | Vitest | Test logic thuần (va chạm, bo, damage) |
| Lint | ESLint + Prettier | |
| CI/CD | GitHub Actions → GitHub Pages | Build + test mỗi PR, deploy khi merge `main` |

### Cấu trúc thư mục đề xuất

```
src/
  main.ts              # khởi tạo, game loop
  config.ts            # hằng số: tốc độ, damage, phase bo...
  core/                # loop, input, rng, events
  world/               # layout bản đồ, sinh nhà, landmark, cầu, sông
  physics/             # spatial grid, collision, ground height, raycast, LOS
  entities/            # player, bot, loot
  ai/                  # bot brain
  systems/             # zone, combat, healing, dragon fire, pickup
  render/              # scene, materials, shaders, effects, viewmodel
  ui/                  # HUD, minimap, big map, menu, end screen
  audio/
tests/
```

---

## 3. Requirements

Ưu tiên: **P0** = bắt buộc cho MVP · **P1** = nên có trong MVP nếu kịp · **P2** = sau MVP.

### 3.1 Bản đồ (MAP)

| ID | Requirement | Ưu tiên |
|---|---|---|
| MAP-01 | Bản đồ khoảng 640×640 đơn vị, layout lưới đường phỏng theo Hải Châu, có ranh giới không đi ra ngoài được | P0 |
| MAP-02 | Sông Hàn chạy dọc phía đông, uốn nhẹ; đi xuống sông thì bơi | P0 |
| MAP-03 | 3 cầu có dốc lên xuống: Cầu sông Hàn, Cầu Rồng, Cầu Trần Thị Lý; bơi được dưới gầm cầu | P0 |
| MAP-04 | Nhà ống sinh theo block giữa các đường, có kiệt (hẻm) để đi xuyên block; nhà cao tầng gần sông | P0 |
| MAP-05 | Landmark: Cầu Rồng (thân rồng, đầu rồng), Chợ Hàn, Nhà thờ Con Gà, Bảo tàng Chăm | P0 |
| MAP-06 | Đứng được trên mái nhà khi nhảy dù đáp xuống | P1 |
| MAP-07 | Chi tiết trang trí: bồn nước inox trên mái, hàng cây dọc Bạch Đằng, đồi Sơn Trà phía xa | P1 |
| MAP-08 | Sinh bản đồ deterministic theo seed (cùng seed ra cùng bản đồ) | P0 |

### 3.2 Người chơi (PLR)

| ID | Requirement | Ưu tiên |
|---|---|---|
| PLR-01 | Góc nhìn thứ nhất, WASD di chuyển, chuột xoay (pointer lock) | P0 |
| PLR-02 | Chạy nhanh (Shift), nhảy (Space), bơi chậm khi ở dưới sông | P0 |
| PLR-03 | Nhảy dù đầu trận từ độ cao ~75 m, lái được bằng WASD, Space để rơi nhanh | P0 |
| PLR-04 | Máu 100, giáp (áo mưa) 60 điểm chặn 45% sát thương súng | P0 |
| PLR-05 | Fallback khi trình duyệt không cho khoá chuột: giữ chuột phải để xoay, P để tạm dừng | P1 |
| PLR-06 | Esc tạm dừng trận, bấm để vào lại | P0 |

### 3.3 Chiến đấu (CMB)

| ID | Requirement | Ưu tiên |
|---|---|---|
| CMB-01 | Một súng tự động (AK-Mía): băng 30 viên, thay đạn 1.8 s, hitscan | P0 |
| CMB-02 | Hitbox đầu (x2 damage), thân, chân | P0 |
| CMB-03 | Độ giật và độ toả đạn tăng khi chạy, khi đang trên không; giảm khi ngắm | P0 |
| CMB-04 | Ngắm bằng chuột phải (giảm FOV, súng vào giữa màn hình) | P0 |
| CMB-05 | Đạn bị nhà chặn | P0 |
| CMB-06 | Không bắn được khi đang bơi, đang nhảy dù, đang chạy nhanh | P0 |
| CMB-07 | Hiệu ứng: tracer, chớp đầu nòng, hitmarker (đầu màu vàng), chỉ hướng bị bắn | P0 |

### 3.4 Bot (BOT)

| ID | Requirement | Ưu tiên |
|---|---|---|
| BOT-01 | 19 bot nhảy dù ở vị trí ngẫu nhiên, có tên tiếng Việt bựa, đội nón lá | P0 |
| BOT-02 | Tìm địch gần nhất trong tầm nhìn (có line of sight), đánh cả người chơi lẫn bot khác | P0 |
| BOT-03 | Có thời gian phản ứng; tỉ lệ trúng giảm theo khoảng cách và khi mục tiêu chạy/nhảy | P0 |
| BOT-04 | Đi theo bo: chạy vào vùng khô kế tiếp khi bo sắp thu | P0 |
| BOT-05 | Tự gỡ khi kẹt tường (đi vòng), đổi mục tiêu nếu kẹt lâu | P0 |
| BOT-06 | Nhặt đồ khi đi ngang qua; rơi đồ khi chết | P1 |
| BOT-07 | Đổi độ khó (dễ/thường/khó) qua `config.ts` | P2 |

### 3.5 Bo nước ngập (ZON)

| ID | Requirement | Ưu tiên |
|---|---|---|
| ZON-01 | 5 phase: chờ → thu hẹp; bán kính 230 → 130 → 68 → 30 → 6 | P0 |
| ZON-02 | Tâm vòng mới nằm trong vòng cũ, tránh rơi vào giữa sông | P0 |
| ZON-03 | Ngoài vùng khô bị trừ máu, mức trừ tăng theo phase (1 → 12 máu/giây) | P0 |
| ZON-04 | Hiển thị: mặt nước ngập trên đường bên ngoài vòng (shader), tường nước hình trụ, overlay màn hình khi đứng ngoài | P0 |
| ZON-05 | Thông báo khi nước bắt đầu dâng và khi có vùng khô mới | P0 |

### 3.6 Loot & hồi máu (LOT)

| ID | Requirement | Ưu tiên |
|---|---|---|
| LOT-01 | ~150 vật phẩm rải dọc vỉa hè: bánh mì, nước mía, hộp đạn, áo mưa | P0 |
| LOT-02 | Tự nhặt khi đi qua; giới hạn mang: 5 bánh mì, 3 nước mía, 180 đạn | P0 |
| LOT-03 | Phím 1: ăn bánh mì (2 s, +30 máu). Phím 2: uống nước mía (1.2 s, +15 máu, chạy nhanh 8 s) | P0 |
| LOT-04 | Đang ăn/uống thì đi chậm; bắn hoặc bị bắn thì huỷ | P0 |

### 3.7 Sự kiện Cầu Rồng phun lửa (EVT)

| ID | Requirement | Ưu tiên |
|---|---|---|
| EVT-01 | Đầu rồng phun lửa về phía Võ Văn Kiệt tại giây 110, 250, 380; mỗi lần 6.5 s | P1 |
| EVT-02 | Cảnh báo trước 6 giây; ai đứng trong vùng lửa bị trừ máu | P1 |

### 3.8 Giao diện (UI)

| ID | Requirement | Ưu tiên |
|---|---|---|
| UI-01 | Màn hình bắt đầu: tên game, mô tả, phím điều khiển, nút vào trận; nền là camera bay quanh sông Hàn | P0 |
| UI-02 | HUD: máu, giáp, đạn, đồ dùng, số người còn sống, số kill, đồng hồ bo | P0 |
| UI-03 | Minimap xoay theo hướng nhìn, có vòng bo hiện tại và vòng kế tiếp | P0 |
| UI-04 | Bản đồ lớn (phím M) có tên đường và landmark | P1 |
| UI-05 | Kill feed (tối đa 5 dòng), toast nhặt đồ, banner sự kiện | P0 |
| UI-06 | Màn kết thúc: hạng, kill, sát thương, thời gian sống; câu thoại theo cách chết; nút chơi lại | P0 |
| UI-07 | Thông báo không hỗ trợ khi mở trên thiết bị cảm ứng | P0 |

### 3.9 Phi chức năng (NFR)

| ID | Requirement | Ưu tiên |
|---|---|---|
| NFR-01 | 60 FPS trên laptop GPU tích hợp ở 1080p; pixel ratio tối đa 1.5 | P0 |
| NFR-02 | Load lần đầu dưới 3 s trên mạng 4G (bundle JS < 1 MB gzip) | P0 |
| NFR-03 | Không dùng asset có bản quyền; không dùng tên, UI, asset của PUBG; không tên thương hiệu thật trên bản đồ | P0 |
| NFR-04 | Không dựng trụ sở cơ quan nhà nước; bạo lực kiểu cartoon, không máu me | P0 |
| NFR-05 | Logic thuần (va chạm, bo, damage, LOS) có unit test | P0 |
| NFR-06 | Toàn bộ thông số cân bằng game nằm trong `config.ts` | P0 |

---

## 4. Plan MVP theo milestone

Mỗi dòng dưới đây là một ticket. Size: **S** ≈ nửa ngày, **M** ≈ 1–2 ngày, **L** ≈ 3–4 ngày.

### M0 — Setup repo

| Ticket | Mô tả | Acceptance criteria | Size | Phụ thuộc | Req |
|---|---|---|---|---|---|
| T-001 | Khởi tạo repo Vite + TS + three.js | `npm run dev` hiện một khối hộp xoay | S | | |
| T-002 | ESLint, Prettier, Vitest | `npm run lint` và `npm test` chạy được | S | T-001 | NFR-05 |
| T-003 | GitHub Actions: build + test mỗi PR | PR đỏ khi test fail | S | T-002 | |
| T-004 | Deploy GitHub Pages khi merge `main` | Có link public chạy được | S | T-003 | |
| T-005 | `config.ts`, seeded RNG, game loop có `dt` giới hạn | Loop chạy ổn định khi đổi tab rồi quay lại | S | T-001 | MAP-08, NFR-06 |

### M1 — Bản đồ

| Ticket | Mô tả | Acceptance criteria | Size | Phụ thuộc | Req |
|---|---|---|---|---|---|
| T-101 | Data layout: danh sách đường, sông, cầu, vùng landmark | File `world/layout.ts`, có test kiểm tra đường không chồng sông | S | T-005 | MAP-01 |
| T-102 | Texture mặt đất vẽ bằng canvas (đường, vạch kẻ, bãi cỏ), khoét lỗ sông | Nhìn từ trên thấy rõ lưới đường và sông | M | T-101 | MAP-01, MAP-02 |
| T-103 | Sông: lòng sông, mặt nước, phần kéo dài ra ngoài map | Không có khoảng trống nhìn xuyên ra ngoài | S | T-102 | MAP-02 |
| T-104 | Sinh nhà theo block (chia đôi đệ quy, có kiệt) | Cùng seed ra cùng bản đồ; có test số nhà và không nhà nào đè lên đường | M | T-101 | MAP-04, MAP-08 |
| T-105 | Render nhà bằng `InstancedMesh` + shader cửa sổ theo world-space | 1 draw call cho toàn bộ nhà | M | T-104 | MAP-04, NFR-01 |
| T-106 | 3 cầu: mặt cầu, dốc, lan can, trụ | Đi từ bờ này qua bờ kia không bị kẹt | M | T-101 | MAP-03 |
| T-107 | Cầu Rồng: thân rồng bằng tube, đầu, sừng, đuôi | Nhìn từ xa nhận ra Cầu Rồng | M | T-106 | MAP-05 |
| T-108 | Landmark: Chợ Hàn (có bảng hiệu), Nhà thờ Con Gà, Bảo tàng Chăm | Mỗi landmark có hình dáng nhận ra được | M | T-104 | MAP-05 |
| T-109 | Trang trí: bồn nước inox, cây, đồi xa, bầu trời gradient, fog | | S | T-105 | MAP-07 |

### M2 — Vật lý & người chơi

| Ticket | Mô tả | Acceptance criteria | Size | Phụ thuộc | Req |
|---|---|---|---|---|---|
| T-201 | Spatial grid + truy vấn vật thể gần | Có test | S | T-104 | |
| T-202 | Va chạm hình tròn với AABB, đẩy ra khi kẹt bên trong | Có test các ca: trượt dọc tường, góc tường, kẹt bên trong | M | T-201 | |
| T-203 | Hàm độ cao mặt đất: đất, lòng sông, mặt cầu, mái nhà | Có test: dưới gầm cầu vẫn là lòng sông | M | T-201, T-106 | MAP-03, MAP-06 |
| T-204 | Input: bàn phím, chuột, pointer lock, fallback | Esc thì tạm dừng | M | T-005 | PLR-01, PLR-05, PLR-06 |
| T-205 | Di chuyển người chơi: đi, chạy, nhảy, bơi, trọng lực | Không đi xuyên tường; lên xuống dốc cầu mượt | M | T-202, T-203, T-204 | PLR-02 |
| T-206 | Nhảy dù đầu trận | Đáp xuống đất hoặc mái nhà đúng chỗ | S | T-205 | PLR-03 |

### M3 — Chiến đấu

| Ticket | Mô tả | Acceptance criteria | Size | Phụ thuộc | Req |
|---|---|---|---|---|---|
| T-301 | Raycast 3D với nhà + ray-sphere với hitbox | Có test | M | T-201 | CMB-02, CMB-05 |
| T-302 | Súng: bắn tự động, băng đạn, thay đạn, toả đạn, giật | Các điều kiện cấm bắn đúng | M | T-301, T-205 | CMB-01, CMB-03, CMB-06 |
| T-303 | Ngắm (ADS), viewmodel súng | | S | T-302 | CMB-04 |
| T-304 | Hệ thống damage: giáp, chết, ghi nhận ai hạ ai | Có test tính giáp | S | T-302 | PLR-04 |
| T-305 | Hiệu ứng: tracer, chớp nòng, hitmarker, chỉ hướng bị bắn | | S | T-302 | CMB-07 |
| T-306 | Âm thanh tổng hợp: súng, trúng đích, nhặt đồ | Âm thanh chỉ bật sau khi người chơi bấm | S | T-302 | |

### M4 — Bot

| Ticket | Mô tả | Acceptance criteria | Size | Phụ thuộc | Req |
|---|---|---|---|---|---|
| T-401 | Model bot (thân, đầu, nón lá, dù) + spawn nhảy dù | 19 bot đáp đất rải khắp map | S | T-206 | BOT-01 |
| T-402 | Line of sight 2D | Có test | S | T-201 | BOT-02 |
| T-403 | Bot brain: tìm địch, đuổi, strafe, bắn có phản ứng | Bot đánh nhau được khi để chạy một mình | L | T-401, T-402, T-304 | BOT-02, BOT-03 |
| T-404 | Bot đi theo bo, chọn điểm đến, tự gỡ khi kẹt | Không quá 2 bot chết vì kẹt tường mỗi trận | M | T-403, T-501 | BOT-04, BOT-05 |
| T-405 | Bot nhặt đồ, rơi đồ khi chết | | S | T-403, T-601 | BOT-06 |

### M5 — Bo nước ngập

| Ticket | Mô tả | Acceptance criteria | Size | Phụ thuộc | Req |
|---|---|---|---|---|---|
| T-501 | Logic bo: phase chờ/thu, chọn tâm mới, trừ máu | Có test theo thời gian giả lập | M | T-304 | ZON-01, ZON-02, ZON-03 |
| T-502 | Shader nước ngập ngoài vòng + tường nước | Ranh giới có bọt trắng | M | T-501 | ZON-04 |
| T-503 | Overlay màn hình và thông báo bo | | S | T-501 | ZON-04, ZON-05 |

### M6 — Loot, sự kiện, UI

| Ticket | Mô tả | Acceptance criteria | Size | Phụ thuộc | Req |
|---|---|---|---|---|---|
| T-601 | Spawn loot dọc vỉa hè, tự nhặt, giới hạn mang | Không có vật phẩm nằm trong nhà hay dưới sông | M | T-205 | LOT-01, LOT-02 |
| T-602 | Hồi máu bằng bánh mì / nước mía, buff chạy nhanh | | S | T-601 | LOT-03, LOT-04 |
| T-603 | Sự kiện Cầu Rồng phun lửa (particle + damage) | | M | T-107, T-304 | EVT-01, EVT-02 |
| T-604 | HUD | | M | T-302, T-501 | UI-02, UI-05 |
| T-605 | Minimap + bản đồ lớn | | M | T-102, T-501 | UI-03, UI-04 |
| T-606 | Menu bắt đầu, tạm dừng, màn kết thúc, chơi lại | Chơi lại 3 lần liên tiếp không rò bộ nhớ, không lỗi | M | T-604 | UI-01, UI-06, UI-07 |

### M7 — Hoàn thiện & phát hành MVP

| Ticket | Mô tả | Acceptance criteria | Size | Phụ thuộc | Req |
|---|---|---|---|---|---|
| T-701 | Đo và tối ưu hiệu năng | Đạt NFR-01, NFR-02 | M | M1–M6 | NFR-01, NFR-02 |
| T-702 | Cân bằng game: damage, số máu, tốc độ thu bo, độ chính xác bot | Trận 5–7 phút; người mới thắng được khoảng 1/5 trận | M | M1–M6 | NFR-06 |
| T-703 | Rà soát nội dung | Đạt NFR-03, NFR-04 | S | M1–M6 | NFR-03, NFR-04 |
| T-704 | README: giới thiệu, ảnh chụp, phím điều khiển, cách chạy local | | S | T-004 | |
| T-705 | Playtest với 5 người, ghi lại phản hồi thành issue mới | | S | T-701 | |

### Thứ tự gợi ý

```
M0 → M1 → M2 → M3 ─┬→ M4 ─┐
                   └→ M5 ─┴→ M6 → M7
```

M4 (bot) và M5 (bo) làm song song được sau khi xong M3.

---

## 5. Sau MVP (chi tiết viết sau)

**Phase 2 — Nội dung & cảm giác chơi**
- Xe máy Wave để chạy bo
- Thêm súng: súng lục, shotgun, súng bắn tỉa; ống ngắm
- Bot dùng navmesh (recast-navigation-js) thay cho cơ chế đi vòng khi kẹt
- Vào được bên trong một số nhà
- Âm thanh thật, nhạc nền
- Mode chơi khác: "Ngập Bo" (bo thu nhanh), solo vs 49 bot

**Phase 3 — Dữ liệu bản đồ thật**
- Pipeline OpenStreetMap → footprint nhà → mesh, mở rộng sang Sơn Trà, Thanh Khê
- Thêm landmark: Cầu Thuận Phước, Công viên APEC, bãi biển Mỹ Khê

**Phase 4 — Multiplayer**
- Server authoritative (Node, Colyseus hoặc tương đương), chạy chung code va chạm với client
- Client prediction, reconciliation, interpolation, lag compensation
- Transport: WebSocket trước, cân nhắc WebRTC/WebTransport
- Interest management + chống wallhack cơ bản
- Phòng chơi riêng cho nhóm bạn; server đặt ở Singapore

**Phase 5 — Mobile & phát hành**
- Điều khiển cảm ứng, tối ưu cho điện thoại
- Hỏi luật sư về giấy phép trò chơi G1 trước khi public hoặc thu tiền

---

## 6. Definition of Done (mọi ticket)

- Code đã merge vào `main` qua PR, CI xanh
- Logic thuần có unit test
- Thông số mới nằm trong `config.ts`, không hard-code
- Chạy thử trên Chrome desktop, FPS không tụt so với trước
- Cập nhật README nếu thêm phím điều khiển hoặc tính năng người chơi thấy được

---

## 7. Gợi ý tổ chức trên GitHub

**Milestones:** `M0 Setup`, `M1 Map`, `M2 Player`, `M3 Combat`, `M4 Bots`, `M5 Zone`, `M6 Loot & UI`, `M7 Release MVP`.

**Labels:**
- Loại: `feature`, `bug`, `chore`, `perf`, `test`
- Mảng: `area:map`, `area:player`, `area:combat`, `area:bot`, `area:zone`, `area:ui`, `area:infra`
- Ưu tiên: `P0`, `P1`, `P2`
- Size: `size:S`, `size:M`, `size:L`

**Mẫu issue:**

```markdown
## Mô tả
<ticket làm gì, vì sao>

## Requirement liên quan
MAP-04, NFR-01

## Acceptance criteria
- [ ] ...
- [ ] ...

## Phụ thuộc
Blocked by #<số issue>

## Ghi chú kỹ thuật
<tham khảo prototype: hàm nào, file nào>
```

**Tạo nhanh bằng GitHub CLI** (ví dụ một ticket):

```bash
gh issue create \
  --title "T-104 Sinh nhà theo block (chia đôi đệ quy, có kiệt)" \
  --body-file issues/T-104.md \
  --label "feature,area:map,P0,size:M" \
  --milestone "M1 Map"
```
