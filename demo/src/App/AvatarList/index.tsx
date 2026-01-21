import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { nanoid } from 'nanoid'

import type { AvatarFullConfig } from 'react-nice-avatar/types'
import type { AvatarListItem } from './types'

import ReactNiceAvatar, { genConfig } from 'react-nice-avatar/index'

import "./index.scss"

// Approved background colors - must match exactly with AvatarEditor approved colors
const APPROVED_BG_COLORS = [
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
];

const pickRandomBgColor = (): string => {
  const randomIndex = Math.floor(Math.random() * APPROVED_BG_COLORS.length);
  return APPROVED_BG_COLORS[randomIndex];
};

export default class AvatarList extends Component {
  static propTypes = {
    selectConfig: PropTypes.func.isRequired
  }

  constructor (props: { selectConfig: (item: AvatarFullConfig) => void }) {
    super(props)
    this.displayCount = 10
    this.state = {
      current: 0,
      avatarConfigList: this.genConfigList(this.displayCount)
    }
    this.listId = 'avatarList'
    this.listWidth = 0
  }

  componentDidMount () {
    this.fetchListWidth()
  }

  genConfigList (count: number): AvatarListItem {
    return new Array(count)
      .fill(null)
      .map(() => {
        const config = genConfig();
        // Override bgColor to only use approved colors
        return {
          ...config,
          bgColor: pickRandomBgColor(),
          id: 'n_' + nanoid()
        };
      })
  }

  fetchListWidth (count = 0) {
    if (count > 20) return
    const listElem = document.getElementById(this.listId)
    if (!listElem) {
      return setTimeout(() => {
        this.fetchListWidth(count + 1)
      }, 500)
    }

    this.listWidth = listElem.offsetWidth
  }

  changeCurrent (deg: 1 | -1) {
    const { current, avatarConfigList } = this.state
    const newCurrent = Math.max(current + deg, 0)
    const newState = { current: newCurrent }
    if (newCurrent * this.displayCount > avatarConfigList.length - 1) {
      const newConfigList = this.genConfigList(this.displayCount)
      newState.avatarConfigList = avatarConfigList.concat(newConfigList)
    }
    this.setState(newState)
  }

  render () {
    const { selectConfig } = this.props
    const { current, avatarConfigList } = this.state
    const displayMax = (current + 2) * this.displayCount
    const displayMin = (current - 1) * this.displayCount
    return (
      <div className="flex items-center justify-center">
        {/* Arrow left */}
        {current !== 0 &&
          <i
            className="iconfont icon-arrow-right-filling-center transform rotate-180 mr-1 text-xl text-gray-500 transition hover:text-white cursor-pointer"
            onClick={this.changeCurrent.bind(this, -1)} />
        }

        {/* List */}
        <div
          id={this.listId}
          className="AvatarList overflow-x-hidden">
          <div
            className="listWrapper flex items-center py-3"
            style={{
              transform: `translateX(-${current * this.listWidth}px)`
            }}>
            {avatarConfigList.map((item, idx) => {
              return (
                <div
                  key={item.id}
                  className="AvatarItemWrapper"
                  onClick={selectConfig.bind(this, item)}>
                  {idx >= displayMin && idx < displayMax &&
                    <ReactNiceAvatar
                      className="AvatarItem"
                      {...item} />
                    }
                </div>
              )
            })}
          </div>
        </div>

      {/* Arrow right */}
        <i
          className="iconfont icon-arrow-right-filling-center ml-1 text-xl text-gray-500 transition hover:text-white cursor-pointer"
          onClick={this.changeCurrent.bind(this, 1)} />
      </div>

    )
  }
}
