import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'

import AppLayout from 'app/AppLayout'
import PageTitle from 'components/PageTitle/PageTitle'
import useActiveFeature from 'hooks/useActiveFeature'
import { campaignTracker } from 'tracking/mediaCampaignsTracking'
import Logo from 'ui-kit/Logo/Logo'

import styles from './Signup.module.scss'
import SignupConfirmation from './SignupConfirmation/SignupConfirmation'
import SignupContainer from './SignupContainer/SignupContainer'
import SignupUnavailable from './SignupUnavailable/SignupUnavailable'

const Signup = ({ location }) => {
  useEffect(() => {
    campaignTracker.signUp()
  }, [])
  const isProAccountCreationEnabled = useActiveFeature(
    'ENABLE_PRO_ACCOUNT_CREATION'
  )
  return (
    <AppLayout
      layoutConfig={{
        fullscreen: true,
        pageName: 'sign-up',
      }}
      className={styles['sign-up']}
    >
      <PageTitle title="S’inscrire" />
      <div className={styles['logo-side']}>
        <Logo noLink signPage />
      </div>
      {isProAccountCreationEnabled ? (
        <Switch location={location}>
          <Route component={SignupContainer} exact path="/inscription" />
          <Route
            component={SignupConfirmation}
            path="/inscription/confirmation"
          />
        </Switch>
      ) : (
        <SignupUnavailable />
      )}
    </AppLayout>
  )
}

Signup.propTypes = {
  location: PropTypes.shape().isRequired,
}

export default Signup
