export const SET_FINISH = 'SET_FINISH'
export const SET_MATERIAL = 'SET_MATERIAL'

/**
 * Reducer for floor finish mixer state management
 * @param {Object} state 
 * @param {Object} action {type, payload}
 */
export function reducer(state = {}, action = {}) {
  const { type, payload } = action

  switch (type) {
    case SET_FINISH:
      return {
        ...state,
        finishes: state.finishes.map((item, index) => {
          if (payload && index === payload.index) {
            return payload.finish
          }
          return item
        })
      }
      
    case SET_MATERIAL:
      return {
        ...state,        
        groupIndex: payload.groupIndex,
        material: payload.material,
        finishes: state.finishes.map((item, index) => {
          if (index === 2 && (payload.listFinishes || []).length === 0) {
            return null
          }
          return item
        }),
        baseFinishes: [...payload.baseFinishes],
        frameFinishes: [...payload.frameFinishes],
        listFinishes: [...payload.listFinishes],
      }
  
    default:
      break;
  }

  return state
}