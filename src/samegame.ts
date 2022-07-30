export type SameGameMap = number[][];
export type SameGamePoint = {
  x: number;
  y: number;
};

// 一パネルの値を生成する
// numOfTypes: パネルの種類数
// 0は空白として利用するため1以降を利用
function genRandPanel(numOfTypes: number): number {
  return Math.floor(Math.random() * numOfTypes) + 1;
}

// マップの初期生成関数
// numOfTypesだけゲーム開始時に動的に変更できるように
// この関数を生成する関数をローカルで生成してもよいかも
// @param {number} w - ゲームの内部マップのwidth
// @param {number} h - ゲームの内部マップのheight
// @param {number} numOfType - ゲームの内部マップのvalueの種類数
// @return {SameGameMap} - ゲームの内部マップ
export function genMap(w: number, h: number, numOfTypes: number): SameGameMap {
  return [...Array(h)].map((x) =>
    [...Array(w)].map((y) => genRandPanel(numOfTypes))
  );
}

// ptrの隣接座標を生成する。
// 中心点を除いた十字位置のみを隣接座標とする
function getAroundPtrs(ptr: SameGamePoint): SameGamePoint[][] {
  let ptrs: SameGamePoint[] = [];
  for (let i = -1; i < 2; i++) {
    const y: SameGamePoint = ptr.y + i;
    for (let j = -1; j < 2; j++) {
      const x = ptr.x + j;
      const p: SameGamePoint = { x, y };
      if (
        !(x === ptr.x && y === ptr.y) &&
        (Math.abs(i) === 0 || Math.abs(j) === 0)
      )
        ptrs.push(p);
    }
  }
  return ptrs;
}

function blockLeftDown(map: SameGameMap, ptr: SameGamePoint) {
  const oldmap = JSON.parse(JSON.stringify(map));
  for (let i = ptr.x; i < oldmap[0].length - 1; i++) {
    map[ptr.y][i] = oldmap[ptr.y][i + 1];
  }
}

// 一列ずつブロックを左方向へ切り詰められるか確認し、
// 可能であれば切り詰める
function tryBlockLinesLeftDown(map: SameGameMap) {
  for (let i = map.length - 1; i > -1; i--) {
    let hstack = [];
    let zstack = [];
    for (let k = 0; k < map[i].length; k++) {
      if (map[i][k] > 0) {
        hstack.push(map[i][k]);
      } else {
        zstack.push(0);
      }
    }
    if (zstack.length > 0) {
      const stack = [...hstack, ...zstack];
      for (let k = 0; k < map[i].length; k++) {
        map[i][k] = stack[k];
      }
    }
  }
}

// 一列ずつブロックを下方向へ切り詰められるか確認し、
// 可能であれば切り詰める
function tryBlockLinesDown(map: SameGameMap) {
  for (let i = 0; i < map[0].length - 1; i++) {
    let vstack = [];
    let zstack = [];
    for (let k = 0; k < map.length; k++) {
      if (map[k][i] >= 0) {
        vstack.push(map[k][i]);
      } else {
        zstack.push(0);
      }
    }
    if (zstack.length > 0) {
      const stack = [...zstack, ...vstack];
      for (let k = 0; k < map.length; k++) {
        map[k][i] = stack[k];
      }
    }
  }
}

// パネル選択時、以下の処理をmapへ適用する
// ・選択したパネルを含むと隣接する同じ値のパネルを消す
// ・パネルを詰める処理。連番と優先順位はリンクしている
//   1. パネルをけした後に下に詰める
//   2. 次に左に詰められる場合は詰める。
// @param {SameGameMap} map - ゲームの内部マップ
// @param {SameGamePoint} ptr - ゲームの内部マップの座標
// @return {SameGameMap} - ゲームの内部マップ
function choicePanelOnMapInternal(
  map: SameGameMap,
  ptr: SameGamePoint,
  v: number,
  memo: Map<string, boolean>
) {
  // 既に確認済の場合実効しない
  const mkey = `${ptr.y}:${ptr.x}`;
  if (memo.has(mkey)) return;
  memo.set(mkey, true);
  // 隣接パネルの座標配列を取得
  const ptrs: SameGamePoint[] = getAroundPtrs(ptr);
  // 選択パネルから隣接するパネルへこの関数を適用
  ptrs.forEach((p) => {
    const { x, y } = p;
    // 範囲外エラーチェック
    if (map.length <= y || map[0].length <= x || x < 0 || y < 0) return;
    const pv = map[y][x];
    if (pv === v) {
      choicePanelOnMapInternal(map, p, pv, memo);
    }
  });
  // この関数では-1,置換予定の値に変更するだけ
  map[ptr.y][ptr.x] = -1;
}

// パネル選択時、以下の処理をmapへ適用する
// 最初の値のみ固定する必要があるため
// ここでは固定のみ行い、
// 以降はchoicePanelOnMapInternalで処理を行う
// mapは別のオブジェクトをコピーしてそちらを返却する。
// @param {SameGameMap} map - ゲームの内部マップ
// @param {SameGamePoint} ptr - ゲームの内部マップの座標
// @return {SameGameMap} - ゲームの内部マップ
export function choicePanelOnMap(
  map: SameGameMap,
  ptr: SameGamePoint
): SameGameMap {
  const v = map[ptr.y][ptr.x];
  let mmap: SameGameMap = JSON.parse(JSON.stringify(map));
  let memo: Map<string, boolean> = new Map<string, boolean>();
  choicePanelOnMapInternal(mmap, ptr, v, memo);
  // 切り詰め処理
  tryBlockLinesDown(mmap);
  tryBlockLinesLeftDown(mmap);
  return mmap;
}

// パネルを切り詰める関数

// 終了判定関数
// 隣接する同じパネルが存在しない
// @param {SameGameMap} map - ゲームの内部マップ
// @return {boolean} - 終了ならTrue
export function isFinish(map: SameGameMap): boolean {
  return !map.find((l) => l.find((x) => x > 0));
}

export function countFPanel(
  map: SameGameMap,
  f: (x: number) => boolean
): number {
  let cnt = 0;
  for (let i = 0; i < map.length; i++) {
    for (let k = 0; k < map.length; k++) {
      if (f(map[i][k])) cnt++;
    }
  }
  return cnt;
}

export function countEnablePanel(map: SameGameMap): number{
  return countFPanel(map, (x) => x > 0);
}
