import { Story, Meta } from '@storybook/react/types-6-0'
import DocumentsList, { DocumentsListProps } from './DocumentsList'

const Component: Meta = {
  title: 'Components/DocumentsList',
  component: DocumentsList,
  argTypes: {},
}

export default Component
const Template: Story<DocumentsListProps> = args => <DocumentsList {...args} />
export const dataAvailable = Template.bind({})

dataAvailable.args = {
  contracts: [
    {
      name: '1',
      displayName: 'Customer Acknowledgment',
      path: 'http://www.africau.edu/images/default/sample.pdf',
      isSignedByCustomer: true,
      isSignedByDealer: true,
    },
    {
      name: '2',
      displayName: "buyer's Guide",
      path: 'http://www.africau.edu/images/default/sample.pdf',
      isSignedByCustomer: false,
      isSignedByDealer: false,
    },
    {
      name: '3',
      displayName: 'MINI Agreement',
      path: 'http://www.africau.edu/images/default/sample.pdf',
      isSignedByCustomer: true,
      isSignedByDealer: true,
    },
    {
      name: '4',
      displayName: 'Vehicle Limited Warranty',
      path: 'http://www.africau.edu/images/default/sample.pdf',
      isSignedByCustomer: true,
      isSignedByDealer: true,
    },
    {
      name: '5',
      displayName: 'Vehicle Maintenance Plan',
      path: 'http://www.africau.edu/images/default/sample.pdf',
      isSignedByCustomer: true,
      isSignedByDealer: true,
    },
    {
      name: '6',
      displayName: 'Vehicle Roadside Assistance',
      path: 'http://www.africau.edu/images/default/sample.pdf',
      isSignedByCustomer: true,
      isSignedByDealer: true,
    },
  ],
}
