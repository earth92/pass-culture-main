import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Route } from 'react-router-dom'

import { Events } from 'core/FirebaseEvents/constants'
import * as useAnalytics from 'hooks/useAnalytics'
import { renderWithProviders } from 'utils/renderWithProviders'

import ProfileAndSupport from '../ProfileAndSupport'

const mockLogEvent = jest.fn()

const renderProfileAndSupport = () => {
  const currentUser = {
    id: 'EY',
  }
  const storeOverrides = {
    user: {
      initialized: true,
      currentUser,
    },
  }

  return renderWithProviders(
    <>
      <Route path="/profil">
        <h1>Page profil</h1>
      </Route>
      <Route path="/accueil">
        <ProfileAndSupport />
      </Route>
    </>,
    { storeOverrides, initialRouterEntries: ['/accueil'] }
  )
}

describe('ProfileAndSupport', () => {
  describe('when the user click on Modifier', () => {
    it('should redirect to /profil page', async () => {
      // When
      jest.spyOn(useAnalytics, 'default').mockImplementation(() => ({
        logEvent: mockLogEvent,
        setLogEvent: null,
      }))
      renderProfileAndSupport()
      const editButton = screen.getByRole('link', { name: 'Modifier' })
      expect(editButton).toHaveAttribute('href', '/profil')
      await userEvent.click(editButton)

      // Then
      expect(mockLogEvent).toHaveBeenCalledTimes(1)
      expect(mockLogEvent).toHaveBeenCalledWith(Events.CLICKED_EDIT_PROFILE)
      expect(screen.getByText('Page profil')).toBeInTheDocument()
    })
  })
})
