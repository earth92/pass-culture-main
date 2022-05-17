import { updateOffersActiveStatusAdapter } from '../updateOffersActiveStatusAdapter'

describe('updateAllOffersActiveStatusAdapter', () => {
  it('should deactivate all offers and confirm', async () => {
    // given
    // @ts-ignore
    jest.spyOn(window, 'fetch').mockResolvedValueOnce({
      status: 204,
    })

    const response = await updateOffersActiveStatusAdapter({
      ids: ['A1', 'A2', 'A3'],
      isActive: false,
    })

    // then
    expect(response.isOk).toBeTruthy()
    expect(response.message).toBe('3 offres ont bien été désactivées')
  })

  it('should activate all offers and confirm', async () => {
    // given
    // @ts-ignore
    jest.spyOn(window, 'fetch').mockResolvedValueOnce({
      status: 204,
    })

    const response = await updateOffersActiveStatusAdapter({
      ids: ['A1', 'A2', 'A3'],
      isActive: true,
    })

    // then
    expect(response.isOk).toBeTruthy()
    expect(response.message).toBe('3 offres ont bien été activées')
  })

  it('should return an error when the update has failed', async () => {
    // given
    // @ts-ignore
    jest.spyOn(window, 'fetch').mockResolvedValueOnce({
      status: 422,
    })

    // when
    const response = await updateOffersActiveStatusAdapter({
      ids: ['A1', 'A2', 'A3'],
      isActive: false,
    })

    // then
    expect(response.isOk).toBeFalsy()
    expect(response.message).toBe(
      'Une erreur est survenue lors de la désactivation des offres sélectionnées'
    )
  })
})
