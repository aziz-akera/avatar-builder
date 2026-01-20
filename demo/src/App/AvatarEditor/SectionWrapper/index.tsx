import React from 'react'

import './index.scss'

type SectionWrapperProps = {
  className?: string;
  children: React.ReactNode;
  switchConfig: () => void;
  tip: string;
};

export default function SectionWrapper({
  className = "",
  children,
  switchConfig,
  tip,
}: SectionWrapperProps): JSX.Element {
  return (
    <div
      className={"SectionWrapper " + className}
      data-tip={tip}
      onClick={switchConfig}>
      <div className="relative w-full h-full">
        <div className="childrenWrapper absolute top-0 left-0 w-full h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  )
}