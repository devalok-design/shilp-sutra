// Deliberately does NOT import Button — the reporter found that importing it
// here masks the bug, so the route must stay clean for the probe to be valid.
import { AsChildProbe } from '../../components/aschild-probe'

export default function Page() {
  return <AsChildProbe />
}
