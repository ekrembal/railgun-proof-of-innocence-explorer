import React, { CSSProperties } from 'react';
import cn from 'classnames';
import styles from './ErrorDisplay.module.scss';

export type ErrorProps = {
  message: string;
  style?: CSSProperties;
  onClick?: () => void;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const ErrorDisplay = ({
  message,
  style,
  onClick,
  onMouseLeave,
  onMouseEnter,
  className,
}: ErrorProps) => {
  return (
    <div
      className={cn(
        styles.error,
        { [styles.clickable]: onClick },
        className
      )}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {message}
    </div>
  );
};
