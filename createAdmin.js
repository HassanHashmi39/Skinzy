const adminData = {
    name: "Admin",
    email: "admin@skinzy.com",
    password: "Password123!",
    role: "admin",
    userType: "admin"
};

fetch('https://skinzy.onrender.com/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminData)
})
.then(res => res.json())
.then(data => console.log("Admin Creation Result:", data))
.catch(err => console.error("Error:", err));
