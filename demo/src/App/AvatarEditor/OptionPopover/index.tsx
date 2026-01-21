import React, { useEffect, useRef } from 'react';
import './index.scss';

interface OptionPopoverProps {
  options: any[];
  currentValue: any;
  onSelect: (value: any) => void;
  onClose: () => void;
  renderOption: (option: any, isSelected?: boolean) => React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function OptionPopover({
  options,
  currentValue,
  onSelect,
  onClose,
  renderOption,
  position = 'top',
}: OptionPopoverProps): JSX.Element {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className={`OptionPopover OptionPopover--${position}`}
      onClick={(e) => e.stopPropagation()}>
      <div className="OptionPopover__grid">
        {options.map((option, index) => {
          const isSelected = option === currentValue;
          return (
            <button
              key={index}
              type="button"
              className={`OptionPopover__item ${isSelected ? 'OptionPopover__item--selected' : ''}`}
              onClick={() => {
                onSelect(option);
                onClose();
              }}
              title={option === 'none' ? 'None' : String(option)}>
              {renderOption(option, isSelected)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

