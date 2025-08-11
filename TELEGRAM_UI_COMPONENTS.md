# Telegram UI Component Library

A comprehensive collection of reusable React components designed specifically for Telegram Mini Apps with automatic theme inheritance.

## Overview

This component library provides a set of pre-styled, accessible components that automatically adapt to Telegram's theme (light/dark mode) and color scheme. All components are built with TypeScript and include proper TypeScript definitions.

## Installation

The components are already included in your project. You can import them from:

```typescript
import {
  Button,
  Card,
  Input,
  Badge,
  Alert,
  List,
  Modal,
} from '@/components/ui';
```

## Components

### Button

A versatile button component with multiple variants and sizes.

```typescript
import { Button } from '@/components/ui';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With states
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
```

**Props:**

- `variant`: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- All standard button HTML attributes

### Card

A container component for grouping related content.

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Variants:**

- `default`: Standard card with section background
- `secondary`: Card with secondary background
- `section`: Card with section separator border

### Input

A form input component with built-in validation states.

```typescript
import { Input } from '@/components/ui';

// Basic input
<Input placeholder="Enter text" />

// With label and helper text
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  helperText="We'll never share your email"
/>

// With error state
<Input
  label="Username"
  placeholder="Enter username"
  error="Username is already taken"
/>
```

**Props:**

- `label`: string - Input label
- `error`: string - Error message
- `helperText`: string - Helper text
- All standard input HTML attributes

### Badge

A component for displaying status indicators and labels.

```typescript
import { Badge } from '@/components/ui';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>

// With sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

**Props:**

- `variant`: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
- `size`: 'sm' | 'md' | 'lg'

### Alert

A component for displaying notifications and messages.

```typescript
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';

<Alert>
  <AlertTitle>Default Alert</AlertTitle>
  <AlertDescription>This is a default alert message.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>

<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Operation completed successfully.</AlertDescription>
</Alert>

<Alert variant="warning">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Please review your input.</AlertDescription>
</Alert>
```

**Props:**

- `variant`: 'default' | 'destructive' | 'success' | 'warning'

### List

A component for displaying lists of items with actions.

```typescript
import { List, ListItem, ListItemContent, ListItemTitle, ListItemSubtitle, ListItemAction } from '@/components/ui';

<List>
  <ListItem clickable>
    <ListItemContent>
      <ListItemTitle>List Item Title</ListItemTitle>
      <ListItemSubtitle>List item subtitle</ListItemSubtitle>
    </ListItemContent>
    <ListItemAction>
      <Badge>New</Badge>
    </ListItemAction>
  </ListItem>
</List>
```

**Props:**

- `clickable`: boolean - Makes the list item clickable with hover effects

### Modal

A modal dialog component for overlays and dialogs.

```typescript
import { Modal, ModalContent, ModalFooter } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
  <ModalContent>
    <p>Modal content goes here</p>
  </ModalContent>
  <ModalFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button onClick={() => setIsOpen(false)}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>
```

**Props:**

- `isOpen`: boolean - Controls modal visibility
- `onClose`: () => void - Function called when modal should close
- `title`: string - Modal title
- `showCloseButton`: boolean - Whether to show close button (default: true)

## Theme Integration

All components automatically inherit Telegram's theme colors through CSS variables:

- `--tg-bg-color`: Background color
- `--tg-text-color`: Text color
- `--tg-hint-color`: Secondary/hint text color
- `--tg-link-color`: Link color
- `--tg-button-color`: Button background color
- `--tg-button-text-color`: Button text color
- `--tg-secondary-bg-color`: Secondary background color
- `--tg-accent-text-color`: Accent text color
- `--tg-destructive-text-color`: Destructive text color
- `--tg-header-bg-color`: Header background color
- `--tg-section-bg-color`: Section background color
- `--tg-section-header-text-color`: Section header text color
- `--tg-section-separator-color`: Section separator color
- `--tg-subtitle-text-color`: Subtitle text color
- `--tg-bottom-bar-bg-color`: Bottom bar background color

## Utility Classes

The library also provides utility classes for custom styling:

- `tg-bg`: Background color
- `tg-text`: Text color
- `tg-hint`: Secondary/hint text
- `tg-link`: Link styling
- `tg-button`: Button styling
- `tg-secondary-bg`: Secondary background
- `tg-accent-text`: Accent text color
- `tg-destructive-text`: Destructive text color
- `tg-header-bg`: Header background
- `tg-section-bg`: Section background
- `tg-section-header-text`: Section header text
- `tg-section-separator`: Section separator
- `tg-subtitle-text`: Subtitle text
- `tg-bottom-bar-bg`: Bottom bar background

## Usage Examples

### Form Example

```typescript
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Input, Button, Alert } from '@/components/ui';

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Input
          label="Name"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Message"
          placeholder="Your message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </CardContent>
      <CardFooter>
        <Button>Send Message</Button>
      </CardFooter>
    </Card>
  );
}
```

### List Example

```typescript
import { List, ListItem, ListItemContent, ListItemTitle, ListItemSubtitle, ListItemAction, Badge, Button } from '@/components/ui';

function UserList({ users }) {
  return (
    <List>
      {users.map(user => (
        <ListItem key={user.id} clickable>
          <ListItemContent>
            <ListItemTitle>{user.name}</ListItemTitle>
            <ListItemSubtitle>{user.email}</ListItemSubtitle>
          </ListItemContent>
          <ListItemAction>
            <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
              {user.status}
            </Badge>
          </ListItemAction>
        </ListItem>
      ))}
    </List>
  );
}
```

## Best Practices

1. **Use semantic variants**: Choose the appropriate variant for your use case (e.g., `destructive` for delete actions)
2. **Provide proper labels**: Always include labels for form inputs
3. **Handle loading states**: Use the `loading` prop for async operations
4. **Accessibility**: All components include proper ARIA attributes and keyboard navigation
5. **Theme consistency**: Let the components handle theming automatically

## Customization

You can customize components by passing additional CSS classes:

```typescript
<Button className="w-full">Full Width Button</Button>
<Card className="max-w-md mx-auto">Centered Card</Card>
```

The components use the `cn` utility function which properly merges Tailwind classes and handles conflicts.

## TypeScript Support

All components include full TypeScript support with proper type definitions. The library exports both the components and their prop types:

```typescript
import { Button, type ButtonProps } from '@/components/ui';
```
