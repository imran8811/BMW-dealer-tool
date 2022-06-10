import Icon from '@components/Icon'
import React from 'react'
import styles from './SearchFilter.module.scss'

const SearchFilter: React.FC<{ onSearch: (e: string) => void; btnTestId?: string; inputTestId?: string }> = ({
  onSearch,
  inputTestId,
  btnTestId,
}) => {
  const [query, setQuery] = React.useState('')
  const [error, setError] = React.useState(false)
  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        onSearch(query)
        if (query.length > 0) {
          setError(false)

          return
        }
        setError(true)
      }}
      className={styles['search-control']}
    >
      <input
        data-testid={inputTestId}
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          if (e.target.value.length === 0) {
            onSearch('')
          }
        }}
        type="text"
        className={error || query.length > 0 ? styles.error : ''}
      />
      <button data-testid={btnTestId} type="submit">
        <Icon name="search" />
      </button>
    </form>
  )
}

export default SearchFilter
