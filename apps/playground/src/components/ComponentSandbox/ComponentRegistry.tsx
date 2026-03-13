import React from 'react'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Input } from '@/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card'
import { Alert } from '@/ui/alert'
import { Checkbox } from '@/ui/checkbox'
import { Switch } from '@/ui/switch'
import { Avatar, AvatarFallback } from '@/ui/avatar'
import { Separator } from '@/ui/separator'

export interface PropSchema {
  name: string
  type: 'select' | 'text' | 'boolean' | 'number'
  label: string
  options?: string[]
  defaultValue: string | boolean | number
}

export interface ComponentEntry {
  name: string
  component: React.ComponentType<any>
  render: (props: Record<string, any>) => React.ReactNode
  props: PropSchema[]
}

export const COMPONENT_REGISTRY: ComponentEntry[] = [
  {
    name: 'Button',
    component: Button,
    render: (props) => (
      <Button
        variant={props.variant}
        color={props.color}
        size={props.size}
        disabled={props.disabled}
        fullWidth={props.fullWidth}
        loading={props.loading}
      >
        {props.children}
      </Button>
    ),
    props: [
      {
        name: 'children',
        type: 'text',
        label: 'Label',
        defaultValue: 'Click me',
      },
      {
        name: 'variant',
        type: 'select',
        label: 'Variant',
        options: ['solid', 'outline', 'ghost', 'link'],
        defaultValue: 'solid',
      },
      {
        name: 'color',
        type: 'select',
        label: 'Color',
        options: ['default', 'error'],
        defaultValue: 'default',
      },
      {
        name: 'size',
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg', 'icon-sm', 'icon-md', 'icon-lg'],
        defaultValue: 'md',
      },
      {
        name: 'disabled',
        type: 'boolean',
        label: 'Disabled',
        defaultValue: false,
      },
      {
        name: 'fullWidth',
        type: 'boolean',
        label: 'Full Width',
        defaultValue: false,
      },
      {
        name: 'loading',
        type: 'boolean',
        label: 'Loading',
        defaultValue: false,
      },
    ],
  },
  {
    name: 'Badge',
    component: Badge,
    render: (props) => (
      <Badge variant={props.variant} color={props.color} size={props.size} dot={props.dot}>
        {props.children}
      </Badge>
    ),
    props: [
      {
        name: 'children',
        type: 'text',
        label: 'Label',
        defaultValue: 'Badge',
      },
      {
        name: 'variant',
        type: 'select',
        label: 'Variant',
        options: ['subtle', 'solid', 'outline'],
        defaultValue: 'subtle',
      },
      {
        name: 'color',
        type: 'select',
        label: 'Color',
        options: [
          'default',
          'info',
          'success',
          'error',
          'warning',
          'brand',
          'accent',
          'teal',
          'amber',
          'slate',
          'indigo',
          'cyan',
          'orange',
          'emerald',
        ],
        defaultValue: 'default',
      },
      {
        name: 'size',
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      {
        name: 'dot',
        type: 'boolean',
        label: 'Dot',
        defaultValue: false,
      },
    ],
  },
  {
    name: 'Input',
    component: Input,
    render: (props) => (
      <Input
        size={props.size}
        state={props.state}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readOnly={props.readOnly}
      />
    ),
    props: [
      {
        name: 'placeholder',
        type: 'text',
        label: 'Placeholder',
        defaultValue: 'Type here...',
      },
      {
        name: 'size',
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      {
        name: 'state',
        type: 'select',
        label: 'State',
        options: ['default', 'error', 'warning', 'success'],
        defaultValue: 'default',
      },
      {
        name: 'disabled',
        type: 'boolean',
        label: 'Disabled',
        defaultValue: false,
      },
      {
        name: 'readOnly',
        type: 'boolean',
        label: 'Read Only',
        defaultValue: false,
      },
    ],
  },
  {
    name: 'Card',
    component: Card,
    render: (props) => (
      <Card variant={props.variant} interactive={props.interactive}>
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-ds-md text-surface-fg-muted">{props.content}</p>
        </CardContent>
      </Card>
    ),
    props: [
      {
        name: 'variant',
        type: 'select',
        label: 'Variant',
        options: ['default', 'elevated', 'outline', 'flat'],
        defaultValue: 'default',
      },
      {
        name: 'interactive',
        type: 'boolean',
        label: 'Interactive',
        defaultValue: false,
      },
      {
        name: 'title',
        type: 'text',
        label: 'Title',
        defaultValue: 'Card Title',
      },
      {
        name: 'description',
        type: 'text',
        label: 'Description',
        defaultValue: 'Card description text',
      },
      {
        name: 'content',
        type: 'text',
        label: 'Content',
        defaultValue: 'Card body content goes here.',
      },
    ],
  },
  {
    name: 'Alert',
    component: Alert,
    render: (props) => (
      <Alert variant={props.variant} color={props.color} title={props.title}>
        {props.children}
      </Alert>
    ),
    props: [
      {
        name: 'children',
        type: 'text',
        label: 'Message',
        defaultValue: 'This is an alert message.',
      },
      {
        name: 'variant',
        type: 'select',
        label: 'Variant',
        options: ['subtle', 'filled', 'outline'],
        defaultValue: 'subtle',
      },
      {
        name: 'color',
        type: 'select',
        label: 'Color',
        options: ['info', 'success', 'warning', 'error', 'neutral'],
        defaultValue: 'info',
      },
      {
        name: 'title',
        type: 'text',
        label: 'Title',
        defaultValue: 'Heads up',
      },
    ],
  },
  {
    name: 'Checkbox',
    component: Checkbox,
    render: (props) => (
      <div className="flex items-center gap-2">
        <Checkbox
          disabled={props.disabled}
          error={props.error}
          defaultChecked={props.checked}
        />
        <label className="text-ds-md text-surface-fg">{props.label}</label>
      </div>
    ),
    props: [
      {
        name: 'label',
        type: 'text',
        label: 'Label',
        defaultValue: 'Accept terms',
      },
      {
        name: 'checked',
        type: 'boolean',
        label: 'Checked',
        defaultValue: false,
      },
      {
        name: 'disabled',
        type: 'boolean',
        label: 'Disabled',
        defaultValue: false,
      },
      {
        name: 'error',
        type: 'boolean',
        label: 'Error',
        defaultValue: false,
      },
    ],
  },
  {
    name: 'Switch',
    component: Switch,
    render: (props) => (
      <div className="flex items-center gap-2">
        <Switch
          disabled={props.disabled}
          error={props.error}
          defaultChecked={props.checked}
        />
        <label className="text-ds-md text-surface-fg">{props.label}</label>
      </div>
    ),
    props: [
      {
        name: 'label',
        type: 'text',
        label: 'Label',
        defaultValue: 'Enable notifications',
      },
      {
        name: 'checked',
        type: 'boolean',
        label: 'Checked',
        defaultValue: false,
      },
      {
        name: 'disabled',
        type: 'boolean',
        label: 'Disabled',
        defaultValue: false,
      },
      {
        name: 'error',
        type: 'boolean',
        label: 'Error',
        defaultValue: false,
      },
    ],
  },
  {
    name: 'Avatar',
    component: Avatar,
    render: (props) => (
      <Avatar size={props.size} shape={props.shape} status={props.status || undefined}>
        <AvatarFallback>{props.fallback}</AvatarFallback>
      </Avatar>
    ),
    props: [
      {
        name: 'fallback',
        type: 'text',
        label: 'Fallback',
        defaultValue: 'JD',
      },
      {
        name: 'size',
        type: 'select',
        label: 'Size',
        options: ['xs', 'sm', 'md', 'lg', 'xl'],
        defaultValue: 'md',
      },
      {
        name: 'shape',
        type: 'select',
        label: 'Shape',
        options: ['circle', 'square', 'rounded'],
        defaultValue: 'circle',
      },
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: ['', 'online', 'offline', 'busy', 'away'],
        defaultValue: '',
      },
    ],
  },
  {
    name: 'Separator',
    component: Separator,
    render: (props) => (
      <div className={props.orientation === 'vertical' ? 'flex h-8 items-center' : 'w-full'}>
        <Separator orientation={props.orientation} decorative={props.decorative} />
      </div>
    ),
    props: [
      {
        name: 'orientation',
        type: 'select',
        label: 'Orientation',
        options: ['horizontal', 'vertical'],
        defaultValue: 'horizontal',
      },
      {
        name: 'decorative',
        type: 'boolean',
        label: 'Decorative',
        defaultValue: true,
      },
    ],
  },
]
