import { Lookups } from '@common/endpoints/typings.gen'
import { AccessoryType } from '@common/endpoints/useAccessories'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent, screen } from '@testing-library/react'
import { ModalProvider } from 'react-modal-hook'
import MasterAccessoryForm, { messages } from '../../components/MasterAccessoryForm'
import MOCKED_DATA from '../fixtures.json'

jest.mock('@common/endpoints/useMasterAccessories', () => ({
  __esModule: true,
  useMasterAccessories: () => ({ pageData: MOCKED_DATA.accessories.pageData }),
  useAccessories: () => ({ pageData: MOCKED_DATA.accessories.pageData }),
  useBulkAssociateAddons: () => ({
    mutate: () => {},
    status: 'idle',
    error: {},
  }),
  useMasterAccessoryMutation: () => ({
    mutate: () => {},
    status: 'idle',
    error: {},
  }),
  useDeleteMasterAccessory: () => ({
    mutate: () => {},
    status: 'idle',
    error: {},
  }),
}))

const getOptions = (lookups: Lookups[]) => {
  const options = [...new Set(lookups.map((value: Lookups) => value))]
  return options.map(value => ({ label: value.displayName, value: value.code }))
}

describe('Testing Master Accessories Form', () => {
  const { referenceData } = MOCKED_DATA
  const handleFormClose = jest.fn()
  const categoryOptions = getOptions((referenceData?.[0].lookups as unknown) as Lookups[])
  const modalOptions = getOptions((referenceData?.[1].lookups as unknown) as Lookups[])
  const InstallationOptions = getOptions((referenceData?.[2].lookups as unknown) as Lookups[])
  test('Verify Accessory form create', async () => {
    render(
      <ModalProvider>
        <MasterAccessoryForm
          categoryOptions={categoryOptions}
          modalOptions={modalOptions}
          InstallationOptions={InstallationOptions}
          handleFormClose={handleFormClose}
          addonData={null}
        />
      </ModalProvider>,
    )
    expect(screen.getByText(messages.input.name)).toBeInTheDocument()
    expect(screen.getByText(messages.input.description)).toBeInTheDocument()
    expect(screen.getByText(messages.input.partNo)).toBeInTheDocument()
    expect(screen.getByText(messages.input.price)).toBeInTheDocument()
    expect(screen.getByText(messages.input.supplier)).toBeInTheDocument()
    const cancelBtn = await screen.findByTestId('cancelBtn')
    fireEvent.click(cancelBtn)
    expect(handleFormClose).toBeCalledTimes(1)
  })

  test('Verify Accessory form update', async () => {
    const addonData = (MOCKED_DATA.accessories.pageData[0] as unknown) as AccessoryType
    render(
      <ModalProvider>
        <MasterAccessoryForm
          categoryOptions={categoryOptions}
          modalOptions={modalOptions}
          InstallationOptions={InstallationOptions}
          handleFormClose={handleFormClose}
          addonData={addonData}
        />
      </ModalProvider>,
    )
    const nameInput = await screen.findByTestId('name')
    expect(nameInput).toHaveValue(addonData.name)
    const descriptionInput = await screen.findByTestId('description')
    expect(descriptionInput).toHaveValue(addonData.description)
    const partNoInput = await screen.findByTestId('partNo')
    expect(partNoInput).toHaveValue(addonData.partNo)
    const categoryInput = await screen.findByTestId('category')
    expect(categoryInput).toHaveValue(addonData.category.code)
    const cancelBtn = await screen.findByTestId('cancelBtn')
    fireEvent.click(cancelBtn)
    expect(handleFormClose).toBeCalled()
  })
})
