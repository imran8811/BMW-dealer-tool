import { HandOverMode } from '@common/endpoints/typings.gen'
import { Story, Meta } from '@storybook/react/types-6-0'
import VehicleAppointment, { IVehicleAppointment } from './VehicleAppointment'

const Component: Meta = {
  title: 'Components/VehicleAppointment',
  component: VehicleAppointment,
  argTypes: {},
}
export default Component

const Template: Story<IVehicleAppointment> = args => <VehicleAppointment {...args} />
export const dataAvailable = Template.bind({})
dataAvailable.args = {
  order: { _id: '2313123123', vehicleHandOverMode: HandOverMode.Delivery },
}
