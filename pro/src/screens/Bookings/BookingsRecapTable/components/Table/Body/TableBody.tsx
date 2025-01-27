import React from 'react'
import type { TableInstance, TableBodyProps, Row } from 'react-table'

import {
  BookingRecapResponseModel,
  CollectiveBookingResponseModel,
} from 'apiClient/v1'
import { Audience } from 'core/shared'
import { Divider } from 'ui-kit'

import CollectiveTableRow from './TableRow/CollectiveTableRow'
import IndividualTableRow from './TableRow/IndividualTableRow'

interface ITableBodyProps<
  T extends BookingRecapResponseModel | CollectiveBookingResponseModel
> {
  page: TableInstance<T>['page']
  prepareRow: TableInstance<T>['prepareRow']
  tableBodyProps: TableBodyProps
  audience: Audience
  reloadBookings: () => void
}

const isCollectiveRow = (
  row: any,
  audience: Audience
): row is Row<CollectiveBookingResponseModel> =>
  audience === Audience.COLLECTIVE

const TableBody = <
  T extends BookingRecapResponseModel | CollectiveBookingResponseModel
>({
  page,
  prepareRow,
  tableBodyProps,
  audience,
  reloadBookings,
}: ITableBodyProps<T>) => {
  return (
    <tbody className="bookings-body" {...tableBodyProps}>
      {page.map((row, index) => {
        prepareRow(row)
        return isCollectiveRow(row, audience) ? (
          <CollectiveTableRow
            key={index}
            row={row}
            reloadBookings={reloadBookings}
          />
        ) : (
          <IndividualTableRow key={index} row={row} />
        )
      })}
      <Divider />
    </tbody>
  )
}

export default TableBody
