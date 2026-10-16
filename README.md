# Max-Heap 與 Heap Sort（C++）

這個專案依照教授提供的 Heap 教學頁完成，未使用 `std::priority_queue` 或 `std::sort`。

## 線上互動網頁

**GitHub Pages：<https://cam-cheney.github.io/HeapSortMaxHeap/>**

專案根目錄的 `index.html`、`styles.css` 與 `app.js` 是可部署到 GitHub Pages 的互動視覺化網站。網站可以：

- 自訂 2–15 個整數（支援負數與重複值）
- 逐步播放 bottom-up 建立 Max-Heap
- 逐步播放原地 Heap Sort
- 同步顯示樹、陣列、Heap 範圍、比較與交換次數
- 使用播放、暫停、上一步、下一步、速度與鍵盤控制

## 專案內容

- `MaxHeap::push()`：新增元素後上浮，時間複雜度 `O(log n)`
- `MaxHeap::pop()`：取出最大值後下沉，時間複雜度 `O(log n)`
- `MaxHeap::top()`：查看最大值，時間複雜度 `O(1)`
- `MaxHeap::buildHeap()`：由最後一個非葉節點往前下沉，時間複雜度 `O(n)`
- `MaxHeap::isHeap()`：檢查每個父節點是否大於等於子節點，時間複雜度 `O(n)`
- `heapSort()`：原地 Heap Sort，時間複雜度 `O(n log n)`，額外空間 `O(1)`

## 在 Visual Studio Code 執行

1. 用 VS Code 開啟整個 `HeapSortMaxHeap` 資料夾。
2. 安裝 Microsoft 的 **C/C++** 擴充套件。
3. 按 `Ctrl+Shift+B`，VS Code 會使用這台電腦現有的 Visual Studio C++ 編譯器完成建置。
4. 按 `Ctrl+F5` 執行，或在終端機輸入：

```powershell
.\build\heap_sort.exe
```

若要手動編譯，請先開啟 **Developer PowerShell for VS 2026**，切換到此資料夾，再執行：

```powershell
New-Item -ItemType Directory -Force build | Out-Null
cl /nologo /std:c++17 /EHsc /W4 /O2 main.cpp /Fe:build/heap_sort.exe
.\build\heap_sort.exe
```

程式可以輸入一串以空白分隔的整數；直接按 Enter 會使用題目指定的測試資料：

```text
21 64 8 52 37 90 17
```

預期結果包含：

```text
Max heap:            [90, 64, 21, 52, 37, 8, 17]
isHeap result:       true
Pop order (DESC):    [90, 64, 52, 37, 21, 17, 8]
Heap sort (ASC):     [8, 17, 21, 37, 52, 64, 90]
```

## 為什麼 Heap Sort 是 O(n log n)？

1. 先使用 bottom-up `buildHeap()` 建立 Max-Heap，成本是 `O(n)`。
2. 接著做 `n - 1` 次取最大值；每次交換根與尾端，再做一次下沉，成本是 `O(log n)`。
3. 總成本為 `O(n) + O(n log n) = O(n log n)`。

Max-Heap 的根永遠是目前最大值。把根和未排序區間的最後一格交換後，最大值會固定在右側；重複執行，陣列最後便會由小到大排列。

## Max-Heap 索引公式（從 0 開始）

對索引 `i`：

- 父節點：`(i - 1) / 2`
- 左子節點：`2 * i + 1`
- 右子節點：`2 * i + 2`

下沉時必須和「較大的子節點」交換。若和較小的子節點交換，較大的子節點可能仍比新的父節點大，會立刻違反 Max-Heap 的規則。

## 複雜度整理

| 操作 | 時間複雜度 | 原因 |
|---|---:|---|
| `top` | `O(1)` | 最大值固定在索引 0 |
| `push` | `O(log n)` | 最多沿樹高上浮 |
| `pop` | `O(log n)` | 最多沿樹高下沉 |
| `buildHeap` | `O(n)` | 多數節點是葉節點或只需下沉少量層數 |
| `heapSort` | `O(n log n)` | 建堆 `O(n)`，再做約 n 次 `O(log n)` 下沉 |

原地 `heapSort` 的額外空間為 `O(1)`；`MaxHeap` 類別本身使用一個 `vector<int>` 儲存 n 筆資料，所以儲存空間為 `O(n)`。
