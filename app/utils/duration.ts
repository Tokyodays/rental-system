/** ミリ秒差を {days, hours} に分解（負値は絶対値で計算し sign で返す） */
export const diffToDaysHours = (diffMs: number) => {
  const sign = Math.sign(diffMs)
  const totalHours = Math.floor(Math.abs(diffMs) / 3_600_000)
  return { sign, days: Math.floor(totalHours / 24), hours: totalHours % 24 }
}
