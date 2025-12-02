<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Cinema Navbar</title>

  <!-- Bootstrap 5 -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <!-- Custom CSS -->
  <link rel="stylesheet" href="./css/nav.css">

  
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark top-navbar">
  <div class="container-fluid">
    <!-- Logo -->
    <a class="navbar-brand d-flex align-items-center" href="#">
      <div class="logo-icon"></div>
      <span class="brand-text">Logoipsum</span>
    </a>

    <!-- Toggle Button -->
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Nav Links -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link active" href="#">HOME</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">OUR SCREENS</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">SCHEDULE</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">MOVIE LIBRARY</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">LOCATION &amp; CONTACT</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

</body>
</html>
