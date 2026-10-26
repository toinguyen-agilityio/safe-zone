/** The words on the start screen, in Vietnamese. The name is the game's own, not borrowed. */
export const GAME_NAME = 'Sinh Tồn Hải Châu';

export const TAGLINE =
  'Nhảy dù xuống Đà Nẵng, nhặt đồ, tránh nước dâng và là người cuối cùng trụ lại.';

export const DESCRIPTION =
  'Bạn cùng 19 đối thủ nhảy dù xuống khu Hải Châu. Nước lũ dâng lên và vùng khô thu hẹp dần: ' +
  'hãy chạy vào vùng khô, nhặt bánh mì, nước mía, đạn và áo mưa, rồi hạ gục những người còn lại.';

export const ENTER_BUTTON = 'Vào trận';

export const CONTROLS_TITLE = 'Điều khiển';

/** Each control as a key and what it does. */
export const CONTROLS: readonly (readonly [key: string, action: string])[] = [
  ['W A S D', 'Di chuyển'],
  ['Shift', 'Chạy nhanh'],
  ['Space', 'Nhảy, rơi nhanh khi nhảy dù'],
  ['Chuột trái', 'Bắn'],
  ['Chuột phải', 'Ngắm'],
  ['R', 'Nạp đạn'],
  ['1', 'Ăn bánh mì'],
  ['2', 'Uống nước mía'],
  ['Esc', 'Tạm dừng'],
];
