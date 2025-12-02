<?php
header('Content-Type: application/json');

// TMDB API Configuration
define('TMDB_API_KEY', '8d0493ce2f980f03b2103f08bfb225a1'); // my api
define('TMDB_BASE_URL', 'https://api.themoviedb.org/3');
define('TMDB_IMAGE_BASE', 'https://image.tmdb.org/t/p/w500');

/**
 * Search for movies using TMDB API
 */
function searchMovies($query) {
    if (empty($query)) {
        return json_encode(['error' => 'Search query is required']);
    }

    $url = TMDB_BASE_URL . '/search/movie?api_key=' . TMDB_API_KEY . '&query=' . urlencode($query);

    try {
        $response = file_get_contents($url);
        $data = json_decode($response, true);

        if (isset($data['results'])) {
            // Format results for frontend
            $movies = [];
            foreach ($data['results'] as $movie) {
                $movies[] = [
                    'id' => $movie['id'],
                    'title' => $movie['title'] ?? 'Unknown',
                    'poster_path' => $movie['poster_path'] ? TMDB_IMAGE_BASE . $movie['poster_path'] : null,
                    'overview' => $movie['overview'] ?? 'No description available',
                    'release_date' => $movie['release_date'] ?? 'N/A',
                    'rating' => $movie['vote_average'] ?? 0
                ];
            }
            return json_encode(['success' => true, 'data' => $movies]);
        } else {
            return json_encode(['error' => 'No results found']);
        }
    } catch (Exception $e) {
        return json_encode(['error' => 'API Error: ' . $e->getMessage()]);
    }
}

/**
 * Get trending movies
 */
function getTrendingMovies() {
    $url = TMDB_BASE_URL . '/trending/movie/week?api_key=' . TMDB_API_KEY;

    try {
        $response = file_get_contents($url);
        $data = json_decode($response, true);

        if (isset($data['results'])) {
            $movies = [];
            foreach (array_slice($data['results'], 0, 6) as $movie) {
                $movies[] = [
                    'id' => $movie['id'],
                    'title' => $movie['title'] ?? 'Unknown',
                    'poster_path' => $movie['poster_path'] ? TMDB_IMAGE_BASE . $movie['poster_path'] : null,
                    'overview' => $movie['overview'] ?? 'No description available',
                    'release_date' => $movie['release_date'] ?? 'N/A',
                    'rating' => $movie['vote_average'] ?? 0
                ];
            }
            return json_encode(['success' => true, 'data' => $movies]);
        } else {
            return json_encode(['error' => 'Could not fetch trending movies']);
        }
    } catch (Exception $e) {
        return json_encode(['error' => 'API Error: ' . $e->getMessage()]);
    }
}

// Handle API requests
$action = $_GET['action'] ?? '';
$query = $_GET['query'] ?? '';

switch ($action) {
    case 'search':
        echo searchMovies($query);
        break;
    case 'trending':
        echo getTrendingMovies();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}
?>
