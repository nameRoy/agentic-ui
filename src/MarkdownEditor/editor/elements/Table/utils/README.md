# 表格列宽逻辑说明

## 一、场景与行为（快速参考）

| 场景 | 行为 |
|------|------|
| 显式传入 `otherProps.colWidths` | 始终使用，不参与自动计算 |
| 列数 ≥ 5 | 始终计算列宽并渲染 colgroup（避免首帧未测量导致无列宽） |
| 列数 < 5 且容器宽度充足 | 不设置 colgroup，交给浏览器 |
| 列数 < 5 且表格溢出或未测量 | 根据列数计算列宽并设置 colgroup |

**实现**：列数 ≥ 5 时直接返回 `getReadonlyTableColWidths` 结果；列数 < 5 时由 `ResizeObserver` 监听容器，`checkOverflow` 为 true 时才计算列宽并渲染 colgroup。

## 二、整体策略（按列数分布）

| 条件 | 行为 |
|------|------|
| 显式传入 `otherProps.colWidths` | 始终使用，不参与自动计算 |
| 5 列及以上 | 始终渲染 colgroup，每列 120px（最后一列弹性） |
| 1–4 列且容器宽度充足 | 不设置 colgroup，由浏览器自然分布 |
| 1–4 列且溢出或未测量 | 计算并设置 colgroup，使用百分比平分 |

## 三、调用流程

```
ReadonlyTableComponent
  └─ useReadonlyTableColWidths(containerRef, tableRef, columnCount, otherProps)
       └─ 列数 ≥ 5 → 直接返回 getReadonlyTableColWidths()
       └─ 列数 < 5 → ResizeObserver 监听容器，溢出或未测量时返回 getReadonlyTableColWidths()
  └─ TableColgroup 渲染 colgroup
```

## 四、常量定义

见 `Constants/mobile.ts`：

- `TABLE_COL_WIDTH_MIN_COLUMNS = 5`：列数阈值
- `TABLE_DEFAULT_COL_WIDTH = 120`：5+ 列时的默认宽度 (px)
- `TABLE_LAST_COL_MIN_WIDTH = 80`：px 模式下最后一列的最小宽度（弹性列）

## 五、文件职责

- `useReadonlyTableColWidths.ts`：Hook，封装溢出检测与列宽按需计算，含完整场景表
- `getTableColWidths.ts`：纯函数，根据列数和 otherProps 计算列宽数组
- `TableColgroup.tsx`：根据列宽数组渲染 `<colgroup>`，支持 px 与百分比
