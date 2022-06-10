import { FC, ComponentProps, ReactNode } from 'react'
import Link from 'next/link'
import cls from 'classnames'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import styles from './Text.module.scss'

export type TextProps = ComponentProps<typeof ReactMarkdown> & {
  inline?: boolean
  centered?: boolean
}

const Text: FC<TextProps> = ({ renderers, inline, centered, ...props }) => (
  <ReactMarkdown
    plugins={[remarkBreaks]}
    className={cls(styles.text, inline && styles.inline, centered && styles.centered)}
    renderers={{
      link: ({ children, href }: { children: ReactNode; href: string }) => (
        <Link href={href}>
          <a>{children}</a>
        </Link>
      ),
      paragraph: ({ children }: { children: ReactNode }) => <>{inline ? <span>{children}</span> : <p>{children}</p>}</>,
      ...renderers,
    }}
    {...props}
  />
)

export default Text
