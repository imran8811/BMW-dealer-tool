import Button from '@components/Button'
import React, { FC } from 'react'

const messages = {
  loadMore: 'Load more',
}

interface LoadMoreProps {
  onLoadMore: () => unknown
  className?: string
}

const LoadMore: FC<LoadMoreProps> = ({ onLoadMore, className }) => (
  <Button tertiary fullWidth className={className} onClick={onLoadMore}>
    {messages.loadMore}
  </Button>
)

export default LoadMore
