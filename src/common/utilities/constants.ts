/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */

export const websiteUrlRegex = /^((https?|ftp|smtp):\/\/)?(www.)?(([\dA-Za-z]([\dA-Za-z-]{0,61}[\dA-Za-z])?\.){1,61})([A-Za-z]{2,63})((?=\/)\/[A-Za-z0-9-#&?_.=]{0,61})*$/
export const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,35}$/
export const zipCodeRegex = /^\d{1,5}?(-\d{4})?$/
export const emailRegex = /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/
export const invalidEmailFormat = 'Please Enter Valid Email Address'
