function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomTupleSum(min: number, max: number): [number, number] {
  const sum = getRandomNumber(min, max)
  const diff = getRandomNumber(min, sum - min)
  return [diff, sum - diff]
}

export function generateRandomTuple(
  min: number,
  max: number
): [number, number] {
  return getRandomTupleSum(min, max)
}
