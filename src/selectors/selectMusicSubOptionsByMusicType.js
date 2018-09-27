import get from 'lodash.get'
import createCachedSelector from 're-reselect'

import { musicOptions } from '../utils/edd'

const mapArgsToKey = musicType => musicType || ' '

const selectMusicOptionsByMusicType = createCachedSelector(
  musicType => musicType,
  musicType => {
    if (!musicType) {
      return
    }
    const parentCode = Number(musicType)
    const option = musicOptions.find(option => option.code === parentCode)
    return get(option, 'children')
  }
)(mapArgsToKey)

export default selectMusicOptionsByMusicType
