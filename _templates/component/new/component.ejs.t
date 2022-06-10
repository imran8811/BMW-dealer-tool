---
to: src/components/<%=name%>/<%=name%>.tsx
---
import { FC } from 'react'
import styles from './<%=name%>.module.scss'

export type <%=name%>Props = {

}

const <%=name%>: FC<<%=name%>Props> = () => (
	<div className={styles.element}>
    
  </div>
)

export default <%=name%>
