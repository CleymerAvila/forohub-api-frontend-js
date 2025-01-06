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
        const data = await fetchData("http://localhost:8080/login", 'POST', { email, password }, false);
        if (data != null) { 
            console.log(data);
            const token = data.token;
            saveToken(token);
            console.log('token guardado: '+ getToken());
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