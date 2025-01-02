// Save token to local storage
function saveToken(token){
    localStorage.setItem('token', token);
}

// Get token from local storage
function getToken(){
    return localStorage.getItem('token');
}

// logout 
function logout(){
    localStorage.removeItem('token');
    window.location.href = '/sign-in.html';
}

// Check if user is logged in
function isAuthenticated(){
    return !!getToken();
}


// Función global para hacer solicitudes a los endpoints de backend
async function fetchData(url, method = 'GET', body = null, requiresAuth = false) {
    // const headers = {
    //     'Content-Type': 'application/json'
    // };



    if (requiresAuth) {
        const token = getToken();
        console.log('token en mainpage: '+ getToken());
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.error('No token found');
        }
    }

    // const options = {
    //     method,
    //     headers
    // };

    if (body) {
        const body = JSON.stringify(body);
    }


    if (requiresAuth && body!=null) {
        const token = getToken();
        const response = await fetch(url, {
            method: method,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            body: JSON.stringify(body)
        }); 

        return response;
    } else if(requiresAuth && body==null) {
        const token = getToken();
        const response = await fetch(url , {
            method: method,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        });

        return response;
    } else {
        const response = await fetch(url , {
            method: method,
            'Content-Type': 'application/json',
        });

        return response;
    }
}
