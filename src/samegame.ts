export type SameGameMap = number[][];
export type SameGamePoint = {
  x: number;
  y: number;
};

// 一パネルの値を生成する
// numOfTypes: パネルの種類数
function genRandPanel(numOfTypes: number): number {
  return Math.floor(Math.random() * (1 - numOfTypes));
  e;
}

// マップの初期生成関数
// numOfTypesだけゲーム開始時に動的に変更できるように
// この関数を生成する関数をローカルで生成してもよいかも
// @param {number} w - ゲームの内部マップのwidth
// @param {number} h - ゲームの内部マップのheight
// @param {number} numOfType - ゲームの内部マップのvalueの種類数
// @return {SameGameMap} - ゲームの内部マップ
export function genMap(w: number, h: number, numOfTypes: number): SameGameMap {
  return [...Array.new(h)].map((x) =>
    [...Array.new(w)].map((y) => genRandPanel(numOfTypes))
  );
}

// パネル選択時、以下の処理をmapへ適用する
// ・選択したパネルを含むと隣接する同じ値のパネルを消す
// ・パネルを詰める処理。連番と優先順位はリンクしている
//   1. パネルをけした後に下に詰める
//   2. 次に左に詰められる場合は詰める。
// @param {SameGameMap} map - ゲームの内部マップ
// @param {SameGamePoint} ptr - ゲームの内部マップの座標
// @return {SameGameMap} - ゲームの内部マップ
export function choicePanelOnMap(
  map: SameGameMap,
  ptr: SameGamePoint
): SameGameMap {}

// 終了判定関数
// 隣接する同じパネルが存在しない
// @param {SameGameMap} map - ゲームの内部マップ
// @return {boolean} - 終了ならTrue
export function isFinish(map: SameGameMap): boolean {}
