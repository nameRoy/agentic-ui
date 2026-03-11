import React, { useEffect, useMemo, useState } from 'react';
import { TABLE_COL_WIDTH_MIN_COLUMNS } from '../../../../../Constants/mobile';
import type { ColWidthValue } from './getTableColWidths';
import { getReadonlyTableColWidths } from './getTableColWidths';

/**
 * 只读表格列宽：多列时始终设 colgroup，少列时按需计算
 *
 * ## 场景与行为
 *
 * | 场景                         | 行为                                   |
 * | ---------------------------- | -------------------------------------- |
 * | 显式传入 otherProps.colWidths | 始终使用，不参与自动计算               |
 * | 列数 >= 5                     | 始终计算列宽并渲染 colgroup，避免首帧未测量 |
 * | 列数 < 5 且容器宽度充足       | 不设置 colgroup，交给浏览器自然分布    |
 * | 列数 < 5 且表格溢出或未测量   | 根据列数计算列宽并设置 colgroup        |
 *
 * ## 实现方式
 *
 * - 列数 >= TABLE_COL_WIDTH_MIN_COLUMNS 时始终返回列宽，保证多列表格（如 12 列季度数据）有 colgroup
 * - 列数 < 5 时沿用 ResizeObserver 溢出检测，宽容器下不渲染 colgroup
 *
 * @see ./README.md
 */
export interface UseReadonlyTableColWidthsParams {
  columnCount: number;
  otherProps?: { colWidths?: ColWidthValue[] } | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  tableRef: React.RefObject<HTMLTableElement | null>;
}

export function useReadonlyTableColWidths({
  columnCount,
  otherProps,
  containerRef,
  tableRef,
}: UseReadonlyTableColWidthsParams): ColWidthValue[] {
  const [needsColWidths, setNeedsColWidths] = useState(false);

  const computedColWidths = useMemo(
    () =>
      getReadonlyTableColWidths({
        columnCount,
        otherProps: otherProps as { colWidths?: number[] } | null | undefined,
      }),
    [columnCount, otherProps],
  );

  useEffect(() => {
    const container = containerRef.current;
    const table = tableRef.current;
    if (!container || !table || columnCount === 0) return;

    const checkOverflow = () => {
      const cw = container.clientWidth;
      const sw = table.scrollWidth;
      const unmeasured = cw === 0;
      const overflow = sw > cw;
      setNeedsColWidths(unmeasured || overflow);
    };

    const ro = new ResizeObserver(checkOverflow);
    ro.observe(container);
    checkOverflow();
    return () => ro.disconnect();
  }, [columnCount]);

  return useMemo(() => {
    if (otherProps?.colWidths?.length) return otherProps.colWidths;
    // 多列表格（如 12 列季度数据）始终渲染 colgroup，避免首帧未测量导致无列宽
    if (columnCount >= TABLE_COL_WIDTH_MIN_COLUMNS) return computedColWidths;
    return needsColWidths ? computedColWidths : [];
  }, [otherProps?.colWidths, needsColWidths, computedColWidths, columnCount]);
}
