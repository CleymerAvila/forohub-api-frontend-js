import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.esm.js';
const token = getToken();
const topicList = document.querySelector('.topicList');
const topicContent = document.getElementById('topicDetail');
const topicDetail = document.querySelector('.topicDetails');
const filterButtons = document.querySelectorAll('.toggle-btn');

let courses = [];
// Autor: CLEYMER
// Fecha: 2023-03-01
document.addEventListener('DOMContentLoaded', async function () {
    if (!token) {
        window.location.href = 'sign-in.html';
        return;
    }

    try {
        
        const selectedCategory = document.getElementById('category').value;
        // Si la categoría es "all", se obtienen todos los tópicos
        if (selectedCategory === 'all') {
            const data = await fetchData('http://localhost:8080/topics', 'GET', null, true);
            if(data != null){ 
                showTopicList(data);
                console.log('Datos obtenidos correctamente');
            } else {
                alert('No autorizado');
            }
        } else {
            // Si la categoría no es "all", se obtienen los tópicos de esa categoría
            const data = await fetchData(`http://localhost:8080/topics/category/${selectedCategory}`, 'GET', null, true);
            showTopicList(data);
        }
        console.log('Categoria seleccionada: ', selectedCategory);
    } catch (error) {
        console.error('Error:', error);
    }
    document.getElementById('logout').addEventListener('click', function () {
        logout();
    });

    // Mostrar detalle de un tópico
    
    document.getElementById('backToTopics').addEventListener('click', function () {
        topicList.parentElement.style.display = "flex"; // Mostrar lista
        topicDetail.innerHTML = '';
        topicContent.style.display = "none"; // Ocultar detalle
        window.location.href = 'forum.html';
    });
});

function showTopicList(data){
    // Limpiar los topics existentes (si es necesario)
    topicList.innerHTML = '';

    console.log(data);

    // Crear el HTML para los topics
    const topicsHTML = data.content.map(topic => `
        <div class="topic" data-id="${topic.topicId}">
            <h3>${topic.title}</h3>
            <p>Estado: <span>${topic.status}</span></p>
            <p>Autor: ${topic.authorName}</p>
            <p>Curso: ${topic.courseName}</p>
            <p>Publicado ${new Date(topic.createdAt).toLocaleString()}</p>
        </div>
    `).join('');

    topicList.innerHTML = topicsHTML;

    document.querySelectorAll('.topic').forEach(item => {
        console.log('entro en el evento dfjasd')
        item.addEventListener('click', () => {
            const topicId = item.getAttribute('data-id');
            showTopicDetail(topicId);
        });
    });
}
async function showTopicDetail(topicId) {

    const data = await fetchData(`http://localhost:8080/topics/${topicId}`, 'GET', null, true);

    if (data != null) {

        // Limpiar los topics existentes (si es necesario)
        topicList.parentElement.style.display = "none"; // Ocultar lista
        topicContent.style.display = "block"; // Mostrar detalle

        topicDetail.innerHTML = `
            <h2>${data.title}</h2>
            <p>Mensaje: ${data.message}</p>
            <p>Estado: <span>${data.status}</span></p>
            <p>Autor: ${data.author}</p>
            <p>Curso: ${data.course}</p>
            <p>Publicado ${new Date(data.createdAt).toLocaleString()}</p>
        `;
    }
}

document.getElementById('btn-confirm').addEventListener('click', async function () {

    const decodedToken = jwt_decode(token);
    const userId = decodedToken.id;

    const title = document.getElementById('title').value;
    const message = document.getElementById('message').value;
    let courseId = document.getElementById('courseList').value;

    console.log('Id del curso: ', courseId);

    const newTopic = {
        title: title,
        message: message,
        authorId: userId,
        courseId: courseId
    };

    try {
        const data = await fetchData('http://localhost:8080/topics', 'POST', newTopic, true);
        if (data.topicId != null) {
            topicList.parentElement.style.display = "none"; // Ocultar lista
            topicContent.style.display = "block"; // Mostrar detalle
            showTopicDetail(data.topicId);
            clearForm();
            document.getElementById('info').style.display = 'block';
            document.getElementById('info').style.color = 'green';
            document.getElementById('info').innerHTML = 'Tópico creado correctamente';
            alert('Tópico creado correctamente');
            closeModal();
        } else {
            alert('Error al crear el tópico: ', data);
            closeModal();
            document.getElementById('info').style.color = 'red';
            document.getElementById('info').innerHTML = 'Error al crear el tópico';
        }
    } catch (error) {
        alert('Error al intentar crear el tópico');
        console.error(error);
        clearForm();
        const infoParagraph = document.getElementById('info');
        infoParagraph.style.display = 'block';
        infoParagraph.innerHTML = `&#8505; Error al intentar crear el tópico`; 
        infoParagraph.style.color = 'red';
    }

    function clearForm() {
        document.getElementById('title').value = '';
        document.getElementById('message').value = '';
    }
});

document.getElementById('category').addEventListener('change', async function () {
    const category = document.getElementById('category').value;
    console.log('Categoría seleccionada: ', category);
    if (category === 'all') {
        const data = await fetchData('http://localhost:8080/topics', 'GET', null, true);
        showTopicList(data);
    } else {
        const data = await fetchData(`http://localhost:8080/topics/category/${category}`, 'GET', null, true);
        showTopicList(data);
        fetchData(`http://localhost:8080/topics?category=${category}`, 'GET', null, true);
    }
});

// Seleccionamos elementos del DOM
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarCollapse');

// Evento para abrir y cerrar la sidebar
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');  // Alterna la clase 'active'
    
    // Cambia el icono del botón dependiendo del estado
    if (sidebar.classList.contains('active')) {
        toggleBtn.innerHTML = '|||';  // Icono de cerrar
    } else {
        toggleBtn.innerHTML = '☰';  // Icono de menú
    }
});

// Evento para abrir y cerrar la sidebar
document.getElementById('btn-create-topic').addEventListener('click', async () => {
    const dataCourse = await fetchData('http://localhost:8080/courses', 'GET', null, true);
    courses = dataCourse.content;
    openModal(dataCourse);
});

// Filtros de topicos

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Si el botón ya está activo, lo desactiva
        if (button.classList.contains('active')) {
            button.classList.remove('active');
            console.log('Filtro deseleccionado');
        } else {
            // Desactivar cualquier botón previamente activo
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Activar el botón seleccionado
            button.classList.add('active');
            console.log('Filtro seleccionado:', button.getAttribute('data-filter'));
        }

        // Aquí podrías hacer una llamada a la API o filtrar elementos
    });
});
