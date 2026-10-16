const palette = ["#ff5c3f", "#0d9488", "#4e72df", "#a855f7", "#e5a300", "#db2777", "#0891b2", "#65a30d"];

const elements = {
  input: document.querySelector("#number-input"),
  error: document.querySelector("#input-error"),
  build: document.querySelector("#build-button"),
  tree: document.querySelector("#tree-stage"),
  array: document.querySelector("#array-view"),
  phase: document.querySelector("#phase-badge"),
  title: document.querySelector("#step-title"),
  description: document.querySelector("#step-description"),
  compares: document.querySelector("#compare-count"),
  swaps: document.querySelector("#swap-count"),
  heapSize: document.querySelector("#heap-size"),
  heapRange: document.querySelector("#heap-range"),
  current: document.querySelector("#step-current"),
  total: document.querySelector("#step-total"),
  progress: document.querySelector("#progress-bar"),
  play: document.querySelector("#play-button"),
  prev: document.querySelector("#prev-button"),
  next: document.querySelector("#next-button"),
  reset: document.querySelector("#reset-button"),
  speed: document.querySelector("#speed-range"),
  repo: document.querySelector("#repo-link")
};

let steps = [];
let stepIndex = 0;
let timer = null;
let idSeed = 0;

function parseInput(raw) {
  const tokens = raw.trim().split(/[\s,，]+/).filter(Boolean);
  if (tokens.length < 2 || tokens.length > 15) {
    throw new Error("請輸入 2–15 個整數。");
  }
  const values = tokens.map(Number);
  if (values.some(value => !Number.isInteger(value) || Math.abs(value) > 999)) {
    throw new Error("只能輸入 -999 到 999 的整數。");
  }
  return values;
}

function createTrace(values) {
  const data = values.map(value => ({ value, id: idSeed++ }));
  const trace = [];
  let comparisons = 0;
  let swaps = 0;

  const save = (phase, title, description, heapSize, active = [], compare = []) => {
    trace.push({
      phase,
      title,
      description,
      heapSize,
      active: [...active],
      compare: [...compare],
      comparisons,
      swaps,
      data: data.map(item => ({ ...item }))
    });
  };

  const siftDown = (start, heapSize, phase) => {
    let parent = start;
    while (true) {
      const left = 2 * parent + 1;
      const right = 2 * parent + 2;
      let largest = parent;

      if (left < heapSize) {
        comparisons++;
        save(phase, "比較左子節點", `${data[parent].value} 與左子節點 ${data[left].value} 比較。`, heapSize, [parent], [left]);
        if (data[left].value > data[largest].value) largest = left;
      }
      if (right < heapSize) {
        comparisons++;
        save(phase, "比較右子節點", `再與右子節點 ${data[right].value} 比較，找出最大的節點。`, heapSize, [parent], [right, largest]);
        if (data[right].value > data[largest].value) largest = right;
      }
      if (largest === parent) {
        save(phase, "下沉完成", `${data[parent].value} 已大於等於子節點，這條路徑符合 Max-Heap。`, heapSize, [parent]);
        return;
      }

      const parentValue = data[parent].value;
      const childValue = data[largest].value;
      [data[parent], data[largest]] = [data[largest], data[parent]];
      swaps++;
      save(phase, "與較大的孩子交換", `${parentValue} 與較大的孩子 ${childValue} 交換，繼續往下檢查。`, heapSize, [parent, largest]);
      parent = largest;
    }
  };

  save("READY", "原始資料", "先把資料放進陣列；此時還不一定符合 Max-Heap。", data.length);

  for (let i = Math.floor(data.length / 2) - 1; i >= 0; i--) {
    save("BUILD", "建立 Max-Heap", `從索引 ${i} 開始下沉。葉節點本身已是合法的小 Heap。`, data.length, [i]);
    siftDown(i, data.length, "BUILD");
  }

  save("HEAP READY", "Max-Heap 建立完成", `最大值 ${data[0].value} 位於根節點。接著把它固定到未排序區的尾端。`, data.length, [0]);

  for (let heapSize = data.length; heapSize > 1; heapSize--) {
    const maximum = data[0].value;
    [data[0], data[heapSize - 1]] = [data[heapSize - 1], data[0]];
    swaps++;
    save("SORT", "最大值移到尾端", `${maximum} 已放到索引 ${heapSize - 1}，不再參與後續的 Heap。`, heapSize - 1, [0, heapSize - 1]);
    siftDown(0, heapSize - 1, "SORT");
  }

  save("DONE", "排序完成", "所有元素已由小到大排列。Heap Sort 完成！", 0);
  return trace;
}

function nodeClasses(index, step) {
  const classes = [];
  if (step.active.includes(index)) classes.push("is-active");
  else if (step.compare.includes(index)) classes.push("is-compare");
  if (index >= step.heapSize) classes.push("is-fixed");
  return classes.join(" ");
}

function renderTree(step) {
  elements.tree.replaceChildren();
  if (step.heapSize === 0) {
    const empty = document.createElement("div");
    empty.className = "tree-empty";
    empty.textContent = "Heap 已清空；所有數字都固定在陣列中。";
    elements.tree.append(empty);
    return;
  }

  let start = 0;
  let width = 1;
  while (start < step.heapSize) {
    const row = document.createElement("div");
    row.className = "tree-level";
    const end = Math.min(start + width, step.heapSize);
    for (let i = start; i < end; i++) {
      const item = step.data[i];
      const node = document.createElement("div");
      node.className = `tree-node ${nodeClasses(i, step)}`;
      node.style.setProperty("--node-color", palette[item.id % palette.length]);
      node.dataset.index = i;
      node.textContent = item.value;
      node.title = `索引 ${i}，值 ${item.value}`;
      row.append(node);
    }
    elements.tree.append(row);
    start = end;
    width *= 2;
  }
}

function renderArray(step) {
  elements.array.replaceChildren();
  step.data.forEach((item, index) => {
    const cell = document.createElement("div");
    cell.className = `array-cell ${nodeClasses(index, step)}`;
    cell.style.setProperty("--node-color", palette[item.id % palette.length]);
    cell.innerHTML = `<strong>${item.value}</strong><small>[${index}]</small>`;
    elements.array.append(cell);
  });
}

function render() {
  const step = steps[stepIndex];
  if (!step) return;
  renderTree(step);
  renderArray(step);
  elements.phase.textContent = step.phase;
  elements.title.textContent = step.title;
  elements.description.textContent = step.description;
  elements.compares.textContent = step.comparisons;
  elements.swaps.textContent = step.swaps;
  elements.heapSize.textContent = step.heapSize;
  elements.heapRange.textContent = step.heapSize ? `Heap 範圍：0–${step.heapSize - 1}` : "Heap 範圍：空";
  elements.current.textContent = stepIndex + 1;
  elements.total.textContent = steps.length;
  elements.progress.style.width = `${((stepIndex + 1) / steps.length) * 100}%`;
  elements.prev.disabled = stepIndex === 0;
  elements.reset.disabled = stepIndex === 0;
  elements.next.disabled = stepIndex === steps.length - 1;

  if (stepIndex === steps.length - 1) stopPlayback();
}

function buildTrace() {
  try {
    const values = parseInput(elements.input.value);
    elements.error.textContent = "";
    stopPlayback();
    steps = createTrace(values);
    stepIndex = 0;
    render();
  } catch (error) {
    elements.error.textContent = error.message;
  }
}

function stopPlayback() {
  if (timer) window.clearInterval(timer);
  timer = null;
  elements.play.innerHTML = "▶ <span>播放</span>";
  elements.play.setAttribute("aria-label", "播放");
}

function togglePlayback() {
  if (timer) {
    stopPlayback();
    return;
  }
  if (stepIndex === steps.length - 1) stepIndex = 0;
  elements.play.innerHTML = "Ⅱ <span>暫停</span>";
  elements.play.setAttribute("aria-label", "暫停");
  timer = window.setInterval(() => {
    if (stepIndex < steps.length - 1) {
      stepIndex++;
      render();
    } else {
      stopPlayback();
    }
  }, 1650 - Number(elements.speed.value));
  render();
}

elements.build.addEventListener("click", buildTrace);
elements.input.addEventListener("keydown", event => {
  if (event.key === "Enter") buildTrace();
});
document.querySelectorAll(".example-button").forEach(button => {
  button.addEventListener("click", () => {
    elements.input.value = button.dataset.values;
    buildTrace();
  });
});
elements.play.addEventListener("click", togglePlayback);
elements.prev.addEventListener("click", () => {
  stopPlayback();
  stepIndex = Math.max(0, stepIndex - 1);
  render();
});
elements.next.addEventListener("click", () => {
  stopPlayback();
  stepIndex = Math.min(steps.length - 1, stepIndex + 1);
  render();
});
elements.reset.addEventListener("click", () => {
  stopPlayback();
  stepIndex = 0;
  render();
});
elements.speed.addEventListener("input", () => {
  if (timer) {
    stopPlayback();
    togglePlayback();
  }
});
document.addEventListener("keydown", event => {
  if (event.target.matches("input")) return;
  if (event.code === "Space") {
    event.preventDefault();
    togglePlayback();
  } else if (event.key === "ArrowLeft") {
    elements.prev.click();
  } else if (event.key === "ArrowRight") {
    elements.next.click();
  }
});

buildTrace();
