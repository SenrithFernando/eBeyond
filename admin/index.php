<?php
include "../conn/dbconn.php";

// Fetch all messages (newest first)
$getmsg = "SELECT * FROM contact_messages ORDER BY created_at DESC";
$result = mysqli_query($conn, $getmsg);
$messages = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $messages[] = $row;
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Panel – Contact Messages</title>

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <link rel="stylesheet" href="../css/admin/massage.css">
</head>
<body>

<div class="d-flex">

    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="brand">Cinema Admin</div>
        <nav>
            <a href="#">Dashboard</a>
            <a href="index.php" class="active">Contact Messages</a>
            <a href="#">Users</a>
            <a href="#">Settings</a>
        </nav>
    </aside>

    <!-- Main content -->
    <div class="content-wrap">

        <!-- Top bar -->
        <header class="topbar">
            <div class="page-header-text">Contact Messages</div>
            <div>
                <span class="me-3">Admin</span>
                <a href="#" class="btn btn-sm btn-outline-light">Logout</a>
            </div>
        </header>

        <!-- Page body -->
        <main class="p-4">
            <div class="card card-table shadow-sm">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <strong>All Messages</strong>
                        <span class="text-muted ms-2">(<?php echo count($messages); ?>)</span>
                    </div>
                    <div class="d-flex gap-2">
                        <input type="text" class="form-control form-control-sm" placeholder="Search by name or email">
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-sm mb-0">
                        <thead class="table-light">
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Telephone</th>
                            <th>Message</th>
                            <th>Terms</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th class="text-end">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php if (empty($messages)): ?>
                            <tr>
                                <td colspan="9" class="text-center py-4 text-muted">
                                    No messages yet.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($messages as $index => $msg): ?>
                                <tr>
                                    <td><?php echo $index + 1; ?></td>
                                    <td><?php echo htmlspecialchars($msg['first_name'] . ' ' . $msg['last_name']); ?></td>
                                    <td><?php echo htmlspecialchars($msg['email']); ?></td>
                                    <td><?php echo htmlspecialchars($msg['telephone'] ?? ''); ?></td>
                                    <td class="message-cell" title="<?php echo htmlspecialchars($msg['message']); ?>">
                                        <?php echo htmlspecialchars($msg['message']); ?>
                                    </td>
                                    <td>
                                        <?php echo $msg['agreed_terms'] ? 'Yes' : 'No'; ?>
                                    </td>
                                    <td><?php echo date('Y-m-d H:i', strtotime($msg['created_at'])); ?></td>
                                    <td>
                                        <?php if ($msg['is_read']): ?>
                                            <span class="status-badge status-read">Read</span>
                                        <?php else: ?>
                                            <span class="status-badge status-new">New</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-end">
                                        <button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#messageModal" 
                                                onclick="loadMessage(<?php echo $msg['id']; ?>, '<?php echo htmlspecialchars($msg['first_name']); ?>', '<?php echo htmlspecialchars($msg['last_name']); ?>', '<?php echo htmlspecialchars($msg['email']); ?>', '<?php echo htmlspecialchars($msg['telephone'] ?? ''); ?>', '<?php echo htmlspecialchars($msg['message']); ?>', '<?php echo $msg['agreed_terms'] ? 'Yes' : 'No'; ?>', '<?php echo date('Y-m-d H:i:s', strtotime($msg['created_at'])); ?>')">View</button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<!-- Message Modal -->
<div class="modal fade" id="messageModal" tabindex="-1" aria-labelledby="messageModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-light border-0">
        <h5 class="modal-title" id="messageModalLabel">Message Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label fw-bold text-muted">First Name</label>
            <p id="modalFirstName" class="text-dark"></p>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-bold text-muted">Last Name</label>
            <p id="modalLastName" class="text-dark"></p>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label fw-bold text-muted">Email</label>
            <p id="modalEmail" class="text-dark"></p>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-bold text-muted">Telephone</label>
            <p id="modalTelephone" class="text-dark"></p>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label fw-bold text-muted">Message</label>
          <div class="p-3 bg-light rounded" style="min-height: 120px;">
            <p id="modalMessage" class="text-dark" style="white-space: pre-wrap;"></p>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <label class="form-label fw-bold text-muted">Agreed to Terms</label>
            <p id="modalTerms" class="text-dark"></p>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-bold text-muted">Received</label>
            <p id="modalDate" class="text-dark"></p>
          </div>
        </div>
      </div>
      <div class="modal-footer border-top bg-light">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>



<script>
  function loadMessage(id, firstName, lastName, email, telephone, message, terms, date) {
    document.getElementById('modalFirstName').textContent = firstName;
    document.getElementById('modalLastName').textContent = lastName;
    document.getElementById('modalEmail').textContent = email;
    document.getElementById('modalTelephone').textContent = telephone || 'N/A';
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modalTerms').textContent = terms;
    document.getElementById('modalDate').textContent = date;
  }
</script>
</body>
</html>