/**
 * @module @devalok/shilp-sutra/ui
 *
 * Core UI primitives: buttons, inputs, dialogs, cards, tables, badges, navigation, and more.
 * Most components require client-side React ("use client").
 *
 * **Server-safe components** (import individually for Server Components):
 * `Text`, `Skeleton`, `Stack`, `Container`, `Table`, `Code`, `VisuallyHidden`
 *
 * @example
 * // Server Component — import individually:
 * import { Text } from '@devalok/shilp-sutra/ui/text'
 * import { Stack } from '@devalok/shilp-sutra/ui/stack'
 *
 * // Client Component — barrel import:
 * import { Button, Dialog } from '@devalok/shilp-sutra/ui'
 */

// Dev-mode token presence check — runs once on first import
import { checkTokensLoaded } from './lib/check-tokens'
checkTokensLoaded()

// Core
export { Button, type ButtonProps,buttonVariants } from './button'
export { ButtonGroup, type ButtonGroupProps,useButtonGroup } from './button-group'
export { ColorInput, type ColorInputProps } from './color-input'
export { Icon, type IconProps } from './icon'
export { IconButton, type IconButtonProps } from './icon-button'
export { IconContext, type IconContextValue, IconProvider, type IconSize, type IconStroke,useIconContext } from './icon-context'
export { IconGroup, type IconGroupProps } from './icon-group'
export { Input, type InputProps, type InputState, inputWrapperVariants } from './input'
export { Label, type LabelProps } from './label'
export { type FieldState } from './lib/field-state'
export { Separator, type SeparatorProps } from './separator'
export { SplitButton, type SplitButtonPlacement,type SplitButtonProps } from './split-button'
export { VisuallyHidden, type VisuallyHiddenProps } from './visually-hidden'

// Autocomplete
export { Autocomplete, type AutocompleteOption,type AutocompleteProps } from './autocomplete'

// Combobox
export { Combobox, type ComboboxOption, type ComboboxPillTone, type ComboboxProps, type ComboboxSize,comboboxTriggerVariants } from './combobox'

// FileUpload
export { FileUpload, type FileUploadProps } from './file-upload'

// Form Controls
export { Checkbox, type CheckboxProps } from './checkbox'
export { FormField, type FormFieldProps, type FormHelperState, FormHelperText, type FormHelperTextProps,useFormField } from './form'
// InputOTP removed from barrel in 0.40.0 — hard peer `input-otp` was breaking
// fresh-consumer builds. Import per-component instead:
//   import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@devalok/shilp-sutra/ui/input-otp'
export { NumberInput, type NumberInputProps, type NumberInputSize, type NumberInputState,numberInputWrapperVariants } from './number-input'
export { RadioGroup, RadioGroupItem, type RadioGroupItemProps,type RadioGroupProps } from './radio'
export { SearchInput, type SearchInputProps } from './search-input'
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  type SelectTriggerProps,
  selectTriggerVariants,
  SelectValue,
} from './select'
export { Slider, type SliderColor,type SliderMark, type SliderMarkProps, type SliderProps, type SliderSize, sliderThumbVariants, sliderTrackVariants } from './slider'
export { Switch, type SwitchProps } from './switch'
export { Textarea, type TextareaProps,textareaVariants } from './textarea'
export { Toggle, type ToggleProps,toggleVariants } from './toggle'
export { ToggleGroup, ToggleGroupItem, type ToggleGroupItemProps,type ToggleGroupProps } from './toggle-group'
export { TruncatedText, type TruncatedTextProps } from './truncated-text'

// Feedback & Overlays
export {
  AlertDialog,
  AlertDialogAction,
  type AlertDialogActionProps,
  AlertDialogCancel,
  type AlertDialogCancelProps,
  AlertDialogContent,
  type AlertDialogContentProps,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'
export { Collapsible, CollapsibleContent, type CollapsibleProps,CollapsibleTrigger } from './collapsible'
export {
  Dialog,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogContentRaw,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  type DialogTitleProps,
  DialogTrigger,
} from './dialog'
export { HoverCard, HoverCardContent, type HoverCardContentProps,HoverCardTrigger } from './hover-card'
export { Popover, PopoverAnchor, PopoverContent, type PopoverContentProps,PopoverTrigger } from './popover'
export {
  Sheet,
  SheetClose,
  SheetContent,
  type SheetContentProps,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from './sheet'
// toast + Toaster removed from barrel in 0.40.0 — hard peer `sonner` was
// breaking fresh-consumer builds when consumers imported other UI symbols
// from the barrel without sonner installed. Import per-component instead:
//   import { toast, formatFileSize, type ToastOptions } from '@devalok/shilp-sutra/ui/toast'
//   import { Toaster } from '@devalok/shilp-sutra/ui/toaster'
export { Tooltip, TooltipContent, type TooltipContentProps,TooltipProvider, TooltipTrigger } from './tooltip'
// ---------------------------------------------------------------------------
// Notifications — pick the right one:
//   Alert   — inline, static feedback within a form or page section (no user action needed to show)
//   Banner  — persistent, page-level notice shown above main content (survives navigation)
//   Toast   — imperative, transient, action-triggered (fires on user action, auto-dismisses)
//             Requires <Toaster /> mounted once at layout root. Use toast.success() etc. from anywhere.
// ---------------------------------------------------------------------------
export { Alert, type AlertProps,alertVariants } from './alert'
export { Banner, type BannerProps,bannerVariants } from './banner'
export { Spinner, type SpinnerProps } from './spinner'

// Data Display
export { AspectRatio } from './aspect-ratio'
export { Avatar, AvatarFallback, type AvatarFallbackProps, AvatarImage, type AvatarProps, type AvatarRing,type AvatarStatus, avatarVariants } from './avatar'
export { Badge, type BadgeProps,badgeVariants } from './badge'
export { BadgeGroup, type BadgeGroupProps } from './badge-group'
export { BadgeIndicator, type BadgeIndicatorProps } from './badge-indicator'
export { Card, CardAction, type CardActionPlacement, type CardActionProps, CardBleed, type CardBleedProps, type CardBleedSide, CardContent, CardDescription, CardFooter, CardHeader, type CardProps,CardSection, CardTitle, cardVariants } from './card'
export { Code, type CodeProps } from './code'
export { ColorSwatch, type ColorSwatchProps } from './color-swatch'
export { Dot, type DotColor, type DotProps, type DotSize, type DotVariant, dotVariants } from './dot'
export {
  Progress,
  type ProgressColor,
  ProgressIndicator,
  type ProgressIndicatorProps,
  progressIndicatorVariants,
  ProgressLabel,
  type ProgressLabelProps,
  type ProgressProps,
  ProgressRoot,
  type ProgressRootProps,
  ProgressSegment,
  type ProgressSegmentProps,
  type ProgressSize,
  ProgressTrack,
  type ProgressTrackProps,
  progressTrackVariants,
  ProgressValue,
  type ProgressValueProps,
} from './progress'
export { MultiProgressRing, type MultiProgressRingProps,ProgressRing, type ProgressRingProps } from './progress-ring'
export {
  Skeleton,
  SkeletonAvatar,
  type SkeletonAvatarProps,
  SkeletonButton,
  type SkeletonButtonProps,
  SkeletonChart,
  type SkeletonChartProps,
  SkeletonGroup,
  type SkeletonGroupProps,
  SkeletonImage,
  type SkeletonImageProps,
  SkeletonInput,
  type SkeletonInputProps,
  type SkeletonProps,
  SkeletonText,
  type SkeletonTextProps,
  skeletonVariants,
} from './skeleton'
export { StatCard, type StatCardProps } from './stat-card'
export {
  type FlashPreset,
  type FlashSpec,
  type FlashSpeed,
  type FlashTone,
  StatFlash,
  type StatFlashProps,
} from './stat-flash'
export { Surface, type SurfaceProps, surfaceVariants } from './surface'
export { Table, TableBody, TableCaption, TableCell, type TableCellBaseProps,type TableCellProps,type TableDensity, TableFooter, TableHead, TableHeader, type TableProps, TableRow, TableRowActions, type TableRowActionsProps,type TableRowProps } from './table'
export { TableRowLink, type TableRowLinkProps } from './table-row-link'

// Navigation
export { Accordion, AccordionContent, type AccordionContentProps,AccordionItem, type AccordionItemProps, AccordionTrigger, type AccordionTriggerProps } from './accordion'
export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  type BreadcrumbLinkProps,
  BreadcrumbList,
  BreadcrumbPage,
  type BreadcrumbProps,
  BreadcrumbSeparator,
} from './breadcrumb'
export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  type ContextMenuContentProps,
  ContextMenuGroup,
  ContextMenuItem,
  type ContextMenuItemProps,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu'
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  type DropdownMenuContentProps,
  DropdownMenuGroup,
  DropdownMenuItem,
  type DropdownMenuItemProps,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'
export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  type MenubarContentProps,
  MenubarGroup,
  MenubarItem,
  type MenubarItemProps,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './menubar'
export {
  NavigationMenu,
  NavigationMenuContent,
  type NavigationMenuContentProps,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  type NavigationMenuProps,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from './navigation-menu'
export {
  generatePagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  type PaginationLinkProps,
  PaginationNav,
  type PaginationNavProps,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
} from './pagination'
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  type SidebarProps,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar'
export { Tabs, type TabsColor, TabsContent, type TabsContentProps, TabsList, type TabsListProps, type TabsOrientation,type TabsProps, type TabsSize, TabsTrigger, type TabsTriggerProps } from './tabs'

// Workflow
export { Step, Stepper, type StepperProps, type StepProps } from './stepper'


// Typography
export { Text, type TextProps, type TextVariant,textVariants } from './text'

// Layout
export { Container, type ContainerProps } from './container'
export { type SpacingToken,Stack, type StackProps } from './stack'

// Tree View
export { TreeItem, type TreeItemProps, type TreeNode,TreeView, type TreeViewProps, useTree } from './tree-view'

// Segmented Control
export {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlProps,
  type SegmentedControlSize,
  type SegmentedControlVariant,
} from './segmented-control'

// Brand Texture
export { DevalokGrain, type DevalokGrainProps, type GrainIntensity } from './devalok-grain'

// Chat primitives
export {
  DateSeparator,
  type DateSeparatorProps,
  Message,
  type MessageActionProps,
  type MessageActionsProps,
  type MessageAuthorProps,
  type MessageAvatarProps,
  type MessageBodyProps,
  type MessageContentProps,
  type MessageContextValue,
  type MessageEditableBodyProps,
  MessageInput,
  type MessageInputProps,
  MessageList,
  type MessageListProps,
  type MessageProps,
  type MessageReactionsProps,
  SystemMessage,
  type SystemMessageProps,
  TypingIndicator,
  type TypingIndicatorProps,
  UnreadSeparator,
  type UnreadSeparatorProps,
  useMessageContext,
} from './chat'

// Other
export { Link, type LinkProps } from './link'

// OAuth / Social sign-in
export {
  getOAuthLabel,
  getOAuthName,
  OAuth,
  type OAuthAppearance,
  OAuthButton,
  type OAuthButtonProps,
  OAuthConnectionRow,
  type OAuthConnectionRowProps,
  OAuthDivider,
  type OAuthDividerProps,
  OAuthGlyph,
  type OAuthGlyphProps,
  OAuthGroup,
  type OAuthGroupProps,
  type OAuthIntent,
  type OAuthProvider,
  type OAuthVariant,
} from './oauth-button'

// Utilities
export { formatRelativeTime } from './lib/date-utils'
export type { SpringPreset, TweenPreset } from './lib/motion'
export { springs, stagger, tweens, withReducedMotion } from './lib/motion'
export { cn } from './lib/utils'
