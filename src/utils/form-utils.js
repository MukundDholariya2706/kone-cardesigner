export const titles = [
    {value: 'Mr.', text: 'title-mr'},
    {value: 'Ms.', text: 'title-ms'},
    {value: 'Mrs.', text: 'title-mrs'},
    {value: 'Mgr', text: 'title-mgr'},
    {value: 'Captain', text: 'title-captain'},
    {value: 'Dr.', text: 'title-dr'},
]

export const formHandler = (event, inputs, setInputs) => {
    let exists = ''
    let newVals = []
    inputs.forEach(item => {
        if(item.type === event.type) exists = item.type
    })

    inputs.forEach(item => {
        if(item.type !== exists) {
            newVals.push(item)}
    })

    if(event.value !== "" && event.value !== 'invalid') newVals.push(event)
    setInputs(newVals)
}

export const postContactForm = async ({ inputs, api, recaptchaToken, recaptchaNumber }) => {
    // Convert the inputs array to an object with the form of 
    // { firstName: "firstName", lastName: "lastName", ...}
    const inputsObject = inputs.reduce((prev, curr) => {
        const newObject = {...prev}
        newObject[curr.identifier] = curr.value
        return newObject
    }, {})
    
    inputsObject.recaptchaToken = recaptchaToken
    inputsObject.recaptchaNumber = recaptchaNumber

    const response = await api.post(`/contact`, inputsObject, { withKeyToken: true })

    return response
}