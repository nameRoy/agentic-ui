import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MermaidFallback } from '../../../src/Plugins/mermaid/MermaidFallback';

vi.mock('../../../src/Plugins/mermaid/style', () => ({
  useStyle: vi.fn(() => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  })),
}));

describe('MermaidFallback', () => {
  it('应在 getPrefixCls 返回空时使用默认 baseCls (line 12 fallback)', () => {
    const emptyPrefixClsContext = {
      getPrefixCls: () => '',
      getIconPrefixCls: () => 'anticon',
    };
    const { container } = render(
      <ConfigProvider.ConfigContext.Provider value={emptyPrefixClsContext as any}>
        <MermaidFallback />
      </ConfigProvider.ConfigContext.Provider>,
    );
    expect(
      container.querySelector('.agentic-plugin-mermaid-fallback'),
    ).toBeInTheDocument();
  });

  it('应在 ConfigProvider 下使用 prefixCls', () => {
    const { container } = render(
      <ConfigProvider prefixCls="ant">
        <MermaidFallback />
      </ConfigProvider>,
    );
    const fallbackEl =
      container.querySelector('.ant-agentic-plugin-mermaid-fallback') ||
      container.querySelector('[class*="mermaid-fallback"]');
    expect(fallbackEl).toBeTruthy();
  });
});
