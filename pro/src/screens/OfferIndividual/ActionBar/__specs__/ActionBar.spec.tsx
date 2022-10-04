import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { OFFER_WIZARD_STEP_IDS } from 'new_components/OfferIndividualStepper'
import { configureTestStore } from 'store/testUtils'

import { ActionBar } from '..'
import { IActionBarProps } from '../ActionBar'

const renderActionBar = (props: IActionBarProps) => {
  return render(
    <Provider
      store={configureTestStore({
        offers: { searchFilters: ['filter', 'other_filter'], pageNumber: 3 },
      })}
    >
      <MemoryRouter>
        <ActionBar {...props} />
      </MemoryRouter>
    </Provider>
  )
}

describe('OfferIndividual::ActionBar', () => {
  let props: IActionBarProps
  const onClickPreviousMock = jest.fn()
  const onClickNextMock = jest.fn()
  const onClickSaveDraftMock = jest.fn()

  beforeEach(() => {
    props = {
      onClickPrevious: onClickPreviousMock,
      onClickNext: onClickNextMock,
      onClickSaveDraft: onClickSaveDraftMock,
      isCreation: true,
      step: OFFER_WIZARD_STEP_IDS.INFORMATIONS,
    }
  })

  describe('on creation', () => {
    beforeEach(() => {
      props.isCreation = true
    })

    it('should render the component for information page', async () => {
      props.step = OFFER_WIZARD_STEP_IDS.INFORMATIONS

      renderActionBar(props)

      const buttonCancel = screen.getByText('Annuler et quitter')
      expect(buttonCancel).toHaveAttribute('href', '/offres')
      const buttonSaveDraft = screen.getByText('Sauvegarder le brouillon')
      await userEvent.click(buttonSaveDraft)
      expect(onClickSaveDraftMock).toHaveBeenCalled()
      const buttonNextStep = screen.getByText('Étape suivante')
      await userEvent.click(buttonNextStep)
      expect(onClickNextMock).toHaveBeenCalled()
    })

    it('should render the component for stock page', async () => {
      props.step = OFFER_WIZARD_STEP_IDS.STOCKS

      renderActionBar(props)

      const buttonPreviousStep = screen.getByText('Étape précédente')
      await userEvent.click(buttonPreviousStep)
      expect(onClickPreviousMock).toHaveBeenCalled()
      const buttonSaveDraft = screen.getByText('Sauvegarder le brouillon')
      await userEvent.click(buttonSaveDraft)
      expect(onClickSaveDraftMock).toHaveBeenCalled()
      const buttonNextStep = screen.getByText('Étape suivante')
      await userEvent.click(buttonNextStep)
      expect(onClickNextMock).toHaveBeenCalled()
    })

    it('should render the component for summary page', async () => {
      props.step = OFFER_WIZARD_STEP_IDS.SUMMARY

      renderActionBar(props)

      const buttonPreviousStep = screen.getByText('Étape précédente')
      await userEvent.click(buttonPreviousStep)
      expect(onClickPreviousMock).toHaveBeenCalled()
      const buttonSaveDraft = screen.getByText(
        'Sauvegarder le brouillon et quitter'
      )
      expect(buttonSaveDraft).toHaveAttribute('href', '/offres')
      const buttonPublishOffer = screen.getByText("Publier l'offre")
      await userEvent.click(buttonPublishOffer)
      expect(onClickNextMock).toHaveBeenCalled()
    })
  })

  describe('on edition', () => {
    beforeEach(() => {
      props.isCreation = false
    })

    it('should render the component for information page', async () => {
      props.step = OFFER_WIZARD_STEP_IDS.INFORMATIONS

      renderActionBar(props)

      const buttonCancel = screen.getByText('Annuler et quitter')
      expect(buttonCancel).toHaveAttribute(
        'href',
        '/offres?0=filter&1=other_filter&page=3'
      )
      const buttonSave = screen.getByText('Enregistrer les modifications')
      await userEvent.click(buttonSave)
      expect(onClickNextMock).toHaveBeenCalled()
    })

    it('should render the component for stock page', async () => {
      props.step = OFFER_WIZARD_STEP_IDS.STOCKS

      renderActionBar(props)

      const buttonCancel = screen.getByText('Annuler et quitter')
      expect(buttonCancel).toHaveAttribute(
        'href',
        '/offres?0=filter&1=other_filter&page=3'
      )
      const buttonSave = screen.getByText('Enregistrer les modifications')
      await userEvent.click(buttonSave)
      expect(onClickNextMock).toHaveBeenCalled()
    })

    it('should render the component for summary page', async () => {
      props.step = OFFER_WIZARD_STEP_IDS.SUMMARY

      renderActionBar(props)

      const buttonBack = screen.getByText('Retour à la liste des offres')
      expect(buttonBack).toHaveAttribute(
        'href',
        '/offres?0=filter&1=other_filter&page=3'
      )
    })
  })
})