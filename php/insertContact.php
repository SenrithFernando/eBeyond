<?php
// Start session and include database connection
session_start();
include "../conn/dbconn.php";

// PHPMailer - optional SMTP email notification (guarded include)
$phpmailer_available = false;
// Prefer Composer autoload if present
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
    $phpmailer_available = class_exists('PHPMailer\\PHPMailer\\PHPMailer');
} elseif (file_exists(__DIR__ . '/phpmailer/src/Exception.php') && file_exists(__DIR__ . '/phpmailer/src/PHPMailer.php') && file_exists(__DIR__ . '/phpmailer/src/SMTP.php')) {
    require_once __DIR__ . '/phpmailer/src/Exception.php';
    require_once __DIR__ . '/phpmailer/src/PHPMailer.php';
    require_once __DIR__ . '/phpmailer/src/SMTP.php';
    $phpmailer_available = class_exists('PHPMailer\\PHPMailer\\PHPMailer');
} else {
    $phpmailer_available = false;
    error_log('PHPMailer not found; email sending disabled.');
}

// SMTP configuration - update with your credentials
$SMTP_ENABLED = true; // set to false to disable SMTP sending
$SMTP_HOST = 'smtp.gmail.com';
$SMTP_PORT = 465; // 587 (tls) or 465 (ssl)
$SMTP_USERNAME = 'info.mail.senrith@gmail.com'; // replace
$SMTP_PASSWORD = 'pidkyv5Vipbapodgyg'; // replace (app password)
$SMTP_SECURE = 'ssl'; // 'tls' or 'ssl'

$FROM_EMAIL = 'info.mail.senrith@gmail.com';
$FROM_NAME = 'eBeyonds Website';
$ADMIN_EMAIL = 'rihansenrith@gmail.com';


// Set response header as JSON
header('Content-Type: application/json');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Initialize error array
$errors = [];

// Get POST data
$firstName = isset($_POST['first_name']) ? trim($_POST['first_name']) : '';
$lastName = isset($_POST['last_name']) ? trim($_POST['last_name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$telephone = isset($_POST['telephone']) ? trim($_POST['telephone']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$agreedTerms = isset($_POST['agreed_terms']) ? 1 : 0;

// ===== BACKEND VALIDATION =====

// Validate First Name
if (empty($firstName)) {
    $errors['first_name'] = 'First name is required';
} elseif (strlen($firstName) < 2) {
    $errors['first_name'] = 'First name must be at least 2 characters';
} elseif (strlen($firstName) > 100) {
    $errors['first_name'] = 'First name cannot exceed 100 characters';
} elseif (!preg_match('/^[a-zA-Z\s\-\']+$/', $firstName)) {
    $errors['first_name'] = 'First name can only contain letters, spaces, hyphens, and apostrophes';
}

// Validate Last Name
if (empty($lastName)) {
    $errors['last_name'] = 'Last name is required';
} elseif (strlen($lastName) < 2) {
    $errors['last_name'] = 'Last name must be at least 2 characters';
} elseif (strlen($lastName) > 100) {
    $errors['last_name'] = 'Last name cannot exceed 100 characters';
} elseif (!preg_match('/^[a-zA-Z\s\-\']+$/', $lastName)) {
    $errors['last_name'] = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
}

// Validate Email
if (empty($email)) {
    $errors['email'] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Invalid email format';
} elseif (strlen($email) > 150) {
    $errors['email'] = 'Email cannot exceed 150 characters';
}

// Validate Telephone (optional but if provided, must be valid)
if (!empty($telephone)) {
    if (strlen($telephone) != 10) {
        $errors['telephone'] = 'Telephone only 10  characters';
    } elseif (!preg_match('/^[0-9\s\-\+\(\)]+$/', $telephone)) {
        $errors['telephone'] = 'Telephone can only contain numbers, spaces, hyphens, plus sign, and parentheses';
    }
}

// Validate Message
if (empty($message)) {
    $errors['message'] = 'Message is required';
} elseif (strlen($message) < 10) {
    $errors['message'] = 'Message must be at least 10 characters';
} elseif (strlen($message) > 5000) {
    $errors['message'] = 'Message cannot exceed 5000 characters';
}

// Validate Terms Agreement
if (!$agreedTerms) {
    $errors['agreed_terms'] = 'You must agree to the Terms & Conditions';
}

// If validation errors exist, return them
if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please correct the following errors:',
        'errors' => $errors
    ]);
    exit;
}


// Apply additional sanitization
$firstName = htmlspecialchars($firstName, ENT_QUOTES, 'UTF-8');
$lastName = htmlspecialchars($lastName, ENT_QUOTES, 'UTF-8');
$email = strtolower(htmlspecialchars($email, ENT_QUOTES, 'UTF-8'));
$telephone = htmlspecialchars($telephone, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// Check for duplicate submission (same email within last 5 minutes)
$checkDuplicateStmt = $conn->prepare("SELECT id FROM contact_messages WHERE email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)");

if (!$checkDuplicateStmt) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}

$checkDuplicateStmt->bind_param('s', $email);
$checkDuplicateStmt->execute();
$duplicateResult = $checkDuplicateStmt->get_result();

if ($duplicateResult->num_rows > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'A message from this email was recently sent. Please wait a few minutes before sending another message.'
    ]);
    $checkDuplicateStmt->close();
    exit;
}

$checkDuplicateStmt->close();

// INSERT INTO DATABASE 
$stmt = $conn->prepare("INSERT INTO contact_messages (first_name, last_name, email, telephone, message, agreed_terms, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)");

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit;
}

// Bind parameters (s=string, i=integer)
$stmt->bind_param('sssssi', $firstName, $lastName, $email, $telephone, $message, $agreedTerms);

// Execute query
if ($stmt->execute()) {
    $messageId = $stmt->insert_id;

    // Attempt to send admin notification via PHPMailer (only if available)
    $mailSent = false;
    $mailError = '';

    if ($phpmailer_available) {
        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

            if ($SMTP_ENABLED && !empty($SMTP_HOST)) {
                $mail->isSMTP();
                $mail->Host = $SMTP_HOST;
                $mail->SMTPAuth = true;
                $mail->Username = $SMTP_USERNAME;
                $mail->Password = $SMTP_PASSWORD;
                $mail->SMTPSecure = $SMTP_SECURE;
                $mail->Port = $SMTP_PORT;
            } else {
                $mail->isMail();
            }

            $mail->setFrom($FROM_EMAIL, $FROM_NAME);
            $mail->addAddress($ADMIN_EMAIL);
            $mail->isHTML(true);
            $mail->Subject = "New contact message from $firstName $lastName";

            $body = "<div style=\"font-family:system-ui,Arial,sans-serif;color:#333;\">" .
                "<h3>New contact message</h3>" .
                "<p><strong>Name:</strong> {$firstName} {$lastName}</p>" .
                "<p><strong>Email:</strong> {$email}</p>" .
                "<p><strong>Telephone:</strong> " . (!empty($telephone) ? $telephone : 'N/A') . "</p>" .
                "<p><strong>Message:</strong><br>" . nl2br($message) . "</p>" .
                "<p style=\"font-size:12px;color:#666;\">Received: " . date('Y-m-d H:i:s') . "</p>" .
                "</div>";

            $mail->Body = $body;
            $mail->send();
            $mailSent = true;
        } catch (\Exception $e) {
            $mailError = (isset($mail) && !empty($mail->ErrorInfo)) ? $mail->ErrorInfo : $e->getMessage();
            error_log('PHPMailer error: ' . $mailError);
        }
    } else {
        $mailSent = false;
        $mailError = 'PHPMailer not available on server';
        error_log('PHPMailer not available - email skipped');
    }

    // Success response includes mail status
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Your message has been saved.' . ($mailSent ? ' Notification email sent.' : ' Message saved, but failed to send notification email.'),
        'messageId' => $messageId,
        'mailSent' => $mailSent,
        'mailError' => $mailError
    ]);

    // Optional: Log the submission
    error_log("Contact form submitted - ID: $messageId, Email: $email, Date: " . date('Y-m-d H:i:s'));
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error sending message: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>