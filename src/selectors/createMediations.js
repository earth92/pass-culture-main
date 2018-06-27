import get from 'lodash.get'
import { createSelector } from 'reselect'

export default () => createSelector(
  state => state.data.mediations,
  (state, event) => event,
  (state, event, thing) => thing,
  (mediations, event, thing) => {
    if (event)
      mediations = mediations.filter(m => m.eventId === event.id)

    if (thing)
      mediations = mediations.filter(m => m.thingId === thing.id)

    return mediations
  }
)
