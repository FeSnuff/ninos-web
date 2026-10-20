import type { ReactNode } from 'react'
import { business } from '../../site.config'
import { lineTotal, subtotal, type Client, type Line } from '../data'
import { LOGO } from '../env'
import { fmtFull, money } from '../ui'

/** Paper-like document (quote, contract, invoice) as the client would see it */
export function Doc({ kind, number, date, client, children }: { kind: string; number: string; date: string; client?: Client; children: ReactNode }) {
  const lic = business.license
  return (
    <article className="doc">
      <p className="doc__demo">Documento de demostración · datos inventados · sin validez</p>
      <header className="doc__head">
        <div className="doc__brand">
          <img src={LOGO} alt="" width={48} height={48} />
          <div>
            <b>{business.name}</b>
            <small>{business.phoneDisplay}{business.email ? ` · ${business.email}` : ''} · Northern Virginia</small>
            {lic.dporNumber ? <small>Licencia DPOR {lic.dporClass} N.º {lic.dporNumber}{lic.specialties.length ? ` · ${lic.specialties.join(', ')}` : ''}</small> : null}
          </div>
        </div>
        <div className="doc__meta">
          <p className="doc__kind">{kind}</p>
          <p><b>{number}</b></p>
          <p>{fmtFull(date)}</p>
        </div>
      </header>
      {client ? (
        <div className="doc__client">
          <small>Para</small>
          <b>{client.name}</b>
          {client.contact ? <span>{client.contact}</span> : null}
          <span>{client.address}, {client.city}, VA {client.zip}</span>
          <span>{client.phone} · {client.email}</span>
        </div>
      ) : null}
      {children}
    </article>
  )
}

export function DocLines({ lines, taxPct = 0, depositPct = 0, paid = 0 }: { lines: Line[]; taxPct?: number; depositPct?: number; paid?: number }) {
  const sub = subtotal(lines)
  const tax = (sub * taxPct) / 100
  const total = sub + tax
  return (
    <>
      <table className="doc__table">
        <thead>
          <tr><th>Descripción</th><th className="num">Cant.</th><th className="num">Precio</th><th className="num">Total</th></tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.id}>
              <td>{l.desc}</td>
              <td className="num">{l.qty} {l.unit}</td>
              <td className="num">{money(l.price)}</td>
              <td className="num">{money(lineTotal(l))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="doc__totals">
        <div><dt>Subtotal</dt><dd>{money(sub)}</dd></div>
        {taxPct ? <div><dt>Impuesto ({taxPct} %)</dt><dd>{money(tax)}</dd></div> : null}
        <div className="is-total"><dt>Total</dt><dd>{money(total)}</dd></div>
        {depositPct ? <div><dt>Depósito para agendar ({depositPct} %)</dt><dd>{money((total * depositPct) / 100)}</dd></div> : null}
        {paid ? <div><dt>Pagado</dt><dd>−{money(paid)}</dd></div> : null}
        {paid ? <div className="is-total"><dt>Saldo</dt><dd>{money(Math.max(0, total - paid))}</dd></div> : null}
      </dl>
    </>
  )
}
