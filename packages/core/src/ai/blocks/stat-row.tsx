'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { springs } from '../../ui/lib/motion'
import { useMotion } from '../../motion/motion-provider'
import { StatCard } from '../../ui/stat-card'
import type { BlockComponentProps, StatRowBlockData } from '../types'

const StatRowBlock = React.memo(function StatRowBlock({
  data,
}: BlockComponentProps<StatRowBlockData>) {
  const { reducedMotion } = useMotion()
  const stats = data.stats ?? []

  if (stats.length === 0) return null

  return (
    <div className="flex flex-wrap gap-ds-05">
      {stats.map((stat, index) => {
        const delta = stat.change
          ? {
              value: stat.change.value,
              direction: stat.change.direction,
            }
          : undefined

        if (reducedMotion) {
          return (
            <div key={stat.label} className="flex-1 min-w-[140px]">
              <StatCard
                label={stat.label}
                value={stat.value}
                delta={delta}
              />
            </div>
          )
        }

        return (
          <motion.div
            key={stat.label}
            className="flex-1 min-w-[140px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.responsive, delay: index * 0.08 }}
          >
            <StatCard
              label={stat.label}
              value={stat.value}
              delta={delta}
            />
          </motion.div>
        )
      })}
    </div>
  )
})

StatRowBlock.displayName = 'StatRowBlock'

export { StatRowBlock }
