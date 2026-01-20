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

export default class AvatarEditor extends Component<AvatarEditorProps> {
  static propTypes = {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
    download: PropTypes.func.isRequired
  }

  myDefaultOptions: any;

  constructor (props: AvatarEditorProps) {
    super(props)
    this.myDefaultOptions = this.genDefaultOptions(defaultOptions)
  }

  // Modification on defaultOptions for convenient
  genDefaultOptions (opts: any): any {
    const hairSet = new Set(opts.hairStyleMan.concat(opts.hairStyleWoman))
    return {
      ...opts,
      hairStyle: Array.from(hairSet)
    }
  }

  switchConfig (type: string, currentOpt: any): void {
    const { updateConfig } = this.props
    const opts = this.myDefaultOptions[type]
    const currentIdx = opts.findIndex((item: any) => item === currentOpt)
    const newIdx = (currentIdx + 1) % opts.length
    updateConfig(type, opts[newIdx])
  }

  render () {
    const { config, download } = this.props
    return (
      <div className="AvatarEditor rounded-full px-3 py-2 flex items-center">
        {/* Face */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Face"
          switchConfig={this.switchConfig.bind(this, 'faceColor', config.faceColor)}>
          {/* @ts-expect-error - Face component returns SVGElement but works as JSX */}
          <Face color={config.faceColor} />
        </SectionWrapper>
        {/* Hair style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Hair"
          switchConfig={this.switchConfig.bind(this, 'hairStyle', config.hairStyle)}>
          {/* @ts-expect-error - Hair component returns SVGElement but works as JSX */}
          <Hair style={config.hairStyle} color="#fff" colorRandom />
        </SectionWrapper>
        {/* Hat style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Hat"
          switchConfig={this.switchConfig.bind(this, 'hatStyle', config.hatStyle)}>
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
          switchConfig={this.switchConfig.bind(this, 'eyeStyle', config.eyeStyle)}>
          {/* @ts-expect-error - Eyes component returns SVGElement but works as JSX */}
          <Eyes style={config.eyeStyle} color="#fff" />
        </SectionWrapper>
        {/* Glasses style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Glasses"
          switchConfig={this.switchConfig.bind(this, 'glassesStyle', config.glassesStyle)}>
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
          switchConfig={this.switchConfig.bind(this, 'earSize', config.earSize)}>
          {/* @ts-expect-error - Ear component returns SVGElement but works as JSX */}
          <Ear size={config.earSize} color="#fff" />
        </SectionWrapper>
        {/* Nose style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Nose"
          switchConfig={this.switchConfig.bind(this, 'noseStyle', config.noseStyle)}>
          {/* @ts-expect-error - Nose component returns SVGElement but works as JSX */}
          <Nose style={config.noseStyle} color="#fff" />
        </SectionWrapper>
        {/* Mouth style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Mouth"
          switchConfig={this.switchConfig.bind(this, 'mouthStyle', config.mouthStyle)}>
          {/* @ts-expect-error - Mouth component returns SVGElement but works as JSX */}
          <Mouth style={config.mouthStyle} color="#fff" />
        </SectionWrapper>
        {/* Shirt style */}
        <SectionWrapper
          className="p-2.5 mx-2"
          tip="Shirt"
          switchConfig={this.switchConfig.bind(this, 'shirtStyle', config.shirtStyle)}>
          {/* @ts-expect-error - Shirt component returns SVGElement but works as JSX */}
          <Shirt style={config.shirtStyle} color="#fff" />
        </SectionWrapper>

        <div className="divider w-0.5 h-6 rounded mx-2" />
        <i
          className="iconfont icon-download text-xl mx-2 cursor-pointer"
          data-tip="Download"
          onClick={download} />
      </div>
    )
  }
}
