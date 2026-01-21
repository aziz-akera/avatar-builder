import React, { Component } from "react";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";

import ReactNiceAvatar, { genConfig } from "react-nice-avatar/index";
import type { AvatarFullConfig } from "react-nice-avatar/types";

import AvatarEditor from './AvatarEditor/index'
import { OnboardBackground } from './OnboardBackground/index'

require('./index.scss')

interface AppState {
  config: AvatarFullConfig;
  premadeAvatars: AvatarFullConfig[];
}

class App extends Component<Record<string, never>, AppState> {
  avatarId: string;

  constructor(props) {
    super(props)
    this.state = {
      config: {
        ...genConfig(),
        bgColor: '#5A3CF1'
      },
      premadeAvatars: []
    }
    this.avatarId = 'myAvatar'
  }

  selectConfig(config) {
    this.setState({ config })
  }

  updateConfig (key, value) {
    const { config } = this.state
    config[key] = value
    this.setState({ config })
  }

  randomizeConfig () {
    const { config } = this.state
    const next = genConfig()
    // Preserve current background selection while randomizing traits
    this.setState({ config: { ...next, bgColor: config.bgColor } })
  }

  componentDidMount() {
    // Initialize premade avatars once so they stay stable when selecting
    const bgColors = this.getApprovedBgColors()
    const premadeAvatars: AvatarFullConfig[] = []

    // Generate 8 avatars (2 rows of 4)
    for (let i = 0; i < 8; i++) {
      const config = genConfig()
      config.bgColor = bgColors[i % bgColors.length]
      premadeAvatars.push(config)
    }

    this.setState({ premadeAvatars })
  }

  // Approved background colors - must match exactly with AvatarEditor approved colors
  getApprovedBgColors() {
    return [
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

  pickRandomBgColor(): string {
    const colors = this.getApprovedBgColors()
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
  }

  renderPremadeAvatars() {
    const { premadeAvatars } = this.state
    const bgColors = this.getApprovedBgColors()
    
    return premadeAvatars.map((avatarConfig, index) => (
      <div
        key={index}
        className="premade-avatar-item"
        onClick={() => this.selectConfig(avatarConfig)}>
        <ReactNiceAvatar
          className="premade-avatar"
          shape="circle"
          style={{ 
            width: '4.5rem', 
            height: '4.5rem', 
            flexShrink: 0
          }}
          {...avatarConfig} />
      </div>
    ))
  }

  async download() {
    const scale = 2;
    const node = document.getElementById(this.avatarId);
    if (node) {
      const blob = await domtoimage.toBlob(node, {
        height: node.offsetHeight * scale,
        style: {
          transform: `scale(${scale}) translate(${node.offsetWidth / 2 / scale}px, ${node.offsetHeight / 2 / scale}px)`,
          "border-radius": 0
        },
        width: node.offsetWidth * scale
      });

      saveAs(blob, "avatar.png");
    }
  }

  render() {
    const { config } = this.state
    return (
      <OnboardBackground>
        <div className="App flex flex-col min-h-screen">
          <main className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="glass-morphism-card">
              <h1 className="avatar-title">Build Your Avatar</h1>
              <p className="avatar-description">
                Customize every detail to create a unique avatar that represents you
              </p>
              <div
                id={this.avatarId}
                className="mb-4">
                <ReactNiceAvatar
                  className="w-40 h-40"
                  hairColorRandom
                  shape="circle"
                  {...config} />
              </div>
              <AvatarEditor
                config={config}
                updateConfig={this.updateConfig.bind(this)} />
              
              {/* Premade avatars */}
              <p className="premade-avatars-label mt-6 mb-2">Or choose from these...</p>
              <div className="premade-avatars-grid mb-2">
                {this.renderPremadeAvatars()}
              </div>

              {/* Action buttons */}
              <div className="w-full flex justify-center items-center gap-4 mt-4 mb-0">
                <button
                  type="button"
                  className="randomize-btn"
                  data-tip="Randomize"
                  aria-label="Randomize avatar"
                  onClick={this.randomizeConfig.bind(this)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dices-icon lucide-dices"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
                </button>
                <button
                  type="button"
                  className="action-icon cursor-pointer"
                  data-tip="Download"
                  onClick={this.download.bind(this)} >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
                  </button>
                <button
                  type="button"
                  className="continue-btn">
                  Continue
                </button>
              </div>
            </div>
          </main>
        </div>
      </OnboardBackground>
    );
  }
}

export default App;
