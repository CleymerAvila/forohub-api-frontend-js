document.addEventListener('DOMContentLoaded', function () {
    const token = getToken();
  
    if (token) {
      window.location.href = 'forum.html';
      return;
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;


    try {
        const response = await fetch("http://localhost:8080/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        console.log("password is", password);
        console.log(response);
        if (response.ok) {
            const data = await response.json();
            console.log(data.token);
            const token = data.token;
            saveToken(token);
            alert('Usuario iniciado con éxito');
            window.location.href = '/forum.html';
        } else {
            alert('Invalid email or password');
        }
    } catch (error) {
        alert('Error al intentar iniciar sesión');
        console.error(error);
    }
});