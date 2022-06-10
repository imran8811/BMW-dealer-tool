import { Story, Meta } from '@storybook/react/types-6-0'

import { Column } from 'primereact/column'
import Cell, { ImageCell, ListCell, StatusCell } from './components/Cell/Cell'
import Table, { TableProps } from './Table'

const Component: Meta = {
  title: 'Components/Table',
  component: Table,
}

export default Component

interface MockDataType {
  id?: string | number
  imageUrl?: string
  imageAlt?: string
  content?: string | number
  data?: Array<string | number>
  status?: string
  message?: string
}

const mockData: MockDataType[] = [
  {
    id: 2734,
    imageUrl: '//source.unsplash.com/uBCc2WvFEWM',
    imageAlt: 'This is a random picture',
    data: ['2020 Cooper Hardtop 4 Door', '1FMCU9J97EUC58367', 283459353],
    content: 'John Anderson',
    status: 'scheduled',
    message: 'On time',
  },
  {
    id: 2735,
    imageUrl: '//source.unsplash.com/gaP0lpKZJ54',
    imageAlt: 'This is a random picture',
    data: ['2020 Cooper Hardtop 4 Door', '1FMCU9J97EUC58367', 283459353],
    content: 'Cooper Anderson',
    status: 'missed',
    message: 'Missed',
  },
  {
    id: 2736,
    imageUrl: '//source.unsplash.com/befACr7J9ls',
    imageAlt: 'This is a random picture',
    data: ['2020 Cooper Hardtop 4 Door', '1FMCU9J97EUC58367', 283459353],
    content: 'Cohn Jooper',
    status: 'unscheduled',
    message: 'Not set',
  },
]

const Template: Story<TableProps> = args => {
  return (
    <Table value={mockData} selection={mockData.slice(1, 2)} {...args} onSelectionChange={() => {}}>
      <Column selectionMode="multiple" />
      <Column sortable field="id" header="ID" filter body={(data: MockDataType) => <Cell>{data.id}</Cell>} />
      <Column
        field="image"
        header="Image"
        body={(data: MockDataType) => (
          <ImageCell imageUrl={data.imageUrl} imageAlt={data.imageAlt} style={{ maxWidth: '120px' }} />
        )}
      />
      <Column
        sortable
        field="image"
        header="Data"
        filter
        body={(data: MockDataType) => <ListCell data={data.data} />}
      />
      <Column
        sortable
        field="status"
        header="Status"
        body={(data: MockDataType) => <StatusCell status={data.status} message={data.message} />}
      />
    </Table>
  )
}

export const example = Template.bind({})

example.args = {
  rowHover: true,
}
