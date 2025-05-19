/**
 * 
 * @param {Object} param
 * @param {Object} param.fn - Async function to attempt
 * @param {number} param.retries - How many times to try the function before throwing
 * @param {number=} param.delay - Time in milliseconds before trying again
 * @param {number[]=} param.delays - Definition of delays for different attempts, in order.
 * @param {any[]} param.params - Array of params to pass to the function
 * @param {number=} times - Used to stop the recursion loop 
 */
 export async function attemptAsync({ fn, retries, delay = 500, delays = [], params = [], lastError }, times = 0) {
   let delayToUse = delay

   if (delays?.length) {
     delayToUse = delays[0]
   }
   
  if (delayToUse < 0) {
    delayToUse = 0
  }

  if (times >= retries) {
    console.error(`Operation failed after ${retries} attempts`, lastError)
    throw lastError
  }
  let result
  try {
    result = await fn(...params)
  } catch (err) {
    console.error(`Operation failed "${err.message}". Retrying`)
    result = await new Promise((resolve, reject) => {
      setTimeout(() => {
        attemptAsync({ 
          fn, 
          retries, 
          delay, 
          delays: delays.slice(1), 
          params, 
          lastError: err 
        }, times + 1).then(resolve).catch(reject)
      }, delayToUse);
    })
  }
  return result
}