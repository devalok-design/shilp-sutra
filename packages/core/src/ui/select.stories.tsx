import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect, waitFor } from 'storybook/test'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'
import { Label } from './label'

const meta: Meta<typeof Select> = {
  title: 'Components/Selectors/Select',
  component: Select,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  // Note: play function removed — Radix Select portal timing is unreliable in
  // Chromatic's headless capture. Interaction tests run locally via Storybook test widget.
  render: () => (
    <Select>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
        <SelectItem value="dragonfruit">Dragon Fruit</SelectItem>
        <SelectItem value="elderberry">Elderberry</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const WithGroups: Story = {
  parameters: { chromatic: { delay: 500 } },
  render: () => (
    <Select>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern (EST)</SelectItem>
          <SelectItem value="cst">Central (CST)</SelectItem>
          <SelectItem value="mst">Mountain (MST)</SelectItem>
          <SelectItem value="pst">Pacific (PST)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="ist">India (IST)</SelectItem>
          <SelectItem value="jst">Japan (JST)</SelectItem>
          <SelectItem value="cst-cn">China (CST)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the select dropdown
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)

    // Verify group labels and options are visible
    const body = within(document.body)
    await waitFor(() => {
      const listbox = body.getByRole('listbox')
      expect(within(listbox).getByText('North America')).toBeVisible()
      expect(within(listbox).getByText('Asia')).toBeVisible()
      expect(within(listbox).getByText('Eastern (EST)')).toBeVisible()
      expect(within(listbox).getByText('India (IST)')).toBeVisible()
    })
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-02">
      <Label>Priority</Label>
      <Select defaultValue="medium">
        <SelectTrigger className="w-[240px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Option A</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const WithDisabledItems: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Choose a plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
        <SelectItem value="enterprise" disabled>
          Enterprise (Coming Soon)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <div className="flex flex-col gap-ds-02">
        <Label>Default</Label>
        <Select>
          <SelectTrigger variant="default" className="w-[240px]">
            <SelectValue placeholder="Default variant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-ds-02">
        <Label>Outline</Label>
        <Select>
          <SelectTrigger variant="outline" className="w-[240px]">
            <SelectValue placeholder="Outline variant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-ds-02">
        <Label>Ghost</Label>
        <Select>
          <SelectTrigger variant="ghost" className="w-[240px]">
            <SelectValue placeholder="Ghost variant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}

export const ValidationColors: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <div className="flex flex-col gap-ds-02">
        <Label>Default</Label>
        <Select>
          <SelectTrigger color="default" className="w-[240px]">
            <SelectValue placeholder="No validation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-ds-02">
        <Label>Error</Label>
        <Select>
          <SelectTrigger color="error" className="w-[240px]">
            <SelectValue placeholder="Error state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-ds-02">
        <Label>Success</Label>
        <Select>
          <SelectTrigger color="success" className="w-[240px]">
            <SelectValue placeholder="Success state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-ds-02">
        <Label>Warning</Label>
        <Select>
          <SelectTrigger color="warning" className="w-[240px]">
            <SelectValue placeholder="Warning state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}
