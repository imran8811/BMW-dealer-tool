import { Story, Meta } from '@storybook/react/types-6-0'
import Carousel, { CarouselProps } from './Carousel'

const Component: Meta = {
  title: 'Components/Carousel',
  component: Carousel,
  argTypes: {
    fullWidth: { type: 'boolean', description: 'Push navigation outside component' },
    navigation: { type: 'boolean' },
    pagination: { type: 'boolean' },
    slidesPerView: { type: 'number', defaultValue: 1 },
    marginCompenstaion: { description: 'Add negative margin to the sides (if you have padding in slides)' },
  },
}

const Template: Story<CarouselProps> = args => <Carousel {...args} />

export const example = Template.bind({})

example.args = {
  children: [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore ' +
      'magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo' +
      ' consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla ' +
      'pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id ' +
      'est laborum.',
    2,
    3,
    4,
    5,
  ],
  fullWidth: false,
  pagination: true,
  navigation: true,
}

example.parameters = {
  docs: {
    storyDescription: 'Swiper slider. See documentation at [swiperjs.com/api](https://swiperjs.com/api/)',
  },
}

export default Component
