import { Link } from 'react-router-dom'
import { PageShell } from '../layout'

export function NotFoundPage() {
  return (
    <PageShell narrow>
      <header className="page-intro">
        <p className="page-kicker">404</p>
        <h1>This path wandered off.</h1>
        <p className="page-lead">
          The page is gone, or it never lived here. The collection is still on
          the other side of the hall.
        </p>
      </header>
      <Link to="/" className="cta">
        <span>Return home</span>
      </Link>
    </PageShell>
  )
}
