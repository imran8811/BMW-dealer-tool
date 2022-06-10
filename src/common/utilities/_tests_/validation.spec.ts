import { validateEmail, capitalizeFirstLetter } from '../validation'

describe('Test validators', () => {
  test('Email validator', () => {
    const email = 'rabbiyaalamgir@gmail.com'
    const isEmailValid = validateEmail()(email)
    expect(isEmailValid).toEqual(true)
  })
  test('Capitilize first letter validator', () => {
    const word = 'hello'
    const capitilizedWord = capitalizeFirstLetter(word)
    expect(capitilizedWord).toEqual('Hello')
  })
})
