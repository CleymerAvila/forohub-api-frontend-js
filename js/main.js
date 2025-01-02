

document.addEventListener('DOMContentLoaded', async function () {
    const token = getToken();
    const topicList = document.querySelector('.topicList');
    const topicContent = document.getElementById('topicDetail');
    const topicDetail = document.querySelector('.topicDetails');
    let topicAsArray = {};
    if (!token) {
      window.location.href = 'sign-in.html';
      return;
    }

    try {
        // console.log('token en main.js', token);
        const response = await fetch('http://localhost:8080/topics', {
            method : 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('response', response);

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta de la solicitud OK '+ data);	

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
        // Encontrar el tópico seleccionado

        const response = await fetch(`http://localhost:8080/topics/${topicId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta de la solicitud OK')

            // Limpiar los topics existentes (si es necesario)
            topicList.parentElement.style.display = "none"; // Ocultar lista
            topicContent.style.display = "block"; // Mostrar detalle

            const topic = data;

            console.log(data);

            topicDetail.innerHTML = `
                <h2>${topic.title}</h2>
                <p>Message: ${topic.message}</p>
                <p>Status: <span>${topic.status}</span></p>
                <p>Author name: ${topic.author}</p>
                <p>Course name: ${topic.course}</p>
                <p>Publicado ${new Date(topic.createdAt).toLocaleString()}</p>
            `;


            // Crear el HTML para los topics
        }    
    
        // // Si el tópico existe, mostrar detalles
        // console.log(topic);
        // if (topic !== undefined) {
        // topicContent.innerHTML = `
        //     <h3>${topic.name}</h3>
        //     <p>${topic.status}</p>
        // `;
    
        // // Cambiar de vista
        // topicList.parentElement.style.display = "none"; // Ocultar lista
        // topicDetail.style.display = "block"; // Mostrar detalle
        // alert('Datos obtenidos correctamente');
        // }
    }

    document.getElementById('backToTopics').addEventListener('click', function () {
      topicList.parentElement.style.display = "flex"; // Mostrar lista
      topicDetail.innerHTML = '';
      topicContent.style.display = "none"; // Ocultar detalle

    });
});
