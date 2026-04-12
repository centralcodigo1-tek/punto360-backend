const axios = require('axios');

async function testStats() {
    try {
        // 1. Login to get token
        const loginRes = await axios.post('http://127.0.0.1:3000/auth/login', {
            email: 'ing.joseramirezgarcia@gmail.com',
            password: 'password123'
        });
        const token = loginRes.data.accessToken;
        console.log('✅ Logged in');

        // 2. Hit /sales/stats
        const statsRes = await axios.get('http://127.0.0.1:3000/sales/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('📊 Stats:', statsRes.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.status, error.response?.data);
        if (error.response?.data?.message) {
            console.error('Message:', error.response.data.message);
        }
    }
}

testStats();
