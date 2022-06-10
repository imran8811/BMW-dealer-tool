import { Story, Meta } from '@storybook/react/types-6-0'
import jsonData from '../../../../fixtures/jsonData.json'
import CarInfoHeader, { ICarInfoHeaderProps } from './CarInfoHeader'

const carInfo = jsonData.vehicle
const Component: Meta = {
  title: 'Components/CarInfoHeader',
  component: CarInfoHeader,
  argTypes: {
    hideBackButton: {
      type: 'boolean',
      defaultValue: false,
    },
  },
}
export default Component

const Template: Story<ICarInfoHeaderProps> = args => <CarInfoHeader {...args} />
export const dataAvailable = Template.bind({})
dataAvailable.args = {
  carInfo,
  hideBackButton: false,
}
