<?php
/**
 * ShopAI - User Registration Backend Processor
 * Saves registration form submissions directly into shop_db in phpMyAdmin
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Database Connection
$host     = 'localhost';
$dbname   = 'shop_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

// Ensure POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

// 1. Sanitize & extract inputs
$full_name = trim($_POST['fullName'] ?? '');
$email     = trim($_POST['email'] ?? '');
$phone     = trim($_POST['phone'] ?? '');
$dob       = trim($_POST['dob'] ?? '') ?: null;
$age       = !empty($_POST['age']) ? intval($_POST['age']) : null;
$gender    = trim($_POST['gender'] ?? 'other');
$pref_time = trim($_POST['prefTime'] ?? '') ?: null;
$password  = $_POST['password'] ?? '';

$address   = trim($_POST['address'] ?? '');
$city      = trim($_POST['city'] ?? '');
$state     = trim($_POST['state'] ?? '');
$country   = trim($_POST['country'] ?? 'India');

// Checkbox arrays
$categories = isset($_POST['categories']) ? (is_array($_POST['categories']) ? implode(', ', $_POST['categories']) : trim($_POST['categories'])) : '';
$brands     = isset($_POST['brands']) ? (is_array($_POST['brands']) ? implode(', ', $_POST['brands']) : trim($_POST['brands'])) : '';

$budget     = trim($_POST['budget'] ?? '');
$skills     = trim($_POST['skills'] ?? '');
$comments   = trim($_POST['additionalComments'] ?? ($_POST['userNotes'] ?? ''));

// Auto-calculate age if missing but dob provided
if (!$age && $dob) {
    try {
        $birthDate = new DateTime($dob);
        $today     = new DateTime('today');
        $age       = $birthDate->diff($today)->y;
    } catch (Exception $e) {
        $age = null;
    }
}

// Validation
$errors = [];
if (empty($full_name)) {
    $errors[] = 'Full name is required.';
}
if (empty($email)) {
    $errors[] = 'Email address is required.';
}
if (empty($phone)) {
    $errors[] = 'Phone number is required.';
}
if (empty($password)) {
    $errors[] = 'Password is required.';
}

// Handle Profile Picture Upload
$profile_pic_path = null;
if (isset($_FILES['profilePic']) && $_FILES['profilePic']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['profilePic']['tmp_name'];
    $fileName    = $_FILES['profilePic']['name'];
    $fileSize    = $_FILES['profilePic']['size'];
    $fileExt     = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    $allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (in_array($fileExt, $allowedExts)) {
        if ($fileSize <= 2 * 1024 * 1024) {
            $uploadDir = __DIR__ . '/uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $newFileName = 'avatar_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $fileExt;
            $destPath    = $uploadDir . $newFileName;
            if (move_uploaded_file($fileTmpPath, $destPath)) {
                $profile_pic_path = 'uploads/' . $newFileName;
            }
        } else {
            $errors[] = 'Profile picture must be under 2MB.';
        }
    } else {
        $errors[] = 'Profile picture must be JPG, PNG, or WebP.';
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Hash password
$password_hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $pdo->beginTransaction();

    // 1. Insert into registration__details (Master table)
    $sqlDetails = "INSERT INTO registration__details 
        (full_name, email, phone, dob, age, gender, pref_time, password_hash, address, city, state, country, preferred_categories, preferred_brands, budget_range, interests_skills, profile_pic, additional_comments)
        VALUES 
        (:full_name, :email, :phone, :dob, :age, :gender, :pref_time, :password_hash, :address, :city, :state, :country, :categories, :brands, :budget, :skills, :profile_pic, :comments)";
    
    $stmt = $pdo->prepare($sqlDetails);
    $stmt->execute([
        ':full_name'    => $full_name,
        ':email'        => $email,
        ':phone'        => $phone,
        ':dob'          => $dob,
        ':age'          => $age,
        ':gender'       => $gender,
        ':pref_time'    => $pref_time,
        ':password_hash'=> $password_hash,
        ':address'      => $address,
        ':city'         => $city,
        ':state'        => $state,
        ':country'      => $country,
        ':categories'   => $categories,
        ':brands'       => $brands,
        ':budget'       => $budget,
        ':skills'       => $skills,
        ':profile_pic'  => $profile_pic_path,
        ':comments'     => $comments,
    ]);
    $regId = $pdo->lastInsertId();

    // 2. Insert into registration__logs
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $sqlLog = "INSERT INTO registration__logs (registration_id, email, ip_address, status) VALUES (:reg_id, :email, :ip, 'Success')";
    $stmtLog = $pdo->prepare($sqlLog);
    $stmtLog->execute([':reg_id' => $regId, ':email' => $email, ':ip' => $ip]);

    // 3. Insert into personal__info
    $sqlPersonal = "INSERT INTO personal__info (registration_id, full_name, email, phone, dob, age, gender, pref_time)
                    VALUES (:reg_id, :full_name, :email, :phone, :dob, :age, :gender, :pref_time)";
    $stmtPers = $pdo->prepare($sqlPersonal);
    $stmtPers->execute([
        ':reg_id'    => $regId,
        ':full_name' => $full_name,
        ':email'     => $email,
        ':phone'     => $phone,
        ':dob'       => $dob,
        ':age'       => $age,
        ':gender'    => $gender,
        ':pref_time' => $pref_time,
    ]);

    // 4. Insert into personal__credentials
    $sqlCred = "INSERT INTO personal__credentials (registration_id, email, password_hash) VALUES (:reg_id, :email, :password_hash)";
    $stmtCred = $pdo->prepare($sqlCred);
    $stmtCred->execute([':reg_id' => $regId, ':email' => $email, ':password_hash' => $password_hash]);

    // 5. Insert into preferences__address
    $sqlAddr = "INSERT INTO preferences__address (registration_id, address, city, state, country)
                VALUES (:reg_id, :address, :city, :state, :country)";
    $stmtAddr = $pdo->prepare($sqlAddr);
    $stmtAddr->execute([
        ':reg_id'  => $regId,
        ':address' => $address,
        ':city'    => $city,
        ':state'   => $state,
        ':country' => $country,
    ]);

    // 6. Insert into preferences__interests
    $sqlInt = "INSERT INTO preferences__interests (registration_id, preferred_categories, preferred_brands, budget_range, interests_skills, profile_pic, additional_comments)
               VALUES (:reg_id, :categories, :brands, :budget, :skills, :profile_pic, :comments)";
    $stmtInt = $pdo->prepare($sqlInt);
    $stmtInt->execute([
        ':reg_id'      => $regId,
        ':categories'  => $categories,
        ':brands'      => $brands,
        ':budget'      => $budget,
        ':skills'      => $skills,
        ':profile_pic' => $profile_pic_path,
        ':comments'    => $comments,
    ]);

    $pdo->commit();

    header('Content-Type: application/json');
    echo json_encode([
        'success'        => true,
        'message'        => 'Registration saved to phpMyAdmin shop_db successfully!',
        'registrationId' => $regId,
        'user' => [
            'id'        => $regId,
            'name'      => $full_name,
            'email'     => $email,
            'phone'     => $phone,
            'city'      => $city,
            'state'     => $state,
            'categories'=> $categories
        ]
    ]);
    exit;

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'errors'  => ['Database insertion error: ' . $e->getMessage()]
    ]);
    exit;
}
