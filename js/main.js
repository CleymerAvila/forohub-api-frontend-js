import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.esm.js';
const token = getToken();
const topicList = document.querySelector('.topicList');
const topicContent = document.getElementById('topicDetail');
const topicDetail = document.querySelector('.topicDetails');
// Autor: CLEYMER
// Fecha: 2023-03-01
document.addEventListener('DOMContentLoaded', async function () {
    let topicAsArray = {};
    if (!token) {
        window.location.href = 'sign-in.html';
        return;
    }

    try {
        const data = await fetchData('http://localhost:8080/topics', 'GET', null, true);

        if (data != null) {
            console.log('Respuesta de la solicitud OK ' + data);

            // Limpiar los topics existentes (si es necesario)
            topicList.innerHTML = '';

            console.log(data);

            // Crear el HTML para los topics
            const topicsHTML = data.content.map(topic => `
                <div class="topic" data-id="${topic.topicId}">
                    <h3>${topic.title}</h3>
                    <p>Status: <span>${topic.status}</span></p>
                    <p>Author name: ${topic.authorName}</p>
                    <p>Course name: ${topic.courseName}</p>
                    <p>Publicado ${new Date(topic.createdAt).toLocaleString()}</p>
                </div>
            `).join('');

            topicAsArray = data.content;

            // Asignar el HTML al contenedor principal
            topicList.innerHTML = topicsHTML;

            document.querySelectorAll('.topic').forEach(item => {
                console.log('entro en el evento dfjasd')
                item.addEventListener('click', () => {
                    const topicId = item.getAttribute('data-id');
                    showTopicDetail(topicId);
                });
            });

            // alert('Datos obtenidos correctamente');
        } else {
            alert('No autorizado');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    document.getElementById('logout').addEventListener('click', function () {
        logout();
    });

    // Mostrar detalle de un tópico
    async function showTopicDetail(topicId) {

        const data = await fetchData(`http://localhost:8080/topics/${topicId}`, 'GET', null, true);

        if (data != null) {

            // Limpiar los topics existentes (si es necesario)
            topicList.parentElement.style.display = "none"; // Ocultar lista
            topicContent.style.display = "block"; // Mostrar detalle

            topicDetail.innerHTML = `
                <h2>${data.title}</h2>
                <p>Message: ${data.message}</p>
                <p>Status: <span>${data.status}</span></p>
                <p>Author name: ${data.author}</p>
                <p>Course name: ${data.course}</p>
                <p>Publicado ${new Date(data.createdAt).toLocaleString()}</p>
            `;
        }
    }

    document.getElementById('backToTopics').addEventListener('click', function () {
        topicList.parentElement.style.display = "flex"; // Mostrar lista
        topicDetail.innerHTML = '';
        topicContent.style.display = "none"; // Ocultar detalle

    });
});

document.getElementById('btn-confirm').addEventListener('click', async function () {

    const decodedToken = jwt_decode(token);
    const userId = decodedToken.id;

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const course = document.getElementById('course').value;

    const newTopic = {
        title: title,
        message: description,
        authorId: userId,
        courseId: course
    };

    try {
        const data = await fetchData('http://localhost:8080/topics', 'POST', newTopic, true);
        if (data.topicId != null) {
            topicList.parentElement.style.display = "none"; // Ocultar lista
            topicContent.style.display = "block"; // Mostrar detalle
            topicDetail.innerHTML = `
                <h2>${data.title}</h2>
                <p>Message: ${data.message}</p>
                <p>Status: <span>${data.status}</span></p>
                <p>Course name: ${data.course}</p>
                <p>Publicado ${new Date(data.createdAt).toLocaleString()}</p>
            `;
            clearForm();
            document.getElementById('info').style.color = 'green';
            document.getElementById('info').innerHTML = 'Tópico creado correctamente';
        } else {
            alert('Error al crear el tópico: ', data);
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
        document.getElementById('description').value = '';
        document.getElementById('course').value = '';
    }
});
