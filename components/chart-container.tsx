"use client"

import { useRef, useState, useEffect, Children, cloneElement, isValidElement } from "react"

interface ChartContainerProps {
  height: number
  children: React.ReactNode
  className?: string
}

export function ChartContainer({ height, children, className }: ChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} style={{ width: "100%", height }}>
      {size.width > 0 &&
        Children.map(children, (child) => {
          if (isValidElement(child)) {
            return cloneElement(
              child as React.ReactElement<{ width?: number; height?: number }>,
              { width: size.width, height: size.height },
            )
          }
          return child
        })}
    </div>
  )
}
