async function testStats() {
    try {
        console.log('--- 🧪 Iniciando Prueba de Estabilidad ---');
        // 1. Login
        const loginRes = await fetch('http://127.0.0.1:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'ing.joseramirezgarcia@gmail.com',
                password: 'password123'
            })
        });
        
        const loginData = await loginRes.json();
        const token = loginData.access_token;
        
        if (!token) {
            console.error('❌ Error de Login:', loginData);
            return;
        }
        console.log('✅ Token obtenido correctamente');

        // 2. Hit /sales/stats
        const statsRes = await fetch('http://127.0.0.1:3000/sales/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (statsRes.status === 200) {
            const data = await statsRes.json();
            console.log('✅ /sales/stats: 200 OK');
            console.log('📦 Tickets Hoy:', data.ticketsHoy);
            console.log('📦 Recientes:', data.recentSales.length);
        } else {
            const err = await statsRes.json();
            console.error(`❌ Error ${statsRes.status}:`, err);
        }

        // 3. Hit /reports/financial
        const repRes = await fetch('http://127.0.0.1:3000/reports/financial?startDate=2026-04-04&endDate=2026-04-11', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (repRes.status === 200) {
            console.log('✅ /reports/financial: 200 OK');
        } else {
            const err = await repRes.json();
            console.error(`❌ Error en Reportes ${repRes.status}:`, err);
        }

    } catch (error) {
        console.error('💥 Crash inesperado:', error);
    }
}

testStats();
