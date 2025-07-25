<template>
  <div class="admin-users">
    <h1>Admin - Manage Users</h1>
    
    <div v-if="loading">Loading users...</div>
    
    <div v-else>
      <p>Total Users: {{ users.length }}</p>
      
      <table class="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
            <td>
              <button 
                @click="deleteUserConfirm(user)"
                :disabled="user._id === currentUserId"
                class="delete-btn"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getAllUsers, deleteUser } from '@/api/adminAPI';
import { getUser } from '@/api/authAPI';

export default {
  name: 'AdminUsers',
  data() {
    return {
      users: [],
      loading: true,
      currentUserId: null
    };
  },
  async mounted() {
    const currentUser = getUser();
    this.currentUserId = currentUser?._id;
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        this.loading = true;
        const response = await getAllUsers();
        if (response.success) {
          this.users = response.data;
        }
      } catch (error) {
        alert('Error loading users: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    async deleteUserConfirm(user) {
      if (confirm(`Delete user "${user.username}"? This will also delete all their prompts and comments.`)) {
        try {
          const response = await deleteUser(user._id);
          if (response.success) {
            alert('User deleted successfully');
            await this.loadUsers();
          }
        } catch (error) {
          alert('Error deleting user: ' + error.message);
        }
      }
    }
  }
};
</script>

<style scoped>
.admin-users {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.users-table th,
.users-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.users-table th {
  background-color: #f4f4f4;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
}

.delete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
}
</style> 