import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListItemContent,
  ListItemTitle,
  ListItemSubtitle,
  ListItemAction,
  Modal,
  ModalContent,
  ModalFooter,
} from './ui';

export function TelegramUIComponentsDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="space-y-8 p-4">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">Telegram UI Components</h1>
        <p className="tg-hint">
          A collection of reusable components with Telegram theme styling
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </CardContent>
      </Card>

      {/* Inputs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          <CardDescription>
            Form input components with validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            helperText="Must be at least 8 characters"
          />
          <Input
            label="Username"
            placeholder="Enter username"
            error="Username is already taken"
          />
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Notification and message components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a default alert message with some information.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was an error processing your request. Please try again.
            </AlertDescription>
          </Alert>

          <Alert variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your changes have been saved successfully!
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Please review your information before proceeding.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Lists Section */}
      <Card>
        <CardHeader>
          <CardTitle>Lists</CardTitle>
          <CardDescription>List components for displaying data</CardDescription>
        </CardHeader>
        <CardContent>
          <List>
            <ListItem clickable>
              <ListItemContent>
                <ListItemTitle>List Item 1</ListItemTitle>
                <ListItemSubtitle>
                  This is a subtitle for item 1
                </ListItemSubtitle>
              </ListItemContent>
              <ListItemAction>
                <Badge variant="secondary">New</Badge>
              </ListItemAction>
            </ListItem>

            <ListItem clickable>
              <ListItemContent>
                <ListItemTitle>List Item 2</ListItemTitle>
                <ListItemSubtitle>
                  This is a subtitle for item 2
                </ListItemSubtitle>
              </ListItemContent>
              <ListItemAction>
                <Button size="sm" variant="ghost">
                  Action
                </Button>
              </ListItemAction>
            </ListItem>

            <ListItem clickable>
              <ListItemContent>
                <ListItemTitle>List Item 3</ListItemTitle>
                <ListItemSubtitle>
                  This is a subtitle for item 3
                </ListItemSubtitle>
              </ListItemContent>
              <ListItemAction>
                <Badge variant="success">Active</Badge>
              </ListItemAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Modal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Modal</CardTitle>
          <CardDescription>Dialog and overlay components</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
      >
        <ModalContent>
          <p className="tg-text">
            This is an example modal with Telegram theme styling. You can add
            any content here.
          </p>
          <Input label="Modal Input" placeholder="Enter some text" />
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
        </ModalFooter>
      </Modal>

      {/* Complex Example */}
      <Card>
        <CardHeader>
          <CardTitle>Complex Example</CardTitle>
          <CardDescription>
            A combination of multiple components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">User Profile</h3>
              <p className="tg-hint text-sm">Manage your account settings</p>
            </div>
            <Badge variant="success">Verified</Badge>
          </div>

          <List>
            <ListItem clickable>
              <ListItemContent>
                <ListItemTitle>Personal Information</ListItemTitle>
                <ListItemSubtitle>Update your name and email</ListItemSubtitle>
              </ListItemContent>
              <ListItemAction>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </ListItemAction>
            </ListItem>

            <ListItem clickable>
              <ListItemContent>
                <ListItemTitle>Security</ListItemTitle>
                <ListItemSubtitle>
                  Change password and 2FA settings
                </ListItemSubtitle>
              </ListItemContent>
              <ListItemAction>
                <Badge variant="warning">Update</Badge>
              </ListItemAction>
            </ListItem>
          </List>

          <Alert variant="success">
            <AlertDescription>
              Your profile was last updated 2 days ago.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
