import { type ReactNode, type CSSProperties } from 'react';

interface PaperPanelProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function PaperPanel({ children, style }: PaperPanelProps) {
  return (
    <div style={{ width: '100%', maxWidth: 640, ...style }}>
      <div className="tear-top" />
      <div className="panel-body">{children}</div>
      <div className="tear-bottom" />
    </div>
  );
}
