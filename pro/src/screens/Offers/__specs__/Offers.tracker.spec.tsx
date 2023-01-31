import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { UserRole } from 'apiClient/v1'
import { Events } from 'core/FirebaseEvents/constants'
import { DEFAULT_SEARCH_FILTERS } from 'core/Offers/constants'
import { Audience } from 'core/shared'
import * as useAnalytics from 'hooks/useAnalytics'
import { offererFactory } from 'utils/apiFactories'
import { renderWithProviders } from 'utils/renderWithProviders'

import Offers, { IOffersProps } from '../Offers'

const mockLogEvent = jest.fn()

const renderOffers = (props: IOffersProps) =>
  renderWithProviders(<Offers {...props} />)

describe('tracker screen Offers', () => {
  it('should track when clciking on offer link', async () => {
    // Given
    const props = {
      currentPageNumber: 1,
      isLoading: false,
      currentUser: {
        isAdmin: false,
        roles: [UserRole.PRO],
      },
      loadAndUpdateOffers: jest.fn(),
      offerer: offererFactory(),
      offers: [],
      setIsLoading: jest.fn(),
      setOfferer: jest.fn(),
      urlSearchFilters: DEFAULT_SEARCH_FILTERS,
      separateIndividualAndCollectiveOffers: false,
      initialSearchFilters: DEFAULT_SEARCH_FILTERS,
      audience: Audience.INDIVIDUAL,
      redirectWithUrlFilters: jest.fn(),
      venues: [],
      categories: [],
    }
    jest.spyOn(useAnalytics, 'default').mockImplementation(() => ({
      logEvent: mockLogEvent,
      setLogEvent: null,
    }))

    // When
    renderOffers(props)

    // Then
    const createLink = screen.getByText('Créer une offre')
    await userEvent.click(createLink)
    expect(mockLogEvent).toHaveBeenCalledTimes(1)
    expect(mockLogEvent).toHaveBeenNthCalledWith(
      1,
      Events.CLICKED_OFFER_FORM_NAVIGATION,
      {
        from: 'Offers',
        isEdition: false,
        to: 'OfferFormHomepage',
        used: 'OffersButton',
      }
    )
  })
})
