document.addEventListener('DOMContentLoaded', function () {
    const token = getToken();
  
    if (token) {
      alert('Ya tienes una cuenta con sesión iniciada.. cierra sesión primero');
      window.location.href = 'forum.html';
      return;
    } 
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role-selection').value.toUpperCase();


    try {
        // const response = await fetch("http://localhost:8080/users", {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }, 
        //     body: JSON.stringify({ name: name, password: password, email: email, profileType: role }),
        // });

        

        const data = await fetchData("http://localhost:8080/users", 'POST', { name: name, password: password, email: email, profileType: role }, false);
        if (data != null) {
            console.log(data);
            alert('Usuario creado con éxito');
            window.location.href = '/sign-in.html';
        } else {
            alert('Error al crear el usuario');
        }
    } catch (error) {
        alert('Error al intentar iniciar sesión');
        console.error(error);
    }
});