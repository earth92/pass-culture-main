import React from 'react'

import { GetOffererVenueResponseModel } from 'apiClient/v1'
import { useNewOfferCreationJourney } from 'hooks'

import Venue from './Venue'

interface IVenueListProps {
  physicalVenues: {
    id: string
    name: string
    publicName?: string
    hasMissingReimbursementPoint: boolean
    hasCreatedOffer: boolean
  }[]
  selectedOffererId: string
  virtualVenue: GetOffererVenueResponseModel | null
}

const VenueList = ({
  physicalVenues,
  selectedOffererId,
  virtualVenue,
}: IVenueListProps) => {
  const hasNewOfferCreationJourney = useNewOfferCreationJourney()
  return (
    <div className="h-venue-list">
      {virtualVenue && (
        <Venue
          id={virtualVenue.id}
          isVirtual
          name="Offres numériques"
          offererId={selectedOffererId}
          hasMissingReimbursementPoint={
            virtualVenue.hasMissingReimbursementPoint
          }
          initialOpenState={
            hasNewOfferCreationJourney ? !virtualVenue.hasCreatedOffer : false
          }
        />
      )}

      {physicalVenues?.map(venue => (
        <Venue
          id={venue.id}
          key={venue.id}
          name={venue.name}
          offererId={selectedOffererId}
          publicName={venue.publicName}
          hasMissingReimbursementPoint={venue.hasMissingReimbursementPoint}
          hasCreatedOffer={venue.hasCreatedOffer}
          initialOpenState={
            hasNewOfferCreationJourney ? !venue.hasCreatedOffer : false
          }
        />
      ))}
    </div>
  )
}

export default VenueList
