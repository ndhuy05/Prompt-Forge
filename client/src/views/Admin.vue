<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    
    <div class="admin-links">
      <router-link to="/admin/users" class="admin-link">
        Manage Users
      </router-link>
      
      <router-link to="/admin/prompts" class="admin-link">
        Manage Prompts
      </router-link>
    </div>
    
    <div class="admin-info">
      <p>Welcome to the admin panel. You can manage users and prompts from here.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Admin'
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.admin-links {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 30px 0;
}

.admin-link {
  background: #007bff;
  color: white;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
}

.admin-link:hover {
  background: #0056b3;
  color: white;
}

.admin-info {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 5px;
}
</style> 