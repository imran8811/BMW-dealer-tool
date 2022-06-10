import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { IDealerSocialLinks } from '@common/endpoints/typings.gen'
import Button from '@components/Button/Button'
import Input from '@components/Input/Input'
import Form from '@components/Form'
import { selectErrorMessage, sendForm } from '@common/utilities/http-api'
import useMutation from 'use-mutation'
import { mutate as swrMutate } from 'swr'
import cls from 'classnames'
import styles from './socialmedia.module.scss'

type FormValues = {
  facebook: string
  instagram: string
  google: string
  linkedin: string
  twitter: string
  youtube: string
}

const messages = {
  title: 'Social Links',
  input: {
    facebook: 'facebook',
    instagram: 'instagram',
    google: 'google',
    linkedin: 'linkedin',
    twitter: 'twitter',
    youtube: 'youtube',
  },
  regex: {
    facebook: /^(https?:\/\/)?((www|web)\.)?facebook\.com\/\w+/,
    instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/\w+/,
    google: /^(https?:\/\/)?(www\.)?google\.com\/\w+/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/\w+/,
    twitter: /^(https?:\/\/)?(www\.)?twitter\.com\/\w+/,
    youtube: /^(https?:\/\/)?(www\.)?youtube\.com\/\w+/,
  },
  placeholder: {
    typeHere: 'Add URL...',
  },
  button: {
    save: 'Save',
    saving: 'Saving…',
  },
}

const getValidation = (name: keyof typeof messages.input) => ({
  required: {
    value: false,
    message: `${capFirstLetter(name)} is Required`,
  },
  validate: {
    matchesPattern: (value: string | undefined) => {
      const regexp = messages.regex[name]
      if (value && !regexp.exec(value)) {
        return `This is not a valid ${name} URL`
      }
      return true
    },
  },
})

const capFirstLetter = (str: keyof typeof messages.input) =>
  str
    .toLowerCase()
    .split(' ')
    .map(e => `${e.charAt(0).toUpperCase()}${e.slice(1)}`)
    .join(' ')

type ISocialMediaType = {
  initialValues?: IDealerSocialLinks
  dealerCode: string
}

const SocialMedia: FC<ISocialMediaType> = ({ initialValues, dealerCode }) => {
  const { register, errors, handleSubmit, formState, reset } = useForm<FormValues>({
    defaultValues: {
      facebook: initialValues?.facebook || '',
      instagram: initialValues?.instagram || '',
      google: initialValues?.google || '',
      linkedin: initialValues?.linkedin || '',
      twitter: initialValues?.twitter || '',
      youtube: initialValues?.youtube || '',
    },
  })

  const { isDirty } = formState
  const [saveSocialMediaConfig, { error, status }] = useMutation<FormValues, IDealerSocialLinks, Error>(
    (values): Promise<IDealerSocialLinks> => {
      const newValues = {
        ...values,
      }
      const url = `/dealer-management/menu-items/social-media/${dealerCode}`
      return sendForm<IDealerSocialLinks>(url, newValues, {
        withAuthentication: true,
        method: 'POST',
      })
    },
    {
      onSuccess(data): void {
        reset(data.data)
        void swrMutate(`/dealer-management/menu-items/social-media/${dealerCode}`, undefined, true)
      },
    },
  )

  return (
    <>
      <Form
        onSubmit={handleSubmit(async values => void (await saveSocialMediaConfig(values)))}
        error={error && selectErrorMessage(error)}
      >
        <div className="container bg-white rounded p-xl-5 p-lg-5 p-4 mt-2">
          <h2 className="section-subheading">{messages.title}</h2>
          <div className="row">
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Input
                name="facebook"
                ref={register(getValidation('facebook'))}
                error={errors?.facebook?.message as string}
                placeholder={messages.placeholder.typeHere}
                label={messages.input.facebook}
              />
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Input
                name="google"
                ref={register(getValidation('google'))}
                error={errors?.google?.message as string}
                placeholder={messages.placeholder.typeHere}
                label={messages.input.google}
              />
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Input
                name="instagram"
                ref={register(getValidation('instagram'))}
                error={errors?.instagram?.message as string}
                placeholder={messages.placeholder.typeHere}
                label={messages.input.instagram}
              />
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Input
                name="linkedin"
                ref={register(getValidation('linkedin'))}
                error={errors?.linkedin?.message as string}
                placeholder={messages.placeholder.typeHere}
                label={messages.input.linkedin}
              />
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Input
                name="twitter"
                ref={register(getValidation('twitter'))}
                error={errors?.twitter?.message as string}
                placeholder={messages.placeholder.typeHere}
                label={messages.input.twitter}
              />
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Input
                name="youtube"
                ref={register(getValidation('youtube'))}
                error={errors?.youtube?.message as string}
                placeholder={messages.placeholder.typeHere}
                label={messages.input.youtube}
              />
            </div>
          </div>

          <div className="pt-4 d-flex justify-content-center">
            <Button
              type="submit"
              loading={(!isDirty && messages.button.save) || (status === 'running' && messages.button.saving)}
            >
              {messages.button.save}
            </Button>
          </div>
        </div>
      </Form>
    </>
  )
}
export default SocialMedia
