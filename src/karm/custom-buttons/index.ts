// Backwards-compat re-exports — canonical location is now ui/segmented-control
export {
  SegmentedControl,
  SegmentedControlItem,
  segmentedControlItemVariants,
  type SegmentedControlSize,
  type SegmentedControlColor,
  type SegmentedControlOption,
  type SegmentedControlProps,
  type SegmentedControlItemProps,
} from '../../ui/segmented-control'
/** @deprecated Use SegmentedControl instead */
export { SegmentedControl as Toggle } from '../../ui/segmented-control'
/** @deprecated Use SegmentedControlSize instead */
export type { ToggleSize } from '../../ui/segmented-control'
/** @deprecated Use SegmentedControlColor instead */
export type { ToggleColor } from '../../ui/segmented-control'
/** @deprecated Use SegmentedControlOption instead */
export type { ToggleOption } from '../../ui/segmented-control'
