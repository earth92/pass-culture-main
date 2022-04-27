import isEqual from 'lodash.isequal'

import {
  EditEducationalOfferPayload,
  IOfferEducationalFormValues,
  parseDuration,
  serializeParticipants,
} from 'core/OfferEducational'

const serializer = {
  title: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => ({ ...payload, name: offer.title }),
  description: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => ({ ...payload, description: offer.description }),
  duration: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => ({ ...payload, durationMinutes: parseDuration(offer.duration) }),
  subCategory: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => ({ ...payload, subcategoryId: offer.subCategory }),
  eventAddress: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => ({
    ...payload,
    extraData: { ...payload.extraData, offerVenue: offer.eventAddress },
  }),
  participants: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => ({
    ...payload,
    extraData: {
      ...payload.extraData,
      students: serializeParticipants(offer.participants),
    },
  }),
  accessibility: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => ({
    ...payload,
    mentalDisabilityCompliant: offer.accessibility.mental,
    motorDisabilityCompliant: offer.accessibility.motor,
    audioDisabilityCompliant: offer.accessibility.audio,
    visualDisabilityCompliant: offer.accessibility.visual,
  }),
  phone: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => ({
    ...payload,
    extraData: {
      ...payload.extraData,
      contactPhone: offer.phone,
    },
  }),
  email: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => ({
    ...payload,
    extraData: {
      ...payload.extraData,
      contactEmail: offer.email,
    },
  }),
  notificationEmail: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => {
    if (offer.notifications) {
      return {
        ...payload,
        bookingEmail: offer.notificationEmail,
      }
    }
    return payload
  },
  notifications: (
    payload: EditEducationalOfferPayload,
    offer: IOfferEducationalFormValues
  ) => {
    if (offer.notifications) {
      return {
        ...payload,
        bookingEmail: offer.notificationEmail,
      }
    }
    return {
      ...payload,
      bookingEmail: '',
    }
  },
  // Unchanged keys
  // Need to put them here for ts not to raise an error
  offererId: (payload: DeepPartialEducationalOfferModelPayload) => payload,
  venueId: (payload: DeepPartialEducationalOfferModelPayload) => payload,
  category: (payload: DeepPartialEducationalOfferModelPayload) => payload,
}

export const createPatchOfferPayload = (
  offer: IOfferEducationalFormValues,
  initialValues: IOfferEducationalFormValues
): EditEducationalOfferPayload => {
  let changedValues: EditEducationalOfferPayload = {}

  const offerKeys = Object.keys(offer) as (keyof IOfferEducationalFormValues)[]

  offerKeys.forEach(key => {
    if (!isEqual(offer[key], initialValues[key])) {
      changedValues = serializer[key](changedValues, offer)
    }
  })

  return changedValues
}
