CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) NULL UNIQUE,
    phone VARCHAR(50) NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    phone VARCHAR(50) NOT NULL UNIQUE,
    parent_name VARCHAR(191) NOT NULL,
    parent_contact VARCHAR(191) NULL,
    grade VARCHAR(100) NULL,
    school VARCHAR(191) NULL,
    learning_level VARCHAR(100) NULL,
    notes TEXT NULL,
    qr_code VARCHAR(191) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendances (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_attendance_student_date (student_id, date),
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    enrollment_request_id CHAR(36) NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('MONTHLY', 'CLASS') NOT NULL,
    method ENUM('CASH', 'ONLINE') NOT NULL,
    status ENUM('PAID', 'PENDING') NOT NULL,
    date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS classes (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    subject VARCHAR(191) NOT NULL,
    level VARCHAR(191) NOT NULL,
    type ENUM('ONLINE', 'OFFLINE') NOT NULL,
    status ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    date DATE NOT NULL,
    schedule_day ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    meeting_link VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    capacity INT NOT NULL DEFAULT 20,
    fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT NULL,
    teacher_id CHAR(36) NOT NULL,
    created_by_id CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS class_enrollments (
    id CHAR(36) PRIMARY KEY,
    class_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_class_student (class_id, student_id),
    CONSTRAINT fk_enrollment_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS class_enrollment_requests (
    id CHAR(36) PRIMARY KEY,
    class_id CHAR(36) NOT NULL,
    student_name VARCHAR(191) NOT NULL,
    student_phone VARCHAR(50) NOT NULL,
    student_email VARCHAR(191) NULL,
    parent_name VARCHAR(191) NOT NULL,
    parent_contact VARCHAR(191) NULL,
    grade VARCHAR(100) NULL,
    school VARCHAR(191) NULL,
    learning_level VARCHAR(100) NULL,
    notes TEXT NULL,
    status ENUM('REQUESTED', 'PAYMENT_SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'REQUESTED',
    payment_slip_name VARCHAR(255) NULL,
    payment_slip_path VARCHAR(255) NULL,
    review_note TEXT NULL,
    approved_student_id CHAR(36) NULL,
    reviewed_at DATETIME NULL,
    approved_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_enrollment_request_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

ALTER TABLE payments
    ADD CONSTRAINT fk_payment_enrollment_request FOREIGN KEY (enrollment_request_id) REFERENCES class_enrollment_requests(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS homework (
    id CHAR(36) PRIMARY KEY,
    class_id CHAR(36) NOT NULL,
    title VARCHAR(191) NOT NULL,
    description TEXT NULL,
    deadline DATE NOT NULL,
    attachment_name VARCHAR(255) NULL,
    attachment_path VARCHAR(255) NULL,
    created_by_id CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_homework_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_homework_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS homework_submissions (
    id CHAR(36) PRIMARY KEY,
    homework_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    status ENUM('PENDING', 'SUBMITTED', 'REVIEWED') NOT NULL DEFAULT 'PENDING',
    response_name VARCHAR(255) NULL,
    response_path VARCHAR(255) NULL,
    score INT NULL,
    max_score INT NULL,
    feedback TEXT NULL,
    submitted_at DATETIME NULL,
    reviewed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_homework_student (homework_id, student_id),
    CONSTRAINT fk_homework_submission_homework FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
    CONSTRAINT fk_homework_submission_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress_entries (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    month DATE NOT NULL,
    listening INT NOT NULL,
    reading INT NOT NULL,
    writing INT NOT NULL,
    speaking INT NOT NULL,
    comment TEXT NULL,
    test_mark INT NULL,
    created_by_id CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_progress_student_month (student_id, month),
    CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materials (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    category ENUM('WORKSHEET', 'STORY', 'VIDEO') NOT NULL,
    description TEXT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_by_id CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_material_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    message TEXT NOT NULL,
    created_by_id CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcement_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizzes (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    description TEXT NULL,
    created_by_id CHAR(36) NOT NULL,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id CHAR(36) PRIMARY KEY,
    quiz_id CHAR(36) NOT NULL,
    prompt TEXT NOT NULL,
    options_json JSON NOT NULL,
    correct_answer INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
    id CHAR(36) PRIMARY KEY,
    quiz_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    answers_json JSON NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_result_quiz_student (quiz_id, student_id),
    CONSTRAINT fk_result_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_result_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

