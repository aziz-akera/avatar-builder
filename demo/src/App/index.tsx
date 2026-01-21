import React, { Component } from "react";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";

import ReactNiceAvatar, { genConfig } from "react-nice-avatar/index";
import type { AvatarFullConfig } from "react-nice-avatar/types";

import AvatarEditor from './AvatarEditor/index'
import AvatarList from './AvatarList/index'
import { OnboardBackground } from './OnboardBackground/index'

require('./index.scss')

interface AppState {
  config: AvatarFullConfig;
}

class App extends Component<Record<string, never>, AppState> {
  avatarId: string;

  constructor(props) {
    super(props)
    this.state = {
      config: {
        ...genConfig("Aziz"),
        bgColor: '#5A3CF1'
      }
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

  onInputKeyUp (e) {
    this.setState({
      config: genConfig(e.target.value)
    })
  }

  render() {
    const { config } = this.state
    return (
      <OnboardBackground>
        <div className="App flex flex-col min-h-screen">
          <main className="flex-1 flex flex-col items-center justify-center">
            <div
              id={this.avatarId}
              className="mb-10">
              <ReactNiceAvatar
                className="w-64 h-64 highres:w-80 highres:h-80"
                hairColorRandom
                shape="circle"
                {...config} />
            </div>
            <AvatarEditor
              config={config}
              updateConfig={this.updateConfig.bind(this)}
              download={this.download.bind(this)} />
            <input
              className="inputField w-64 h-10 p-2 rounded-full mt-10 text-center"
              value="Aziz"
              disabled
              readOnly />
          </main>

          {/* Avatar list */}
          <AvatarList selectConfig={this.selectConfig.bind(this)} />
        </div>
      </OnboardBackground>
    );
  }
}

export default App;
