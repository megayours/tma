import { useState } from 'react';
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

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
}

export function ExampleApp() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      role: 'Admin',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'active',
      role: 'User',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'inactive',
      role: 'User',
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice@example.com',
      status: 'pending',
      role: 'Moderator',
    },
  ]);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User' });
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user: User = {
        id: users.length + 1,
        name: newUser.name,
        email: newUser.email,
        status: 'pending',
        role: newUser.role as any,
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'User' });
      setIsAddUserModalOpen(false);
      setSuccessMessage('User added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const getStatusBadgeVariant = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">User Management</h1>
        <p className="tg-hint">
          Manage your application users with Telegram-themed UI
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>User statistics and quick actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="tg-hint text-sm">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="tg-hint text-sm">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'pending').length}
              </div>
              <div className="tg-hint text-sm">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'inactive').length}
              </div>
              <div className="tg-hint text-sm">Inactive</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setIsAddUserModalOpen(true)}>
            Add New User
          </Button>
        </CardFooter>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <List>
            {users.map(user => (
              <ListItem key={user.id} clickable>
                <ListItemContent>
                  <ListItemTitle>{user.name}</ListItemTitle>
                  <ListItemSubtitle>{user.email}</ListItemSubtitle>
                </ListItemContent>
                <ListItemAction className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {user.role}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </ListItemAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add New User"
      >
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="Enter user's full name"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter user's email"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            />
            <div>
              <label className="tg-text text-sm font-medium">Role</label>
              <select
                className="tg-text border-opacity-20 mt-1 w-full rounded-md border border-current bg-transparent px-3 py-2"
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="User">User</option>
                <option value="Moderator">Moderator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setIsAddUserModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddUser}
            disabled={!newUser.name || !newUser.email}
          >
            Add User
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
