/**
 * Has arrays any common elements
 * @param {Array} array1 
 * @param {Array} array2 
 */
export function hasCommonElement(array1, array2) { 
  if (!array1 || !array2) {
    return false
  }
  
  // Loop for array1 
  for(let i = 0; i < array1.length; i++) { 
        
      // Loop for array2 
      for(let j = 0; j < array2.length; j++) { 
            
          // Compare the element of each and 
          // every element from both of the 
          // arrays 
          if(array1[i] === array2[j]) { 
            
              // Return if common element found 
              return true; 
          } 
      } 
  } 
    
  // Return if no common element exist 
  return false;  
}