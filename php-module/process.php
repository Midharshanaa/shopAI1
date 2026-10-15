<?php
/**
 * ShopAI - Server-Side Form Processing & Record Creation
 */

require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$errors = [];

// 1. Sanitize & Validate Text Inputs
$full_name = trim(filter_input(INPUT_POST, 'fullName', FILTER_SANITIZE_SPECIAL_CHARS));
$email     = trim(filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL));
$phone     = trim(filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_SPECIAL_CHARS));
$dob       = trim($_POST['dob'] ?? '');
$gender    = trim($_POST['gender'] ?? '');
$pref_time = trim($_POST['prefTime'] ?? '');
$address   = trim($_POST['address'] ?? '');
$city      = trim($_POST['city'] ?? '');
$state     = trim($_POST['state'] ?? '');
$country   = trim($_POST['country'] ?? 'IN');
$budget    = trim($_POST['budget'] ?? '');
$notes     = trim($_POST['userNotes'] ?? '');
$password  = $_POST['password'] ?? '';

$categories = isset($_POST['categories']) ? implode(', ', (array)$_POST['categories']) : '';
$brands     = isset($_POST['brands']) ? implode(', ', (array)$_POST['brands']) : '';

if (empty($full_name) || strlen($full_name) < 2) {
    $errors[] = 'Full name must be at least 2 characters.';
}
if (!$email) {
    $errors[] = 'Valid email address is required.';
}
if (empty($phone) || !preg_match('/^[6-9][0-9]{9}$/', $phone)) {
    $errors[] = 'Phone number must be a 10-digit Indian mobile number.';
}
if (empty($dob)) {
    $errors[] = 'Date of birth is required.';
}
if (empty($gender)) {
    $errors[] = 'Gender selection is required.';
}
if (empty($password) || strlen($password) < 8) {
    $errors[] = 'Password must be at least 8 characters.';
}

// 2. Handle Profile Picture Upload
$profile_pic_path = null;
if (isset($_FILES['profilePic']) && $_FILES['profilePic']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['profilePic']['tmp_name'];
    $fileName = $_FILES['profilePic']['name'];
    $fileSize = $_FILES['profilePic']['size'];
    $fileType = $_FILES['profilePic']['type'];
    $fileNameCmps = explode(".", $fileName);
    $fileExtension = strtolower(end($fileNameCmps));

    $allowedfileExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (in_array($fileExtension, $allowedfileExtensions)) {
        if ($fileSize <= 2 * 1024 * 1024) {
            $uploadFileDir = './uploads/';
            if (!is_dir($uploadFileDir)) {
                mkdir($uploadFileDir, 0755, true);
            }
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $dest_path = $uploadFileDir . $newFileName;
            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                $profile_pic_path = $dest_path;
            }
        } else {
            $errors[] = 'Uploaded image must be under 2MB.';
        }
    } else {
        $errors[] = 'Upload valid image type (JPG, PNG, WebP).';
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// 3. Database Insertion or Simulated Storage
$password_hash = password_hash($password, PASSWORD_BCRYPT);

if (isset($pdo)) {
    try {
        $pdo->beginTransaction();

        $sql = "INSERT INTO registration__details 
                (full_name, email, phone, dob, gender, pref_time, address, city, state, country, preferred_categories, preferred_brands, budget_range, profile_pic, additional_comments, password_hash)
                VALUES (:full_name, :email, :phone, :dob, :gender, :pref_time, :address, :city, :state, :country, :category_prefs, :brand_prefs, :budget_range, :profile_pic, :additional_notes, :password_hash)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':full_name'        => $full_name,
            ':email'            => $email,
            ':phone'            => $phone,
            ':dob'              => $dob,
            ':gender'           => $gender,
            ':pref_time'        => $pref_time ?: null,
            ':address'          => $address,
            ':city'             => $city,
            ':state'            => $state,
            ':country'          => $country,
            ':category_prefs'   => $categories,
            ':brand_prefs'      => $brands,
            ':budget_range'     => $budget,
            ':profile_pic'      => $profile_pic_path,
            ':additional_notes' => $notes,
            ':password_hash'    => $password_hash
        ]);
        $regId = $pdo->lastInsertId();

        // Populate subfolder tables
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $pdo->prepare("INSERT INTO registration__logs (registration_id, email, ip_address, status) VALUES (?, ?, ?, 'Success')")
            ->execute([$regId, $email, $ip]);

        $pdo->prepare("INSERT INTO personal__info (registration_id, full_name, email, phone, dob, gender, pref_time) VALUES (?, ?, ?, ?, ?, ?, ?)")
            ->execute([$regId, $full_name, $email, $phone, $dob, $gender, $pref_time ?: null]);

        $pdo->prepare("INSERT INTO personal__credentials (registration_id, email, password_hash) VALUES (?, ?, ?)")
            ->execute([$regId, $email, $password_hash]);

        $pdo->prepare("INSERT INTO preferences__address (registration_id, address, city, state, country) VALUES (?, ?, ?, ?, ?)")
            ->execute([$regId, $address, $city, $state, $country]);

        $pdo->prepare("INSERT INTO preferences__interests (registration_id, preferred_categories, preferred_brands, budget_range, profile_pic, additional_comments) VALUES (?, ?, ?, ?, ?, ?)")
            ->execute([$regId, $categories, $brands, $budget, $profile_pic_path, $notes]);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Registration saved to database successfully!',
            'userId'  => $regId
        ]);
        exit;
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'errors' => ['Database error: ' . $e->getMessage()]]);
        exit;
    }
} else {
    // Graceful fallback response when MySQL server is not active
    echo json_encode([
        'success' => true,
        'message' => 'Validation passed! (Simulated storage: DB connection was inactive)',
        'data' => [
            'name' => $full_name,
            'email' => $email,
            'categories' => $categories
        ]
    ]);
}
?>
