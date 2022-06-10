import { Story, Meta } from '@storybook/react/types-6-0'

import OfferCard, { OfferCardProps } from './OfferCard'

const Component: Meta = {
  title: 'Components/OfferCard',
  component: OfferCard,
  argTypes: {
    inProgress: {
      type: 'string',
      description: 'Markdown',
    },
    pickup: {
      type: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      defaultValue: false,
    },
  },
}

export default Component

const Template: Story<OfferCardProps> = args => (
  <div style={{ maxWidth: '342px' }}>
    <OfferCard {...args} />
  </div>
)
const ScheduleTemplate: Story<OfferCardProps> = args => (
  <div style={{ maxWidth: '425px' }}>
    <OfferCard {...args} />
  </div>
)

export const offerCard = Template.bind({})

const basicProps = {
  imageUrl: 'https://picsum.photos/65/40',
  offerTitle: 'Offer Title',
  offerTime: '3:20 hrs',
  offerPrice: '13000',
  stockNumber: 12345324,
  vin: 12432532431123,
}

offerCard.args = {
  ...basicProps,
}

export const scheduleCard = ScheduleTemplate.bind({})

scheduleCard.args = {
  ...basicProps,
  pickup: true,
}

export const inProgress = Template.bind({})

inProgress.args = {
  ...basicProps,
  inProgress: 'Checkout in progress\nPlease resume',
}

export const fieldNameReference = Template.bind({})

fieldNameReference.args = {
  imageUrl: 'https://picsum.photos/65/40',
  offerTitle: 'offerTitle',
  offerTime: 'offerTime',
  offerPrice: 'offerPrice',
  stockNumber: 'stockNumber',
  vin: 'vin',
}
