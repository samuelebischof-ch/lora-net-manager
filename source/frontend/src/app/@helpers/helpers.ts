/**
* @name delay
* @param ms: time in milliseconds
* @description returns a Promise of a timeout
*/
export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
