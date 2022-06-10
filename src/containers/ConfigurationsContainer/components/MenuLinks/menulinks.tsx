import { FC, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { IMenuLinks, MenuPosition } from '@common/endpoints/typings.gen'
import Button from '@components/Button/Button'
import Input from '@components/Input/Input'
import Form from '@components/Form'
import { selectErrorMessage, sendForm } from '@common/utilities/http-api'
import useMutation from 'use-mutation'
import { mutate as swrMutate } from 'swr'
import cls from 'classnames'
import Select from '@components/Select'
import Icon from '@components/Icon'
import { deleteMenuLink } from '@common/endpoints/useMenuItems'
import { websiteUrlRegex } from '@common/utilities/constants'
import styles from './menulinks.module.scss'

type IMenuTypes = IMenuLinks & {
  _id?: string
  tempId?: string
}

const messages = {
  title: 'Custom Links',
  input: {
    name: 'Link name',
    position: 'Link Type',
    webUrl: 'Link URL',
  },
  placeholder: {
    typeHere: 'Type here...',
    typeUrlHere: 'Add URL here...',
  },
  button: {
    save: 'Save',
    saving: 'Saving…',
    addNew: 'Add new',
  },
}

const getValidation = (str: keyof typeof messages.input) => ({
  required: {
    value: true,
    message: `${capFirstLetter(messages.input[str])} is Required`,
  },
  validate: {
    matchesPattern: (value: string | undefined) => {
      if (value && str === 'webUrl' && !websiteUrlRegex.exec(value)) {
        return 'This is not a valid URL'
      }
      return true
    },
  },
})

const capFirstLetter = (str: string) =>
  str
    .toLowerCase()
    .split(' ')
    .map(e => (e === 'url' ? 'URL' : `${e.charAt(0).toUpperCase()}${e.slice(1)}`))
    .join(' ')

type IMenuLinksType = {
  initialValues?: IMenuLinks[]
  dealerCode: string
}

type FormReturnType = {
  [name: string]: IMenuTypes
}

const MenuLinks: FC<IMenuLinksType> = ({ initialValues, dealerCode }) => {
  const { errors, handleSubmit, formState, control } = useForm<FormReturnType>()
  const [menuItems, setMenuItems] = useState<IMenuTypes[]>([])

  useEffect(() => {
    if (initialValues) {
      setMenuItems(initialValues)
    }
  }, [initialValues])
  const { isDirty } = formState

  const makeReqObj = (arr: IMenuTypes[]): IMenuLinks[] =>
    arr.map((e, i) => ({
      name: e.name,
      position: e.position,
      webUrl: e.webUrl,
      order: i,
    }))
  const [saveMenuLinkConfig, { error, status }] = useMutation<FormReturnType, IMenuLinks[], Error>(
    (values): Promise<IMenuLinks[]> => {
      const data: IMenuTypes[] = Object.keys(values).map(e => values[e])
      const header = data.filter(f => f.position === MenuPosition.Header)
      const footer = data.filter(f => f.position === MenuPosition.Footer)
      const newValues = [...makeReqObj(header), ...makeReqObj(footer)]

      const url = `/dealer-management/menu-items/menu-links/${dealerCode}`
      return sendForm<IMenuLinks[]>(
        url,
        { menu: newValues },
        {
          withAuthentication: true,
          method: 'POST',
        },
      )
    },
    {
      onSuccess(): void {
        void swrMutate(`/dealer-management/menu-items/menu-by-dealerCode/${dealerCode}`, undefined, true)
      },
    },
  )

  const [deleteMenuLinkConfig, { error: deleteError, status: deleteStatus }] = useMutation<
    IMenuTypes,
    IMenuTypes,
    Error
  >((item): Promise<IMenuTypes> => deleteMenuLink(item._id || '', dealerCode), {
    onSuccess(): void {
      void swrMutate(`/dealer-management/menu-items/menu-by-dealerCode/${dealerCode}`, undefined, true)
    },
  })

  const onRemoveItem = (item: IMenuTypes) => {
    if (item._id) {
      void deleteMenuLinkConfig(item)
    } else {
      const items = menuItems.filter(f => f.tempId !== item.tempId)
      setMenuItems(items)
    }
  }

  const linkTypesOptions = useMemo(() => {
    const position = Object.keys(MenuPosition) as Array<keyof typeof MenuPosition>
    return position.map(e => ({
      label: MenuPosition[e] as string,
      value: MenuPosition[e] as string,
    }))
  }, [])

  return (
    <>
      <Form
        onSubmit={handleSubmit(async values => saveMenuLinkConfig(values))}
        error={(error && selectErrorMessage(error)) || (deleteError && selectErrorMessage(deleteError))}
      >
        <div className="container bg-white rounded p-xl-5 p-lg-5 p-4 mt-2">
          <h2 className="section-subheading">{messages.title}</h2>
          {menuItems &&
            menuItems.map(e => (
              <div className="row" key={e.tempId || e._id}>
                <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
                  <Controller
                    name={`${e._id || e.tempId || e.order}.position`}
                    control={control}
                    defaultValue={e.position}
                    rules={getValidation('position')}
                    render={({ value, name, onChange }) => (
                      <Select
                        name={name}
                        label={messages.input.position}
                        options={linkTypesOptions}
                        error={errors?.[`${e._id || e.tempId || e.order}`]?.position?.message}
                        value={value as string}
                        onChange={event => {
                          onChange(event.target.value)
                        }}
                      />
                    )}
                  />
                </div>
                <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
                  <Controller
                    name={`${e._id || e.tempId || e.order}.name`}
                    control={control}
                    defaultValue={e.name}
                    rules={getValidation('name')}
                    render={({ value, name, onChange }) => (
                      <Input
                        name={name}
                        maxLength={20}
                        value={value as string}
                        error={errors?.[`${e._id || e.tempId || e.order}`]?.name?.message as string}
                        placeholder={messages.placeholder.typeHere}
                        label={messages.input.name}
                        onChange={event => {
                          onChange(event.target.value)
                        }}
                      />
                    )}
                  />
                </div>
                <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
                  <Controller
                    name={`${e._id || e.tempId || e.order}.webUrl`}
                    control={control}
                    defaultValue={e.webUrl}
                    rules={getValidation('webUrl')}
                    render={({ value, name, onChange }) => (
                      <Input
                        name={name}
                        value={value as string}
                        error={errors?.[`${e._id || e.tempId || e.order}`]?.webUrl?.message as string}
                        placeholder={messages.placeholder.typeUrlHere}
                        label={messages.input.webUrl}
                        onChange={event => {
                          onChange(event.target.value)
                        }}
                      />
                    )}
                  />
                </div>
                <div className={cls('col pt-2', styles.BasketIcon)}>
                  <Icon
                    name="basket"
                    size={25}
                    onClick={() => deleteStatus !== 'running' && onRemoveItem(e)}
                    className={deleteStatus === 'running' ? styles.loading : ''}
                  />
                </div>
              </div>
            ))}
          <div className={cls([styles.wrap, 'pt-4 justify-content-center'])}>
            <div className="p-1">
              <Button
                type="button"
                disabled={status === 'running' || deleteStatus === 'running'}
                onClick={() => {
                  const items = [...menuItems]
                  items.push({
                    name: '',
                    position: MenuPosition.Header,
                    webUrl: '',
                    order: 0,
                    tempId: `${Math.random().toString(36).slice(7)}${Date.now()}`,
                  })
                  setMenuItems(items)
                }}
              >
                {messages.button.addNew}
              </Button>
            </div>
            <div className="p-1">
              <Button
                type="submit"
                disabled={deleteStatus === 'running'}
                loading={(!isDirty && messages.button.save) || (status === 'running' && messages.button.saving)}
              >
                {messages.button.save}
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </>
  )
}
export default MenuLinks
