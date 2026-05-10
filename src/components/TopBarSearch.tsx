import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { invalidatePermitRecordCache } from '../lib/recordApi'
import { useGlobalRecordSearchValue } from '../lib/useGlobalRecordSearchValue'

export function TopBarSearch() {
  const navigate = useNavigate()
  const derived = useGlobalRecordSearchValue()
  const [value, setValue] = useState(derived)

  useEffect(() => {
    queueMicrotask(() => setValue(derived))
  }, [derived])

  return (
    <form
      className="topbarSearch"
      role="search"
      aria-label="Search permits"
      onSubmit={(e) => {
        e.preventDefault()
        const id = value.trim()
        if (!id) {
          navigate('/')
          return
        }
        invalidatePermitRecordCache(id)
        navigate(`/permit-workflow/${encodeURIComponent(id)}`)
      }}
    >
      <div className="topbarSearchIcon" aria-hidden="true">
        <Search size={18} />
      </div>
      <input
        className="topbarSearchInput"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by record number…"
        autoComplete="off"
        inputMode="search"
        enterKeyHint="search"
        aria-label="Record number"
      />
    </form>
  )
}
