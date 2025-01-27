import { screen } from '@testing-library/react'
import React from 'react'
import type { Row } from 'react-table'

import { api } from 'apiClient/api'
import {
  CancelablePromise,
  CollectiveBookingBankInformationStatus,
  CollectiveBookingByIdResponseModel,
  CollectiveBookingResponseModel,
  OfferAddressType,
  StudentLevels,
} from 'apiClient/v1'
import { renderWithProviders } from 'utils/renderWithProviders'

import CollectiveTableRow, { ITableBodyProps } from '../CollectiveTableRow'

jest.mock('apiClient/api')
jest.mock(
  'screens/Bookings/BookingsRecapTable/components/Table/Body/TableRow/TableRow',
  () => ({
    __esModule: true,
    default: jest.fn(() => <tr />),
  })
)

const renderCollectiveTableRow = (props: ITableBodyProps) =>
  renderWithProviders(
    <table>
      <tbody>
        <CollectiveTableRow {...props} />
      </tbody>
    </table>
  )

describe('CollectiveTableRow', () => {
  beforeAll(() => {
    jest.spyOn(api, 'getCollectiveBookingById').mockResolvedValue({
      id: 1,
      bankInformationStatus: CollectiveBookingBankInformationStatus.ACCEPTED,
      beginningDatetime: new Date('2022-01-23T10:30:00').toISOString(),
      venuePostalCode: '75017',
      offerVenue: {
        addressType: OfferAddressType.OFFERER_VENUE,
        otherAddress: '',
        venueId: 'V1',
      },
      venueId: 'A1',
      offererId: 'O1',
      numberOfTickets: 10,
      price: 0,
      students: [StudentLevels.COLL_GE_4E],
      educationalInstitution: {
        institutionType: 'LYCEE PROFESIONNEL',
        name: 'Métier Alexandre Bérard',
        postalCode: '01500',
        city: 'Ambérieu-en-Buguey',
        id: 1,
        phoneNumber: '0672930477',
        institutionId: 'ABCDEF11',
      },
      educationalRedactor: {
        firstName: 'Benoit',
        lastName: 'Demon',
        email: 'benoit.demon@lyc-alexandreberard.com',
        civility: 'M',
        id: 1,
      },
      isCancellable: true,
    })
  })

  it('should not render booking details if row is not expanded', async () => {
    const row = {
      original: {
        bookingIdentifier: 'A1',
        stock: {
          offerIdentifier: 'A1',
        },
        bookingStatus: 'booked',
      },
      isExpanded: false,
    } as Row<CollectiveBookingResponseModel>

    renderCollectiveTableRow({ row, reloadBookings: jest.fn() })

    expect(
      screen.queryByText('Métier Alexandre Bérard')
    ).not.toBeInTheDocument()
  })

  it('should render loader while fetching data', async () => {
    const row = {
      original: {
        bookingIdentifier: 'A1',
        stock: {
          offerIdentifier: 'A1',
        },
        bookingStatus: 'booked',
      },
      isExpanded: true,
    } as Row<CollectiveBookingResponseModel>

    jest
      .spyOn(api, 'getCollectiveBookingById')
      .mockResolvedValueOnce(
        new CancelablePromise(resolve =>
          setTimeout(
            () => resolve({} as CollectiveBookingByIdResponseModel),
            500
          )
        )
      )

    renderCollectiveTableRow({ row, reloadBookings: jest.fn() })

    expect(await screen.findByText('Chargement en cours')).toBeInTheDocument()
  })

  it('should display booking details if row is expanded', async () => {
    const row = {
      original: {
        bookingIdentifier: 'A1',
        stock: {
          offerIdentifier: 'A1',
        },
        bookingStatus: 'booked',
      },
      isExpanded: true,
    } as Row<CollectiveBookingResponseModel>

    renderCollectiveTableRow({ row, reloadBookings: jest.fn() })

    expect(await screen.findByText('10 élèves')).toBeInTheDocument()
    expect(await screen.findByText('0€')).toBeInTheDocument()
    expect(await screen.findByText('Collège - 4e')).toBeInTheDocument()
    expect(
      await screen.findByText('LYCEE PROFESIONNEL Métier Alexandre Bérard', {
        exact: false,
      })
    ).toBeInTheDocument()
  })
})
