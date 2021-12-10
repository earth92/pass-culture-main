/*
 * @debt directory "Gaël: this file should be migrated within the new directory structure"
 */

import PropTypes from 'prop-types'
import React from 'react'

import useFeatureFlagedOfferEditionURL from 'components/hooks/useFeatureFlaggedOfferEditionURL'
import Breadcrumb, {
  STYLE_TYPE_TAB,
  STYLE_TYPE_DEFAULT,
} from 'new_components/Breadcrumb/Breadcrumb'

export const STEP_ID_DETAILS = 'details'
export const STEP_ID_STOCKS = 'stocks'
export const STEP_ID_CONFIRMATION = 'confirmation'

const OfferBreadcrumb = ({
  activeStep,
  isCreatingOffer,
  offerId,
  isOfferEducational,
}) => {
  const editionUrl = useFeatureFlagedOfferEditionURL(
    isOfferEducational,
    offerId
  )
  let steps = []

  if (!isCreatingOffer) {
    steps = [
      {
        id: STEP_ID_DETAILS,
        label: "Détails de l'offre",
        url: editionUrl,
      },
      {
        id: STEP_ID_STOCKS,
        label: 'Stock et prix',
        url: `/offres/${offerId}/stocks`,
      },
    ]
  } else {
    steps = [
      {
        id: STEP_ID_DETAILS,
        label: "Détails de l'offre",
      },
      {
        id: STEP_ID_STOCKS,
        label: 'Stock et prix',
      },
      {
        id: STEP_ID_CONFIRMATION,
        label: 'Confirmation',
      },
    ]
  }

  return (
    <Breadcrumb
      activeStep={activeStep}
      steps={steps}
      styleType={isCreatingOffer ? STYLE_TYPE_DEFAULT : STYLE_TYPE_TAB}
    />
  )
}

OfferBreadcrumb.defaultProps = {
  isOfferEducational: false,
  offerId: null,
}

OfferBreadcrumb.propTypes = {
  activeStep: PropTypes.string.isRequired,
  isCreatingOffer: PropTypes.bool.isRequired,
  isOfferEducational: PropTypes.bool,
  offerId: PropTypes.string,
}

export default OfferBreadcrumb
