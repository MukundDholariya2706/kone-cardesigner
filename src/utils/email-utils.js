export const sendEmail = async ({ fields, api}) => {
  
  if (!api) {
    const errorMsg = "No api specified" 
    console.log(errorMsg)
    throw Error(errorMsg)
  }

  const response = await api
    .post(`/mail`, fields, {
      withKeyToken: true
    })

  return response
}