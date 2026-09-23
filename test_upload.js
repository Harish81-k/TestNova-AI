async function testUpload() {
  try {
    const registerRes = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser_upload2',
        email: 'test_upload2@test.com',
        password: 'password123'
      })
    });
    
    let token = null;
    if (!registerRes.ok) {
      if (registerRes.status === 400) {
        // Might already exist, try login
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test_upload2@test.com',
            password: 'password123'
          })
        });
        const loginData = await loginRes.json();
        token = loginData.token;
      } else {
        console.log('Signup failed', registerRes.status, await registerRes.text());
        return;
      }
    } else {
      const regData = await registerRes.json();
      token = regData.token;
    }
    
    console.log('Got token:', token ? 'yes' : 'no');

    const putRes = await fetch('http://localhost:5000/api/users/profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        username: 'testuser_upload2',
        bio: 'Test bio',
        profilePic: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      })
    });

    if (!putRes.ok) {
      console.log('PUT failed', putRes.status, await putRes.text());
      return;
    }
    const putData = await putRes.json();
    console.log('PUT response:', putData);
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testUpload();
