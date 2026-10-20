/**
 * Contract terms the owner can adjust. Example values for the demo:
 * review every one of them with a Virginia attorney before using the contract with real clients.
 */
export const TERMS = {
  /** days after completion to pay the balance */
  balanceDueDays: 10,
  /** monthly charge on balances more than 30 days late (%) */
  lateFeePct: 1.5,
  /** workmanship warranty (months) */
  workmanshipMonths: 12,
  /** one-time replacement of plants and sod that die (months), if watering instructions were followed */
  plantMonths: 12,
  /** returned check fee ($) */
  returnedCheckFee: 35,
  /** county whose courts handle disputes */
  venue: 'Fairfax County, Virginia',
  /**
   * Address where clients mail a cancellation notice. Required by the Virginia Home Solicitation Sales Act
   * for contracts signed at the client's home. Not published on the website.
   */
  noticeAddress: '',
}
