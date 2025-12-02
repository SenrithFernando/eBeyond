<?php
    $server = "localhost";
    $un = "root";
    $pw = "";
    $db = "eBeyonds";

    // MySQLi Connection
    $conn = mysqli_connect($server, $un, $pw, $db);
    
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }
    
    // Set charset to utf8mb4
    mysqli_set_charset($conn, "utf8mb4");
?>