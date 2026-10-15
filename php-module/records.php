<?php
/**
 * ShopAI - Display, Search & Delete Registered Records
 */

require_once 'db.php';

$records = [];
$search = trim($_GET['search'] ?? '');

// Handle delete request
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $delId = intval($_GET['id']);
    if (isset($pdo)) {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $delId]);
        header("Location: records.php?msg=deleted");
        exit;
    }
}

// Fetch records
if (isset($pdo)) {
    if (!empty($search)) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE full_name LIKE :s OR email LIKE :s OR city LIKE :s ORDER BY id DESC");
        $stmt->execute([':s' => "%$search%"]);
        $records = $stmt->fetchAll();
    } else {
        $stmt = $pdo->query("SELECT * FROM users ORDER BY id DESC");
        $records = $stmt->fetchAll();
    }
} else {
    // Mock records for demonstration when MySQL server is not connected
    $records = [
        [
            'id' => 1,
            'full_name' => 'Kavitha Raman',
            'email' => 'kavitha@example.com',
            'phone' => '9876543210',
            'dob' => '1998-05-14',
            'gender' => 'female',
            'city' => 'Chennai',
            'state' => 'Tamil Nadu',
            'category_prefs' => 'Laptops, Audio',
            'budget_range' => '50000-100000',
            'created_at' => '2026-10-12 09:15:00'
        ],
        [
            'id' => 2,
            'full_name' => 'Suresh Kumar',
            'email' => 'suresh.k@example.com',
            'phone' => '9123456789',
            'dob' => '1995-11-20',
            'gender' => 'male',
            'city' => 'Bengaluru',
            'state' => 'Karnataka',
            'category_prefs' => 'Smartphones, Gaming',
            'budget_range' => '25000-50000',
            'created_at' => '2026-10-12 08:30:00'
        ]
    ];
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <title>Registration Records — ShopAI PHP Module</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css">
    <style>
        body { padding: 2rem 0; }
        .table-wrap { overflow-x: auto; background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius); }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        th, td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border); text-align: left; }
        th { background: var(--bg-3); color: var(--text-strong); }
    </style>
</head>
<body>
<div class="container">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div>
            <h2>📋 User Registrations (PHP + MySQL CRUD)</h2>
            <p style="color:var(--text-muted); font-size:0.85rem;">Live records fetched using prepared PDO statements.</p>
        </div>
        <div style="display:flex; gap:0.5rem;">
            <a href="index.html" class="btn btn-primary btn-sm">+ New Registration</a>
            <a href="../index.html" class="btn btn-outline btn-sm">Main Storefront 🛍️</a>
        </div>
    </div>

    <!-- Search Bar -->
    <div class="card mb-3" style="padding:1rem;">
        <form method="GET" action="records.php" style="display:flex; gap:0.5rem;">
            <input type="text" name="search" class="form-control" placeholder="Search by name, email, or city..." value="<?= htmlspecialchars($search) ?>" />
            <button type="submit" class="btn btn-primary">Search</button>
            <?php if (!empty($search)): ?>
                <a href="records.php" class="btn btn-outline">Clear</a>
            <?php endif; ?>
        </form>
    </div>

    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender / DOB</th>
                    <th>Location</th>
                    <th>Preferences</th>
                    <th>Budget</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($records)): ?>
                    <tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">No records found matching your query.</td></tr>
                <?php else: ?>
                    <?php foreach ($records as $r): ?>
                        <tr>
                            <td>#<?= $r['id'] ?></td>
                            <td><strong><?= htmlspecialchars($r['full_name']) ?></strong></td>
                            <td><?= htmlspecialchars($r['email']) ?></td>
                            <td><?= htmlspecialchars($r['phone']) ?></td>
                            <td><?= ucfirst($r['gender']) ?> / <?= htmlspecialchars($r['dob']) ?></td>
                            <td><?= htmlspecialchars($r['city']) ?>, <?= htmlspecialchars($r['state']) ?></td>
                            <td><span class="tag tag-primary"><?= htmlspecialchars($r['category_prefs']) ?></span></td>
                            <td>₹<?= htmlspecialchars($r['budget_range']) ?></td>
                            <td>
                                <a href="records.php?action=delete&id=<?= $r['id'] ?>" onclick="return confirm('Delete this record?')" class="btn btn-danger btn-sm">Delete</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
