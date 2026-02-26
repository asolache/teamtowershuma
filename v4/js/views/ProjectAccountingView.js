document.addEventListener('click', (e) => {
    // Escuchar el clic en el botón del menú desplegable
    if (e.target.id === 'btn-toggle-theme') {
        e.preventDefault();
        
        // Cargar el estado global
        const state = JSON.parse(localStorage.getItem('tt_sos_state')) || {};
        if (!state.config) state.config = {};
        
        // Cambiar el tema
        const nuevoTema = state.config.theme === 'light' ? 'dark' : 'light';
        state.config.theme = nuevoTema;
        
        // Guardar y aplicar al <body>
        localStorage.setItem('tt_sos_state', JSON.stringify(state));
        document.body.setAttribute('data-theme', nuevoTema);
        
        alert(`Vista cambiada al modo: ${nuevoTema.toUpperCase()}`);
    }
});
