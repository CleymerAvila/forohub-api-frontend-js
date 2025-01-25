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
    const headers = {
        'Content-Type': 'application/json'
    };

    if (requiresAuth) {
        const token = getToken();
        if (token!=null) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            throw new Error('No token found');
        }
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    // if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    // }
    const data = await response.json();

    return data;
}

async function openModal(dataCourse){
    document.getElementById('myModal').style.display = "block";
    document.getElementById('modal-content').style.display = "block";
    localStorage.setItem('courses', JSON.stringify(dataCourse));
    document.getElementById('courseList').innerHTML = dataCourse.content.map(course => `<option value="${course.courseId}">${course.name}</option>`).join('');
}

function closeModal(){
    document.getElementById('myModal').style.display = "none";
    document.getElementById('modal-content').style.display = "none";
}