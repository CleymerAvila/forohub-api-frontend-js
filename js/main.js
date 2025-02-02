import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.esm.js';
const token = getToken();
const topicList = document.querySelector('.topicList');
const topicContent = document.getElementById('topicDetail');
const topicDetail = document.querySelector('.topicInfo');
const filterButtons = document.querySelectorAll('.toggle-btn');
const topicReply = document.querySelector('.topic-replies');    

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
    
    document.getElementById('back-to-topics-btn').addEventListener('click', function () {
        topicList.parentElement.style.display = "flex"; // Mostrar lista
        topicDetail.innerHTML = '';
        topicContent.style.display = "none"; // Ocultar detalle
        window.location.href = 'forum.html';
    });
});

function showTopicList(data, status=''){
    // Limpiar los topics existentes (si es necesario)
    topicList.innerHTML = '';

    console.log(data);

    if(status === ''){
        // Crear el HTML para los topics
        const topicsHTML = data.content.map(topic => renderTopicItem(topic)).join('');
        topicList.innerHTML = topicsHTML;
    } else {
        const topicsHTML = data.content.filter(topic => topic.status === status)
        .map(topic => renderTopicItem(topic)).join('');
        topicList.innerHTML = topicsHTML;
    }


    document.querySelectorAll('.topic').forEach(item => {
        console.log('entro en el evento dfjasd')
        item.addEventListener('click', () => {
            const topicId = item.getAttribute('data-id');
            showTopicDetail(topicId);
        });
    });
}

function renderTopicItem(topic) {
    return `
        <div class="topic" data-id="${topic.topicId}">
            <div id="topic-date">
                <p>${new Date(topic.createdAt).toLocaleDateString()}</p>      
            </div>
            <div id="topic-header">
                <h3>${topic.title}</h3>
                <p><span>${topic.courseName}</span></p>
            </div>
            <div id="topic-body">
                <p>Por <span id="topic-author-name">${topic.authorName}</span></p>  
                <p>Estado: <span>${topic.status}</span></p>
            </div>
        </div>
    `;
}
async function showTopicDetail(topicId) {

    const data = await fetchData(`http://localhost:8080/topics/${topicId}`, 'GET', null, true);

    if (data != null) {

        // Limpiar los topics existentes (si es necesario)
        topicList.parentElement.style.display = "none"; // Ocultar lista
        topicContent.style.display = "block"; // Mostrar detalle

        topicDetail.innerHTML = `
            <div class="cant-topic">
                ${data.replies.length === 1 
                    ?
                     `<h1>${data.replies.length}</h1>
                      <p>Respuesta</p>` 
                    : `<h1>${data.replies.length}</h1>
                       <p>Respuestas</p>`
                }
            </div>
            <div class="topicText">
                <div class="topic-details-header">
                    <h2>${data.title}</h2>
                    <p>Publicado el ${new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
                <p><span id="course-name">Referente al Curso ${data.course}</span></p> 
                <p>${data.message}</p>
                <div id="topic-details-other-info">
                    <p>Por <span id="author-name">${data.author}</span></p> 
                    <p>Estado: <span style=color:green>${data.status}</span></p>
                </div>
            </div>
        `;

        document.getElementById('btn-confirm-response').addEventListener('click', async function (){
            const decodedToken = jwt_decode(token);
            const message = document.getElementById('message-response').value;
            const solution = document.getElementById('solution-response').value;
            const authorId = decodedToken.id;
        
            const newReply = {
                message: message,
                topicId: data.topicId,
                authorId: authorId,
                solution: solution
            };
        
            console.log('Nueva respuesta: ', newReply);

            try {
                const data = await fetchData('http://localhost:8080/replies', 'POST', newReply, true);
                if (data.replyId != null) {
                    console.log('Respuesta creada correctamente');
                    document.getElementById('message-response').value = '';
                    document.getElementById('solution-response').value = '';
                    alert('Respuesta creada correctamente');
                    showTopicDetail(data.topicId);
                    document.querySelector('.response').style.display = 'none';
                } else {
                    alert('Error al crear la respuesta');
                }
            } catch (error) {
                alert('Error al intentar crear la respuesta');
                console.error(error);
            }
        });
        // Mostrar respuestas
        const replies = data.replies;
        console.log('Respuestas: '+ replies);
        if(replies.length === 0){
            document.getElementById('topic-label').innerHTML = 'No hay respuestas';
        } else {
            document.getElementById('topic-label').innerHTML = 'Respuestas';        
        }
        const repliesHTML = replies.map(reply => `
            <div class="reply">
                <div class="reply-header">
                    <p>Por <span>${reply.authorName}</span></p>
                    <p>Publicado el ${new Date(reply.createdAt).toLocaleString()}</p>
                </div>
                <div class="reply-body">
                    <div id="reply-message">
                        <p>${reply.message}</p>
                    </div>
                    <p><span>Solución: </span></p>
                    <div id="reply-solution">
                        <p>${reply.solution}</p>
                    </div>
                </div>
            </div>
        `).join('');
        topicReply.innerHTML = repliesHTML;
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
    button.addEventListener('click', async() => {
        let statusSelected = '';
        // Si el botón ya está activo, lo desactiva
        if (button.classList.contains('active')) {
            button.classList.remove('active');
            console.log('Filtro deseleccionado');
            const data = await fetchData(`http://localhost:8080/topics`, 'GET', null, true);
            showTopicList(data);
        } else {
            // Desactivar cualquier botón previamente activo
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Activar el botón seleccionado
            button.classList.add('active');
            console.log('Filtro seleccionado:', button.getAttribute('data-filter'));
            statusSelected = button.getAttribute('data-filter');

            const data = await fetchData(`http://localhost:8080/topics`, 'GET', null, true);
            showTopicList(data, statusSelected);
        }

        // Aquí podrías hacer una llamada a la API o filtrar elementos
    });
});


// Función para mostrar el formulario de respuesta
document.querySelector('.topicResponseBtn').addEventListener('click', function () {
    document.querySelector('.response').style.display = 'block';
});