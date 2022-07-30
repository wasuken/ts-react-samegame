import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import {
  genMap,
  SameGameMap,
  SameGamePoint,
  choicePanelOnMap,
  isFinish,
  countEnablePanel,
} from "./samegame";

function genColor() {
  return (
    "rgb(" +
    ~~(256 * Math.random()) +
    ", " +
    ~~(256 * Math.random()) +
    ", " +
    ~~(256 * Math.random()) +
    ")"
  );
}

const numOfTypes = 4;
const width = 15;
const height = 15;
const not_map = ["white", ...[...Array(numOfTypes)].map((x) => genColor())];

function App() {
  const [remBlocks, setRemBlocks] = useState<number[]>([]);
  const [map, setMap] = useState<SameGameMap>(
    genMap(width, height, numOfTypes)
  );
  const [lastClickPtr, setLastClickPtr] = useState<SameGamePoint>({
    x: -1,
    y: -1,
  });
  function handlePanelClick(y: number, x: number) {
    let newmap = JSON.parse(JSON.stringify(map));
    const beforeScore = countEnablePanel(newmap);
    const ptr: SameGamePoint = { x, y };
    const rstmap = choicePanelOnMap(newmap, ptr);
    setMap(rstmap);
    setLastClickPtr(ptr);
    console.log(beforeScore, countEnablePanel(rstmap))
    setRemBlocks([...remBlocks, beforeScore - countEnablePanel(rstmap)]);
    console.log(remBlocks)
    if (isFinish(rstmap)) alert("finish.");
  }

  return (
    <div className="App" style={{ display: "flex" }}>
      <div>
        <div style={{ paddingLeft: "10px" }}>
          {[...Array(width)].map((x, i) => (
            <div style={{ display: "inline-block", width: `25px` }} key={i}>
              {i + 1}
            </div>
          ))}
        </div>
        {map.map((l, i) => (
          <div key={i}>
            <span style={{ display: 'inline-block', width: '30px'}}>{i + 1}:</span>
            <div
              style={{
                display: "inline",
                width: `${width * 25}px`,
                height: "25px",
              }}
            >
              {l.map((x, k) => (
                <div
                  key={k}
                  style={{
                    width: "23px",
                    height: "23px",
                    border: "solid 1px",
                    display: "inline-block",
                    backgroundColor: not_map[x],
                    cursor: "pointer",
                  }}
                  onClick={() => handlePanelClick(i, k)}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ border: "solid 1px", marginLeft: "30px", width: "30vw" }}>
        <h3>detail</h3>
        <div>得点: {remBlocks.reduce((acm, v) => acm + v*v, 0)}</div>
        <div>残りブロック: {countEnablePanel(map)}</div>
        <div></div>
      </div>
    </div>
  );
}

export default App;
