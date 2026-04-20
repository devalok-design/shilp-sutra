'use client'

import { motion } from 'framer-motion'
import * as React from 'react'

import { useMotion } from '../../motion/motion-provider'
import { tweens } from '../../ui/lib/motion'
import { Separator } from '../../ui/separator'
import type { BlockComponentProps } from '../types'

const DividerBlock = React.memo(function DividerBlock(
  _props: BlockComponentProps<Record<string, never>>,
) {
  const { reducedMotion } = useMotion()

  if (reducedMotion) {
    return <Separator />
  }

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      style={{ originX: 0.5 }}
      transition={tweens.elegant}
    >
      <Separator />
    </motion.div>
  )
})

DividerBlock.displayName = 'DividerBlock'

export { DividerBlock }
