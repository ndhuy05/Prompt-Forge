<template>
  <div class="admin-prompts">
    <h1>Admin - Manage Prompts</h1>
    
    <div v-if="loading">Loading prompts...</div>
    
    <div v-else>
      <p>Total Prompts: {{ prompts.length }}</p>
      
      <table class="prompts-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Likes</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prompt in prompts" :key="prompt._id">
            <td>
              <router-link :to="`/prompts/${prompt._id}`" target="_blank">
                {{ prompt.title }}
              </router-link>
            </td>
            <td>{{ prompt.author?.username || 'Unknown' }}</td>
            <td>{{ prompt.category }}</td>
            <td>{{ prompt.likes?.length || 0 }}</td>
            <td>{{ new Date(prompt.createdAt).toLocaleDateString() }}</td>
            <td>
              <button @click="deletePromptConfirm(prompt)" class="delete-btn">
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
import { getAllPrompts, deletePrompt } from '@/api/adminAPI';

export default {
  name: 'AdminPrompts',
  data() {
    return {
      prompts: [],
      loading: true
    };
  },
  async mounted() {
    await this.loadPrompts();
  },
  methods: {
    async loadPrompts() {
      try {
        this.loading = true;
        const response = await getAllPrompts();
        if (response.success) {
          this.prompts = response.data;
        }
      } catch (error) {
        alert('Error loading prompts: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    async deletePromptConfirm(prompt) {
      if (confirm(`Delete prompt "${prompt.title}"? This will also delete all comments.`)) {
        try {
          const response = await deletePrompt(prompt._id);
          if (response.success) {
            alert('Prompt deleted successfully');
            await this.loadPrompts();
          }
        } catch (error) {
          alert('Error deleting prompt: ' + error.message);
        }
      }
    }
  }
};
</script>

<style scoped>
.admin-prompts {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.prompts-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.prompts-table th,
.prompts-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.prompts-table th {
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

.delete-btn:hover {
  background: #c82333;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style> 