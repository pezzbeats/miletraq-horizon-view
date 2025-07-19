
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const SMALL_MOBILE_BREAKPOINT = 375
const MEDIUM_MOBILE_BREAKPOINT = 414
const LARGE_MOBILE_BREAKPOINT = 428

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useMobileSize() {
  const [mobileSize, setMobileSize] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'desktop'>('desktop')

  React.useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      if (width < 375) setMobileSize('xs')
      else if (width < 390) setMobileSize('sm')
      else if (width < 414) setMobileSize('md')
      else if (width < 428) setMobileSize('lg')
      else if (width < 768) setMobileSize('xl')
      else setMobileSize('desktop')
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return mobileSize
}
