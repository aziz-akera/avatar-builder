import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { defaultOptions } from "react-nice-avatar/utils"
import type { AvatarFullConfig } from "react-nice-avatar/types"
import Face from "react-nice-avatar/face/index"
import Hair from "react-nice-avatar/hair/index"
import Hat from "react-nice-avatar/hat/index"
import Eyes from "react-nice-avatar/eyes/index"
import Glasses from "react-nice-avatar/glasses/index"
import Ear from "react-nice-avatar/ear/index"
import Nose from "react-nice-avatar/nose/index"
import Mouth from "react-nice-avatar/mouth/index"
import Shirt from "react-nice-avatar/shirt/index"

import SectionWrapper from "./SectionWrapper/index"

import './index.scss'

interface AvatarEditorProps {
  config: AvatarFullConfig;
  updateConfig: (key: string, value: any) => void;
  download: () => void;
}

interface AvatarEditorState {
  openPopover: string | null;
  popoverPosition: { left: number; top: number } | null;
}

export default class AvatarEditor extends Component<AvatarEditorProps, AvatarEditorState> {
  static propTypes = {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
    download: PropTypes.func.isRequired
  }

  myDefaultOptions: any;

  constructor (props: AvatarEditorProps) {
    super(props)
    this.myDefaultOptions = this.genDefaultOptions(defaultOptions)
    this.state = {
      openPopover: null,
      popoverPosition: null,
    }
  }

  // Modification on defaultOptions for convenient
  genDefaultOptions (opts: any): any {
    const hairSet = new Set(opts.hairStyleMan.concat(opts.hairStyleWoman))
    return {
      ...opts,
      hairStyle: Array.from(hairSet),
      hairColor: opts.hairColor,
      hatColor: opts.hatColor,
      bgColor: [
        // Solid colors
        '#5A3CF1',
        '#E38DD3',
        '#57C7FA',
        '#8B75FF',
        '#BCAFFF',
        // Gradients
        'linear-gradient(135deg, #5A3CF1 0%, #E38DD3 100%)',
        'linear-gradient(135deg, #2D4CF9 0%, #57C7FA 100%)',
        'linear-gradient(135deg, #8B75FF 0%, #BCAFFF 100%)',
        'linear-gradient(135deg, #5A3CF1 0%, #8B75FF 100%)',
        'linear-gradient(135deg, #E38DD3 0%, #BCAFFF 100%)',
        'linear-gradient(135deg, #57C7FA 0%, #E38DD3 100%)',
        'linear-gradient(135deg, #8B75FF 0%, #E38DD3 100%)'
      ]
    }
  }

  openPopover (type: string, event?: React.MouseEvent): void {
    if (event) {
      const buttonElement = event.currentTarget as HTMLElement;
      const rect = buttonElement.getBoundingClientRect();
      const wrapperElement = buttonElement.closest('.AvatarEditor-wrapper') as HTMLElement;
      
      if (wrapperElement) {
        const wrapperRect = wrapperElement.getBoundingClientRect();
        const left = rect.left - wrapperRect.left + rect.width / 2;
        const top = rect.bottom - wrapperRect.top + 12; // 0.75rem = 12px
        
        this.setState((prev) => ({
          openPopover: prev.openPopover === type ? null : type,
          popoverPosition: prev.openPopover === type ? null : { left, top },
        }));
      }
    } else {
      this.setState((prev) => ({
        openPopover: prev.openPopover === type ? null : type,
        popoverPosition: null,
      }));
    }
  }

  selectOption (type: string, value: any): void {
    const { updateConfig } = this.props
    updateConfig(type, value)
    // Keep popover open to allow previewing multiple options
  }

  renderOption (type: string, option: any): React.ReactNode {
    if (option === 'none') {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#e63946' }}>
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }

    if (type === 'bgColor') {
      return (
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            background: option, 
            borderRadius: '50%',
            border: '2px solid rgba(0, 0, 0, 0.1)'
          }} 
        />
      )
    }

    if (type === 'hairColor' || type === 'hatColor') {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: option,
            borderRadius: '50%',
            border: '2px solid rgba(0, 0, 0, 0.1)',
          }}
        />
      )
    }

    switch (type) {
      case 'faceColor':
        // @ts-expect-error - Face component returns SVGElement but works as JSX
        return <Face color={option} />
      case 'hairStyle':
        // @ts-expect-error - Hair component returns SVGElement but works as JSX
        return <Hair style={option} color="#fff" colorRandom />
      case 'hatStyle':
        return <Hat style={option} color="#fff" />
      case 'eyeStyle':
        // @ts-expect-error - Eyes component returns SVGElement but works as JSX
        return <Eyes style={option} color="#fff" />
      case 'glassesStyle':
        // @ts-expect-error - Glasses component returns SVGElement but works as JSX
        return <Glasses style={option} color="#fff" />
      case 'earSize':
        // @ts-expect-error - Ear component returns SVGElement but works as JSX
        return <Ear size={option} color="#fff" />
      case 'noseStyle':
        // @ts-expect-error - Nose component returns SVGElement but works as JSX
        return <Nose style={option} color="#fff" />
      case 'mouthStyle':
        // @ts-expect-error - Mouth component returns SVGElement but works as JSX
        return <Mouth style={option} color="#fff" />
      case 'shirtStyle':
        // @ts-expect-error - Shirt component returns SVGElement but works as JSX
        return <Shirt style={option} color="#fff" />
      default:
        return null
    }
  }

  render () {
    const { config, download } = this.props
    const { openPopover, popoverPosition } = this.state
    
    return (
      <div className="AvatarEditor-wrapper">
      <div className="AvatarEditor rounded-full px-3 py-2 flex items-center">
        {/* Face */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Face"
          switchConfig={(e) => this.openPopover('faceColor', e)}>
          {/* @ts-expect-error - Face component returns SVGElement but works as JSX */}
          <Face color={config.faceColor} />
        </SectionWrapper>
        {/* Hair style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Hair"
          switchConfig={(e) => this.openPopover('hairStyle', e)}>
          {/* @ts-expect-error - Hair component returns SVGElement but works as JSX */}
          <Hair style={config.hairStyle} color="#fff" colorRandom />
        </SectionWrapper>
        {/* Hat style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Hat"
          switchConfig={(e) => this.openPopover('hatStyle', e)}>
          {config.hatStyle === "none" ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" style={{ color: '#e63946' }}>
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            // @ts-expect-error - Hat component returns SVGElement but works as JSX
          <Hat style={config.hatStyle} color="#fff" />
          )}
        </SectionWrapper>
        {/* Eyes style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Eyes"
          switchConfig={(e) => this.openPopover('eyeStyle', e)}>
          {/* @ts-expect-error - Eyes component returns SVGElement but works as JSX */}
          <Eyes style={config.eyeStyle} color="#fff" />
        </SectionWrapper>
        {/* Glasses style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Glasses"
          switchConfig={(e) => this.openPopover('glassesStyle', e)}>
          {config.glassesStyle === "none" ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" style={{ color: '#e63946' }}>
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            // @ts-expect-error - Glasses component returns SVGElement but works as JSX
          <Glasses style={config.glassesStyle} color="#fff" />
          )}
        </SectionWrapper>
        {/* Ear style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Ear"
          switchConfig={(e) => this.openPopover('earSize', e)}>
          {/* @ts-expect-error - Ear component returns SVGElement but works as JSX */}
          <Ear size={config.earSize} color="#fff" />
        </SectionWrapper>
        {/* Nose style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Nose"
          switchConfig={(e) => this.openPopover('noseStyle', e)}>
          {/* @ts-expect-error - Nose component returns SVGElement but works as JSX */}
          <Nose style={config.noseStyle} color="#fff" />
        </SectionWrapper>
        {/* Mouth style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Mouth"
          switchConfig={(e) => this.openPopover('mouthStyle', e)}>
          {/* @ts-expect-error - Mouth component returns SVGElement but works as JSX */}
          <Mouth style={config.mouthStyle} color="#fff" />
        </SectionWrapper>
        {/* Shirt style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Shirt"
          switchConfig={(e) => this.openPopover('shirtStyle', e)}>
          {/* @ts-expect-error - Shirt component returns SVGElement but works as JSX */}
          <Shirt style={config.shirtStyle} color="#fff" />
        </SectionWrapper>

        <div className="divider w-0.5 h-6 rounded mx-2" />

        {/* Background color */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Background"
          switchConfig={(e) => this.openPopover('bgColor', e)}>
          <div 
            style={{ 
              width: '100%', 
              height: '100%', 
              background: config.bgColor || '#5A3CF1', 
              borderRadius: '50%',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }} 
          />
        </SectionWrapper>

        <div className="divider w-0.5 h-6 rounded mx-2" />
        <i
          className="iconfont icon-download text-xl mx-2 cursor-pointer"
          data-tip="Download"
          onClick={download} />
        </div>

        {openPopover && popoverPosition && (
          <div 
            className="AvatarEditor-popover"
            style={{
              left: `${popoverPosition.left}px`,
              top: `${popoverPosition.top}px`,
              transform: 'translateX(-50%)',
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}>
            <div className="AvatarEditor-popover-header">
              <span className="AvatarEditor-popover-title">
                {openPopover === 'bgColor' ? 'Background Color' : openPopover.replace(/([A-Z])/g, ' $1')}
              </span>
              <button
                type="button"
                className="AvatarEditor-popover-close"
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({ openPopover: null, popoverPosition: null });
                }}>
                ✕
              </button>
            </div>

            {/* Combined popovers for style + color */}
            {openPopover === 'hairStyle' ? (
              <>
                <div className="AvatarEditor-popover-grid">
                  {this.myDefaultOptions.hairStyle?.map((option: any, index: number) => (
                    <button
                      key={`hair-style-${index}`}
                      type="button"
                      className="AvatarEditor-popover-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.selectOption('hairStyle', option);
                      }}
                      onMouseDown={(e) => e.preventDefault()}>
                      {this.renderOption('hairStyle', option)}
                    </button>
                  ))}
                </div>
                <div className="divider w-full h-px my-3" />
                <div className="AvatarEditor-popover-grid">
                  {this.myDefaultOptions.hairColor?.map((option: any, index: number) => (
                    <button
                      key={`hair-color-${index}`}
                      type="button"
                      className="AvatarEditor-popover-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.selectOption('hairColor', option);
                      }}
                      onMouseDown={(e) => e.preventDefault()}>
                      {this.renderOption('hairColor', option)}
                    </button>
                  ))}
                </div>
              </>
            ) : openPopover === 'hatStyle' ? (
              <>
                <div className="AvatarEditor-popover-grid">
                  {this.myDefaultOptions.hatStyle?.map((option: any, index: number) => (
                    <button
                      key={`hat-style-${index}`}
                      type="button"
                      className="AvatarEditor-popover-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.selectOption('hatStyle', option);
                      }}
                      onMouseDown={(e) => e.preventDefault()}>
                      {this.renderOption('hatStyle', option)}
                    </button>
                  ))}
                </div>
                <div className="divider w-full h-px my-3" />
                <div className="AvatarEditor-popover-grid">
                  {this.myDefaultOptions.hatColor?.map((option: any, index: number) => (
                    <button
                      key={`hat-color-${index}`}
                      type="button"
                      className="AvatarEditor-popover-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.selectOption('hatColor', option);
                      }}
                      onMouseDown={(e) => e.preventDefault()}>
                      {this.renderOption('hatColor', option)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="AvatarEditor-popover-grid">
                {this.myDefaultOptions[openPopover]?.map((option: any, index: number) => (
                  <button
                    key={index}
                    type="button"
                    className="AvatarEditor-popover-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.selectOption(openPopover, option);
                    }}
                    onMouseDown={(e) => e.preventDefault()}>
                    {this.renderOption(openPopover, option)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}
