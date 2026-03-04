// Core
export { Button, buttonVariants, type ButtonProps } from './button'
export { IconButton, type IconButtonProps } from './icon-button'
export { ButtonGroup, useButtonGroup, type ButtonGroupProps } from './button-group'
export { Input, type InputProps, type InputState } from './input'
export { Label, type LabelProps } from './label'
export { Separator } from './separator'
export { VisuallyHidden, type VisuallyHiddenProps } from './visually-hidden'

// Autocomplete
export { Autocomplete, type AutocompleteProps, type AutocompleteOption } from './autocomplete'

// Combobox
export { Combobox, type ComboboxProps, type ComboboxOption } from './combobox'

// FileUpload
export { FileUpload, type FileUploadProps } from './file-upload'

// Form Controls
export { Checkbox, type CheckboxProps } from './checkbox'
export { RadioGroup, RadioGroupItem } from './radio'
export { Switch } from './switch'
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
  type SelectTriggerProps,
  selectTriggerVariants,
} from './select'
export { Textarea, type TextareaProps } from './textarea'
export { NumberInput, type NumberInputProps } from './number-input'
export { SearchInput, type SearchInputProps } from './search-input'
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './input-otp'
export { FormField, FormHelperText, getFormFieldA11y, type FormFieldProps, type FormHelperState, type FormHelperTextProps } from './form'
export { Slider } from './slider'
export { Toggle, toggleVariants } from './toggle'
export { ToggleGroup, ToggleGroupItem } from './toggle-group'

// Feedback & Overlays
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog'
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogContentRaw,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog'
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  type SheetContentProps,
} from './sheet'
export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastProps,
  type ToastActionElement,
} from './toast'
export { Toaster } from './toaster'
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './popover'
export { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card'
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible'
// ---------------------------------------------------------------------------
// Notifications — pick the right one:
//   Alert   — inline, static feedback within a form or page section (no user action needed to show)
//   Banner  — persistent, page-level notice shown above main content (survives navigation)
//   Toast   — imperative, transient, action-triggered (fires on user action, auto-dismisses)
//             Requires <Toaster /> mounted once at layout root + useToast() hook or toast() function
// ---------------------------------------------------------------------------
export { Alert, alertVariants, type AlertProps } from './alert'
export { Banner, bannerVariants, type BannerProps } from './banner'
export { Spinner, type SpinnerProps } from './spinner'

// Data Display
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, type CardProps } from './card'
export { Badge, badgeVariants, type BadgeProps } from './badge'
export { Avatar, AvatarImage, AvatarFallback, avatarVariants, type AvatarProps, type AvatarStatus } from './avatar'
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './table'
export { DataTable, type DataTableProps } from './data-table'
export { DataTableToolbar, type DataTableToolbarProps, type Density } from './data-table-toolbar'
export { Progress, progressTrackVariants, progressIndicatorVariants, type ProgressProps } from './progress'
export { Skeleton, skeletonVariants, type SkeletonProps } from './skeleton'
export { StatCard, type StatCardProps } from './stat-card'
export { Code, type CodeProps } from './code'
export { AspectRatio } from './aspect-ratio'

// Navigation
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'
export { Tabs, TabsList, TabsTrigger, TabsContent, type TabsProps, type TabsListProps, type TabsTriggerProps, type TabsContentProps } from './tabs'
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb'
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu'
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from './context-menu'
export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarGroup,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarShortcut,
} from './menubar'
export {
  PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationNav,
  generatePagination,
  type PaginationLinkProps,
  type PaginationNavProps,
} from './pagination'
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from './navigation-menu'
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
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar'

// Workflow
export { Stepper, Step, type StepperProps, type StepProps } from './stepper'

// Interactive Tags
export { Chip, chipVariants, type ChipProps } from './chip'

// Transitions
export { Fade, Collapse, Grow, Slide, type TransitionProps } from './transitions'

// Typography
export { Text, textVariants, type TextProps, type TextVariant } from './text'

// Layout
export { Stack, type StackProps } from './stack'
export { Container, type ContainerProps } from './container'

// Tree View
export { TreeView, type TreeViewProps, TreeItem, type TreeItemProps, useTree, type TreeNode } from './tree-view'

// Segmented Control
export {
  SegmentedControl,
  SegmentedControlItem,
  segmentedControlItemVariants,
  type SegmentedControlSize,
  type SegmentedControlColor,
  type SegmentedControlOption,
  type SegmentedControlProps,
  type SegmentedControlItemProps,
} from './segmented-control'

// Other
export { Link, type LinkProps } from './link'

// Charts
export * from './charts'

// Utilities
export { cn } from './lib/utils'
export { motion, duration, easings, durations } from './lib/motion'
export type { MotionMode, MotionCategory, DurationToken } from './lib/motion'
