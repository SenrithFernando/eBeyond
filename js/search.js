// Search movies and display results
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.fav-search-input');
    const favGrid = document.querySelector('.row.g-3');

    if (!searchInput) return;

    // Search on input with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length < 2) {
            return; // Don't search for very short queries
        }

        searchTimeout = setTimeout(function() {
            searchMovies(query);
        }, 500);
    });

    /**
     * Fetch movies from API
     */
    function searchMovies(query) {
        fetch(`./php/api.php?action=search&query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayResults(data.data);
                } else {
                    showMessage(data.error || 'No results found');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('Error fetching movies. Please check the API key in php/api.php');
            });
    }

    /**
     * Display movie results as cards
     */
    function displayResults(movies) {
        if (!favGrid) return;

        // Clear existing cards
        favGrid.innerHTML = '';

        if (movies.length === 0) {
            showMessage('No movies found');
            return;
        }

        movies.forEach(movie => {
            const card = createMovieCard(movie);
            favGrid.appendChild(card);
        });
    }

    /**
     * Create a movie card element
     */
    function createMovieCard(movie) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 col-12';

        const posterImage = movie.poster_path 
            ? movie.poster_path 
            : 'https://via.placeholder.com/300x450?text=No+Poster';

        const shortDescription = (movie.overview || '').substring(0, 120) + '...';

        col.innerHTML = `
            <article class="fav-card h-100">
                <button class="fav-close-btn" type="button" data-movie-id="${movie.id}">✕</button>
                <div class="fav-image-wrapper">
                    <img src="${posterImage}" alt="${movie.title}" class="fav-img" />
                </div>
                <div class="fav-body">
                    <h3 class="fav-title">${movie.title}</h3>
                    <p class="fav-text">
                        ${shortDescription}
                    </p>
                    <small class="d-block mt-2" style="color: #999;">⭐ ${movie.rating.toFixed(1)} | ${movie.release_date}</small>
                </div>
            </article>
        `;

        // Add close button functionality
        const closeBtn = col.querySelector('.fav-close-btn');
        closeBtn.addEventListener('click', function() {
            col.remove();
        });

        return col;
    }

    /**
     * Show status message
     */
    function showMessage(message) {
        if (!favGrid) return;

        favGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    ${message}
                </div>
            </div>
        `;
    }

    // Load trending movies on page load
    loadTrendingMovies();

    /**
     * Load trending movies by default
     */
    function loadTrendingMovies() {
        fetch('./php/api.php?action=trending')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayResults(data.data);
                }
            })
            .catch(error => console.error('Error loading trending:', error));
    }
});
